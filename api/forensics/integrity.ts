
/**
 * FORENSIC INTEGRITY MODULE
 * -------------------------
 * Standard: NIST FIPS 180-4 (SHA-256)
 * Purpose: Chain of Custody verification for digital evidence.
 */

export async function calculateSHA256(data: string | Uint8Array): Promise<string> {
  let msgBuffer: Uint8Array;
  
  if (typeof data === 'string') {
    msgBuffer = new TextEncoder().encode(data);
  } else {
    msgBuffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function generateForensicMetadata(sourceId: string, timestamp: string) {
  return {
    captureTool: 'Salem Forensic Kitchen v1.0',
    isoTimestamp: timestamp,
    integrityCheck: 'SHA-256',
    sourceId: sourceId
  };
}
