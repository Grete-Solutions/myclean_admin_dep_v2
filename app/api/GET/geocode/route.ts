import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache to avoid redundant calls
const geocodeCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Rate limiting: Nominatim requires max 1 request per second
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // slightly over 1 second for safety

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const cacheKey = `${lat},${lon}`;

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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MyCleanAdminApp/1.0 (admin dashboard)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding proxy error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed', display_name: 'Location unavailable' },
      { status: 502 }
    );
  }
}
