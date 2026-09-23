import { useSyncExternalStore } from "react";
import { TOKEN_BALANCE_POLL_MS } from "./config";
import type { BalanceReadResult, ChainKind, ChainOwners, PayToken, ReadBalances, TokenBalanceStatus } from "./types";

export type TokenBalance = {
  raw: string | null;
  formatted: string | null;
  status: TokenBalanceStatus;
  error: string | null;
  updatedAt: number | null;
};

const listeners = new Set<() => void>();
let balances: Record<string, TokenBalance> = {};
let reader: ReadBalances | null = null;
const chainInflight = new Map<string, Promise<void>>();

function emit() {
  balances = { ...balances };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribePayTokenBalances(listener: () => void) {
  return subscribe(listener);
}

export function getPayTokenBalances() {
  return balances;
}

function ownerKey(owner: string, chainKind: ChainKind): string {
  return chainKind === "solana" || chainKind === "zec" ? owner : owner.toLowerCase();
}

function balanceKey(owner: string, assetId: string, chainKind: ChainKind): string {
  return `${ownerKey(owner, chainKind)}:${assetId}`;
}

function isFresh(entry: TokenBalance | undefined, now: number): boolean {
  return Boolean(
    entry
    && entry.status === "success"
    && entry.updatedAt != null
    && now - entry.updatedAt < TOKEN_BALANCE_POLL_MS,
  );
}

function loadingEntry(prev: TokenBalance | undefined): TokenBalance {
  if (!prev) return { raw: null, formatted: null, status: "loading", error: null, updatedAt: null };
  return { ...prev, status: "loading", error: null };
}

function withStaleOnError(prev: TokenBalance | undefined, next: TokenBalance): TokenBalance {
  if (next.status !== "error") return next;
  if (prev?.raw == null && prev?.formatted == null) return next;
  return { ...next, raw: prev.raw, formatted: prev.formatted, updatedAt: prev.updatedAt };
}

export function setBalanceReader(next: ReadBalances | null) {
  reader = next;
}

export function clearPayTokenBalances() {
  balances = {};
  emit();
}

export function getPayTokenBalance(owner: string | null | undefined, assetId: string | null | undefined): TokenBalance | undefined {
  if (!owner || !assetId) return undefined;
  return balances[`${owner}:${assetId}`] ?? balances[`${owner.toLowerCase()}:${assetId}`];
}

export function usePayTokenBalance(owner: string | null | undefined, assetId: string | null | undefined): TokenBalance | undefined {
  const current = useSyncExternalStore(subscribe, getPayTokenBalances, getPayTokenBalances);
  if (!owner || !assetId) return undefined;
  return current[`${owner}:${assetId}`] ?? current[`${owner.toLowerCase()}:${assetId}`];
}

function writeResult(owner: string, token: PayToken, result: BalanceReadResult) {
  const key = balanceKey(owner, token.assetId, token.chain.chainKind);
  const prev = balances[key];
  const next: TokenBalance = "error" in result
    ? { raw: null, formatted: null, status: "error", error: result.error, updatedAt: Date.now() }
    : { raw: result.raw ?? null, formatted: result.formatted, status: "success", error: null, updatedAt: Date.now() };
  balances[key] = withStaleOnError(prev, next);
}

export async function refreshPayTokenBalance(owner: string, token: PayToken): Promise<TokenBalance | null> {
  const key = balanceKey(owner, token.assetId, token.chain.chainKind);
  balances[key] = loadingEntry(balances[key]);
  emit();
  if (!reader) {
    balances[key] = withStaleOnError(balances[key], {
      raw: null,
      formatted: null,
      status: "error",
      error: "Balance reader is not configured",
      updatedAt: Date.now(),
    });
    emit();
    return balances[key] ?? null;
  }
  try {
    const results = await reader({
      owner,
      chainKind: token.chain.chainKind,
      blockchain: token.blockchain,
      tokens: [token],
    });
    const result = results.find((item) => item.assetId === token.assetId) ?? {
      assetId: token.assetId,
      error: "Balance reader returned no result",
    };
    writeResult(owner, token, result);
  } catch (cause) {
    writeResult(owner, token, {
      assetId: token.assetId,
      error: cause instanceof Error ? cause.message : "Failed to read balance",
    });
  }
  emit();
  return balances[key] ?? null;
}

function groupByChain(tokens: PayToken[]): Map<string, PayToken[]> {
  const groups = new Map<string, PayToken[]>();
  for (const token of tokens) {
    const list = groups.get(token.blockchain) ?? [];
    list.push(token);
    groups.set(token.blockchain, list);
  }
  return groups;
}

async function fetchChain(owner: string, tokens: PayToken[], force: boolean) {
  const blockchain = tokens[0]?.blockchain;
  const kind = tokens[0]?.chain.chainKind;
  if (!blockchain || !kind) return;
  const now = Date.now();
  const stale = tokens.filter((token) => force || !isFresh(balances[balanceKey(owner, token.assetId, kind)], now));
  if (stale.length === 0) return;

  const flightKey = `${ownerKey(owner, kind)}:${blockchain}`;
  const pending = chainInflight.get(flightKey);
  if (pending) return pending;

  for (const token of stale) {
    const key = balanceKey(owner, token.assetId, kind);
    balances[key] = loadingEntry(balances[key]);
  }
  emit();

  const run = (async () => {
    if (!reader) {
      for (const token of stale) {
        writeResult(owner, token, { assetId: token.assetId, error: "Balance reader is not configured" });
      }
      emit();
      return;
    }
    try {
      const results = await reader({ owner, chainKind: kind, blockchain, tokens: stale });
      const byId = new Map(results.map((item) => [item.assetId, item]));
      for (const token of stale) {
        writeResult(owner, token, byId.get(token.assetId) ?? {
          assetId: token.assetId,
          error: "Balance reader returned no result",
        });
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Failed to read balance";
      for (const token of stale) writeResult(owner, token, { assetId: token.assetId, error: message });
    }
    emit();
  })();

  chainInflight.set(flightKey, run);
  return run.finally(() => {
    if (chainInflight.get(flightKey) === run) chainInflight.delete(flightKey);
  });
}

export async function ensurePayTokenBalances(
  owners: ChainOwners,
  tokens: PayToken[],
  opts?: { force?: boolean },
) {
  const force = Boolean(opts?.force);
  const groups = groupByChain(tokens);
  await Promise.all(Array.from(groups.values()).map((group) => {
    const kind = group[0]?.chain.chainKind;
    const owner = kind ? owners[kind] : undefined;
    if (!owner) return Promise.resolve();
    return fetchChain(owner, group, force);
  }));
}
