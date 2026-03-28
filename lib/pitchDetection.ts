import { PitchSample } from '@/types';

// Convert frequency (Hz) to MIDI note number
function freqToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

// Convert MIDI note number to note name (e.g. 69 → "A4")
function midiToNoteName(midi: number): string {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rounded = Math.round(midi);
  const octave = Math.floor(rounded / 12) - 1;
  const semitone = rounded % 12;
  return `${NOTE_NAMES[semitone]}${octave}`;
}

export interface PitchDetector {
  start(): Promise<void>;
  stop(): void;
  onSample?: (sample: PitchSample) => void;
  onError?: (error: Error) => void;
}

// Minimum clarity threshold to accept a detected pitch
const CLARITY_THRESHOLD = 0.85;
// Minimum frequency (guitar low E is ~82 Hz)
const MIN_FREQ = 70;
// Maximum frequency (guitar high e fret 20 is ~1047 Hz)
const MAX_FREQ = 1100;
// How often to sample, in ms
const SAMPLE_INTERVAL_MS = 100;

// Create a pitch detector that listens to the microphone
export function createPitchDetector(): PitchDetector {
  let audioContext: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let analyser: AnalyserNode | null = null;

  const detector: PitchDetector = {
    async start() {
      // Dynamically import pitchy (browser-only)
      const { PitchDetector: Pitchy } = await import('pitchy');

      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const bufferLength = analyser.fftSize;
      const floatData = new Float32Array(bufferLength);
      const pitchDetectorInstance = Pitchy.forFloat32Array(bufferLength);

      intervalId = setInterval(() => {
        if (!analyser || !audioContext) return;
        analyser.getFloatTimeDomainData(floatData);
        const [freq, clarity] = pitchDetectorInstance.findPitch(
          floatData,
          audioContext.sampleRate
        );

        if (clarity >= CLARITY_THRESHOLD && freq >= MIN_FREQ && freq <= MAX_FREQ) {
          const midi = freqToMidi(freq);
          const note = midiToNoteName(midi);
          const sample: PitchSample = {
            note,
            frequency: freq,
            duration: SAMPLE_INTERVAL_MS / 1000,
            clarity,
          };
          detector.onSample?.(sample);
        }
      }, SAMPLE_INTERVAL_MS);
    },

    stop() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
      }
    },
  };

  return detector;
}

// Merge consecutive same-note samples to reduce noise
export function mergeConsecutiveNotes(
  samples: PitchSample[],
  minDuration = 0.15
): Array<{ note: string; duration: number }> {
  const result: Array<{ note: string; duration: number }> = [];
  let i = 0;
  while (i < samples.length) {
    const current = samples[i];
    let duration = current.duration;
    while (i + 1 < samples.length && samples[i + 1].note === current.note) {
      duration += samples[i + 1].duration;
      i++;
    }
    if (duration >= minDuration) {
      result.push({ note: current.note, duration });
    }
    i++;
  }
  return result;
}
