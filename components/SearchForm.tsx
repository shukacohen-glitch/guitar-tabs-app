'use client';

import { useState, FormEvent } from 'react';

interface SearchFormProps {
  onSearch: (artist: string, song: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !song.trim()) {
      setError('יש למלא שם זמר ושם שיר');
      return;
    }
    setError('');
    onSearch(artist.trim(), song.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="artist" className="text-guitar-gold font-semibold text-sm">
          שם זמר / Artist
        </label>
        <input
          id="artist"
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="e.g. Metallica"
          className="bg-gray-800 border border-guitar-brown rounded-lg px-4 py-2
                     text-white placeholder-gray-500 focus:outline-none
                     focus:ring-2 focus:ring-guitar-gold"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="song" className="text-guitar-gold font-semibold text-sm">
          שם שיר / Song
        </label>
        <input
          id="song"
          type="text"
          value={song}
          onChange={(e) => setSong(e.target.value)}
          placeholder="e.g. Nothing Else Matters"
          className="bg-gray-800 border border-guitar-brown rounded-lg px-4 py-2
                     text-white placeholder-gray-500 focus:outline-none
                     focus:ring-2 focus:ring-guitar-gold"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-guitar-gold hover:bg-yellow-500 disabled:opacity-50
                   text-guitar-dark font-bold py-2 px-6 rounded-lg transition-colors"
      >
        {loading ? 'מחפש...' : '🔍 חפש'}
      </button>
    </form>
  );
}
