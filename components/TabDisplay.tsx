'use client';

import { GuitarTab } from '@/types';

interface TabDisplayProps {
  tab: GuitarTab;
}

export default function TabDisplay({ tab }: TabDisplayProps) {
  // Group asciiLines into measures (every 7 lines = 6 string lines + 1 blank)
  const measures: string[][] = [];
  let current: string[] = [];
  for (const line of tab.asciiLines) {
    if (line === '' && current.length > 0) {
      measures.push([...current]);
      current = [];
    } else if (line !== '') {
      current.push(line);
    }
  }
  if (current.length > 0) measures.push(current);

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-guitar-gold">{tab.title}</h2>
        <p className="text-gray-400 text-sm">by {tab.artist}</p>
      </div>

      {/* Tuning legend */}
      <div className="flex justify-center gap-4 text-xs text-gray-400">
        <span className="font-mono">
          Standard Tuning: <span className="text-guitar-gold">E A D G B e</span>
        </span>
        <span>|</span>
        <span>{tab.notes.length} notes</span>
      </div>

      {/* TAB measures */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {measures.map((measure, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3 font-mono
                         text-sm text-guitar-string whitespace-pre"
            >
              {measure.map((line, lineIdx) => (
                <div key={lineIdx} className="leading-6">
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Finger notation guide */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-semibold text-guitar-gold mb-1">מקרא:</p>
        <div className="grid grid-cols-2 gap-1">
          <span>
            <code className="text-guitar-string">0</code> — מיתר פתוח
          </span>
          <span>
            <code className="text-guitar-string">1-4</code> — מספר סריג
          </span>
          <span>
            <code className="text-guitar-string">e</code> — מיתר מי עליון (High E)
          </span>
          <span>
            <code className="text-guitar-string">E</code> — מיתר מי תחתון (Low E)
          </span>
        </div>
      </div>
    </div>
  );
}
