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
  const ANALYSIS_DURATION_MS = 30_000;

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

  const handleAutoTab = useCallback(() => {
    setAutoGenerating(true);
    setMode('auto');
    setTimeout(() => {
      setAutoGenerating(false);
      onAutoTab();
    }, 800);
  }, [onAutoTab]);

  if (mode === 'choose') {
    return (
      <div className="w-full space-y-3">
        <div className="bg-gray-800 border border-guitar-brown rounded-lg p-4 text-sm text-gray-300">
          <p className="font-semibold text-guitar-gold mb-2">🎵 בחר סוג ניתוח</p>
          <p className="text-xs text-gray-400">כיצד תרצה לקבל את הטאב?</p>
        </div>

        <button
          onClick={() => { setMode('mic'); startListening(); }}
          className="w-full bg-guitar-brown hover:bg-amber-800 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🎤 ניתוח מהמיקרופון
          <span className="text-xs font-normal opacity-75">(האזנה לשיר דרך מיק)</span>
        </button>

        <button
          onClick={handleAutoTab}
          className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold
                     py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🤖 ניתוח אוטומטי
          <span className="text-xs font-normal opacity-75">(האפליקציה מייצרת לפי שם השיר)</span>
        </button>
      </div>
    );
  }

  if (mode === 'auto') {
    return (
      <div className="w-full space-y-3">
        <div className="bg-indigo-900 border border-indigo-600 rounded-lg p-4 text-sm text-indigo-200 text-center">
          {autoGenerating ? (
            <>
              <p className="font-semibold text-lg mb-1">🤖 מייצר טאב אוטומטי...</p>
              <p className="text-xs opacity-75">מנתח: {artist} — {song}</p>
            </>
          ) : (
            <p className="font-semibold">✅ הטאב נוצר בהצלחה!</p>
          )}
        </div>
        <button
          onClick={() => setMode('choose')}
          className="w-full border border-gray-600 text-gray-400 hover:text-white
                     py-2 px-4 rounded-lg text-sm transition-colors"
        >
          ← חזור לבחירה
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-800 border border-guitar-brown rounded-lg p-4 text-sm text-gray-300">
        <p className="font-semibold text-guitar-gold mb-1">🎙️ ניתוח מלודיה ממיקרופון</p>
        <p>הפעל את הוידאו ב-YouTube, האפליקציה מקשיבה דרך המיקרופון.</p>
        <p className="mt-1 text-xs text-gray-400">הניתוח נמשך עד 30 שניות. ניתן לעצור מוקדם.</p>
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
          🎤 התחל האזנה (30 שנ&#x27;)
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
        className="w-full border border-gray-600 text-gray-400 hover:text-white
                   py-2 px-4 rounded-lg text-sm transition-colors"
      >
        ← חזור לבחירה
      </button>
    </div>
  );
}