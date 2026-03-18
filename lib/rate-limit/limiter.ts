import { getDb } from "@/lib/cache/db";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

const LIMITS = {
  hourly: { max: 3, windowSeconds: 3600 },
  daily: { max: 10, windowSeconds: 86400 },
} as const;

export function checkRateLimit(
  ip: string,
  type: "hourly" | "daily" = "hourly"
): RateLimitResult {
  const db = getDb();
  const config = LIMITS[type];
  const identifier = `${ip}:${type}`;

  const row = db
    .prepare(
      `SELECT count, window_start FROM rate_limits
       WHERE identifier = ? AND type = ?`
    )
    .get(identifier, type) as
    | { count: number; window_start: number }
    | undefined;

  const now = Math.floor(Date.now() / 1000);

  if (!row || now - row.window_start >= config.windowSeconds) {
    // Window expired or first request — reset
    db.prepare(
      `INSERT OR REPLACE INTO rate_limits (identifier, type, count, window_start)
       VALUES (?, ?, 1, ?)`
    ).run(identifier, type, now);
    return {
      allowed: true,
      remaining: config.max - 1,
      resetIn: config.windowSeconds,
    };
  }

  if (row.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: config.windowSeconds - (now - row.window_start),
    };
  }

  db.prepare(
    `UPDATE rate_limits SET count = count + 1
     WHERE identifier = ? AND type = ?`
  ).run(identifier, type);

  return {
    allowed: true,
    remaining: config.max - row.count - 1,
    resetIn: config.windowSeconds - (now - row.window_start),
  };
}

export function isRateLimited(ip: string): RateLimitResult {
  const hourly = checkRateLimit(ip, "hourly");
  if (!hourly.allowed) return hourly;

  const daily = checkRateLimit(ip, "daily");
  return daily;
}
