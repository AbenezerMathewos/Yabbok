import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-level store - survives across requests in the same Node.js process.
// Resets on server restart. Upgrade to Redis for multi-instance production.
const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/**
 * Returns null if within limits, or a 429 NextResponse if rate limit exceeded.
 *
 * Usage:
 *   const limited = rateLimit(req, { windowMs: 15 * 60 * 1000, max: 5 });
 *   if (limited) return limited;
 */
export function rateLimit(
  req: Request,
  options: RateLimitOptions
): NextResponse | null {
  const { windowMs, max } = options;
  const now = Date.now();

  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const key = `rl:${ip}:${new URL(req.url).pathname}`;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= max) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count += 1;
  return null;
}