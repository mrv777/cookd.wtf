import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "cache.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      ttl_seconds INTEGER NOT NULL DEFAULT 86400
    );

    CREATE TABLE IF NOT EXISTS roast_cache (
      address TEXT NOT NULL,
      chain TEXT NOT NULL,
      roast_json TEXT NOT NULL,
      summary_card_path TEXT,
      archetype_card_path TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      ttl_seconds INTEGER NOT NULL DEFAULT 86400,
      PRIMARY KEY (chain, address)
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      identifier TEXT NOT NULL,
      type TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      window_start INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (identifier, type)
    );

    CREATE TABLE IF NOT EXISTS budget_tracking (
      date TEXT PRIMARY KEY,
      credits_used REAL NOT NULL DEFAULT 0,
      roast_count INTEGER NOT NULL DEFAULT 0
    );
  `);
}
