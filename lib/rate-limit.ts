// Simple in-memory rate limiter (for serverless, use Redis/Upstash)
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requests) {
    if (now > record.resetAt) requests.delete(key);
  }
}, 60000);
