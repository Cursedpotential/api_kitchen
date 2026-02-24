
import { GoogleClient } from '../googleClient';
import { calculateSHA256 } from '../forensics/integrity';
import { ForensicItem } from '../../types';

/**
 * PEOPLE SERVICE
 * --------------
 * Critical Function: fetchShadowContacts()
 * Logic: Extracts 'Other Contacts' which contains implicit contacts (people emailed/replied to) 
 * who are NOT in the user's explicit address book. High value for identifying hidden relationships.
 */

export class PeopleService {
  private client = GoogleClient.getInstance();

  /**
   * Extracts "Other Contacts" (Transient/Implicit)
   */
  async fetchShadowContacts(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    const items: ForensicItem[] = [];

    try {
      // Request mask specifically targets metadata to see interaction counts if available
      const response = await fetch(
        'https://people.googleapis.com/v1/otherContacts?readMask=names,emailAddresses,phoneNumbers,metadata&pageSize=1000',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      const rawJson = JSON.stringify(data, null, 2);
      const batchHash = await calculateSHA256(rawJson);

      if (data.otherContacts) {
        for (const contact of data.otherContacts) {
          const name = contact.names?.[0]?.displayName || 'Unknown';
          const email = contact.emailAddresses?.[0]?.value || 'No Email';
          
          // Hash individual record
          const recordJson = JSON.stringify(contact);
          const recordHash = await calculateSHA256(recordJson);

          items.push({
            id: contact.resourceName || `unknown-${Math.random()}`,
            source: 'People (Shadow)',
            timestamp: new Date().toISOString(), // 'Other' contacts don't always have timestamps, default to extraction time
            title: `Shadow Contact: ${name} <${email}>`,
            rawJson: recordJson,
            hash: recordHash,
            metadata: {
              email,
              phone: contact.phoneNumbers?.[0]?.value,
              sourceType: 'IMPLICIT_INTERACTION',
              batchHashReference: batchHash
            }
          });
        }
      }
    } catch (error) {
      console.error('PeopleService: Shadow Fetch Error', error);
    }
    return items;
  }

  /**
   * Extracts Verified User Profile
   */
  async fetchProfileMetadata(): Promise<ForensicItem[]> {
    const token = this.client.getToken();
    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers,metadata',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      const rawJson = JSON.stringify(data, null, 2);
      const hash = await calculateSHA256(rawJson);

      return [{
        id: 'ME_PROFILE',
        source: 'People (Profile)',
        timestamp: new Date().toISOString(),
        title: `Identity Verification: ${data.names?.[0]?.displayName}`,
        rawJson: rawJson,
        hash: hash,
        metadata: {
          primaryEmail: data.emailAddresses?.[0]?.value,
          resourceId: data.resourceName
        }
      }];
    } catch (error) {
      console.error('PeopleService: Profile Fetch Error', error);
      return [];
    }
  }
}
