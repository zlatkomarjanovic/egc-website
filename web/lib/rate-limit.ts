/**
 * Lightweight rate limiter.
 *
 * Zero-config by default: a fixed-window in-memory counter (good enough to blunt
 * abuse on a single instance). When UPSTASH_REDIS_REST_URL / _TOKEN are set, it
 * uses Upstash's REST API for accurate, cross-instance limiting in production —
 * recommended on Vercel where each serverless instance has its own memory.
 */

type RateResult = { success: boolean; remaining: number; reset: number };

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

// --- In-memory fallback -----------------------------------------------------
const buckets = new Map<string, { count: number; reset: number }>();

function limitInMemory(key: string): RateResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.reset < now) {
    const reset = now + WINDOW_SECONDS * 1000;
    buckets.set(key, { count: 1, reset });
    return { success: true, remaining: MAX_REQUESTS - 1, reset };
  }
  existing.count += 1;
  const success = existing.count <= MAX_REQUESTS;
  return {
    success,
    remaining: Math.max(0, MAX_REQUESTS - existing.count),
    reset: existing.reset,
  };
}

// Opportunistic cleanup so the map can't grow unbounded.
function sweep() {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}

// --- Upstash (optional, production-grade) -----------------------------------
async function limitUpstash(
  key: string,
  url: string,
  token: string
): Promise<RateResult> {
  const redisKey = `ratelimit:${key}`;
  // INCR then set TTL on first hit, via Upstash pipeline.
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, String(WINDOW_SECONDS), "NX"],
      ["PTTL", redisKey],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}`);
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data[0]?.result ?? 1;
  const pttl = data[2]?.result ?? WINDOW_SECONDS * 1000;
  return {
    success: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    reset: Date.now() + (pttl > 0 ? pttl : WINDOW_SECONDS * 1000),
  };
}

/**
 * Returns whether the request identified by `key` (e.g. "contact:1.2.3.4")
 * is within the allowed rate. Fails open only on Upstash transport errors.
 */
export async function rateLimit(key: string): Promise<RateResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await limitUpstash(key, url, token);
    } catch {
      // Fall back to in-memory rather than blocking legitimate users.
      return limitInMemory(key);
    }
  }
  if (buckets.size > 5000) sweep();
  return limitInMemory(key);
}

export const RATE_LIMIT_MAX = MAX_REQUESTS;
export const RATE_LIMIT_WINDOW = WINDOW_SECONDS;
