'use client';

import { GuitarTab, TabNote } from '@/types';

interface TabDisplayProps {
  tab: GuitarTab;
}

const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

const NOTES_PER_ROW = 16;
const CELL_W = 38;
const STRING_GAP = 28;
const ROW_PADDING_TOP = 20;
const ROW_PADDING_BOTTOM = 40;
const LEFT_LABEL_W = 22;
const ROW_HEIGHT = ROW_PADDING_TOP + STRING_GAP * 5 + ROW_PADDING_BOTTOM;

function TabRow({
  notes,
  rowIndex,
}: {
  notes: TabNote[];
  rowIndex: number;
}) {
  const svgWidth = LEFT_LABEL_W + notes.length * CELL_W + 20;
  const svgHeight = ROW_HEIGHT;

  const stringY = (s: number) => ROW_PADDING_TOP + s * STRING_GAP;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      className="block"
      style={{ fontFamily: 'ui-monospace, monospace' }}
    >
      {STRING_LABELS.map((label, si) => {
        const y = stringY(si);
        return (
          <g key={si}>
            <text
              x={LEFT_LABEL_W - 4}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight="bold"
              fill={si === 0 ? '#f59e0b' : si === 5 ? '#92400e' : '#4b5563'}
            >
              {label}
            </text>
            <line
              x1={LEFT_LABEL_W}
              y1={y}
              x2={svgWidth - 4}
              y2={y}
              stroke="#d1d5db"
              strokeWidth={si === 0 || si === 5 ? 1.5 : 1}
            />
          </g>
        );
      })}

      <line
        x1={LEFT_LABEL_W}
        y1={stringY(0)}
        x2={LEFT_LABEL_W}
        y2={stringY(5)}
        stroke="#6b7280"
        strokeWidth={1.5}
      />

      {notes.map((note, ni) => {
        if (!note.position) return null;
        const cx = LEFT_LABEL_W + ni * CELL_W + CELL_W / 2;
        const si = note.position.string - 1;
        const cy = stringY(si);
        const fretStr = note.position.fret.toString();
        const boxW = fretStr.length > 1 ? 22 : 16;

        return (
          <g key={ni}>
            <rect
              x={cx - boxW / 2}
              y={cy - 9}
              width={boxW}
              height={18}
              fill="white"
            />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fontSize={13}
              fontWeight="600"
              fill="#111827"
            >
              {fretStr}
            </text>
          </g>
        );
      })}

      <line
        x1={LEFT_LABEL_W + notes.length * CELL_W}
        y1={stringY(0)}
        x2={LEFT_LABEL_W + notes.length * CELL_W}
        y2={stringY(5)}
        stroke="#6b7280"
        strokeWidth={1.5}
      />

      <text
        x={LEFT_LABEL_W + 2}
        y={svgHeight - 8}
        fontSize={10}
        fill="#9ca3af"
      >
        {rowIndex + 1}
      </text>
    </svg>
  );
}

export default function TabDisplay({ tab }: TabDisplayProps) {
  const rows: TabNote[][] = [];
  for (let i = 0; i < tab.notes.length; i += NOTES_PER_ROW) {
    rows.push(tab.notes.slice(i, i + NOTES_PER_ROW));
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-guitar-gold">{tab.title}</h2>
        <p className="text-gray-400 text-sm">by {tab.artist}</p>
      </div>

      <div className="flex justify-center gap-6 text-xs text-gray-400 font-mono">
        <span>
          Tuning: <span className="text-guitar-gold font-semibold">E A D G B e</span>
        </span>
        <span>|</span>
        <span>{tab.notes.length} notes</span>
        <span>|</span>
        <span>{rows.length} measures</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto p-4 space-y-2">
        {rows.map((rowNotes, ri) => (
          <TabRow
            key={ri}
            notes={rowNotes}
            rowIndex={ri}
          />
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
        <p className="font-semibold text-guitar-gold mb-2">מקרא:</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <span><code className="text-yellow-400">0</code> — מיתר פתוח (open string)</span>
          <span><code className="text-yellow-400">1–19</code> — מספר סריג (fret number)</span>
          <span><code className="text-yellow-400 font-bold">e</code> — High E (מיתר מי עליון)</span>
          <span><code className="text-amber-700 font-bold">E</code> — Low E (מיתר מי תחתון)</span>
        </div>
      </div>
    </div>
  );
}