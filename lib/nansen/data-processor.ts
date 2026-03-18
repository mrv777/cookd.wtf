import type { PhaseAResults, PhaseBResults } from "./endpoints";
import type { RoastInput } from "@/lib/roast/types";
import type { BalanceRow, TransactionRow, PnlLeaderboardRow } from "./types";
import { computeGrades, selectCandidateArchetypes } from "@/lib/roast/grading";

const STABLECOINS = new Set([
  "USDT", "USDC", "DAI", "BUSD", "TUSD", "FRAX", "LUSD",
  "USDD", "GUSD", "USDP", "sUSD", "PYUSD",
]);

export function processNansenData(
  address: string,
  chain: string,
  phaseA: PhaseAResults,
  phaseB: PhaseBResults | null
): RoastInput {
  const labels = extractLabels(phaseA);
  const pnlSummary = extractPnlSummary(phaseA);
  const worstTrades = phaseB ? extractWorstTrades(phaseA, phaseB) : [];
  const portfolio = extractPortfolio(phaseA);
  const timing = extractTiming(phaseA);
  const smartMoneyAlignment = phaseB ? computeSmartMoneyAlignment(phaseA, phaseB) : null;
  const counterpartiesData = extractCounterparties(phaseA);
  const leaderboardRank = phaseB ? extractLeaderboardRank(address, phaseB) : null;
  const activityLevel = phaseA.activityLevel;

  const input: RoastInput = {
    address,
    chains: [chain],
    labels,
    pnlSummary,
    worstTrades,
    portfolio,
    timing,
    smartMoneyAlignment,
    counterparties: counterpartiesData,
    leaderboardRank,
    suggestedGrades: {},
    candidateArchetypes: [],
    activityLevel,
  };

  // Compute grades and archetypes
  const grades = computeGrades(input);
  input.suggestedGrades = grades as unknown as Record<string, string>;
  input.candidateArchetypes = selectCandidateArchetypes(input);

  return input;
}

function extractLabels(phaseA: PhaseAResults): string[] {
  const labels: string[] = [];
  if (phaseA.search.success && Array.isArray(phaseA.search.data)) {
    for (const item of phaseA.search.data) {
      if (item.entity_name) labels.push(item.entity_name);
    }
  }
  return labels;
}

function extractPnlSummary(phaseA: PhaseAResults): RoastInput["pnlSummary"] {
  if (!phaseA.pnlSummary.success || !phaseA.pnlSummary.data) return null;

  const d = phaseA.pnlSummary.data;
  const tokens = d.top5_tokens ?? [];
  const sorted = [...tokens].sort((a, b) => a.realized_pnl - b.realized_pnl);

  return {
    totalRealizedPnl: d.realized_pnl_usd ?? 0,
    winRate: d.win_rate ?? 0,
    totalTrades: d.traded_times ?? 0,
    worstTrade: sorted[0]
      ? { token: sorted[0].token_symbol, pnlPct: sorted[0].realized_roi }
      : undefined,
    bestTrade: sorted[sorted.length - 1]
      ? { token: sorted[sorted.length - 1].token_symbol, pnlPct: sorted[sorted.length - 1].realized_roi }
      : undefined,
  };
}

function extractWorstTrades(
  phaseA: PhaseAResults,
  phaseB: PhaseBResults
): RoastInput["worstTrades"] {
  const trades: RoastInput["worstTrades"] = [];

  // From Phase B PnL details
  for (const result of [phaseB.pnlWorst1, phaseB.pnlWorst2]) {
    if (!result.success || !Array.isArray(result.data)) continue;
    for (const row of result.data) {
      if (row.pnl_usd_realised < 0) {
        trades.push({
          token: row.token_symbol,
          boughtAt: row.cost_basis_usd / Math.max(row.bought_amount, 1),
          soldAt: row.avg_sold_price_usd,
          lossPct: row.roi_percent_realised,
        });
      }
    }
  }

  // Fallback: from Phase A PnL summary
  if (trades.length === 0 && phaseA.pnlSummary.success && phaseA.pnlSummary.data?.top5_tokens) {
    for (const t of phaseA.pnlSummary.data.top5_tokens) {
      if (t.realized_pnl < 0) {
        trades.push({
          token: t.token_symbol,
          boughtAt: 0,
          soldAt: 0,
          lossPct: t.realized_roi * 100,
        });
      }
    }
  }

  return trades.sort((a, b) => a.lossPct - b.lossPct).slice(0, 5);
}

function extractPortfolio(phaseA: PhaseAResults): RoastInput["portfolio"] {
  if (!phaseA.balance.success || !Array.isArray(phaseA.balance.data)) return null;

  const holdings: BalanceRow[] = phaseA.balance.data;
  if (holdings.length === 0) return null;

  const totalValue = holdings.reduce((sum, h) => sum + (h.value_usd ?? 0), 0);
  if (totalValue === 0) return null;

  const sorted = [...holdings].sort(
    (a, b) => (b.value_usd ?? 0) - (a.value_usd ?? 0)
  );
  const top = sorted[0];
  const topPct = totalValue > 0 ? ((top.value_usd ?? 0) / totalValue) * 100 : 0;

  const stablecoinValue = holdings
    .filter((h) => STABLECOINS.has(h.token_symbol?.toUpperCase()))
    .reduce((sum, h) => sum + (h.value_usd ?? 0), 0);

  return {
    topHoldingPct: Math.round(topPct),
    topHoldingToken: top.token_symbol ?? "UNKNOWN",
    numTokens: holdings.length,
    stablecoinPct: totalValue > 0 ? Math.round((stablecoinValue / totalValue) * 100) : 0,
  };
}

function extractTiming(phaseA: PhaseAResults): RoastInput["timing"] {
  if (!phaseA.transactions.success || !Array.isArray(phaseA.transactions.data)) return null;

  const txs: TransactionRow[] = phaseA.transactions.data;
  if (txs.length === 0) return null;

  // Compute average hour
  const hours = txs
    .map((tx) => new Date(tx.block_timestamp).getUTCHours())
    .filter((h) => !isNaN(h));
  const avgHour =
    hours.length > 0
      ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
      : 12;

  // Count "buy at top" signals (simplified: tokens received at high volume)
  // This is an approximation — real top detection needs OHLCV comparison
  let boughtTopsCount = 0;
  let soldBottomsCount = 0;

  // We'll refine this with OHLCV data later
  // For now, use transaction pattern heuristics
  const buyTxs = txs.filter((tx) => tx.tokens_received?.length > 0);
  const sellTxs = txs.filter((tx) => tx.tokens_sent?.length > 0);

  // Rough heuristic: high-volume buys are more likely FOMO buys
  const avgBuyVolume =
    buyTxs.reduce((sum, tx) => sum + tx.volume_usd, 0) / Math.max(buyTxs.length, 1);
  boughtTopsCount = buyTxs.filter((tx) => tx.volume_usd > avgBuyVolume * 2).length;
  soldBottomsCount = sellTxs.filter((tx) => tx.volume_usd < avgBuyVolume * 0.3).length;

  return {
    avgHourUtc: avgHour,
    boughtTopsCount,
    soldBottomsCount,
    totalTxCount: txs.length,
  };
}

function computeSmartMoneyAlignment(
  _phaseA: PhaseAResults,
  phaseB: PhaseBResults
): number | null {
  if (!phaseB.whoBoughtSold.success || !Array.isArray(phaseB.whoBoughtSold.data)) {
    return null;
  }

  const smData = phaseB.whoBoughtSold.data;
  if (smData.length === 0) return null;

  // Count smart money buys vs sells
  const smBuys = smData.filter(
    (r) => r.action === "buy" && r.label?.includes("Smart")
  ).length;
  const smSells = smData.filter(
    (r) => r.action === "sell" && r.label?.includes("Smart")
  ).length;

  if (smBuys + smSells === 0) return null;

  // If SM is mostly selling while the wallet is holding/buying → negative alignment
  // Range: -1 (anti-SM) to +1 (aligned with SM)
  return (smBuys - smSells) / (smBuys + smSells);
}

function extractCounterparties(phaseA: PhaseAResults): RoastInput["counterparties"] {
  if (!phaseA.counterparties.success || !Array.isArray(phaseA.counterparties.data)) {
    return null;
  }

  const rows = phaseA.counterparties.data;
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => b.interaction_count - a.interaction_count);
  const top = sorted[0];

  return {
    top: top.counterparty_name || top.counterparty_address || "Unknown",
    interactionCount: top.interaction_count,
  };
}

function extractLeaderboardRank(
  address: string,
  phaseB: PhaseBResults
): RoastInput["leaderboardRank"] {
  if (!phaseB.leaderboard.success || !Array.isArray(phaseB.leaderboard.data)) {
    return null;
  }

  const rows: PnlLeaderboardRow[] = phaseB.leaderboard.data;
  if (rows.length === 0) return null;

  const userRow = rows.find(
    (r) => r.address?.toLowerCase() === address.toLowerCase()
  );
  const rank = userRow?.rank ?? rows.length;
  const tokenSymbol =
    phaseB.tokenInfo.success && phaseB.tokenInfo.data
      ? (phaseB.tokenInfo.data as { token_symbol?: string }).token_symbol ?? "token"
      : "token";

  return {
    rank,
    total: rows.length,
    token: tokenSymbol,
  };
}

