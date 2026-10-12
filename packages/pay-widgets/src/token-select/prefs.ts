import { useSyncExternalStore } from "react";
import {
  MAX_RECENT_BLOCKCHAINS,
  MAX_RECENT_HISTORY,
  TOKEN_SELECT_PREFS_STORAGE_KEY,
  TOKEN_SELECT_PREFS_VERSION,
} from "./config";

export type TokenSelectPrefs = {
  recentAssetIds: string[];
  recentSearchAssetIds: string[];
  recentBlockchains: string[];
};

const EMPTY_PREFS: TokenSelectPrefs = {
  recentAssetIds: [],
  recentSearchAssetIds: [],
  recentBlockchains: [],
};

function rememberId(recent: string[], assetId: string, max: number): string[] {
  const id = assetId.trim();
  if (!id) return recent;
  return [id, ...recent.filter((item) => item !== id)].slice(0, max);
}

export function rememberRecentAsset(recent: string[], assetId: string): string[] {
  return rememberId(recent, assetId, MAX_RECENT_HISTORY);
}

export function rememberRecentSearch(recent: string[], assetId: string): string[] {
  return rememberId(recent, assetId, MAX_RECENT_HISTORY);
}

export function withoutAssetIds(recent: string[], assetIds: readonly string[]): string[] {
  const drop = new Set(assetIds);
  return recent.filter((id) => !drop.has(id));
}

export function rememberRecentBlockchain(recent: string[], blockchain: string): string[] {
  const code = blockchain.trim();
  if (!code) return recent;
  return [code, ...recent.filter((item) => item !== code)].slice(0, MAX_RECENT_BLOCKCHAINS);
}

function cleanIds(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => typeof id === "string" && id.trim()).slice(0, max);
}

export function migrateTokenSelectPrefs(persisted: unknown, version: number): TokenSelectPrefs {
  const state = (persisted ?? {}) as {
    lastAssetId?: string | null;
    lastBlockchain?: string | null;
    recentAssetIds?: string[];
    recentSearchAssetIds?: string[];
    recentBlockchains?: string[];
  };
  const recentBlockchains = version >= 1
    ? cleanIds(state.recentBlockchains, MAX_RECENT_BLOCKCHAINS)
    : (typeof state.lastBlockchain === "string" && state.lastBlockchain ? [state.lastBlockchain] : []);
  const recentAssetIds = version >= 2 && Array.isArray(state.recentAssetIds)
    ? cleanIds(state.recentAssetIds, MAX_RECENT_HISTORY)
    : (typeof state.lastAssetId === "string" && state.lastAssetId ? [state.lastAssetId] : []);
  const recentSearchAssetIds = version >= TOKEN_SELECT_PREFS_VERSION
    ? cleanIds(state.recentSearchAssetIds, MAX_RECENT_HISTORY)
    : [];
  return { recentAssetIds, recentSearchAssetIds, recentBlockchains };
}

function readStorage(): TokenSelectPrefs {
  if (typeof localStorage === "undefined") return EMPTY_PREFS;
  try {
    const raw = localStorage.getItem(TOKEN_SELECT_PREFS_STORAGE_KEY);
    if (!raw) return EMPTY_PREFS;
    const parsed = JSON.parse(raw) as { state?: unknown; version?: number };
    const version = typeof parsed.version === "number" ? parsed.version : 0;
    const payload = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
    return migrateTokenSelectPrefs(payload, version);
  } catch {
    return EMPTY_PREFS;
  }
}

function writeStorage(state: TokenSelectPrefs) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(TOKEN_SELECT_PREFS_STORAGE_KEY, JSON.stringify({
    state,
    version: TOKEN_SELECT_PREFS_VERSION,
  }));
}

let prefs = readStorage();
const listeners = new Set<() => void>();

function emit(next: TokenSelectPrefs) {
  prefs = next;
  writeStorage(next);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTokenSelectPrefs(): TokenSelectPrefs {
  return prefs;
}

export function setLastToken(assetId: string, blockchain: string) {
  emit({
    ...prefs,
    recentAssetIds: rememberRecentAsset(prefs.recentAssetIds, assetId),
    recentBlockchains: rememberRecentBlockchain(prefs.recentBlockchains, blockchain),
  });
}

export function setRecentSearch(assetId: string) {
  emit({
    ...prefs,
    recentSearchAssetIds: rememberRecentSearch(prefs.recentSearchAssetIds, assetId),
  });
}

export function removeRecentSearches(assetIds: readonly string[]) {
  emit({
    ...prefs,
    recentSearchAssetIds: withoutAssetIds(prefs.recentSearchAssetIds, assetIds),
  });
}

export function setLastBlockchain(blockchain: string) {
  emit({
    ...prefs,
    recentBlockchains: rememberRecentBlockchain(prefs.recentBlockchains, blockchain),
  });
}

export function useTokenSelectPrefs(): TokenSelectPrefs {
  return useSyncExternalStore(subscribe, getTokenSelectPrefs, getTokenSelectPrefs);
}
