
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * DRIVE SERVICE (INTEGRITY & REVISIONS)
 * -------------------------------------
 * Critical Function: auditRevisions()
 * Logic: Fetch file revisions.
 * Goal: Find content that was deleted or altered in legal documents.
 */

export class DriveService {
  private client = GoogleClient.getInstance();

  async auditRevisions(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
        const filesResp = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.document"&pageSize=20', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const filesData = await filesResp.json();

        if (filesData.files) {
            for (const file of filesData.files) {
                const revResp = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/revisions?fields=*`, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                const revData = await revResp.json();
                
                if (revData.revisions && revData.revisions.length > 1) {
                    const rawJson = JSON.stringify(revData);
                    const hash = await calculateSHA256(rawJson);

                    items.push({
                        id: file.id,
                        source: 'Drive (Revisions)',
                        timestamp: file.modifiedTime,
                        title: `Revision History: ${file.name}`,
                        rawJson: rawJson,
                        hash: hash,
                        metadata: {
                            revisionCount: revData.revisions.length,
                            lastModifyingUser: revData.revisions[revData.revisions.length-1].lastModifyingUser?.emailAddress,
                            fileId: file.id
                        }
                    });
                }
            }
        }
    } catch (e) {
        console.error("DriveService Error", e);
    }
    return items;
  }
}
