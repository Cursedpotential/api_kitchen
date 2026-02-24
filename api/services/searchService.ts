
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * SEARCH SERVICE (INTENT ANALYZER)
 * --------------------------------
 * Critical Function: analyzeIntent()
 * Logic: Parses activity streams for specific keywords indicating intent (e.g., "delete", "custody").
 * Distinguishes between "Active Search" (User Typed) and "Passive View" (Ads/Recommendations).
 */

const HIGH_RISK_KEYWORDS = [
  'custody', 'lawyer', 'divorce', 'hide assets', 'delete messages', 
  'recover', 'spy', 'tracker', 'location', 'court', 'judge'
];

export class SearchService {
  private client = GoogleClient.getInstance();

  /**
   * Primary Analysis Engine
   * Accepts either raw JSON string (from file upload) or fetches from API if scope permits.
   * For this implementation, we simulate the API fetch as the 'activity' endpoint is highly restricted.
   */
  async analyzeIntent(simulatedData?: any[]): Promise<ForensicItem[]> {
    // NOTE: In a production legal environment, this often ingests a Takeout JSON file.
    // Here we define the logic to process such a structure or API response.
    
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    // 1. Fetch or Load Data (Simulated for Demo purposes as direct Search API is restricted)
    // In a real scenario with 'https://www.googleapis.com/auth/activity', we would fetch here.
    const rawData = simulatedData || [
      { header: 'Searched for how to delete text messages', title: 'Search', time: new Date(Date.now() - 1000000).toISOString() },
      { header: 'Visited Family Law Forum', title: 'Chrome', time: new Date(Date.now() - 5000000).toISOString() },
      { header: 'Ad for Divorce Attorney', title: 'AdSense', time: new Date(Date.now() - 6000000).toISOString() }
    ];

    const batchRaw = JSON.stringify(rawData);
    const batchHash = await calculateSHA256(batchRaw);

    for (const record of rawData) {
      const content = (record.header || record.title || '').toLowerCase();
      
      // Intent Classification
      const isHighRisk = HIGH_RISK_KEYWORDS.some(kw => content.includes(kw));
      const isPassive = content.includes('ad ') || content.includes('recommendation') || record.title === 'AdSense';
      const intentType = isPassive ? 'PASSIVE_IMPRESSION' : 'ACTIVE_QUERY';

      if (isHighRisk || !isPassive) {
         const recordJson = JSON.stringify(record);
         const recordHash = await calculateSHA256(recordJson);

         items.push({
           id: `search-${Math.random().toString(36).substr(2,9)}`,
           source: 'Search/MyActivity',
           timestamp: record.time,
           title: `${intentType}: ${record.header || record.title}`,
           rawJson: recordJson,
           hash: recordHash,
           metadata: {
             riskScore: isHighRisk ? 'HIGH' : 'LOW',
             intent: intentType,
             keywordsMatched: HIGH_RISK_KEYWORDS.filter(kw => content.includes(kw)),
             batchIntegrity: batchHash
           }
         });
      }
    }

    return items;
  }
}
