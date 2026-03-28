import { GuitarTab } from '@/types';

export async function exportToPdf(tab: GuitarTab): Promise<void> {
  // Dynamically import jspdf (browser only)
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${tab.title}`, pageWidth / 2, 20, { align: 'center' });

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
    doc.text(line, margin, y);
    y += lineHeight;
  }

  // Footer
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

  doc.save(`${tab.artist}-${tab.title}-tab.pdf`.replace(/\s+/g, '_'));
}

export function copyAsciiToClipboard(tab: GuitarTab): void {
  const text = [
    `${tab.title} — ${tab.artist}`,
    '',
    ...tab.asciiLines,
  ].join('\n');
  navigator.clipboard.writeText(text);
}
