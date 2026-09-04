// ============================================================
// lib/rate-limiter.ts — In-memory IP-based rate limiting
// ============================================================
// Simple sliding window rate limiter stored in process memory.
// Resets on cold starts (acceptable for Vercel serverless).
// ============================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Maximum requests per window per IP
const MAX_REQUESTS = 10;
// Window duration: 1 minute (in ms)
const WINDOW_MS = 60 * 1000;

// In-memory store (resets on cold start / serverless instance restart)
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > WINDOW_MS) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if an IP is rate limited.
 * Returns { limited: false } if the request is allowed,
 * or { limited: true, retryAfterMs: number } if blocked.
 */
export function checkRateLimit(ip: string): {
  limited: boolean;
  retryAfterMs?: number;
  remaining?: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart);
    return { limited: true, retryAfterMs };
  }

  entry.count++;
  return { limited: false, remaining: MAX_REQUESTS - entry.count };
}
