import { NextRequest, NextResponse } from 'next/server';

// GET /api/youtube?q=artist+song
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    // Fallback: return a "no key" indicator so the client can handle gracefully
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY not configured', videos: [], noApiKey: true },
      { status: 200 }
    );
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '8');
    url.searchParams.set('q', query);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('YouTube API error:', errorBody);
      return NextResponse.json(
        { error: 'YouTube API request failed', videos: [] },
        { status: 502 }
      );
    }

    const data = await response.json() as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string } };
        };
      }>;
    };

    const videos = (data.items ?? []).map((item) => ({
      id: item.id?.videoId ?? '',
      title: item.snippet?.title ?? '',
      thumbnail: item.snippet?.thumbnails?.medium?.url ?? '',
      channelTitle: item.snippet?.channelTitle ?? '',
    }));

    return NextResponse.json({ videos });
  } catch (err) {
    console.error('YouTube search error:', err);
    return NextResponse.json({ error: 'Internal error', videos: [] }, { status: 500 });
  }
}
