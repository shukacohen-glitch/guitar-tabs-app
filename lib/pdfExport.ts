import { GuitarTab } from '@/types';

export async function exportToPdf(tab: GuitarTab): Promise<void> {
  // Dynamically import jspdf (browser only)
  const jspdf = await import('jspdf');
  // Support both named export (v2+/v4) and default export (v1)
  const JsPDF =
    (jspdf as { jsPDF?: typeof import('jspdf').jsPDF }).jsPDF ??
    (jspdf as unknown as { default: typeof import('jspdf').jsPDF }).default;

  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(tab.title, pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`by ${tab.artist}`, pageWidth / 2, 28, { align: 'center' });

  // Separator
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);

  // ASCII TAB in monospace
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);

  let y = 40;
  const lineHeight = 5;

  for (const line of tab.asciiLines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line || ' ', margin, y);
    y += lineHeight;
  }

  // Footer on every page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.text(
      `Guitar Tabs App — ${tab.title} — ${tab.artist}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Build a safe filename
  const fileName = `${tab.artist}-${tab.title}-tab.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^
\w\-_.]/g, '');
  doc.save(fileName);
}

export async function copyAsciiToClipboard(tab: GuitarTab): Promise<void> {
  const text = [
    `${tab.title} — ${tab.artist}`,
    '',
    ...tab.asciiLines,
  ].join('\n');

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-HTTPS environments
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}