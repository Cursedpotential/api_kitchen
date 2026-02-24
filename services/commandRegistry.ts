
import { ForensicCommand, ForensicCategoryType } from '../types';

export const COMMAND_REGISTRY: ForensicCommand[] = [
  // ==================================================================================
  // MODULES (Aggregated Workflows)
  // ==================================================================================
  {
    id: 'MOD_SURVEILLANCE',
    label: 'Surveillance & Location',
    description: 'Master Bundle: Cross-references Google Fi Roaming, Photos GPS, Maps History, and Calendar Locations.',
    category: 'SURVEILLANCE',
    type: ForensicCategoryType.MODULE,
    estimatedTime: '3-6 min'
  },
  {
    id: 'MOD_COMM_ANALYZER',
    label: 'Communication Analyzer',
    description: 'Master Bundle: Scans Gmail, Chat, Voice, and Meet for patterns and spoliation.',
    category: 'COMMUNICATION',
    type: ForensicCategoryType.MODULE,
    estimatedTime: '5-10 min'
  },
  {
    id: 'MOD_DRIVE_FORENSIC',
    label: 'Drive Integrity & Access',
    description: 'Master Bundle: Maps external sharing, orphan files, and cryptographic hashes.',
    category: 'DRIVE',
    type: ForensicCategoryType.MODULE,
    estimatedTime: '4-7 min'
  },
  {
    id: 'MOD_GHOST_DATA',
    label: 'Ephemeral & Deleted Data',
    description: 'Master Bundle: Recovers deleted Calendar events, Trashed Files, and Hidden Tasks.',
    category: 'EPHEMERAL',
    type: ForensicCategoryType.MODULE,
    estimatedTime: '4-8 min'
  },
  {
    id: 'MOD_SOCIAL_GRAPH',
    label: 'Social Graph Analysis',
    description: 'Master Bundle: Shared Albums, Contact Interactions, and Calendar Attendees.',
    category: 'SOCIAL',
    type: ForensicCategoryType.MODULE,
    estimatedTime: '4-6 min'
  },

  // ==================================================================================
  // GMAIL ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_GMAIL_PROFILE',
    label: 'Gmail Profile',
    description: 'Get current user profile stats and history ID.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /gmail/v1/users/me/profile',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_DRAFTS',
    label: 'List Drafts',
    description: 'Retrieve unsent messages (abandoned intent).',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /gmail/v1/users/me/drafts',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_TRASH',
    label: 'List Trash',
    description: 'Retrieve messages marked for deletion.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '4s',
    endpoint: 'GET /gmail/v1/users/me/messages?q=in:trash',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_FILTERS',
    label: 'List Filters',
    description: 'Extract automated processing rules (hiding emails, deleting).',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /gmail/v1/users/me/settings/filters',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_FORWARDING',
    label: 'Auto-Forwarding Addresses',
    description: 'Check for unauthorized data exfiltration settings.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /gmail/v1/users/me/settings/forwardingAddresses',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_SENDAS',
    label: 'SendAs Aliases',
    description: 'Identify other email addresses this account can send as.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /gmail/v1/users/me/settings/sendAs',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_LABELS',
    label: 'List Labels',
    description: 'Map user organization structure and hidden folders.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /gmail/v1/users/me/labels',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_Q_FINANCIAL',
    label: 'Query: Financial Keywords',
    description: 'Search for banks, venmo, paypal, zelle.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '5s',
    endpoint: 'GET /gmail/v1/messages?q={financial}',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_Q_LEGAL',
    label: 'Query: Legal Keywords',
    description: 'Search for lawyer, attorney, court, custody, divorce.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '5s',
    endpoint: 'GET /gmail/v1/messages?q={legal}',
    method: 'GET'
  },
  {
    id: 'CMD_GMAIL_Q_LOCATION',
    label: 'Query: Travel/Location',
    description: 'Search for uber, lyft, flight, hotel, airbnb.',
    category: 'GMAIL',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '5s',
    endpoint: 'GET /gmail/v1/messages?q={travel}',
    method: 'GET'
  },

  // ==================================================================================
  // DRIVE ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_DRIVE_FILES_ALL',
    label: 'List All Files',
    description: 'Standard file listing (limit 20).',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /drive/v3/files',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_TRASH',
    label: 'List Trashed Files',
    description: 'Files marked for deletion but not purged.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /drive/v3/files?q=trashed=true',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_CHANGES',
    label: 'Get Start Page Token',
    description: 'Initialize change tracking for future monitoring.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /drive/v3/changes/startPageToken',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_APPDATA',
    label: 'List AppData Folder',
    description: 'Hidden configuration files for connected third-party apps.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '4s',
    endpoint: 'GET /drive/v3/files?spaces=appDataFolder',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_COMMENTS',
    label: 'List Comments (Recent)',
    description: 'Extracts comments from recent files to find collaboration context.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '6s',
    endpoint: 'GET /drive/v3/files/{id}/comments',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_ACTIVITY',
    label: 'Drive Activity Log',
    description: 'Detailed history of edits, moves, and renames.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '5s',
    endpoint: 'POST /driveactivity/v2/activity:query',
    method: 'POST'
  },
  {
    id: 'CMD_DRIVE_SHARED',
    label: 'Shared With Me',
    description: 'Files shared by external users.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /drive/v3/files?q=sharedWithMe=true',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_TYPE_MAPS',
    label: 'Filter: Google Maps',
    description: 'Custom maps (KML/KMZ).',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /files?q=mimeType="application/vnd.google-apps.map"',
    method: 'GET'
  },
  {
    id: 'CMD_DRIVE_TYPE_FORMS',
    label: 'Filter: Google Forms',
    description: 'Surveys and data collection instruments.',
    category: 'DRIVE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /files?q=mimeType="application/vnd.google-apps.form"',
    method: 'GET'
  },

  // ==================================================================================
  // PHOTOS ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_PHOTOS_LIST',
    label: 'List Media Items',
    description: 'Recent photos and videos with metadata.',
    category: 'PHOTOS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /v1/mediaItems',
    method: 'GET'
  },
  {
    id: 'CMD_PHOTOS_ALBUMS',
    label: 'List Albums',
    description: 'User-created photo collections.',
    category: 'PHOTOS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /v1/albums',
    method: 'GET'
  },
  {
    id: 'CMD_PHOTOS_SHARED_ALBUMS',
    label: 'List Shared Albums',
    description: 'Collaborative albums (high value for social graph).',
    category: 'PHOTOS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /v1/sharedAlbums',
    method: 'GET'
  },
  {
    id: 'CMD_PHOTOS_SEARCH_SCREENSHOTS',
    label: 'Search: Screenshots',
    description: 'AI filter for screenshots (chats, receipts).',
    category: 'PHOTOS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '4s',
    endpoint: 'POST /v1/mediaItems:search (SCREENSHOTS)',
    method: 'POST'
  },
  {
    id: 'CMD_PHOTOS_SEARCH_DOCUMENTS',
    label: 'Search: Documents',
    description: 'AI filter for paper documents and text.',
    category: 'PHOTOS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '4s',
    endpoint: 'POST /v1/mediaItems:search (DOCUMENTS)',
    method: 'POST'
  },

  // ==================================================================================
  // CALENDAR ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_CALENDAR_LIST',
    label: 'List Calendars',
    description: 'All calendars visible to the user.',
    category: 'CALENDAR',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /users/me/calendarList',
    method: 'GET'
  },
  {
    id: 'CMD_CALENDAR_EVENTS',
    label: 'List Events (Primary)',
    description: 'Active events on the primary calendar.',
    category: 'CALENDAR',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /calendars/primary/events',
    method: 'GET'
  },
  {
    id: 'CMD_CALENDAR_DELETED',
    label: 'List Deleted Events',
    description: 'Recover cancelled appointments.',
    category: 'CALENDAR',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /calendars/primary/events?showDeleted=true',
    method: 'GET'
  },
  {
    id: 'CMD_CALENDAR_ACL',
    label: 'Get ACLs',
    description: 'Access Control List (who else sees this calendar).',
    category: 'CALENDAR',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /calendars/primary/acl',
    method: 'GET'
  },
  {
    id: 'CMD_CALENDAR_SETTINGS',
    label: 'Calendar Settings',
    description: 'User preferences and global configs.',
    category: 'CALENDAR',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /users/me/settings',
    method: 'GET'
  },

  // ==================================================================================
  // PEOPLE & CONTACTS ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_PEOPLE_CONNECTIONS',
    label: 'List Connections',
    description: 'Explicit contacts (Address Book).',
    category: 'PEOPLE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /v1/people/me/connections',
    method: 'GET'
  },
  {
    id: 'CMD_PEOPLE_OTHER',
    label: 'List Other Contacts',
    description: 'Implicit contacts from interactions.',
    category: 'PEOPLE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '4s',
    endpoint: 'GET /v1/otherContacts',
    method: 'GET'
  },
  {
    id: 'CMD_PEOPLE_DIRECTORY',
    label: 'List Directory',
    description: 'Domain directory contacts (if Workspace account).',
    category: 'PEOPLE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /v1/people:listDirectoryPeople',
    method: 'GET'
  },
  {
    id: 'CMD_PEOPLE_GROUPS',
    label: 'Contact Groups',
    description: 'Labels/Tags for contacts.',
    category: 'PEOPLE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /v1/contactGroups',
    method: 'GET'
  },
  {
    id: 'CMD_PEOPLE_ME',
    label: 'Get Person (Me)',
    description: 'Full profile metadata for the authenticated user.',
    category: 'PEOPLE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /v1/people/me',
    method: 'GET'
  },

  // ==================================================================================
  // TASKS ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_TASKS_LISTS',
    label: 'List Tasklists',
    description: 'All task lists.',
    category: 'TASKS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '1s',
    endpoint: 'GET /tasks/v1/users/@me/lists',
    method: 'GET'
  },
  {
    id: 'CMD_TASKS_ALL',
    label: 'List Tasks (Default)',
    description: 'Active tasks in default list.',
    category: 'TASKS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /lists/@default/tasks',
    method: 'GET'
  },
  {
    id: 'CMD_TASKS_HIDDEN',
    label: 'List Hidden Tasks',
    description: 'Tasks marked completed or hidden.',
    category: 'TASKS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /lists/@default/tasks?showHidden=true',
    method: 'GET'
  },

  // ==================================================================================
  // CHAT ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_CHAT_SPACES',
    label: 'List Spaces',
    description: 'Rooms and DMs the user is part of.',
    category: 'CHAT',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '2s',
    endpoint: 'GET /v1/spaces',
    method: 'GET'
  },
  {
    id: 'CMD_CHAT_MEMBERS',
    label: 'List Memberships',
    description: 'Who is in the spaces (simulated/limited scope).',
    category: 'CHAT',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /v1/spaces/{space}/members',
    method: 'GET'
  },

  // ==================================================================================
  // OTHER / SIMULATED ENDPOINTS
  // ==================================================================================
  {
    id: 'CMD_YOUTUBE_HISTORY',
    label: 'Watch History',
    description: 'Videos watched by the user.',
    category: 'YOUTUBE',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '3s',
    endpoint: 'GET /youtube/v3/activities',
    method: 'GET'
  },
  {
    id: 'CMD_MAPS_TIMELINE',
    label: 'Location History',
    description: 'Semantic Location History (Simulated access via Takeout).',
    category: 'MAPS',
    type: ForensicCategoryType.SERVICE,
    estimatedTime: '5s',
    endpoint: 'GET /v1/records',
    method: 'GET'
  }
];

export const getCommandsByCategory = (category: string) => {
  return COMMAND_REGISTRY.filter(cmd => cmd.category === category);
};
