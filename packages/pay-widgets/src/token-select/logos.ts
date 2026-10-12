const LOGO_HOST = "https://assets.dapdap.net";

const CHAIN_LOGO_ALIAS: Record<string, string> = {
  eth: "ethereum",
  ethereum: "ethereum",
  base: "base",
  arb: "arbitrum",
  arbitrum: "arbitrum",
  op: "optimism",
  optimism: "optimism",
  pol: "polygon",
  polygon: "polygon",
  bsc: "bsc",
  avax: "avalanche",
  avalanche: "avalanche",
  gnosis: "gnosis",
  scroll: "scroll",
  xlayer: "xlayer",
  bera: "berachain",
  berachain: "berachain",
  near: "near",
  sol: "solana",
  solana: "solana",
  tron: "tron",
  zec: "zcash",
  zcash: "zcash",
};

function logoPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${LOGO_HOST}${normalized}`;
}

export function chainLogoUrl(blockchainOrNetwork: string): string {
  const key = String(blockchainOrNetwork || "").toLowerCase();
  const file = CHAIN_LOGO_ALIAS[key] || key.replace(/\s+/g, "");
  return logoPath(`/stableflow/networks/${file}.png`);
}

export function tokenLogoUrl(symbol: string): string {
  const upper = String(symbol || "").toUpperCase();
  const file = upper === "USDT0" ? "usdt" : upper.toLowerCase();
  return logoPath(`/stableflow/tokens/${file}.png`);
}
