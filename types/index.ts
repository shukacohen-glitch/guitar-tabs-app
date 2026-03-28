// YouTube search result
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

// A detected pitch sample
export interface PitchSample {
  note: string;      // e.g. "E4"
  frequency: number; // Hz
  duration: number;  // seconds
  clarity: number;   // 0–1 confidence
}

// A single fret position on one string
export interface FretPosition {
  string: number; // 1 (high e) – 6 (low E)
  fret: number;   // 0 = open
}

// One note in the TAB with its optimal fret position
export interface TabNote {
  note: string;
  duration: number;
  position: FretPosition | null;
}

// A full TAB representation
export interface GuitarTab {
  title: string;
  artist: string;
  notes: TabNote[];
  asciiLines: string[];
}

// Application state phases
export type AppPhase = 'search' | 'player' | 'analyzing' | 'tab';
