'use client';

import { useState } from 'react';
import { GuitarTab } from '@/types';

interface ExportButtonsProps {
  tab: GuitarTab;
}

export default function ExportButtons({ tab }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handlePdfExport = async () => {
    setExporting(true);
    try {
      const { exportToPdf } = await import('@/lib/pdfExport');
      await exportToPdf(tab);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('שגיאה בייצוא PDF. נסה שוב.');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyAscii = async () => {
    try {
      const { copyAsciiToClipboard } = await import('@/lib/pdfExport');
      copyAsciiToClipboard(tab);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <button
        onClick={handlePdfExport}
        disabled={exporting}
        className="bg-guitar-brown hover:bg-amber-800 disabled:opacity-50
                   text-white font-semibold py-2 px-5 rounded-lg transition-colors
                   flex items-center gap-2"
      >
        {exporting ? '⏳ מייצא...' : '📄 ייצא PDF'}
      </button>

      <button
        onClick={handleCopyAscii}
        className="bg-gray-700 hover:bg-gray-600
                   text-white font-semibold py-2 px-5 rounded-lg transition-colors
                   flex items-center gap-2"
      >
        {copied ? '✅ הועתק!' : '📋 העתק ASCII'}
      </button>
    </div>
  );
}
