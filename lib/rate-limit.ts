import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Rate limit result shape
// ---------------------------------------------------------------------------
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// ---------------------------------------------------------------------------
// Tier definitions (sliding window)
// ---------------------------------------------------------------------------
type RateLimitTier = "ai" | "export" | "api";

const tierConfig: Record<RateLimitTier, { requests: number; window: string }> = {
  ai: { requests: 10, window: "1 m" },
  export: { requests: 5, window: "1 m" },
  api: { requests: 60, window: "1 m" },
};

// ---------------------------------------------------------------------------
// Redis client — initialised lazily, null when env vars are missing (dev mode)
// ---------------------------------------------------------------------------
let rateLimiters: Record<RateLimitTier, Ratelimit> | null = null;

function getRateLimiters(): Record<RateLimitTier, Ratelimit> | null {
  if (rateLimiters) return rateLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Dev mode — no Redis available, rate limiting disabled
    return null;
  }

  try {
    const redis = new Redis({ url, token });

    rateLimiters = {
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tierConfig.ai.requests, tierConfig.ai.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        prefix: "ratelimit:ai",
        analytics: true,
      }),
      export: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tierConfig.export.requests, tierConfig.export.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        prefix: "ratelimit:export",
        analytics: true,
      }),
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tierConfig.api.requests, tierConfig.api.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        prefix: "ratelimit:api",
        analytics: true,
      }),
    };

    return rateLimiters;
  } catch (error) {
    console.error("[rate-limit] Failed to initialise Redis:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether the given identifier is within the rate limit for the tier.
 * Gracefully degrades: if Redis is unavailable the request is always allowed.
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier
): Promise<RateLimitResult> {
  const limiters = getRateLimiters();

  if (!limiters) {
    // No Redis — allow everything (dev / missing config)
    const config = tierConfig[tier];
    return { success: true, limit: config.requests, remaining: config.requests, reset: 0 };
  }

  try {
    const result = await limiters[tier].limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Redis failure — fail-open so legitimate requests are not blocked
    console.error("[rate-limit] Redis error, allowing request:", error);
    const config = tierConfig[tier];
    return { success: true, limit: config.requests, remaining: config.requests, reset: 0 };
  }
}

/**
 * Build standard rate-limit headers for a 429 response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
  };
}
