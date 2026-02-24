
import { ApiStatus } from '../types';

/**
 * GOOGLE CLIENT (AUTO-PROVISIONER)
 * --------------------------------
 * Manages OAuth tokens and ensures required Google Workspace APIs 
 * are enabled via the Service Usage API before extraction begins.
 */

const REQUIRED_SERVICES = [
  'people.googleapis.com',
  'drive.googleapis.com',
  'gmail.googleapis.com',
  'calendar-json.googleapis.com',
  'photoslibrary.googleapis.com',
  'chat.googleapis.com',
  'tasks.googleapis.com',
  'driveactivity.googleapis.com',
  'serviceusage.googleapis.com'
];

export class GoogleClient {
  private static instance: GoogleClient;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  static getInstance(): GoogleClient {
    if (!GoogleClient.instance) {
      GoogleClient.instance = new GoogleClient();
    }
    return GoogleClient.instance;
  }

  public setToken(token: string, expiresInSeconds: number = 3599) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresInSeconds * 1000);
  }

  public getToken(): string {
    if (!this.accessToken) {
      throw new Error("ERR_NO_TOKEN: Forensic extraction requires an active OAuth session.");
    }
    if (Date.now() >= this.tokenExpiry) {
      console.warn("WARN_TOKEN_EXPIRED: The session token may have expired.");
    }
    return this.accessToken;
  }

  /**
   * PROVISIONING LOOP
   * Checks if required APIs are enabled. If not, attempts to enable them 
   * (requires Cloud Project Editor permissions), or flags them as unavailable.
   */
  public async provisionServices(): Promise<ApiStatus[]> {
    const token = this.getToken();
    const statuses: ApiStatus[] = [];

    for (const serviceId of REQUIRED_SERVICES) {
      const status: ApiStatus = { id: serviceId, name: serviceId, enabled: false, loading: true };
      
      try {
        // Check Status
        const checkResp = await fetch(`https://serviceusage.googleapis.com/v1/projects/me/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (checkResp.ok) {
          const data = await checkResp.json();
          if (data.state === 'ENABLED') {
            status.enabled = true;
          } else {
            // Attempt Auto-Enable
            const enableResp = await fetch(`https://serviceusage.googleapis.com/v1/projects/me/services/${serviceId}:enable`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
            status.enabled = enableResp.ok;
          }
        }
      } catch (e) {
        console.error(`Provisioning failed for ${serviceId}`, e);
        status.enabled = false;
      }
      
      status.loading = false;
      statuses.push(status);
    }
    return statuses;
  }
}
