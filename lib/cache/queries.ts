import { getDb } from "./db";

const TTL_SECONDS = 86400; // 24 hours

// --- API Response Cache ---

export function getCachedApiResponse(key: string): unknown | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT data FROM api_cache
       WHERE key = ? AND (unixepoch() - created_at) < ttl_seconds`
    )
    .get(key) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function setCachedApiResponse(
  key: string,
  data: unknown,
  ttl: number = TTL_SECONDS
): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO api_cache (key, data, created_at, ttl_seconds)
     VALUES (?, ?, unixepoch(), ?)`
  ).run(key, JSON.stringify(data), ttl);
}

// --- Roast Cache ---

export interface CachedRoast {
  address: string;
  chain: string;
  roast_json: string;
  summary_card_path: string | null;
  archetype_card_path: string | null;
  created_at: number;
}

export function getCachedRoast(
  chain: string,
  address: string
): CachedRoast | null {
  const db = getDb();
  // Serve any cached roast regardless of age — credits are precious.
  // Users can force-refresh via a future premium feature.
  const row = db
    .prepare(
      `SELECT * FROM roast_cache
       WHERE chain = ? AND address = ?`
    )
    .get(chain, address.toLowerCase()) as CachedRoast | undefined;
  return row ?? null;
}

/** Look up cached roast by address only (any chain). Used when serving
 *  existing results so chain detection differences don't cause cache misses. */
export function getCachedRoastByAddress(
  address: string
): CachedRoast | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM roast_cache
       WHERE address = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(address.toLowerCase()) as CachedRoast | undefined;
  return row ?? null;
}

export function setCachedRoast(
  chain: string,
  address: string,
  roastJson: string,
  summaryCardPath?: string,
  archetypeCardPath?: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO roast_cache
     (chain, address, roast_json, summary_card_path, archetype_card_path, created_at, ttl_seconds)
     VALUES (?, ?, ?, ?, ?, unixepoch(), ?)`
  ).run(
    chain,
    address.toLowerCase(),
    roastJson,
    summaryCardPath ?? null,
    archetypeCardPath ?? null,
    TTL_SECONDS
  );
}

// --- Recent Roasts (for homepage feed — ignores TTL) ---

export function getRecentRoasts(limit = 10): CachedRoast[] {
  const db = getDb();
  // Deduplicate by address — keep only the most recent entry per wallet
  return db
    .prepare(
      `SELECT * FROM roast_cache
       WHERE rowid IN (
         SELECT rowid FROM roast_cache
         GROUP BY address
         HAVING rowid = MAX(rowid)
       )
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(limit) as CachedRoast[];
}

// --- Cleanup ---

export function cleanExpiredEntries(): void {
  const db = getDb();
  db.prepare(
    `DELETE FROM api_cache WHERE (unixepoch() - created_at) >= ttl_seconds`
  ).run();
  // NOTE: roast_cache is NOT cleaned — we keep all roasts permanently
  // for the homepage feed and so cached results survive credit exhaustion.
  db.prepare(
    `DELETE FROM rate_limits WHERE (unixepoch() - window_start) >= 86400`
  ).run();
}
