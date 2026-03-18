// --- Common ---
export interface NansenPagination {
  page: number;
  per_page: number;
  is_last_page: boolean;
}

// --- Search ---
export interface SearchResult {
  entity_name: string;
}

// --- PnL Summary ---
export interface PnlSummaryResponse {
  top5_tokens: PnlTokenSummary[];
  traded_token_count: number;
  traded_times: number;
  realized_pnl_usd: number;
  realized_pnl_percent: number;
  win_rate: number;
}

export interface PnlTokenSummary {
  realized_pnl: number;
  realized_roi: number;
  token_address: string;
  token_symbol: string;
  chain: string;
}

// --- PnL Details (per token) ---
export interface PnlDetailRow {
  token_address: string;
  token_symbol: string;
  token_price: number;
  roi_percent_realised: number;
  pnl_usd_realised: number;
  pnl_usd_unrealised: number;
  roi_percent_unrealised: number;
  bought_amount: number;
  bought_usd: number;
  cost_basis_usd: number;
  sold_amount: number;
  sold_usd: number;
  avg_sold_price_usd: number;
  holding_amount: number;
  holding_usd: number;
  nof_buys: number;
  nof_sells: number;
  max_balance_held: number;
  max_balance_held_usd: number;
}

// --- Balance (Current Portfolio) ---
export interface BalanceRow {
  chain: string;
  address: string;
  token_address: string;
  token_symbol: string;
  token_name?: string;
  token_amount?: number;
  price_usd?: number;
  value_usd?: number;
}

// --- Transactions ---
export interface TransactionRow {
  chain: string;
  method: string;
  tokens_sent: TokenInfo[];
  tokens_received: TokenInfo[];
  volume_usd: number;
  block_timestamp: string;
  transaction_hash: string;
  source_type: string;
}

export interface TokenInfo {
  token_address: string;
  token_symbol: string;
  token_amount: number;
  value_usd?: number;
}

// --- Counterparties ---
export interface CounterpartyRow {
  counterparty_address: string;
  counterparty_name?: string;
  interaction_count: number;
  volume_usd: number;
}

// --- Related Wallets ---
export interface RelatedWalletRow {
  address: string;
  entity_name?: string;
  relationship_type?: string;
}

// --- Historical Balances ---
export interface HistoricalBalanceRow {
  date: string;
  token_address: string;
  token_symbol: string;
  token_amount: number;
  value_usd: number;
}

// --- Token OHLCV ---
export interface TokenOhlcvRow {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// --- Token Who Bought/Sold ---
export interface WhoBoughtSoldRow {
  address: string;
  entity_name?: string;
  label?: string;
  action: "buy" | "sell";
  amount: number;
  value_usd: number;
}

// --- Smart Money Holdings ---
export interface SmartMoneyHoldingRow {
  token_address: string;
  token_symbol: string;
  chain: string;
  holders_count?: number;
  total_value_usd?: number;
}

// --- Token PnL Leaderboard ---
export interface PnlLeaderboardRow {
  address: string;
  entity_name?: string;
  realized_pnl_usd: number;
  realized_roi: number;
  rank?: number;
}

// --- Token Info ---
export interface TokenInfoResponse {
  token_address: string;
  token_symbol: string;
  token_name: string;
  chain: string;
  market_cap_usd?: number;
  price_usd?: number;
  holder_count?: number;
  volume_24h_usd?: number;
}

// --- Generic CLI response wrapper ---
export interface NansenCliResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  code?: string;
  pagination?: NansenPagination;
}
