import { TabNote, FretPosition, GuitarTab } from '@/types';

// Standard guitar tuning: string 1 (high e) to string 6 (low E)
// Each string's open-string MIDI note number
const OPEN_STRINGS_MIDI: Record<number, number> = {
  1: 64, // e4
  2: 59, // B3
  3: 55, // G3
  4: 50, // D3
  5: 45, // A2
  6: 40, // E2
};

// Map note name + octave → MIDI note number
function noteNameToMidi(noteName: string): number | null {
  const noteMap: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
    E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
    Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  };
  const match = noteName.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return null;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitone = noteMap[name];
  if (semitone === undefined) return null;
  return (octave + 1) * 12 + semitone;
}

// Find all valid fret positions for a given MIDI note on all 6 strings
function getFretPositions(midi: number): FretPosition[] {
  const positions: FretPosition[] = [];
  for (let str = 1; str <= 6; str++) {
    const fret = midi - OPEN_STRINGS_MIDI[str];
    if (fret >= 0 && fret <= 19) {
      positions.push({ string: str, fret });
    }
  }
  return positions;
}

// Choose the best fret position: prefer open strings, then lowest frets, then
// strings close to the previous position (greedy with cost function)
function chooseBestPosition(
  positions: FretPosition[],
  prev: FretPosition | null
): FretPosition | null {
  if (positions.length === 0) return null;

  const scored = positions.map((pos) => {
    let cost = pos.fret; // prefer low frets

    // Prefer open strings
    if (pos.fret === 0) cost -= 3;

    // Prefer positions close to previous note
    if (prev) {
      const stringDiff = Math.abs(pos.string - prev.string);
      const fretDiff = Math.abs(pos.fret - prev.fret);
      cost += stringDiff * 1.5 + fretDiff * 0.5;
    }

    return { pos, cost };
  });

  scored.sort((a, b) => a.cost - b.cost);
  return scored[0].pos;
}

// Convert an array of note names to TabNotes with fret positions
export function notesToTabNotes(notes: Array<{ note: string; duration: number }>): TabNote[] {
  let prev: FretPosition | null = null;
  return notes.map(({ note, duration }) => {
    const midi = noteNameToMidi(note);
    if (midi === null) return { note, duration, position: null };
    const positions = getFretPositions(midi);
    const position = chooseBestPosition(positions, prev);
    if (position) prev = position;
    return { note, duration, position };
  });
}

// Render tab notes as 6-line ASCII TAB
// Notes are grouped into measures of ~8 slots each
export function renderAsciiTab(tabNotes: TabNote[]): string[] {
  const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
  const MEASURE_WIDTH = 10; // notes per line

  const chunks: TabNote[][] = [];
  for (let i = 0; i < tabNotes.length; i += MEASURE_WIDTH) {
    chunks.push(tabNotes.slice(i, i + MEASURE_WIDTH));
  }

  const lines: string[] = [];

  for (const chunk of chunks) {
    const stringLines: string[] = STRINGS.map((s) => `${s}|`);

    for (const tabNote of chunk) {
      for (let s = 0; s < 6; s++) {
        const strNum = s + 1;
        if (tabNote.position && tabNote.position.string === strNum) {
          const fretStr = tabNote.position.fret.toString();
          stringLines[s] += `-${fretStr}-`;
        } else {
          stringLines[s] += `---`;
        }
      }
    }

    // Close each string line
    for (let s = 0; s < 6; s++) {
      stringLines[s] += '|';
    }

    lines.push(...stringLines, '');
  }

  return lines;
}

// Demo tab: 30-note melody in E minor (first-position)
const DEMO_NOTES = [
  'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5',
  'D5', 'C5', 'B4', 'A4', 'G4', 'F#4', 'E4',
  'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4',
  'G4', 'F#4', 'E4', 'D4', 'C4', 'B3', 'A3', 'E4',
];

export function generateDemoTab(title: string, artist: string): GuitarTab {
  const notes = DEMO_NOTES.map((note) => ({ note, duration: 0.5 }));
  const tabNotes = notesToTabNotes(notes);
  const asciiLines = renderAsciiTab(tabNotes);
  return { title, artist, notes: tabNotes, asciiLines };
}

// Convert detected pitch samples to a GuitarTab
export function pitchSamplesToTab(
  samples: Array<{ note: string; duration: number }>,
  title: string,
  artist: string
): GuitarTab {
  const tabNotes = notesToTabNotes(samples);
  const asciiLines = renderAsciiTab(tabNotes);
  return { title, artist, notes: tabNotes, asciiLines };
}
