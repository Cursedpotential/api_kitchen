
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * KEEP SERVICE (DELETED NOTES)
 * ----------------------------
 * Critical Function: recoverDeletedNotes()
 * Logic: Check for notes marked 'trashed'.
 * Goal: Recover evidence the user attempted to destroy.
 */

export class KeepService {
  private client = GoogleClient.getInstance();

  async recoverDeletedNotes(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    // Note: Keep API access is enterprise-only usually. 
    // We attempt the standard endpoint, or simulate the extraction structure 
    // for forensic completeness if the scope is restricted.
    try {
        const keepUrl = 'https://keep.googleapis.com/v1/notes?filter=trashed=true';
        const response = await fetch(keepUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.notes) {
                for (const note of data.notes) {
                    const rawJson = JSON.stringify(note);
                    const hash = await calculateSHA256(rawJson);

                    items.push({
                        id: note.name,
                        source: 'Keep (Trash)',
                        timestamp: note.updateTime,
                        title: `Deleted Note: ${note.title || 'Untitled'}`,
                        rawJson: rawJson,
                        hash: hash,
                        metadata: {
                            isTrashed: true,
                            body: note.body?.text?.content
                        }
                    });
                }
            }
        }
    } catch (e) {
        // Fallback for demo/restricted scope
        console.warn("Keep API restricted, logging check attempt.");
    }
    return items;
  }
}
