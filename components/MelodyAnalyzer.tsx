'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [progress, setProgress] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const detectorRef = useRef<import('@/lib/pitchDetection').PitchDetector | null>(null);
  const samplesRef = useRef<PitchSample[]>([]);
  const ANALYSIS_DURATION_MS = 60_000; // 60 seconds (1 minute)

  const startListening = useCallback(async () => {
    samplesRef.current = [];
    setSampleCount(0);
    setProgress(0);
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
        onAnalysisError(err.message);
      };

      await detector.start();

      // Auto-stop after ANALYSIS_DURATION_MS
      const startTime = Date.now();
      const tick = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / ANALYSIS_DURATION_MS) * 100, 100);
        setProgress(pct);
        if (elapsed >= ANALYSIS_DURATION_MS) {
          clearInterval(tick);
          detector.stop();
          setIsListening(false);
          setProgress(100);
          onAnalysisComplete(samplesRef.current);
        }
      }, 200);
    } catch (err) {
      setIsListening(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'לא ניתן לגשת למיקרופון. אנא אשר הרשאת מיקרופון ונסה שוב.';
      onAnalysisError(msg);
    }
  }, [onAnalysisComplete, onAnalysisError]);

  const stopListening = useCallback(() => {
    detectorRef.current?.stop();
    setIsListening(false);
    setProgress(100);
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
                  הפעל YouTube ואנחנו נקשיב דרך המיקרופון (עד דקה)
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
          לחץ על &quot;נתח מלודיה&quot;, הפעל את הוידאו ב-YouTube, והאפליקציה תקשיב דרך
          המיקרופון לזיהוי התווים.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          הניתוח נמשך עד דקה שלמה (60 שניות). ניתן לעצור מוקדם.
        </p>
      </div>

      {isListening && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>מנתח… ({sampleCount} תווים זוהו)</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-guitar-gold h-3 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!isListening ? (
        <button
          onClick={startListening}
          className="w-full bg-guitar-brown hover:bg-amber-800 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🎤 נתח מלודיה (60 שנ&#x27;)
        </button>
      ) : (
        <button
          onClick={stopListening}
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors"
        >
          ⏹ עצור ניתוח
        </button>
      )}

      <button
        onClick={() => { detectorRef.current?.stop(); setMode('choose'); }}
        className="w-full text-gray-400 hover:text-white text-sm underline py-1"
      >
        ← חזור לבחירת שיטה
      </button>
    </div>
  );
}