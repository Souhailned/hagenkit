/**
 * Redis cache layer for Buurtanalyse 2.0
 *
 * Uses Upstash Redis with per-source TTLs.
 * Fail-open: returns null on Redis errors (dev mode without Redis works fine).
 */

import type { CacheSource } from "./types";

// TTL per source in seconds
const SOURCE_TTL: Record<CacheSource, number> = {
  cbs: 365 * 24 * 3600, // 1 year
  bag: 30 * 24 * 3600, // 1 month
  transport: 90 * 24 * 3600, // 3 months
  osm: 7 * 24 * 3600, // 1 week
  google: 24 * 3600, // 24 hours
  ai: 24 * 3600, // 24 hours
  "ai-classify": 7 * 24 * 3600, // 7 days (concept+name classifications are stable)
  "full-analysis": 24 * 3600, // 24 hours
};

// Lazy-init Redis client (same pattern as lib/rate-limit.ts)
let redis: import("@upstash/redis").Redis | null | undefined;

async function getRedis() {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redis = null;
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token });
    return redis;
  } catch {
    redis = null;
    return null;
  }
}

/**
 * Build cache key — lat/lng rounded to 4 decimals (~11m precision)
 */
function buildKey(
  lat: number,
  lng: number,
  source: CacheSource,
  radius: number,
): string {
  const lat4 = lat.toFixed(4);
  const lng4 = lng.toFixed(4);
  return `buurt:${lat4}:${lng4}:${source}:${radius}`;
}

/**
 * Get cached value (fail-open: returns null on error)
 */
export async function getCached<T>(
  lat: number,
  lng: number,
  source: CacheSource,
  radius: number,
): Promise<T | null> {
  const client = await getRedis();
  if (!client) return null;

  try {
    const key = buildKey(lat, lng, source, radius);
    const data = await client.get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Set cached value with source-specific TTL (fail-open: silent on error)
 */
export async function setCache<T>(
  lat: number,
  lng: number,
  source: CacheSource,
  radius: number,
  data: T,
): Promise<void> {
  const client = await getRedis();
  if (!client) return;

  try {
    const key = buildKey(lat, lng, source, radius);
    const ttl = SOURCE_TTL[source];
    await client.set(key, data, { ex: ttl });
  } catch {
    // Fail silently — caching is non-critical
  }
}
