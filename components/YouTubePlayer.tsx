'use client';

import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
}

export default function YouTubePlayer({ videoId, onReady }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Build the standard embed URL (no privacy-enhanced mode needed here)
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.onload = () => onReady?.();

    container.innerHTML = '';
    container.appendChild(iframe);

    return () => {
      container.innerHTML = '';
    };
  }, [videoId, onReady]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video rounded-lg overflow-hidden border border-guitar-brown
                 bg-black"
    />
  );
}
