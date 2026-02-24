
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * VOICE SERVICE (AUDIO EVIDENCE)
 * ------------------------------
 * Critical Function: fetchEvidenceLogs()
 * Logic: Lists call logs differentiating 'Missed' vs 'Rejected'.
 * Critical: Constructs the direct download URL for Voicemail MP3s.
 */

export class VoiceService {
  private client = GoogleClient.getInstance();

  async fetchEvidenceLogs(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
      const response = await fetch('https://voice.googleapis.com/v1/voice/calls', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.calls) {
        for (const call of data.calls) {
          const rawJson = JSON.stringify(call);
          const hash = await calculateSHA256(rawJson);
          
          // Logic: "Rejected" often appears as 0s duration incoming call that wasn't "Missed" in the traditional sense
          const isRejected = call.type === 'INCOMING' && call.duration === '0s' && !call.isMissed;
          const status = isRejected ? 'REJECTED (User sent to VM)' : call.type;

          let mp3Url = null;
          if (call.voicemail) {
             // Construct raw download URL for the artifact
             mp3Url = `https://voice.googleapis.com/v1/voice/voicemails/${call.voicemail.id}/media`;
          }

          items.push({
            id: call.id,
            source: 'Google Voice',
            timestamp: call.startTime,
            title: `${status}: ${call.phoneNumber}`,
            rawJson: rawJson,
            hash: hash,
            metadata: {
              duration: call.duration,
              isRejected: isRejected,
              hasAudioEvidence: !!mp3Url,
              audioDownloadUrl: mp3Url
            }
          });
        }
      }
    } catch (e) {
      console.error("VoiceService Error", e);
    }
    return items;
  }
}
