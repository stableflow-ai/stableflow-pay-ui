import { useSyncExternalStore } from "react";
import {
  MAX_RECENT_ASSETS,
  MAX_RECENT_BLOCKCHAINS,
  TOKEN_SELECT_PREFS_STORAGE_KEY,
  TOKEN_SELECT_PREFS_VERSION,
} from "./config";

export type TokenSelectPrefs = {
  recentAssetIds: string[];
  recentBlockchains: string[];
};

const EMPTY_PREFS: TokenSelectPrefs = { recentAssetIds: [], recentBlockchains: [] };

export function rememberRecentAsset(recent: string[], assetId: string): string[] {
  const id = assetId.trim();
  if (!id) return recent;
  return [id, ...recent.filter((item) => item !== id)].slice(0, MAX_RECENT_ASSETS);
}

export function rememberRecentBlockchain(recent: string[], blockchain: string): string[] {
  const code = blockchain.trim();
  if (!code) return recent;
  return [code, ...recent.filter((item) => item !== code)].slice(0, MAX_RECENT_BLOCKCHAINS);
}

export function migrateTokenSelectPrefs(persisted: unknown, version: number): TokenSelectPrefs {
  const state = (persisted ?? {}) as {
    lastAssetId?: string | null;
    lastBlockchain?: string | null;
    recentAssetIds?: string[];
    recentBlockchains?: string[];
  };
  const recentBlockchains = version >= 1
    ? (Array.isArray(state.recentBlockchains) ? state.recentBlockchains : [])
    : (typeof state.lastBlockchain === "string" && state.lastBlockchain ? [state.lastBlockchain] : []);
  const recentAssetIds = version >= TOKEN_SELECT_PREFS_VERSION && Array.isArray(state.recentAssetIds)
    ? state.recentAssetIds.filter((id) => typeof id === "string" && id.trim()).slice(0, MAX_RECENT_ASSETS)
    : (typeof state.lastAssetId === "string" && state.lastAssetId ? [state.lastAssetId] : []);
  return { recentAssetIds, recentBlockchains };
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
    recentAssetIds: rememberRecentAsset(prefs.recentAssetIds, assetId),
    recentBlockchains: rememberRecentBlockchain(prefs.recentBlockchains, blockchain),
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
