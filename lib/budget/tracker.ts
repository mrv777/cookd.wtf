import { getDb } from "@/lib/cache/db";

const CREDITS_PER_ROAST = 26;
const COST_PER_CREDIT = 0.001; // $0.001 per credit
const DEFAULT_DAILY_CAP = parseFloat(process.env.DAILY_BUDGET_CAP || "10");

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getBudgetStatus(): {
  creditsUsed: number;
  costUsed: number;
  roastCount: number;
  dailyCap: number;
  remaining: number;
  atCapacity: boolean;
} {
  const db = getDb();
  const date = todayKey();

  const row = db
    .prepare(`SELECT credits_used, roast_count FROM budget_tracking WHERE date = ?`)
    .get(date) as { credits_used: number; roast_count: number } | undefined;

  const creditsUsed = row?.credits_used ?? 0;
  const costUsed = creditsUsed * COST_PER_CREDIT;
  const remaining = DEFAULT_DAILY_CAP - costUsed;

  return {
    creditsUsed,
    costUsed,
    roastCount: row?.roast_count ?? 0,
    dailyCap: DEFAULT_DAILY_CAP,
    remaining: Math.max(0, remaining),
    atCapacity: remaining <= CREDITS_PER_ROAST * COST_PER_CREDIT,
  };
}

export function recordRoastCost(credits: number = CREDITS_PER_ROAST): void {
  const db = getDb();
  const date = todayKey();

  db.prepare(
    `INSERT INTO budget_tracking (date, credits_used, roast_count)
     VALUES (?, ?, 1)
     ON CONFLICT(date) DO UPDATE SET
       credits_used = credits_used + ?,
       roast_count = roast_count + 1`
  ).run(date, credits, credits);
}

export function canAffordRoast(): boolean {
  return !getBudgetStatus().atCapacity;
}
