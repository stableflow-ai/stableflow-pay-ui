export const TOKEN_BALANCE_POLL_MS = 60_000;
export const ALL_CHAIN_FILTER = "all";
export const DEFAULT_STABLE_SYMBOLS = ["USDT", "USDC"] as const;
export const POPULAR_SECTION_TITLE = "Popular on your network";
export const TOKEN_SELECT_PREFS_STORAGE_KEY = "stableflow-pay:token-select-prefs:v1";
export const TOKEN_SELECT_PREFS_VERSION = 2;
export const MAX_RECENT_BLOCKCHAINS = 16;
export const MAX_RECENT_ASSETS = 3;

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
