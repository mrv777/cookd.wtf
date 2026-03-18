import type { RoastInput } from "./types";

type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F" | "F-";

interface GradeResult {
  timing: Grade;
  pnl: Grade;
  diversification: Grade;
  diamondHands: Grade;
  degenLevel: Grade;
  smartMoney: Grade;
}

function gradeFromScore(score: number): Grade {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D+";
  if (score >= 40) return "D";
  if (score >= 30) return "D-";
  if (score >= 15) return "F";
  return "F-";
}

export function computeGrades(input: RoastInput): GradeResult {
  return {
    timing: gradeTiming(input),
    pnl: gradePnl(input),
    diversification: gradeDiversification(input),
    diamondHands: gradeDiamondHands(input),
    degenLevel: gradeDegenLevel(input),
    smartMoney: gradeSmartMoney(input),
  };
}

function gradeTiming(input: RoastInput): Grade {
  if (!input.timing) return "C";
  const { boughtTopsCount, totalTxCount } = input.timing;
  if (totalTxCount === 0) return "C";
  const topBuyRate = boughtTopsCount / Math.max(totalTxCount, 1);
  const score = Math.max(0, 100 - topBuyRate * 500);
  return gradeFromScore(score);
}

function gradePnl(input: RoastInput): Grade {
  if (!input.pnlSummary) return "C";
  const { winRate, totalRealizedPnl, totalTrades } = input.pnlSummary;

  // Multi-factor P&L grading:
  // 1. Total realized PnL (most important — did they make money?)
  // 2. Win rate (secondary — consistency)
  // 3. Risk-adjusted: PnL relative to trade count

  let score = 50; // baseline

  // Factor 1: Total PnL direction and magnitude (±40 pts)
  if (totalRealizedPnl > 1_000_000) score += 40;
  else if (totalRealizedPnl > 100_000) score += 35;
  else if (totalRealizedPnl > 10_000) score += 25;
  else if (totalRealizedPnl > 1_000) score += 15;
  else if (totalRealizedPnl > 0) score += 5;
  else if (totalRealizedPnl > -1_000) score -= 5;
  else if (totalRealizedPnl > -10_000) score -= 15;
  else if (totalRealizedPnl > -100_000) score -= 25;
  else score -= 40;

  // Factor 2: Win rate (±15 pts)
  if (winRate >= 0.6) score += 15;
  else if (winRate >= 0.5) score += 10;
  else if (winRate >= 0.4) score += 5;
  else if (winRate >= 0.3) score -= 0; // 33% win rate with big winners is fine
  else if (winRate >= 0.2) score -= 5;
  else score -= 15;

  // Factor 3: Efficiency — PnL per trade (±10 pts)
  if (totalTrades > 0) {
    const pnlPerTrade = totalRealizedPnl / totalTrades;
    if (pnlPerTrade > 10_000) score += 10;
    else if (pnlPerTrade > 1_000) score += 5;
    else if (pnlPerTrade < -1_000) score -= 5;
    else if (pnlPerTrade < -10_000) score -= 10;
  }

  return gradeFromScore(Math.max(0, Math.min(100, score)));
}

function gradeDiversification(input: RoastInput): Grade {
  if (!input.portfolio) return "C";
  const { topHoldingPct, numTokens } = input.portfolio;
  let score = 100 - topHoldingPct;
  score += Math.min(numTokens * 2, 20);
  return gradeFromScore(Math.max(0, Math.min(100, score)));
}

function gradeDiamondHands(input: RoastInput): Grade {
  if (!input.pnlSummary) return "C";
  // If they have worst trades with >80% loss, they're holding too long
  const worstLoss = input.worstTrades[0]?.lossPct ?? 0;
  if (worstLoss < -90) return "F-";
  if (worstLoss < -80) return "F";
  if (worstLoss < -60) return "D";
  if (worstLoss < -40) return "C";
  if (worstLoss < -20) return "B";
  return "A";
}

function gradeDegenLevel(input: RoastInput): Grade {
  if (!input.timing) return "C";
  const { avgHourUtc, totalTxCount } = input.timing;
  let score = 0;
  if (avgHourUtc >= 1 && avgHourUtc <= 5) score += 40;
  else if (avgHourUtc >= 22 || avgHourUtc <= 7) score += 25;
  if (totalTxCount > 500) score += 60;
  else if (totalTxCount > 200) score += 45;
  else if (totalTxCount > 50) score += 30;
  else score += 15;
  return gradeFromScore(Math.min(100, score));
}

function gradeSmartMoney(input: RoastInput): Grade {
  if (input.smartMoneyAlignment === null) return "C";
  const score = (input.smartMoneyAlignment + 1) * 50;
  return gradeFromScore(score);
}

export function computeOverallScore(grades: GradeResult): number {
  const gradeToNum: Record<string, number> = {
    "A+": 97, "A": 93, "A-": 90,
    "B+": 87, "B": 83, "B-": 80,
    "C+": 77, "C": 73, "C-": 70,
    "D+": 67, "D": 63, "D-": 60,
    "F": 50, "F-": 30,
  };

  const weights = {
    timing: 0.2,
    pnl: 0.25,
    diversification: 0.15,
    diamondHands: 0.15,
    degenLevel: 0.1,
    smartMoney: 0.15,
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const grade = grades[key as keyof GradeResult];
    total += (gradeToNum[grade] ?? 50) * weight;
  }

  return Math.round(total);
}

export function computeDiamondHandsScore(input: RoastInput): number {
  if (!input.worstTrades.length) return 50;
  const avgLoss = input.worstTrades.reduce((sum, t) => sum + Math.abs(t.lossPct), 0) / input.worstTrades.length;
  return Math.min(100, Math.round(avgLoss));
}

/**
 * Whether this wallet is net profitable. Used to adjust archetype selection
 * and ensure the roast tone matches reality.
 */
export function isProfitableWallet(input: RoastInput): boolean {
  if (!input.pnlSummary) return false;
  return input.pnlSummary.totalRealizedPnl > 0;
}

export function selectCandidateArchetypes(input: RoastInput): string[] {
  const candidates: Array<{ id: string; score: number }> = [];
  const profitable = isProfitableWallet(input);

  // For profitable wallets, suppress "loser" archetypes and boost "degen winner" ones
  // The roast should still be funny but acknowledge they're making money

  // Inverse Indicator: bad timing + NEGATIVE PnL (not for profitable wallets)
  if (!profitable && input.timing && input.pnlSummary) {
    let score = 0;
    if (input.timing.boughtTopsCount > 5) score += 40;
    if (input.pnlSummary.winRate < 0.3) score += 40;
    if (score > 0) candidates.push({ id: "inverse_indicator", score });
  }

  // FOMO Farmer: buys after pumps (can apply to winners too — they FOMO but still win)
  if (input.timing && input.timing.boughtTopsCount > 10) {
    candidates.push({ id: "fomo_farmer", score: input.timing.boughtTopsCount * 3 });
  }

  // Rug Survivor: multiple large losses but still active
  if (input.worstTrades.filter(t => t.lossPct < -80).length >= 3) {
    candidates.push({ id: "rug_survivor", score: 70 });
  }

  // Diamond Corpse: held through massive drawdowns (even profitable wallets can have bag-held)
  if (input.worstTrades.some(t => t.lossPct < -90)) {
    candidates.push({ id: "diamond_corpse", score: 80 });
  }

  // Gas Guzzler: lots of transactions relative to gains
  if (input.timing && input.timing.totalTxCount > 200 && input.pnlSummary) {
    const pnlPerTx = input.pnlSummary.totalRealizedPnl / input.timing.totalTxCount;
    if (pnlPerTx < 100) candidates.push({ id: "gas_guzzler", score: 60 });
  }

  // Stablecoin Monk: mostly stablecoins
  if (input.portfolio && input.portfolio.stablecoinPct > 80) {
    candidates.push({ id: "stablecoin_monk", score: 90 });
  }

  // Anti-Smart-Money: negative SM alignment (only for unprofitable)
  if (!profitable && input.smartMoneyAlignment !== null && input.smartMoneyAlignment < -0.3) {
    candidates.push({ id: "anti_smart_money", score: Math.abs(input.smartMoneyAlignment) * 100 });
  }

  // Exit Liquidity: buys what SM sells + bad PnL (only for unprofitable)
  if (!profitable && input.smartMoneyAlignment !== null && input.smartMoneyAlignment < -0.5 && input.pnlSummary?.winRate && input.pnlSummary.winRate < 0.35) {
    candidates.push({ id: "exit_liquidity", score: 75 });
  }

  // 3AM Degen: trades at odd hours + high frequency (applies to anyone)
  if (input.timing && input.timing.avgHourUtc >= 1 && input.timing.avgHourUtc <= 5 && input.timing.totalTxCount > 100) {
    candidates.push({ id: "three_am_degen", score: 70 });
  }

  // Chain Hopper: multiple chains
  if (input.chains?.length >= 3) {
    candidates.push({ id: "chain_hopper", score: 60 });
  }

  // For profitable wallets with low diversification — concentrate on that angle
  if (profitable && input.portfolio && input.portfolio.topHoldingPct > 80) {
    // They're winning but dangerously concentrated
    candidates.push({ id: "diamond_corpse", score: 65 });
  }

  // Sort by score descending, return top 3
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 3).map(c => c.id);

  // Default: for profitable wallets with no other match, use FOMO Farmer
  // (they got lucky buying into pumps) — never default to "inverse indicator" for winners
  if (top.length === 0) {
    top.push(profitable ? "fomo_farmer" : "inverse_indicator");
  }

  return top;
}
