'use client';

import { useState, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import YouTubePlayer from '@/components/YouTubePlayer';
import MelodyAnalyzer from '@/components/MelodyAnalyzer';
import TabDisplay from '@/components/TabDisplay';
import ExportButtons from '@/components/ExportButtons';
import { searchYouTube } from '@/lib/youtubeSearch';
import { generateDemoTab, pitchSamplesToTab } from '@/lib/tabGenerator';
import { mergeConsecutiveNotes } from '@/lib/pitchDetection';
import { YouTubeVideo, GuitarTab, AppPhase, PitchSample } from '@/types';

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [tab, setTab] = useState<GuitarTab | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  const handleSearch = useCallback(async (artistName: string, songName: string) => {
    setLoading(true);
    setError('');
    setArtist(artistName);
    setSong(songName);
    setVideos([]);
    setNoApiKey(false);

    try {
      const query = encodeURIComponent(`${artistName} ${songName}`);
      const res = await fetch(`/api/youtube?q=${query}`);
      const data = await res.json();

      if (data.noApiKey) {
        setNoApiKey(true);
        setVideos([]);
      } else if (data.videos) {
        setVideos(data.videos);
      } else {
        setError(data.error ?? 'שגיאה בחיפוש');
      }
    } catch (e) {
      setError('שגיאת רשת. בדוק חיבור לאינטרנט.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectVideo = useCallback((video: YouTubeVideo) => {
    setSelectedVideo(video);
    setPhase('player');
    setTab(null);
  }, []);

  const handleUseDemoTab = useCallback(() => {
    const demoTab = generateDemoTab(song || 'Demo Song', artist || 'Demo Artist');
    setTab(demoTab);
    setPhase('tab');
  }, [song, artist]);

  const handleAnalysisComplete = useCallback(
    (samples: PitchSample[]) => {
      if (samples.length === 0) {
        const demoTab = generateDemoTab(song, artist);
        setTab(demoTab);
      } else {
        const merged = mergeConsecutiveNotes(samples);
        const detectedTab =
          merged.length > 3
            ? pitchSamplesToTab(merged, song, artist)
            : generateDemoTab(song, artist);
        setTab(detectedTab);
      }
      setPhase('tab');
    },
    [song, artist]
  );

  const handleAnalysisError = useCallback(
    (message: string) => {
      setError(message);
      const demoTab = generateDemoTab(song, artist);
      setTab(demoTab);
      setPhase('tab');
    },
    [song, artist]
  );

  const handleBack = useCallback(() => {
    if (phase === 'tab') {
      setPhase('player');
      setTab(null);
    } else if (phase === 'player') {
      setPhase('search');
      setSelectedVideo(null);
    }
  }, [phase]);

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-guitar-gold mb-1">🎸 Guitar Tabs App</h1>
        <p className="text-guitar-brown text-xs mt-1">By Shuki Cohen</p>
        <p className="text-gray-400 text-sm mt-2">
          חפש שיר ב-YouTube, נגן, האזן דרך מיקרופון וקבל טאב לגיטרה קלאסית
        </p>
      </header>

      {/* Global error */}
      {error && (
        <div
          className="max-w-2xl mx-auto mb-6 bg-red-900 border border-red-600
                        rounded-lg p-3 text-red-200 text-sm"
        >
          ⚠️ {error}
          <button
            onClick={() => setError('')}
            className="float-left text-red-300 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Phase: SEARCH ── */}
      {phase === 'search' && (
        <section className="max-w-xl mx-auto space-y-8">
          <SearchForm onSearch={handleSearch} loading={loading} />

          {/* No API key notice */}
          {noApiKey && (
            <div
              className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 text-sm
                            text-yellow-200"
            >
              <p className="font-semibold mb-1">⚙️ מפתח YouTube API לא מוגדר</p>
              <p>
                כדי לחפש ב-YouTube, הוסף{' '}
                <code className="bg-black/30 px-1 rounded">YOUTUBE_API_KEY</code> לקובץ{' '}
                <code className="bg-black/30 px-1 rounded">.env.local</code>.
              </p>
              <p className="mt-2">
                בינתיים תוכל{' '}
                <button
                  onClick={handleUseDemoTab}
                  className="underline text-yellow-300 hover:text-white"
                >
                  לצפות בטאב לדוגמה
                </button>
                .
              </p>
            </div>
          )}

          {/* Search results */}
          {videos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-guitar-gold font-semibold">תוצאות חיפוש:</h2>
              <ul className="space-y-2">
                {videos.map((v) => (
                  <li key={v.id}> 
                    <button
                      onClick={() => handleSelectVideo(v)}
                      className="w-full flex gap-3 items-center bg-gray-800 hover:bg-gray-700
                                 border border-gray-700 hover:border-guitar-brown rounded-lg
                                 p-3 text-left transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-24 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-white font-medium text-sm line-clamp-2">
                          {v.title}
                        </span>
                        <span className="text-gray-400 text-xs">{v.channelTitle}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── Phase: PLAYER ── */}
      {phase === 'player' && selectedVideo && (
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              ← חזור לחיפוש
            </button>
            <h2 className="text-guitar-gold font-semibold truncate">{selectedVideo.title}</h2>
          </div>

          <YouTubePlayer videoId={selectedVideo.id} />

          <div className="flex flex-col gap-3">
            <MelodyAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleAnalysisError}
            />

            <div className="text-center">
              <span className="text-gray-500 text-xs">— או —</span>
            </div>

            <button
              onClick={handleUseDemoTab}
              className="w-full border border-guitar-brown text-guitar-gold hover:bg-guitar-brown/20
                         py-2 px-4 rounded-lg text-sm transition-colors"
            >
              🎸 הצג טאב לדוגמה (ללא ניתוח)
            </button>
          </div>
        </section>
      )}

      {/* ── Phase: TAB ── */}
      {phase === 'tab' && tab && (
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              ← חזור לנגן
            </button>
          </div>

          <TabDisplay tab={tab} />
          <ExportButtons tab={tab} />
        </section>
      )}

      {/* Footer */}
      <footer className="text-center mt-16 text-xs text-gray-600">
        Guitar Tabs App • Next.js 15 • MIT License
      </footer>
    </main>
  );
}