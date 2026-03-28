'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PitchSample } from '@/types';

interface MelodyAnalyzerProps {
  artist: string;
  song: string;
  onAnalysisComplete: (samples: PitchSample[]) => void;
  onAnalysisError: (message: string) => void;
  onAutoTab: () => void;
}

export default function MelodyAnalyzer({
  artist,
  song,
  onAnalysisComplete,
  onAnalysisError,
  onAutoTab,
}: MelodyAnalyzerProps) {
  const [mode, setMode] = useState<'choose' | 'mic' | 'auto'>('choose');
  const [isListening, setIsListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const detectorRef = useRef<import('@/lib/pitchDetection').PitchDetector | null>(null);
  const samplesRef = useRef<PitchSample[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const startListening = useCallback(async () => {
    samplesRef.current = [];
    setSampleCount(0);
    setElapsed(0);
    setIsListening(true);

    try {
      const { createPitchDetector } = await import('@/lib/pitchDetection');
      const detector = createPitchDetector();
      detectorRef.current = detector;

      detector.onSample = (sample: PitchSample) => {
        samplesRef.current.push(sample);
        setSampleCount((c) => c + 1);
      };

      detector.onError = (err: Error) => {
        setIsListening(false);
        if (tickRef.current) clearInterval(tickRef.current);
        onAnalysisError(err.message);
      };

      await detector.start();

      // Count elapsed seconds — no auto-stop
      const startTime = Date.now();
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (err) {
      setIsListening(false);
      if (tickRef.current) clearInterval(tickRef.current);
      const msg =
        err instanceof Error
          ? err.message
          : 'לא ניתן לגשת למיקרופון. אנא אשר הרשאת מיקרופון ונסה שוב.';
      onAnalysisError(msg);
    }
  }, [onAnalysisComplete, onAnalysisError]);

  const stopListening = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    detectorRef.current?.stop();
    setIsListening(false);
    onAnalysisComplete(samplesRef.current);
  }, [onAnalysisComplete]);

  const handleAutoTab = useCallback(async () => {
    setAutoGenerating(true);
    setMode('auto');
    try {
      await new Promise((r) => setTimeout(r, 400));
      onAutoTab();
    } finally {
      setAutoGenerating(false);
    }
  }, [onAutoTab]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Choose mode ──
  if (mode === 'choose') {
    return (
      <div className="w-full space-y-4">
        <div className="bg-gray-800 border border-guitar-brown rounded-lg p-4 text-sm text-gray-300">
          <p className="font-semibold text-guitar-gold mb-2">🎵 בחר שיטת יצירת טאב</p>
          <p>בחר כיצד ברצונך ליצור את הטאב לגיטרה:</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Mic analysis */}
          <button
            onClick={() => setMode('mic')}
            className="w-full bg-guitar-brown hover:bg-amber-800 text-white font-bold
                       py-4 px-6 rounded-lg transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <div className="font-bold">ניתוח מיקרופון</div>
                <div className="text-xs text-amber-200 font-normal mt-0.5">
                  הפעל YouTube ואנחנו נקשיב — עצור בכל עת שתרצה
                </div>
              </div>
            </div>
          </button>

          {/* Auto-generate */}
          <button
            onClick={handleAutoTab}
            disabled={autoGenerating}
            className="w-full bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50
                       text-white font-bold py-4 px-6 rounded-lg transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-bold">
                  {autoGenerating ? 'מייצר טאב...' : 'טאב אוטומטי'}
                </div>
                <div className="text-xs text-indigo-200 font-normal mt-0.5">
                  יצירת טאב מוסיקלי לפי שם האמן והשיר — ללא מיקרופון
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Mic mode ──
  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-800 border border-guitar-brown rounded-lg p-4 text-sm text-gray-300">
        <p className="font-semibold text-guitar-gold mb-1">🎙️ ניתוח מלודיה</p>
        <p>
          לחץ על &quot;התחל האזנה&quot;, הפעל את הוידאו ב-YouTube, והאפליקציה תקשיב דרך
          המיקרופון לזיהוי התווים.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          הניתוח ימשיך לאורך כל השיר — לחץ &quot;עצור ניתוח&quot; בסיום.
        </p>
      </div>

      {isListening && (
        <div className="bg-gray-900 border border-guitar-brown rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-gray-300">מקשיב… {sampleCount} תווים זוהו</span>
          </div>
          <span className="font-mono text-guitar-gold text-sm">{formatElapsed(elapsed)}</span>
        </div>
      )}

      {!isListening ? (
        <button
          onClick={startListening}
          className="w-full bg-guitar-brown hover:bg-amber-800 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🎤 התחל האזנה
        </button>
      ) : (
        <button
          onClick={stopListening}
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors"
        >
          ⏹ עצור ניתוח וצור טאב
        </button>
      )}

      <button
        onClick={() => { detectorRef.current?.stop(); if (tickRef.current) clearInterval(tickRef.current); setMode('choose'); }}
        className="w-full text-gray-400 hover:text-white text-sm underline py-1"
      >
        ← חזור לבחינת שיטה
      </button>
    </div>
  );
}