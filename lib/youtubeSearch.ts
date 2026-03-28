import { YouTubeVideo } from '@/types';

export async function searchYouTube(
  artist: string,
  song: string
): Promise<YouTubeVideo[]> {
  const query = encodeURIComponent(`${artist} ${song}`);
  const res = await fetch(`/api/youtube?q=${query}`);
  if (!res.ok) {
    throw new Error(`YouTube search failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.videos as YouTubeVideo[];
}
