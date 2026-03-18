import { nansenCli, nansenApi } from "./client";
import type {
  SearchResult,
  PnlSummaryResponse,
  PnlDetailRow,
  BalanceRow,
  TransactionRow,
  CounterpartyRow,
  HistoricalBalanceRow,
  WhoBoughtSoldRow,
  PnlLeaderboardRow,
  TokenOhlcvRow,
  TokenInfoResponse,
  NansenCliResponse,
} from "./types";

type Chain = string;

// --- Phase A: Wallet-level calls (all parallel, no dependencies) ---

/** 0 credits — resolve ENS/entity name */
export function search(
  query: string
): Promise<NansenCliResponse<SearchResult[]>> {
  return nansenCli<SearchResult[]>(
    ["search", "--query", query],
    `search:${query}`
  );
}

/** 1 credit — overall W/L record, win rate */
export function pnlSummary(
  address: string,
  chain: Chain,
  days = 365
): Promise<NansenCliResponse<PnlSummaryResponse>> {
  return nansenCli<PnlSummaryResponse>(
    ["profiler", "pnl-summary", "--address", address, "--chain", chain, "--days", String(days)],
    `pnl-summary:${chain}:${address}:${days}`
  );
}

/** 1 credit — current holdings */
export function balance(
  address: string,
  chain: Chain
): Promise<NansenCliResponse<BalanceRow[]>> {
  return nansenCli<BalanceRow[]>(
    ["profiler", "balance", "--address", address, "--chain", chain],
    `balance:${chain}:${address}`
  );
}

/** 1 credit — trading patterns, timing */
export function transactions(
  address: string,
  chain: Chain,
  days = 90
): Promise<NansenCliResponse<TransactionRow[]>> {
  return nansenCli<TransactionRow[]>(
    ["profiler", "transactions", "--address", address, "--chain", chain, "--days", String(days), "--limit", "100"],
    `transactions:${chain}:${address}:${days}`
  );
}

/** 5 credits — who they interact with */
export function counterparties(
  address: string,
  chain: Chain,
  days = 90
): Promise<NansenCliResponse<CounterpartyRow[]>> {
  return nansenCli<CounterpartyRow[]>(
    ["profiler", "counterparties", "--address", address, "--chain", chain, "--days", String(days)],
    `counterparties:${chain}:${address}:${days}`
  );
}

/** 1 credit — historical balances */
export function historicalBalances(
  address: string,
  chain: Chain,
  days = 90
): Promise<NansenCliResponse<HistoricalBalanceRow[]>> {
  return nansenCli<HistoricalBalanceRow[]>(
    ["profiler", "historical-balances", "--address", address, "--chain", chain, "--days", String(days)],
    `historical-balances:${chain}:${address}:${days}`
  );
}

// --- Phase B: Token-specific calls (depend on Phase A results) ---

/** 1 credit — detailed PnL for a specific token */
export function pnlForToken(
  address: string,
  chain: Chain,
  tokenAddress?: string,
  days = 365
): Promise<NansenCliResponse<PnlDetailRow[]>> {
  const args = [
    "profiler", "pnl", "--address", address, "--chain", chain, "--days", String(days),
  ];
  // Filter by token if available
  if (tokenAddress) {
    args.push("--filters", JSON.stringify({ token_address: tokenAddress }));
  }
  return nansenCli<PnlDetailRow[]>(args, `pnl:${chain}:${address}:${tokenAddress}:${days}`);
}

/** 1 credit — token OHLCV price data (REST fallback — not in CLI) */
export function tokenOhlcv(
  tokenAddress: string,
  chain: Chain,
  days = 90
): Promise<NansenCliResponse<TokenOhlcvRow[]>> {
  const now = new Date();
  const from = new Date(now.getTime() - days * 86400000);
  return nansenApi<TokenOhlcvRow[]>(
    "/tgm/token-ohlcv",
    {
      token_address: tokenAddress,
      chain,
      timeframe: "1d",
      date: {
        from: from.toISOString(),
        to: now.toISOString(),
      },
    },
    `ohlcv:${chain}:${tokenAddress}:${days}`
  );
}

/** 1 credit — token info */
export function tokenInfo(
  tokenAddress: string,
  chain: Chain
): Promise<NansenCliResponse<TokenInfoResponse>> {
  return nansenCli<TokenInfoResponse>(
    ["token", "info", "--token", tokenAddress, "--chain", chain],
    `token-info:${chain}:${tokenAddress}`
  );
}

/** 5 credits — PnL leaderboard for a token */
export function pnlLeaderboard(
  tokenAddress: string,
  chain: Chain,
  days = 30
): Promise<NansenCliResponse<PnlLeaderboardRow[]>> {
  return nansenCli<PnlLeaderboardRow[]>(
    ["token", "pnl", "--token", tokenAddress, "--chain", chain, "--days", String(days)],
    `pnl-leaderboard:${chain}:${tokenAddress}:${days}`
  );
}

/** 1 credit — who bought/sold a token */
export function whoBoughtSold(
  tokenAddress: string,
  chain: Chain,
  days = 30
): Promise<NansenCliResponse<WhoBoughtSoldRow[]>> {
  return nansenCli<WhoBoughtSoldRow[]>(
    ["token", "who-bought-sold", "--token", tokenAddress, "--chain", chain, "--days", String(days)],
    `who-bought-sold:${chain}:${tokenAddress}:${days}`
  );
}

// --- Orchestration: Three-phase execution (probe → core → token-specific) ---

export type ActivityLevel = "dead" | "sparse" | "moderate" | "active";

/** Phase 0 result — cheap probe to check activity before committing credits */
export interface Phase0Results {
  search: NansenCliResponse<SearchResult[]>;
  pnlSummary: NansenCliResponse<PnlSummaryResponse>;
  transactions: NansenCliResponse<TransactionRow[]>;
  activityLevel: ActivityLevel;
  txCount: number;
}

export interface PhaseAResults extends Phase0Results {
  balance: NansenCliResponse<BalanceRow[]>;
  historicalBalances: NansenCliResponse<HistoricalBalanceRow[]>;
  counterparties: NansenCliResponse<CounterpartyRow[]>;
}

export interface PhaseBResults {
  pnlWorst1: NansenCliResponse<PnlDetailRow[]>;
  pnlWorst2: NansenCliResponse<PnlDetailRow[]>;
  ohlcvWorst1: NansenCliResponse<TokenOhlcvRow[]>;
  ohlcvWorst2: NansenCliResponse<TokenOhlcvRow[]>;
  leaderboard: NansenCliResponse<PnlLeaderboardRow[]>;
  whoBoughtSold: NansenCliResponse<WhoBoughtSoldRow[]>;
  tokenInfo: NansenCliResponse<TokenInfoResponse>;
}

/**
 * Phase 0: Cheap probe — 20 credits on free plan.
 * Checks activity level before committing to expensive calls.
 * Returns early data for "dead" wallets (≤2 txs).
 */
export async function executePhase0(
  address: string,
  chain: Chain
): Promise<Phase0Results> {
  const [searchResult, pnlSummaryResult, transactionsResult] =
    await Promise.all([
      search(address),
      pnlSummary(address, chain),
      transactions(address, chain),
    ]);

  const txCount =
    transactionsResult.success && Array.isArray(transactionsResult.data)
      ? transactionsResult.data.length
      : 0;

  let activityLevel: ActivityLevel;
  if (txCount <= 2) activityLevel = "dead";
  else if (txCount <= 10) activityLevel = "sparse";
  else if (txCount <= 50) activityLevel = "moderate";
  else activityLevel = "active";

  return {
    search: searchResult,
    pnlSummary: pnlSummaryResult,
    transactions: transactionsResult,
    activityLevel,
    txCount,
  };
}

/**
 * Phase A: Remaining wallet-level calls — 20-70 credits on free plan.
 * Counterparties (50 credits) only included for active wallets (50+ txs).
 */
export async function executePhaseA(
  address: string,
  chain: Chain,
  phase0: Phase0Results
): Promise<PhaseAResults> {
  const includeCounterparties = phase0.activityLevel === "active";

  const [balanceResult, historicalBalancesResult, counterpartiesResult] =
    await Promise.all([
      balance(address, chain),
      historicalBalances(address, chain),
      includeCounterparties
        ? counterparties(address, chain)
        : emptyResponse<CounterpartyRow[]>(),
    ]);

  return {
    ...phase0,
    balance: balanceResult,
    historicalBalances: historicalBalancesResult,
    counterparties: counterpartiesResult,
  };
}

/**
 * Phase B: Token-specific calls — 40-60 credits on free plan.
 * Leaderboard (50 credits) only included for active wallets.
 * OHLCV skipped for sparse wallets.
 */
export async function executePhaseB(
  address: string,
  chain: Chain,
  phaseA: PhaseAResults
): Promise<PhaseBResults> {
  const worstTokens = getWorstTokens(phaseA);
  const largestHolding = getLargestHolding(phaseA);

  const worst1Addr = worstTokens[0]?.token_address;
  const worst2Addr = worstTokens[1]?.token_address;
  const largestAddr = largestHolding?.token_address;

  const includeOhlcv = phaseA.activityLevel !== "sparse";
  const includeLeaderboard = phaseA.activityLevel === "active";

  const [
    pnlWorst1,
    pnlWorst2,
    ohlcvWorst1,
    ohlcvWorst2,
    leaderboard,
    whoBoughtSoldResult,
    tokenInfoResult,
  ] = await Promise.all([
    worst1Addr
      ? pnlForToken(address, chain, worst1Addr)
      : emptyResponse<PnlDetailRow[]>(),
    worst2Addr
      ? pnlForToken(address, chain, worst2Addr)
      : emptyResponse<PnlDetailRow[]>(),
    worst1Addr && includeOhlcv
      ? tokenOhlcv(worst1Addr, chain)
      : emptyResponse<TokenOhlcvRow[]>(),
    worst2Addr && includeOhlcv
      ? tokenOhlcv(worst2Addr, chain)
      : emptyResponse<TokenOhlcvRow[]>(),
    worst1Addr && includeLeaderboard
      ? pnlLeaderboard(worst1Addr, chain)
      : emptyResponse<PnlLeaderboardRow[]>(),
    worst1Addr
      ? whoBoughtSold(worst1Addr, chain)
      : emptyResponse<WhoBoughtSoldRow[]>(),
    (largestAddr || worst1Addr)
      ? tokenInfo(largestAddr || worst1Addr!, chain)
      : emptyResponse<TokenInfoResponse>(),
  ]);

  return {
    pnlWorst1,
    pnlWorst2,
    ohlcvWorst1,
    ohlcvWorst2,
    leaderboard,
    whoBoughtSold: whoBoughtSoldResult,
    tokenInfo: tokenInfoResult,
  };
}

// --- Helpers ---

function getWorstTokens(phaseA: PhaseAResults): PnlTokenSummary[] {
  if (!phaseA.pnlSummary.success || !phaseA.pnlSummary.data?.top5_tokens) {
    return [];
  }
  // Sort by realized PnL ascending (worst first)
  return [...phaseA.pnlSummary.data.top5_tokens]
    .sort((a, b) => a.realized_pnl - b.realized_pnl);
}

function getLargestHolding(phaseA: PhaseAResults): BalanceRow | null {
  if (!phaseA.balance.success || !Array.isArray(phaseA.balance.data)) {
    return null;
  }
  return [...phaseA.balance.data]
    .sort((a, b) => (b.value_usd ?? 0) - (a.value_usd ?? 0))[0] ?? null;
}

function emptyResponse<T>(): Promise<NansenCliResponse<T>> {
  return Promise.resolve({
    success: false,
    data: null as T,
    error: "No token to query",
    code: "SKIPPED",
  });
}

// Re-export for convenience
import type { PnlTokenSummary } from "./types";
