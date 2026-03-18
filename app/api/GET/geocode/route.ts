import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache to avoid redundant calls
const geocodeCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours — addresses don't change often

// Rate limiting: Nominatim requires max 1 request per second
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1500; // 1.5 seconds to be safe

async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, { headers });

    if (response.ok) {
      return response;
    }

    // If rate-limited (429), wait and retry with exponential backoff
    if (response.status === 429 && attempt < retries - 1) {
      const waitTime = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
      console.log(`Nominatim rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    // For other errors, throw
    throw new Error(`Nominatim returned ${response.status}: ${response.statusText}`);
  }

  throw new Error('Max retries exceeded');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const cacheKey = `${parseFloat(lat).toFixed(4)},${parseFloat(lon).toFixed(4)}`;

  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Rate limit: wait if needed
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLast));
  }

  try {
    lastRequestTime = Date.now();

    const response = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        'User-Agent': 'MyCleanAdminApp/1.0 (admin-dashboard; contact@mycleanapp.com)',
        'Accept': 'application/json',
      }
    );

    const data = await response.json();

    // Cache the result
    geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding proxy error:', error);
    // Return a graceful fallback so the frontend doesn't break
    return NextResponse.json(
      {
        display_name: 'Location unavailable',
        address: {},
      },
      { status: 200 } // Return 200 with fallback data so the frontend handles it smoothly
    );
  }
}
