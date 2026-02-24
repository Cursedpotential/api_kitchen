
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * CHAT SERVICE (GASLIGHTING DETECTION)
 * ------------------------------------
 * Critical Function: detectGaslighting()
 * Logic: Scans message history.
 * Trigger: If 'lastUpdateTime' > 'createTime', the message was edited.
 * Goal: Prove that the text was altered after the fact.
 */

export class ChatService {
  private client = GoogleClient.getInstance();

  async detectGaslighting(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
        const spacesResp = await fetch('https://chat.googleapis.com/v1/spaces', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const spacesData = await spacesResp.json();

        if (spacesData.spaces) {
            for (const space of spacesData.spaces) {
                const msgResp = await fetch(`https://chat.googleapis.com/v1/${space.name}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const msgData = await msgResp.json();

                if (msgData.messages) {
                    for (const msg of msgData.messages) {
                        const created = new Date(msg.createTime).getTime();
                        const updated = msg.lastUpdateTime ? new Date(msg.lastUpdateTime).getTime() : created;
                        
                        // Logic: Gaslighting Detection
                        const wasEdited = updated > created;
                        
                        if (wasEdited) {
                             const rawJson = JSON.stringify(msg);
                             const hash = await calculateSHA256(rawJson);
                             
                             items.push({
                                 id: msg.name,
                                 source: 'Chat (Edits)',
                                 timestamp: msg.lastUpdateTime,
                                 title: `Edited Message in ${space.displayName}`,
                                 rawJson: rawJson,
                                 hash: hash,
                                 metadata: {
                                     originalTime: msg.createTime,
                                     editTime: msg.lastUpdateTime,
                                     sender: msg.sender.displayName,
                                     isGaslightingRisk: true
                                 }
                             });
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error("ChatService Error", e);
    }
    return items;
  }
}
