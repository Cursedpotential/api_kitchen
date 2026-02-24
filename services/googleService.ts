
import { ApiStatus, ForensicItem } from '../types';
import { calculateSHA256 } from './hashService';

const REQUIRED_APIS = [
  { id: 'drive.googleapis.com', name: 'Google Drive API' },
  { id: 'photoslibrary.googleapis.com', name: 'Google Photos API' },
  { id: 'chat.googleapis.com', name: 'Google Chat API' },
  { id: 'gmail.googleapis.com', name: 'Gmail API' },
  { id: 'people.googleapis.com', name: 'People API' },
  { id: 'serviceusage.googleapis.com', name: 'Service Usage API' },
  { id: 'calendar-json.googleapis.com', name: 'Calendar API' },
  { id: 'tasks.googleapis.com', name: 'Tasks API' },
  { id: 'driveactivity.googleapis.com', name: 'Drive Activity API' }
];

export class GoogleForensicService {
  private static instance: GoogleForensicService;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance() {
    if (!GoogleForensicService.instance) {
      GoogleForensicService.instance = new GoogleForensicService();
    }
    return GoogleForensicService.instance;
  }

  setToken(token: string) {
    this.accessToken = token;
  }

  async checkAndEnableApis(): Promise<ApiStatus[]> {
    const statuses: ApiStatus[] = [];
    for (const api of REQUIRED_APIS) {
      try {
        const response = await fetch(`https://serviceusage.googleapis.com/v1/projects/me/services/${api.id}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        const data = await response.json();
        let isEnabled = data.state === 'ENABLED';
        if (!isEnabled) {
          await fetch(`https://serviceusage.googleapis.com/v1/projects/me/services/${api.id}:enable`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` }
          });
          isEnabled = true;
        }
        statuses.push({ ...api, enabled: isEnabled, loading: false });
      } catch (error) {
        statuses.push({ ...api, enabled: false, loading: false });
      }
    }
    return statuses;
  }

  // --- CORE PROCESSOR ---
  private async processItem(rawObj: any, source: string, timestamp: string, title: string, metadata: any): Promise<ForensicItem> {
    const rawJson = JSON.stringify(rawObj, null, 2);
    const hash = await calculateSHA256(rawJson);
    return {
      id: rawObj.id || rawObj.resourceName || Math.random().toString(36).substr(2, 9),
      source,
      timestamp,
      title,
      metadata,
      rawJson,
      hash
    };
  }

  // --- ROUTER ---
  async executeCommand(commandId: string): Promise<ForensicItem[]> {
    if (!this.accessToken) throw new Error("Authentication required");

    // Dynamic Keyword Handling
    if (commandId.startsWith('CMD_GMAIL_Q_')) {
        let query = '';
        let label = 'Query';
        if (commandId === 'CMD_GMAIL_Q_FINANCIAL') { query = 'venmo OR zelle OR paypal OR "bank transfer" OR receipt'; label = 'Financial'; }
        if (commandId === 'CMD_GMAIL_Q_LEGAL') { query = 'lawyer OR attorney OR court OR custody OR divorce'; label = 'Legal'; }
        if (commandId === 'CMD_GMAIL_Q_LOCATION') { query = 'uber OR lyft OR flight OR hotel OR airbnb'; label = 'Travel'; }
        return this.runGmailQueryExtraction(query, label);
    }

    if (commandId.startsWith('CMD_PHOTOS_SEARCH_')) {
        const cat = commandId.replace('CMD_PHOTOS_SEARCH_', '');
        return this.runPhotosCategoryExtraction(cat);
    }

    switch (commandId) {
      // GMAIL
      case 'CMD_GMAIL_PROFILE': return this.runGmailProfile();
      case 'CMD_GMAIL_DRAFTS': return this.runGmailDraftsExtraction();
      case 'CMD_GMAIL_TRASH': return this.runGmailQueryExtraction('in:trash', 'Trash');
      case 'CMD_GMAIL_FILTERS': return this.runGmailSettings('filters');
      case 'CMD_GMAIL_FORWARDING': return this.runGmailSettings('forwardingAddresses');
      case 'CMD_GMAIL_SENDAS': return this.runGmailSettings('sendAs');
      case 'CMD_GMAIL_LABELS': return this.runGmailLabels();

      // DRIVE
      case 'CMD_DRIVE_FILES_ALL': return this.runDriveExtraction({});
      case 'CMD_DRIVE_TRASH': return this.runDriveExtraction({ q: 'trashed=true', label: 'Trash' });
      case 'CMD_DRIVE_APPDATA': return this.runDriveExtraction({ q: "'appDataFolder' in parents", label: 'AppData' });
      case 'CMD_DRIVE_SHARED': return this.runDriveExtraction({ q: "sharedWithMe=true", label: 'Shared' });
      case 'CMD_DRIVE_CHANGES': return this.runDriveChangesToken();
      case 'CMD_DRIVE_ACTIVITY': return this.runDriveActivityExtraction();
      case 'CMD_DRIVE_COMMENTS': return this.runDriveCommentsExtraction();
      case 'CMD_DRIVE_TYPE_MAPS': return this.runDriveExtraction({ q: 'mimeType="application/vnd.google-apps.map"', label: 'Maps' });
      case 'CMD_DRIVE_TYPE_FORMS': return this.runDriveExtraction({ q: 'mimeType="application/vnd.google-apps.form"', label: 'Forms' });

      // PHOTOS
      case 'CMD_PHOTOS_LIST': return this.runPhotosExtraction({});
      case 'CMD_PHOTOS_ALBUMS': return this.runPhotosAlbums();
      case 'CMD_PHOTOS_SHARED_ALBUMS': return this.runSharedAlbumExtraction();

      // CALENDAR
      case 'CMD_CALENDAR_LIST': return this.runCalendarList();
      case 'CMD_CALENDAR_EVENTS': return this.runCalendarEvents(false);
      case 'CMD_CALENDAR_DELETED': return this.runCalendarEvents(true);
      case 'CMD_CALENDAR_ACL': return this.runCalendarAclExtraction();
      case 'CMD_CALENDAR_SETTINGS': return this.runCalendarSettings();

      // PEOPLE
      case 'CMD_PEOPLE_CONNECTIONS': return this.runPeopleExtraction('connections');
      case 'CMD_PEOPLE_OTHER': return this.runPeopleExtraction('otherContacts');
      case 'CMD_PEOPLE_DIRECTORY': return this.runPeopleExtraction('directory');
      case 'CMD_PEOPLE_GROUPS': return this.runPeopleExtraction('contactGroups');
      case 'CMD_PEOPLE_ME': return this.runProfileExtraction();

      // TASKS
      case 'CMD_TASKS_LISTS': return this.runTaskLists();
      case 'CMD_TASKS_ALL': return this.runTasksExtraction(false);
      case 'CMD_TASKS_HIDDEN': return this.runTasksExtraction(true);

      // CHAT
      case 'CMD_CHAT_SPACES': return this.runChatSpaces();
      
      // MODULES
      case 'MOD_SURVEILLANCE':
         return [...(await this.runGmailQueryExtraction('subject:("arrived at") OR subject:("shared location")', 'GeoAlert')), ...(await this.runPhotosExtraction({gpsOnly: true}))];
      case 'MOD_COMM_ANALYZER':
         return [...(await this.runGmailQueryExtraction('label:chat', 'Chat Log')), ...(await this.runGmailDraftsExtraction())];
      case 'MOD_DRIVE_FORENSIC':
         return [...(await this.runDriveExtraction({q: "sharedWithMe=true"})), ...(await this.runDriveActivityExtraction())];
      
      default:
        console.warn(`Command ${commandId} not explicitly implemented, attempting generic fallback or returning empty.`);
        return [];
    }
  }

  // ============================================================================
  // GMAIL IMPLEMENTATIONS
  // ============================================================================
  private async runGmailProfile(): Promise<ForensicItem[]> {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/profile`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await res.json();
      return [await this.processItem(data, 'Gmail', new Date().toISOString(), 'Profile Stats', { messages: data.messagesTotal, historyId: data.historyId })];
  }

  private async runGmailSettings(setting: string): Promise<ForensicItem[]> {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/${setting}`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await res.json();
      const items = data[setting] || (Array.isArray(data) ? data : [data]); 
      // Handle various response shapes (filters vs forwardingAddresses)
      const list = Array.isArray(items) ? items : (data.filter ? data.filter : (data.forwardingAddresses ? data.forwardingAddresses : [data]));
      
      return Promise.all(list.map(async (item: any) => 
          this.processItem(item, 'GmailSettings', new Date().toISOString(), `${setting}: ${item.id || item.forwardingEmail || 'Config'}`, { type: setting })
      ));
  }

  private async runGmailLabels(): Promise<ForensicItem[]> {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await res.json();
      return Promise.all((data.labels || []).map(async (l: any) => 
          this.processItem(l, 'GmailLabel', new Date().toISOString(), `Label: ${l.name}`, { type: l.type, unread: l.messagesUnread })
      ));
  }

  private async runGmailQueryExtraction(query: string, label: string): Promise<ForensicItem[]> {
      const listResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const { messages = [] } = await listResp.json();
      return Promise.all(messages.map(async (msg: any) => {
          const detail = await (await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
              headers: { Authorization: `Bearer ${this.accessToken}` }
          })).json();
          const headers = detail.payload.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
          return this.processItem(detail, 'Gmail', new Date(parseInt(detail.internalDate)).toISOString(), `${label}: ${subject}`, {
              snippet: detail.snippet,
              queryMatched: query
          });
      }));
  }

  private async runGmailDraftsExtraction(): Promise<ForensicItem[]> {
      const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=10', {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const { drafts = [] } = await resp.json();
      return Promise.all(drafts.map(async (d: any) => {
          const detail = await (await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${d.id}?format=full`, {
              headers: { Authorization: `Bearer ${this.accessToken}` }
          })).json();
          const msg = detail.message;
          const headers = msg.payload.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Untitled Draft';
          return this.processItem(detail, 'GmailDraft', new Date(parseInt(msg.internalDate)).toISOString(), `Draft: ${subject}`, {
              snippet: msg.snippet,
              isAbandoned: true
          });
      }));
  }

  // ============================================================================
  // DRIVE IMPLEMENTATIONS
  // ============================================================================
  private async runDriveExtraction({ q, label }: { q?: string, label?: string }): Promise<ForensicItem[]> {
      const query = q || "trashed=false";
      const fields = 'files(id, name, mimeType, modifiedTime, size, parents, owners, permissions, md5Checksum, lastModifyingUser)';
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=15&fields=${fields}&q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const { files = [] } = await resp.json();
      return Promise.all(files.map(async (file: any) => 
          this.processItem(file, 'Drive', file.modifiedTime, `${label || 'File'}: ${file.name}`, { mimeType: file.mimeType, owners: file.owners?.map((o: any) => o.emailAddress) })
      ));
  }

  private async runDriveChangesToken(): Promise<ForensicItem[]> {
      const resp = await fetch('https://www.googleapis.com/drive/v3/changes/startPageToken', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return [await this.processItem(data, 'DriveToken', new Date().toISOString(), 'Start Page Token', { token: data.startPageToken })];
  }

  private async runDriveCommentsExtraction(): Promise<ForensicItem[]> {
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=5&q=trashed=false`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const { files = [] } = await resp.json();
      let allComments: ForensicItem[] = [];
      for(const file of files) {
          try {
             const commResp = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/comments?fields=*`, {
                 headers: { Authorization: `Bearer ${this.accessToken}` }
             });
             const commData = await commResp.json();
             if(commData.comments && commData.comments.length > 0) {
                 const items = await Promise.all(commData.comments.map(async (c: any) => 
                    this.processItem(c, 'DriveComment', c.createdTime, `Comment on: ${file.name}`, { author: c.author?.displayName, content: c.content })
                 ));
                 allComments = [...allComments, ...items];
             }
          } catch(e) {}
      }
      return allComments;
  }

  private async runDriveActivityExtraction(): Promise<ForensicItem[]> {
      try {
        const resp = await fetch('https://driveactivity.googleapis.com/v2/activity:query', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` },
            body: JSON.stringify({ pageSize: 10 })
        });
        const data = await resp.json();
        return Promise.all((data.activities || []).map(async (act: any) => 
            this.processItem(act, 'DriveActivity', act.timestamp, 'Activity Log', { action: Object.keys(act.primaryActionDetail || {})[0] })
        ));
      } catch(e) { return []; }
  }

  // ============================================================================
  // PHOTOS IMPLEMENTATIONS
  // ============================================================================
  private async runPhotosExtraction({ gpsOnly }: { gpsOnly?: boolean }): Promise<ForensicItem[]> {
      const resp = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=20', {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const data = await resp.json();
      let items = data.mediaItems || [];
      if (gpsOnly) items = items.filter((i: any) => i.mediaMetadata.location);
      return Promise.all(items.map(async (item: any) => 
          this.processItem(item, 'Photos', item.mediaMetadata.creationTime, item.filename, { gps: item.mediaMetadata.location })
      ));
  }

  private async runPhotosAlbums(): Promise<ForensicItem[]> {
      const resp = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=20', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.albums || []).map(async (a: any) => 
          this.processItem(a, 'PhotosAlbum', new Date().toISOString(), `Album: ${a.title}`, { items: a.mediaItemsCount })
      ));
  }

  private async runSharedAlbumExtraction(): Promise<ForensicItem[]> {
      const resp = await fetch('https://photoslibrary.googleapis.com/v1/sharedAlbums?pageSize=20', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.sharedAlbums || []).map(async (album: any) => 
          this.processItem(album, 'SharedAlbum', new Date().toISOString(), `Shared: ${album.title}`, { url: album.shareInfo?.shareableUrl })
      ));
  }

  private async runPhotosCategoryExtraction(category: string): Promise<ForensicItem[]> {
      const resp = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters: { contentFilter: { includedContentCategories: [category] } }, pageSize: 15 })
      });
      const data = await resp.json();
      return Promise.all((data.mediaItems || []).map(async (item: any) => 
          this.processItem(item, 'Photos', item.mediaMetadata.creationTime, `${category}: ${item.filename}`, {})
      ));
  }

  // ============================================================================
  // CALENDAR IMPLEMENTATIONS
  // ============================================================================
  private async runCalendarList(): Promise<ForensicItem[]> {
      const resp = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (cal: any) => 
          this.processItem(cal, 'CalendarList', new Date().toISOString(), `Calendar: ${cal.summary}`, { hidden: cal.hidden, accessRole: cal.accessRole })
      ));
  }

  private async runCalendarEvents(showDeleted: boolean): Promise<ForensicItem[]> {
      const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&showDeleted=${showDeleted}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (evt: any) => 
          this.processItem(evt, 'Calendar', evt.updated, `Event: ${evt.summary}`, { status: evt.status, creator: evt.creator?.email })
      ));
  }

  private async runCalendarAclExtraction(): Promise<ForensicItem[]> {
      const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/acl', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (rule: any) => 
          this.processItem(rule, 'CalendarACL', new Date().toISOString(), `ACL: ${rule.scope.value}`, { role: rule.role })
      ));
  }

  private async runCalendarSettings(): Promise<ForensicItem[]> {
      const resp = await fetch('https://www.googleapis.com/calendar/v3/users/me/settings', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (s: any) => 
          this.processItem(s, 'CalendarSetting', new Date().toISOString(), `Setting: ${s.id}`, { value: s.value })
      ));
  }

  // ============================================================================
  // PEOPLE IMPLEMENTATIONS
  // ============================================================================
  private async runPeopleExtraction(mode: string): Promise<ForensicItem[]> {
      let url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses`;
      if (mode === 'otherContacts') url = `https://people.googleapis.com/v1/otherContacts?readMask=names,emailAddresses`;
      if (mode === 'contactGroups') url = `https://people.googleapis.com/v1/contactGroups`;
      if (mode === 'directory') url = `https://people.googleapis.com/v1/people:listDirectoryPeople?readMask=names,emailAddresses&sources=DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE`;

      try {
          const resp = await fetch(url, { headers: { Authorization: `Bearer ${this.accessToken}` } });
          const data = await resp.json();
          const items = data.connections || data.otherContacts || data.contactGroups || data.people || [];
          return Promise.all(items.map(async (p: any) => 
              this.processItem(p, 'People', new Date().toISOString(), `Entity: ${p.names?.[0]?.displayName || p.name || 'Unknown'}`, { resourceName: p.resourceName })
          ));
      } catch (e) { return []; }
  }

  private async runProfileExtraction(): Promise<ForensicItem[]> {
      const resp = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,metadata', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return [await this.processItem(data, 'Profile', new Date().toISOString(), 'User Profile', { name: data.names?.[0]?.displayName })];
  }

  // ============================================================================
  // TASKS IMPLEMENTATIONS
  // ============================================================================
  private async runTaskLists(): Promise<ForensicItem[]> {
      const resp = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (l: any) => 
          this.processItem(l, 'TaskList', l.updated, `List: ${l.title}`, { id: l.id })
      ));
  }

  private async runTasksExtraction(showHidden: boolean): Promise<ForensicItem[]> {
      const resp = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showHidden=${showHidden}`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.items || []).map(async (t: any) => 
          this.processItem(t, 'Task', t.updated, `Task: ${t.title}`, { status: t.status, notes: t.notes })
      ));
  }

  // ============================================================================
  // CHAT IMPLEMENTATIONS
  // ============================================================================
  private async runChatSpaces(): Promise<ForensicItem[]> {
      const resp = await fetch('https://chat.googleapis.com/v1/spaces', { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const data = await resp.json();
      return Promise.all((data.spaces || []).map(async (s: any) => 
          this.processItem(s, 'ChatSpace', new Date().toISOString(), `Space: ${s.displayName}`, { type: s.type })
      ));
  }
}
