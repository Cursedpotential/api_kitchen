
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * GMAIL SERVICE (HEADER ANALYSIS)
 * -------------------------------
 * Critical Function: traceHeaders()
 * Logic: Extract "X-Originating-IP" or "Received" headers.
 * Goal: Map physical location of the sender.
 */

export class GmailService {
  private client = GoogleClient.getInstance();

  async traceHeaders(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
        const listResp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const listData = await listResp.json();

        if (listData.messages) {
            for (const msgStub of listData.messages) {
                 const msgResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgStub.id}?format=full`, {
                    headers: { Authorization: `Bearer ${token}` }
                 });
                 const msg = await msgResp.json();
                 
                 const headers = msg.payload.headers || [];
                 const originatingIp = headers.find((h: any) => h.name === 'X-Originating-IP')?.value;
                 const subject = headers.find((h: any) => h.name === 'Subject')?.value;

                 if (originatingIp) {
                     const rawJson = JSON.stringify(msg.payload.headers);
                     const hash = await calculateSHA256(rawJson);

                     items.push({
                         id: msg.id,
                         source: 'Gmail (IP Trace)',
                         timestamp: new Date(parseInt(msg.internalDate)).toISOString(),
                         title: `IP Trace: ${subject}`,
                         rawJson: rawJson,
                         hash: hash,
                         metadata: {
                             originatingIp: originatingIp,
                             sender: headers.find((h: any) => h.name === 'From')?.value
                         }
                     });
                 }
            }
        }
    } catch (e) {
        console.error("GmailService Error", e);
    }
    return items;
  }
}
