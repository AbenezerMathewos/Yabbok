import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "../lib/rateLimit";

// Helper: build a minimal Request-like object
function makeReq(ip: string = "1.2.3.4", path: string = "/api/test"): Request {
  return new Request(`http://localhost:3000${path}`, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("allows first request through", () => {
    const req = makeReq("10.0.0.1", "/api/a");
    const result = rateLimit(req, { windowMs: 60_000, max: 3 });
    expect(result).toBeNull();
  });

  it("allows requests up to the max", () => {
    const ip = "10.0.0.2";
    const path = "/api/b";
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(makeReq(ip, path), { windowMs: 60_000, max: 5 });
      expect(result).toBeNull();
    }
  });

  it("blocks the request that exceeds max", () => {
    const ip = "10.0.0.3";
    const path = "/api/c";
    for (let i = 0; i < 2; i++) {
      rateLimit(makeReq(ip, path), { windowMs: 60_000, max: 2 });
    }
    const blocked = rateLimit(makeReq(ip, path), { windowMs: 60_000, max: 2 });
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
  });

  it("returns 429 with Retry-After header", async () => {
    const ip = "10.0.0.4";
    const path = "/api/d";
    rateLimit(makeReq(ip, path), { windowMs: 60_000, max: 1 });
    const blocked = rateLimit(makeReq(ip, path), { windowMs: 60_000, max: 1 });
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("Retry-After")).toBeTruthy();
    expect(blocked?.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("isolates different IPs independently", () => {
    const path = "/api/e";
    rateLimit(makeReq("10.0.0.5", path), { windowMs: 60_000, max: 1 });
    // Different IP should still pass
    const other = rateLimit(makeReq("10.0.0.6", path), { windowMs: 60_000, max: 1 });
    expect(other).toBeNull();
  });

  it("isolates different paths independently", () => {
    const ip = "10.0.0.7";
    rateLimit(makeReq(ip, "/api/f1"), { windowMs: 60_000, max: 1 });
    // Different path should still pass
    const other = rateLimit(makeReq(ip, "/api/f2"), { windowMs: 60_000, max: 1 });
    expect(other).toBeNull();
  });
});