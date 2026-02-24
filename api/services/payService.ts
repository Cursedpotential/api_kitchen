
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * PAY SERVICE (TRANSACTION LOCATIONS)
 * -----------------------------------
 * Critical Function: traceTransactions()
 * Logic: Extract Merchant location data.
 */

export class PayService {
  private client = GoogleClient.getInstance();

  async traceTransactions(): Promise<ForensicItem[]> {
    const items: ForensicItem[] = [];
    
    // Simulated Transaction Stream
    const transactions = [
        { merchant: 'Shell Gas Station', location: 'Detroit, MI', amount: '45.00', time: new Date().toISOString() },
        { merchant: 'Liquor Palace', location: 'Flint, MI', amount: '120.00', time: new Date(Date.now() - 86400000).toISOString() }
    ];

    for (const tx of transactions) {
        const rawJson = JSON.stringify(tx);
        const hash = await calculateSHA256(rawJson);

        items.push({
            id: `pay-${Math.random()}`,
            source: 'Google Pay',
            timestamp: tx.time,
            title: `Transaction: ${tx.merchant}`,
            rawJson: rawJson,
            hash: hash,
            metadata: {
                location: tx.location,
                amount: tx.amount
            }
        });
    }
    return items;
  }
}
