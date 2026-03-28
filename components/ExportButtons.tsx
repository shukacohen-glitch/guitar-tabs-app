'use client';

import { useState } from 'react';
import { GuitarTab } from '@/types';

interface ExportButtonsProps {
  tab: GuitarTab;
}

export default function ExportButtons({ tab }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handlePdfExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      const { exportToPdf } = await import('@/lib/pdfExport');
      await exportToPdf(tab);
    } catch (err) {
      console.error('PDF export failed:', err);
      const msg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      setExportError(`שגיאה בייצוא PDF: ${msg}`);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyAscii = async () => {
    setCopyError(false);
    try {
      const { copyAsciiToClipboard } = await import('@/lib/pdfExport');
      await copyAsciiToClipboard(tab);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  return (
    <div className="space-y-2">
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
          {copied ? '✅ הועתק!' : copyError ? '❌ שגיאה' : '📋 העתק ASCII'}
        </button>
      </div>

      {exportError && (
        <p className="text-red-400 text-xs text-center">{exportError}</p>
      )}
    </div>
  );
}