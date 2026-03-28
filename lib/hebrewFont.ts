import type { jsPDF } from 'jspdf';

/**
 * Fetches the Alef Regular Hebrew font from Google Fonts CDN at runtime,
 * registers it with the given jsPDF document instance, and sets it as the
 * active font.  Must be called inside a browser context (uses fetch + btoa).
 */
export async function addHebrewFont(doc: jsPDF): Promise<void> {
  const url = 'https://fonts.gstatic.com/s/alef/v21/FeVQS0BTqb2p3MU5.ttf';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Alef font: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();

  // Convert ArrayBuffer → base64 (efficient approach)
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);

  doc.addFileToVFS('Alef-Regular.ttf', base64);
  doc.addFont('Alef-Regular.ttf', 'Alef', 'normal');
  doc.setFont('Alef', 'normal');
}
