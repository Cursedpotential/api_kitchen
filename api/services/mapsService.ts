
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * MAPS SERVICE (SURVEILLANCE DETECTION)
 * -------------------------------------
 * Critical Function: detectSurveillance()
 * Logic: Scans activity logs specifically for "com.google.android.apps.maps" combined with
 * "NOTIFICATION_TRIGGERED". This pattern indicates the user received an alert about
 * SOMEONE ELSE'S location (e.g., "Jane arrived at Home").
 */

export class MapsService {
  private client = GoogleClient.getInstance();

  async detectSurveillance(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    // NOTE: Requires 'activity.readonly' or Gmail filtering for notification emails if Activity API is restricted.
    // We will implement the Gmail fallback extraction for "Location Sharing" alerts.
    
    try {
        const query = 'subject:("arrived at" OR "left" OR "sharing their location") from:Google';
        const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const data = await response.json();
        
        if (data.messages) {
            for (const msgStub of data.messages) {
                const msgResp = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgStub.id}?format=full`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const msg = await msgResp.json();
                const rawJson = JSON.stringify(msg, null, 2);
                const hash = await calculateSHA256(rawJson);

                const headers = msg.payload.headers || [];
                const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
                const date = new Date(parseInt(msg.internalDate)).toISOString();

                // Regex to extract target name and location
                const locationMatch = subject.match(/(.*?) (?:arrived at|left) (.*)/);
                const targetPerson = locationMatch ? locationMatch[1] : 'Unknown Subject';
                const location = locationMatch ? locationMatch[2] : 'Unknown Location';

                items.push({
                    id: msg.id,
                    source: 'Maps (Surveillance)',
                    timestamp: date,
                    title: `Geofence Alert: ${subject}`,
                    rawJson: rawJson,
                    hash: hash,
                    metadata: {
                        eventType: subject.includes('arrived') ? 'ARRIVAL' : 'DEPARTURE',
                        targetPerson: targetPerson,
                        locationTrigger: location,
                        isSurveillanceEvidence: true
                    }
                });
            }
        }
    } catch (error) {
        console.error("MapsService: Extraction Failed", error);
    }

    return items;
  }
}
