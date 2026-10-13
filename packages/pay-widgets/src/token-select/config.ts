export const TOKEN_BALANCE_POLL_MS = 60_000;
export const ALL_CHAIN_FILTER = "all";
export const DEFAULT_STABLE_SYMBOLS = ["USDT", "USDC", "DAI"] as const;
export const TOKEN_SELECT_PREFS_STORAGE_KEY = "stableflow-pay:token-select-prefs:v1";
export const TOKEN_SELECT_PREFS_VERSION = 3;
export const MAX_RECENT_BLOCKCHAINS = 16;
export const MAX_RECENTLY_USED = 5;
export const MAX_RECENT_SEARCHES = 5;
/** Stored history length so a chain filter can still fill the visible lists. */
export const MAX_RECENT_HISTORY = 50;
export const YOUR_TOKENS_TITLE = "Your Tokens";
export const RECENT_SEARCHES_TITLE = "Recent Searches";
export const TRENDS_TOKEN_TITLE = "Trends Token";
export const ALL_CHAIN_PREVIEW_BLOCKCHAINS = ["eth", "near", "sol", "tron"] as const;
export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

/**
 * Stand-in for the trends API. This constant is the only data source for the Trends Token section.
 * Order: tron USDT, eth USDT, eth USDC, sol USDC, sol USDT, pol USDC, bsc USDT, arb USDT, arb USDC, near USDT.
 */
export const TRENDS_TOKENS = [
  { blockchain: "tron", symbol: "USDT" },
  { blockchain: "eth", symbol: "USDT" },
  { blockchain: "eth", symbol: "USDC" },
  { blockchain: "sol", symbol: "USDC" },
  { blockchain: "sol", symbol: "USDT" },
  { blockchain: "pol", symbol: "USDC" },
  { blockchain: "bsc", symbol: "USDT" },
  { blockchain: "arb", symbol: "USDT" },
  { blockchain: "arb", symbol: "USDC" },
  { blockchain: "near", symbol: "USDT" },
] as const;

export const CHAIN_KIND_LABELS: Record<string, string> = {
  evm: "EVM",
  near: "Near",
  solana: "Solana",
  tron: "Tron",
  zec: "Zcash",
};

/** Built-in network code to wallet kind. Callers can override unknown codes. */
export const DEFAULT_CHAIN_KINDS = {
  eth: "evm",
  base: "evm",
  arb: "evm",
  op: "evm",
  pol: "evm",
  bsc: "evm",
  avax: "evm",
  gnosis: "evm",
  scroll: "evm",
  xlayer: "evm",
  bera: "evm",
  near: "near",
  sol: "solana",
  tron: "tron",
  zec: "zec",
} as const;
