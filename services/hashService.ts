
export async function calculateSHA256(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function downloadForensicFiles(item: { rawJson: string; hash: string; title: string }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTitle = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  // JSON data file
  const jsonBlob = new Blob([item.rawJson], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `${safeTitle}_${timestamp}.json`;
  jsonLink.click();
  
  // Hash file
  const hashBlob = new Blob([item.hash], { type: 'text/plain' });
  const hashUrl = URL.createObjectURL(hashBlob);
  const hashLink = document.createElement('a');
  hashLink.href = hashUrl;
  hashLink.download = `${safeTitle}_${timestamp}.json.sha256`;
  hashLink.click();
}
