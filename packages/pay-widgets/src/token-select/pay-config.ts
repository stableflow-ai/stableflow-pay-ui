import { DEFAULT_CHAIN_KINDS } from "./config";
import { chainLogoUrl, tokenLogoUrl } from "./logos";
import type { ChainKind, PayChain, PayConfigSource, PayConfigSourceChain, PayConfigSourceToken, PayToken } from "./types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const WRAP_NEAR_CONTRACT = "wrap.near";

type ChainKindMap = Partial<Record<string, ChainKind>>;

export type NormalizePayConfigOptions = {
  chainKinds?: ChainKindMap;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function apiText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function apiNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  return fallback;
}

function mapSourceChain(raw: unknown): PayConfigSourceChain {
  const row = asRecord(raw) ?? {};
  return {
    network: apiText(row.network),
    chainId: apiText(row.chain_id ?? row.chainId),
    chainName: apiText(row.chain_name ?? row.chainName),
    logo: apiText(row.logo),
    explorer: apiText(row.explorer),
  };
}

function mapSourceToken(raw: unknown): PayConfigSourceToken {
  const row = asRecord(raw) ?? {};
  return {
    symbol: apiText(row.symbol),
    network: apiText(row.network),
    decimals: apiNumber(row.decimals) ?? 0,
    contractAddress: apiText(row.contract_address ?? row.contractAddress),
    price: apiText(row.price),
    supportPayment: asBoolean(row.support_payment ?? row.supportPayment),
    supportReceive: asBoolean(row.support_receive ?? row.supportReceive),
  };
}

function configBody(raw: unknown): Record<string, unknown> {
  const row = asRecord(raw) ?? {};
  const data = asRecord(row.data);
  if (typeof row.code === "number" && data) return data;
  return row;
}

export function mapPayConfigSource(raw: unknown): PayConfigSource {
  const row = configBody(raw);
  const chains = Array.isArray(row.chains) ? row.chains.map(mapSourceChain) : [];
  const tokens = Array.isArray(row.tokens) ? row.tokens.map(mapSourceToken) : [];
  return { chains, tokens };
}

export function chainKindFor(network: string, overrides: ChainKindMap = {}): ChainKind | null {
  const key = network.trim().toLowerCase();
  if (!key) return null;
  return overrides[key] ?? DEFAULT_CHAIN_KINDS[key as keyof typeof DEFAULT_CHAIN_KINDS] ?? null;
}

function normalizeSymbol(symbol: string): string | null {
  const upper = symbol.trim().toUpperCase();
  if (!upper) return null;
  if (upper === "USDT0") return "USDT";
  if (upper === "WNEAR") return "NEAR";
  return upper;
}

export function tokenAssetId(network: string, symbol: string, contractAddress: string | null | undefined): string {
  const addr = String(contractAddress || "").trim();
  return `${network}:${symbol}:${addr || "native"}`;
}

function isNativeAddress(contractAddress: string | null): boolean {
  const addr = String(contractAddress || "").trim();
  if (!addr) return true;
  const lower = addr.toLowerCase();
  return lower === "native" || lower === ZERO_ADDRESS;
}

export function normalizePayConfig(source: PayConfigSource, options?: NormalizePayConfigOptions): PayToken[] {
  const overrides = options?.chainKinds ?? {};
  const chains: PayChain[] = [];
  for (const chain of source.chains) {
    const chainKind = chainKindFor(chain.network, overrides);
    if (!chainKind || !chain.network) continue;
    chains.push({
      blockchain: chain.network,
      chainName: chain.chainName || chain.network,
      chainKind,
      chainId: chain.chainId || undefined,
      logo: chain.logo || chainLogoUrl(chain.network),
      explorer: chain.explorer,
    });
  }
  const chainByCode = new Map(chains.map((chain) => [chain.blockchain, chain]));
  const tokens: PayToken[] = [];
  for (const token of source.tokens) {
    const chain = chainByCode.get(token.network);
    if (!chain) continue;
    const symbol = normalizeSymbol(token.symbol);
    if (!symbol) continue;
    if (!Number.isInteger(token.decimals) || token.decimals < 0) continue;
    const contractAddress = token.contractAddress.trim() || null;
    tokens.push({
      assetId: tokenAssetId(token.network, symbol, contractAddress),
      symbol,
      providerSymbol: token.symbol,
      blockchain: token.network,
      decimals: token.decimals,
      contractAddress,
      price: Number(token.price || 1),
      logo: tokenLogoUrl(symbol),
      supportPayment: token.supportPayment,
      supportReceive: token.supportReceive,
      chain,
    });
  }
  const hasNearWrap = tokens.some((token) => (
    token.symbol === "NEAR" && token.blockchain === "near" && token.contractAddress?.toLowerCase() === WRAP_NEAR_CONTRACT
  ));
  if (!hasNearWrap) return tokens;
  return tokens.filter((token) => !(token.symbol === "NEAR" && token.blockchain === "near" && isNativeAddress(token.contractAddress)));
}
