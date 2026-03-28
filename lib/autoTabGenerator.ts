import { GuitarTab } from '@/types';
import { notesToTabNotes, renderAsciiTab } from './tabGenerator';

// Common scales as semitone intervals from root
const SCALES: Record<string, number[]> = {
  major:       [0, 2, 4, 5, 7, 9, 11],
  minor:       [0, 2, 3, 5, 7, 8, 10],
  pentatonic:  [0, 2, 4, 7, 9],
  blues:       [0, 3, 5, 6, 7, 10],
  dorian:      [0, 2, 3, 5, 7, 9, 10],
  mixolydian:  [0, 2, 4, 5, 7, 9, 10],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Simple hash from a string → number
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Pick a root note and scale based on artist+song name
function pickScaleFromTitle(artist: string, song: string): { root: number; scale: number[]; scaleName: string } {
  const combined = (artist + song).toLowerCase();
  const hash = hashString(combined);
  const root = hash % 12;
  const scaleNames = Object.keys(SCALES);
  const scaleName = scaleNames[hash % scaleNames.length];
  return { root, scale: SCALES[scaleName], scaleName };
}

// Generate a melodic pattern using the scale notes
function generateMelody(
  root: number,
  scale: number[],
  length: number
): Array<{ note: string; duration: number }> {
  // Build notes across 2 octaves (octave 3 and 4)
  const pool: string[] = [];
  for (const octave of [3, 4]) {
    for (const interval of scale) {
      const midi = (octave + 1) * 12 + ((root + interval) % 12);
      const noteName = NOTE_NAMES[(root + interval) % 12];
      const noteOctave = Math.floor(midi / 12) - 1;
      pool.push(`${noteName}${noteOctave}`);
    }
  }

  // Create a musical pattern: ascending, peak, descending
  const result: Array<{ note: string; duration: number }> = [];
  const half = Math.floor(length / 2);

  // Ascending phase
  for (let i = 0; i < half; i++) {
    const idx = i % pool.length;
    result.push({ note: pool[idx], duration: 0.5 });
  }

  // Descending phase
  for (let i = half; i < length; i++) {
    const idx = (pool.length - 1) - ((i - half) % pool.length);
    result.push({ note: pool[Math.max(0, idx)], duration: 0.5 });
  }

  return result;
}

// Generate a guitar tab automatically from artist + song name
export function generateAutoTab(artist: string, song: string): GuitarTab {
  const { root, scale, scaleName } = pickScaleFromTitle(artist, song);
  const rootName = NOTE_NAMES[root];
  const melody = generateMelody(root, scale, 32);
  const tabNotes = notesToTabNotes(melody);
  const asciiLines = renderAsciiTab(tabNotes);

  return {
    title: `${song} (Auto-generated • ${rootName} ${scaleName})`,
    artist,
    notes: tabNotes,
    asciiLines,
  };
}