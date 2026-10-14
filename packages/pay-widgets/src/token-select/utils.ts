import { ALL_CHAIN_FILTER, ALL_CHAIN_PREVIEW_BLOCKCHAINS, DEFAULT_STABLE_SYMBOLS, DUST_USD, TRENDS_TOKENS } from "./config";
import type { ChainKind, PayChain, PayToken, TokenSelectRole } from "./types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type SidebarChain = {
  blockchain: string;
  chainName: string;
  chainKind: ChainKind;
  logo: string;
};

export function chainsFromTokens(tokens: readonly { blockchain: string; chain: PayChain }[]): PayChain[] {
  const byCode = new Map<string, PayChain>();
  for (const token of tokens) {
    const code = token.chain.blockchain || token.blockchain;
    if (!byCode.has(code)) byCode.set(code, token.chain);
  }
  return Array.from(byCode.values());
}

/** USD value of a token balance using config `price`. Unknown balance is -1 (sort last). */
export function tokenBalanceUsd(
  token: Pick<PayToken, "price">,
  formatted: string | null | undefined,
): number {
  if (formatted == null || formatted === "") return -1;
  const amount = Number(formatted);
  if (!Number.isFinite(amount)) return -1;
  const price = Number(token.price);
  return amount * (Number.isFinite(price) ? price : 0);
}

export function tokenMatchesSearch(
  token: Pick<PayToken, "symbol" | "providerSymbol"> & { contractAddress?: string | null },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (token.symbol.toLowerCase().includes(q)) return true;
  if (token.providerSymbol.toLowerCase().includes(q)) return true;
  return Boolean(token.contractAddress?.toLowerCase().includes(q));
}

export function matchesChainFilter(token: Pick<PayToken, "blockchain">, chainFilter: string): boolean {
  if (chainFilter === ALL_CHAIN_FILTER) return true;
  return token.blockchain === chainFilter;
}

export function formattedBalancePositive(formatted: string | null | undefined): boolean {
  if (formatted == null || formatted === "") return false;
  const amount = Number(formatted);
  return Number.isFinite(amount) && amount > 0;
}

export function chainHasBalance<T extends Pick<PayToken, "blockchain">>(
  blockchain: string,
  tokens: T[],
  getBalance: (token: T) => string | null | undefined,
): boolean {
  return tokens.some(
    (token) => token.blockchain === blockchain && formattedBalancePositive(getBalance(token)),
  );
}

export function chainBalanceUsd<T extends Pick<PayToken, "blockchain">>(
  blockchain: string,
  tokens: T[],
  getBalanceUsd: (token: T) => number,
): number {
  let total = 0;
  for (const token of tokens) {
    if (token.blockchain !== blockchain) continue;
    const usd = getBalanceUsd(token);
    if (usd > 0) total += usd;
  }
  return total;
}

export function sortChainsAlpha<T extends { chainName: string }>(chains: readonly T[]): T[] {
  return chains.slice().sort((left, right) => left.chainName.localeCompare(right.chainName));
}

/** Funded chains first by total USD, then chain name. Hidden balances keep the incoming order. */
export function sortChainsForSidebar<T extends Pick<PayToken, "blockchain">>(
  chains: SidebarChain[],
  tokens: T[],
  options: {
    showBalances: boolean;
    getBalanceUsd: (token: T) => number;
  },
): SidebarChain[] {
  if (!options.showBalances) return chains.slice();
  return chains.slice().sort((left, right) => {
    const leftUsd = chainBalanceUsd(left.blockchain, tokens, options.getBalanceUsd);
    const rightUsd = chainBalanceUsd(right.blockchain, tokens, options.getBalanceUsd);
    if (rightUsd !== leftUsd) return rightUsd - leftUsd;
    return left.chainName.localeCompare(right.chainName);
  });
}

export function payerRailChains<T extends { blockchain: string; chainKind: string }>(
  chains: readonly T[],
  owners: Partial<Record<string, string | null | undefined>>,
  fundedSet: ReadonlySet<string>,
): T[] {
  return chains.filter((chain) => {
    if (!owners[chain.chainKind]) return false;
    if (chain.chainKind === "evm" && !fundedSet.has(chain.blockchain)) return false;
    return true;
  });
}

export function initialChainFilter(
  lockChainKind: ChainKind | null | undefined,
  recentBlockchains: readonly string[],
  chains: readonly SidebarChain[],
): string {
  if (!lockChainKind) return ALL_CHAIN_FILTER;
  const matching = chains.filter((chain) => chain.chainKind === lockChainKind);
  if (matching.length === 0) return ALL_CHAIN_FILTER;
  for (const code of recentBlockchains) {
    if (matching.some((chain) => chain.blockchain === code)) return code;
  }
  return matching[0].blockchain;
}

export function isBlockchainDisabled(
  blockchain: string,
  disabledBlockchains: string[] | null | undefined,
): boolean {
  if (!disabledBlockchains?.length) return false;
  const code = blockchain.toLowerCase();
  return disabledBlockchains.some((item) => item.toLowerCase() === code);
}

export function isChainKindLocked(
  chainKind: ChainKind,
  lockChainKind: ChainKind | null | undefined,
): boolean {
  return Boolean(lockChainKind && chainKind !== lockChainKind);
}

const BALANCE_RANK_FUNDED = 0;
const BALANCE_RANK_LOADING = 1;
const BALANCE_RANK_EMPTY = 2;

function tokenBalanceRank(usd: number, loading: boolean): number {
  if (loading) return BALANCE_RANK_LOADING;
  if (usd > 0) return BALANCE_RANK_FUNDED;
  return BALANCE_RANK_EMPTY;
}

export function compareTokensBySymbol<T extends {
  symbol: string;
  chain: { chainName: string };
}>(left: T, right: T): number {
  return left.symbol.localeCompare(right.symbol) || left.chain.chainName.localeCompare(right.chain.chainName);
}

/** Positive USD first, then balances still loading, then zero or unknown. */
export function sortTokensByBalance<T extends {
  symbol: string;
  chain: { chainName: string };
}>(
  tokens: T[],
  getBalanceUsd: (token: T) => number,
  isLoading: (token: T) => boolean,
): T[] {
  return tokens.slice().sort((left, right) => {
    const leftRank = tokenBalanceRank(getBalanceUsd(left), isLoading(left));
    const rightRank = tokenBalanceRank(getBalanceUsd(right), isLoading(right));
    if (leftRank !== rightRank) return leftRank - rightRank;
    if (leftRank === BALANCE_RANK_FUNDED) {
      const byUsd = getBalanceUsd(right) - getBalanceUsd(left);
      if (byUsd !== 0) return byUsd;
    }
    return compareTokensBySymbol(left, right);
  });
}

export function sortTokensBySymbol<T extends {
  symbol: string;
  chain: { chainName: string };
}>(tokens: T[]): T[] {
  return tokens.slice().sort(compareTokensBySymbol);
}

export function positiveBalanceTokens<T extends {
  symbol: string;
  chain: { chainName: string };
}>(
  tokens: T[],
  getBalanceUsd: (token: T) => number,
): T[] {
  return sortTokensByBalance(
    tokens.filter((token) => getBalanceUsd(token) > 0),
    getBalanceUsd,
    () => false,
  );
}

/** Drops balances under `DUST_USD` unless Show dust is on. `$1` stays visible. */
export function withoutDustTokens<T>(
  tokens: T[],
  getBalanceUsd: (token: T) => number,
  showDust: boolean,
): T[] {
  if (showDust) return tokens;
  return tokens.filter((token) => getBalanceUsd(token) >= DUST_USD);
}

export function isGasToken(token: {
  contractAddress?: string | null;
  symbol: string;
  blockchain: string;
}): boolean {
  const addr = String(token.contractAddress || "").trim().toLowerCase();
  if (!addr || addr === "native" || addr === ZERO_ADDRESS) return true;
  return token.blockchain === "near" && token.symbol.toUpperCase() === "NEAR";
}

export function stableSymbolIndex(symbol: string, stableSymbols: readonly string[]): number {
  const upper = symbol.toUpperCase();
  return stableSymbols.findIndex((item) => item.toUpperCase() === upper);
}

export function tokenPriority(
  token: { contractAddress?: string | null; symbol: string; blockchain: string },
  stableSymbols: readonly string[] = DEFAULT_STABLE_SYMBOLS,
): number {
  if (stableSymbolIndex(token.symbol, stableSymbols) >= 0) return 0;
  if (isGasToken(token)) return 1;
  return 2;
}

export function compareTokensByPriority<T extends {
  symbol: string;
  contractAddress?: string | null;
  blockchain: string;
  chain: { chainName: string };
}>(left: T, right: T, stableSymbols: readonly string[] = DEFAULT_STABLE_SYMBOLS): number {
  const leftPriority = tokenPriority(left, stableSymbols);
  const rightPriority = tokenPriority(right, stableSymbols);
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  if (leftPriority === 0) {
    const leftIndex = stableSymbolIndex(left.symbol, stableSymbols);
    const rightIndex = stableSymbolIndex(right.symbol, stableSymbols);
    if (leftIndex !== rightIndex) return leftIndex - rightIndex;
  }
  return left.symbol.localeCompare(right.symbol) || left.chain.chainName.localeCompare(right.chain.chainName);
}

export function sortTokensForChain<T extends {
  symbol: string;
  contractAddress?: string | null;
  blockchain: string;
  chain: { chainName: string };
}>(
  tokens: readonly T[],
  options: {
    withBalances: boolean;
    usdOf: (token: T) => number;
    loadingOf: (token: T) => boolean;
    stableSymbols?: readonly string[];
  },
): T[] {
  const stableSymbols = options.stableSymbols ?? DEFAULT_STABLE_SYMBOLS;
  if (!options.withBalances) {
    return tokens.slice().sort((left, right) => compareTokensByPriority(left, right, stableSymbols));
  }
  return tokens.slice().sort((left, right) => {
    const leftRank = tokenBalanceRank(options.usdOf(left), options.loadingOf(left));
    const rightRank = tokenBalanceRank(options.usdOf(right), options.loadingOf(right));
    if (leftRank !== rightRank) return leftRank - rightRank;
    if (leftRank === BALANCE_RANK_FUNDED) {
      const byUsd = options.usdOf(right) - options.usdOf(left);
      if (byUsd !== 0) return byUsd;
    }
    return compareTokensByPriority(left, right, stableSymbols);
  });
}

export type TrendTokenRef = {
  blockchain: string;
  symbol: string;
};

export function trendTokensIn<T extends { blockchain: string; symbol: string }>(
  tokens: readonly T[],
  options: {
    chainFilter: string;
    sortRest: (tokens: T[]) => T[];
    trends?: readonly TrendTokenRef[];
  },
): T[] {
  const trends = options.trends ?? TRENDS_TOKENS;
  const inScope = tokens.filter((token) => matchesChainFilter(token, options.chainFilter));
  const used = new Set<T>();
  const head: T[] = [];
  for (const ref of trends) {
    if (
      options.chainFilter !== ALL_CHAIN_FILTER
      && ref.blockchain.toLowerCase() !== options.chainFilter.toLowerCase()
    ) continue;
    const match = inScope.find((token) => (
      !used.has(token)
      && token.blockchain.toLowerCase() === ref.blockchain.toLowerCase()
      && token.symbol.toLowerCase() === ref.symbol.toLowerCase()
    ));
    if (!match) continue;
    used.add(match);
    head.push(match);
  }
  return [...head, ...options.sortRest(inScope.filter((token) => !used.has(token)))];
}

/** Preview logos for the All chain button. Four or fewer chains are all shown. */
export function allChainPreview<T extends SidebarChain>(chains: readonly T[]): T[] {
  if (chains.length <= 4) return chains.slice();
  const byCode = new Map(chains.map((chain) => [chain.blockchain.toLowerCase(), chain]));
  const used = new Set<string>();
  const picked: T[] = [];
  const take = (chain: T | undefined) => {
    if (!chain || picked.length >= 4) return;
    const code = chain.blockchain.toLowerCase();
    if (used.has(code)) return;
    used.add(code);
    picked.push(chain);
  };
  const eth = byCode.get(ALL_CHAIN_PREVIEW_BLOCKCHAINS[0]);
  if (eth) take(eth);
  else take(chains.find((chain) => chain.chainKind === "evm"));
  take(byCode.get("near"));
  take(byCode.get("sol"));
  take(byCode.get("tron"));
  const fill = chains
    .filter((chain) => chain.chainKind === "evm" && !used.has(chain.blockchain.toLowerCase()))
    .slice()
    .sort((left, right) => left.chainName.localeCompare(right.chainName));
  for (const chain of fill) take(chain);
  return picked;
}

/** Dotted chains first (USD, then name), then the rest by name. All is not included. */
export function chainMenuOrder<TChain extends SidebarChain, TToken extends { blockchain: string }>(
  chains: readonly TChain[],
  tokens: readonly TToken[],
  options: {
    dotted: ReadonlySet<string>;
    showBalances: boolean;
    getBalanceUsd: (token: TToken) => number;
  },
): TChain[] {
  const dotted = chains.filter((chain) => options.dotted.has(chain.blockchain));
  const rest = chains.filter((chain) => !options.dotted.has(chain.blockchain));
  return [
    ...sortChainsForSidebar(dotted, [...tokens], options) as TChain[],
    ...sortChainsAlpha(rest),
  ];
}

export function searchTokens<T extends {
  symbol: string;
  providerSymbol: string;
  contractAddress?: string | null;
  chain: { chainName: string };
}>(
  tokens: readonly T[],
  query: string,
  options: {
    role: TokenSelectRole;
    usdOf: (token: T) => number;
    loadingOf: (token: T) => boolean;
  },
): T[] {
  const matched = tokens.filter((token) => tokenMatchesSearch(token, query));
  if (options.role === "payer") return sortTokensByBalance(matched, options.usdOf, options.loadingOf);
  return sortTokensBySymbol(matched);
}

export function recentTokensInOrder<T extends { assetId: string }>(
  tokens: T[],
  recentAssetIds: readonly string[],
): T[] {
  const byId = new Map(tokens.map((token) => [token.assetId, token]));
  const result: T[] = [];
  for (const assetId of recentAssetIds) {
    const token = byId.get(assetId);
    if (token) result.push(token);
  }
  return result;
}
