
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * YOUTUBE SERVICE (INTENT HISTORY)
 * --------------------------------
 * Critical Function: fetchWatchHistory()
 * Logic: Analyze viewing habits.
 * Goal: Find videos related to "hiding assets" or "spying".
 */

export class YouTubeService {
  private client = GoogleClient.getInstance();

  async fetchWatchHistory(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=20', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.items) {
            for (const item of data.items) {
                const rawJson = JSON.stringify(item);
                const hash = await calculateSHA256(rawJson);
                
                items.push({
                    id: item.id,
                    source: 'YouTube',
                    timestamp: item.snippet.publishedAt,
                    title: `Watched: ${item.snippet.title}`,
                    rawJson: rawJson,
                    hash: hash,
                    metadata: {
                        channel: item.snippet.channelTitle,
                        description: item.snippet.description
                    }
                });
            }
        }
    } catch (e) {
        console.error("YouTubeService Error", e);
    }
    return items;
  }
}
