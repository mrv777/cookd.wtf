export interface RoastCategory {
  name: string;
  grade: string;
  cardRoast: string;   // one-liner for the image card
  detailRoast: string; // 2-3 sentences for results page
}

export interface RoastResult {
  address: string;
  chain: string;
  displayAddress: string;
  archetype: string;       // archetype ID
  archetypeName: string;   // display name
  categories: RoastCategory[];
  verdict: string;         // single memorable analogy
  shareableLine: string;   // for pre-filled tweet
  overallScore: number;    // 0-100
  diamondHandsScore: number; // 0-100 for the meter
  createdAt: number;
}

export interface GradeInput {
  category: string;
  grade: string;
  dataPoints: Record<string, unknown>;
}

export interface RoastInput {
  address: string;
  chains: string[];
  labels: string[];
  pnlSummary: {
    totalRealizedPnl: number;
    winRate: number;
    totalTrades: number;
    bestTrade?: { token: string; pnlPct: number };
    worstTrade?: { token: string; pnlPct: number };
  } | null;
  worstTrades: Array<{
    token: string;
    boughtAt: number;
    soldAt: number;
    lossPct: number;
  }>;
  portfolio: {
    topHoldingPct: number;
    topHoldingToken: string;
    numTokens: number;
    stablecoinPct: number;
  } | null;
  timing: {
    avgHourUtc: number;
    boughtTopsCount: number;
    soldBottomsCount: number;
    totalTxCount: number;
  } | null;
  smartMoneyAlignment: number | null; // -1 to 1
  counterparties: {
    top: string;
    interactionCount: number;
  } | null;
  leaderboardRank: {
    rank: number;
    total: number;
    token: string;
  } | null;
  suggestedGrades: Record<string, string>;
  candidateArchetypes: string[];
  activityLevel: "dead" | "sparse" | "moderate" | "active";
}
