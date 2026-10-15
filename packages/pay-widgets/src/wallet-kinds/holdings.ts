import { formattedBalancePositive, tokenBalanceUsd } from "../token-select/utils";
import type { ChainOwners, PayToken, WalletAccountInput, WalletKindMeta } from "../token-select/types";
import { canonicalWalletKind, defaultWalletKindMeta, walletKindsMatch } from "../token-select/wallet-kind-meta";

export type WalletHolding = {
  token: PayToken;
  amount: string;
  usd: number;
};

export function accountForKind(
  accounts: Partial<Record<string, WalletAccountInput | undefined>>,
  kind: string,
): WalletAccountInput | undefined {
  if (accounts[kind]) return accounts[kind];
  const canonical = canonicalWalletKind(kind);
  if (accounts[canonical]) return accounts[canonical];
  if (canonical === "solana") return accounts.sol ?? accounts.solana;
  if (canonical === "zcash") return accounts.zec ?? accounts.zcash;
  return undefined;
}

export function kindAddress(
  accounts: Partial<Record<string, WalletAccountInput | undefined>>,
  kind: string,
): string | null {
  const address = accountForKind(accounts, kind)?.address?.trim();
  return address ? address : null;
}

function assignOwner(owners: ChainOwners, kind: string, address: string) {
  owners[kind] = address;
  const canonical = canonicalWalletKind(kind);
  owners[canonical] = address;
  if (canonical === "solana") {
    owners.sol = address;
    owners.solana = address;
  }
  if (canonical === "zcash") {
    owners.zec = address;
    owners.zcash = address;
  }
}

export function ownersForAccounts(
  accounts: Partial<Record<string, WalletAccountInput | undefined>>,
): ChainOwners {
  const owners: ChainOwners = {};
  for (const [kind, account] of Object.entries(accounts)) {
    const address = account?.address?.trim();
    if (!address) continue;
    assignOwner(owners, kind, address);
  }
  return owners;
}

export function orderedWalletKinds(
  kinds: readonly string[] | undefined,
  provided: readonly WalletKindMeta[],
): WalletKindMeta[] {
  if (!kinds) return [...provided];
  const result: WalletKindMeta[] = [];
  for (const kind of kinds) {
    const found = provided.find((item) => walletKindsMatch(item.kind, kind));
    if (found) {
      result.push(found.kind === kind ? found : { ...found, kind });
      continue;
    }
    const fallback = defaultWalletKindMeta(kind);
    if (fallback) result.push(fallback);
  }
  return result;
}

export function tokensForKind(tokens: readonly PayToken[], kind: string): PayToken[] {
  return tokens.filter((token) => walletKindsMatch(token.chain.chainKind, kind));
}

export function evmChainLogos(tokens: readonly PayToken[]): string[] {
  const seen = new Set<string>();
  const logos: string[] = [];
  for (const token of tokens) {
    if (!walletKindsMatch(token.chain.chainKind, "evm")) continue;
    const logo = token.chain.logo.trim();
    if (!logo || seen.has(logo)) continue;
    seen.add(logo);
    logos.push(logo);
  }
  return logos;
}

export function buildWalletHoldings(
  tokens: readonly PayToken[],
  amountOf: (token: PayToken) => string | null | undefined,
): WalletHolding[] {
  const rows: WalletHolding[] = [];
  for (const token of tokens) {
    const amount = amountOf(token);
    if (!formattedBalancePositive(amount) || amount == null) continue;
    const usd = tokenBalanceUsd(token, amount);
    rows.push({ token, amount, usd: usd > 0 ? usd : 0 });
  }
  rows.sort((left, right) => right.usd - left.usd || left.token.symbol.localeCompare(right.token.symbol));
  return rows;
}

export function walletHoldingsTotal(rows: readonly WalletHolding[]): number {
  return rows.reduce((sum, row) => sum + row.usd, 0);
}

export function kindBalancesLoading(
  tokens: readonly PayToken[],
  amountOf: (token: PayToken) => string | null | undefined,
  loadingOf: (token: PayToken) => boolean,
): boolean {
  if (tokens.some((token) => formattedBalancePositive(amountOf(token)))) return false;
  return tokens.some((token) => loadingOf(token));
}
