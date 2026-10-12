import { describe, expect, it } from "vitest";
import { MAX_RECENT_BLOCKCHAINS, MAX_RECENT_HISTORY } from "./config";
import { mapPayConfigSource, normalizePayConfig } from "./pay-config";
import { chainsFromTokens } from "./utils";
import {
  migrateTokenSelectPrefs,
  rememberRecentAsset,
  rememberRecentBlockchain,
  rememberRecentSearch,
  withoutAssetIds,
} from "./prefs";

describe("rememberRecentAsset", () => {
  it("drops empty ids and caps the list", () => {
    expect(rememberRecentAsset(["usdt-eth"], "  ")).toEqual(["usdt-eth"]);
    const stored = Array.from({ length: MAX_RECENT_HISTORY }, (_, index) => `id-${index}`);
    expect(rememberRecentAsset(stored, "fresh")).toHaveLength(MAX_RECENT_HISTORY);
    expect(rememberRecentAsset(stored, "fresh")[0]).toBe("fresh");
  });
});

describe("rememberRecentBlockchain", () => {
  it("drops empty codes and caps the list", () => {
    expect(rememberRecentBlockchain(["eth"], "  ")).toEqual(["eth"]);
    const codes = Array.from({ length: MAX_RECENT_BLOCKCHAINS + 2 }, (_, index) => `c${index}`);
    const recent = rememberRecentBlockchain(codes.slice(1), codes[0]);
    expect(recent).toHaveLength(MAX_RECENT_BLOCKCHAINS);
    expect(recent[0]).toBe("c0");
  });
});

describe("migrateTokenSelectPrefs", () => {
  it("lifts a single last token and last chain from v0", () => {
    expect(migrateTokenSelectPrefs({ lastAssetId: "usdt-eth", lastBlockchain: "sol" }, 0)).toEqual({
      recentAssetIds: ["usdt-eth"],
      recentSearchAssetIds: [],
      recentBlockchains: ["sol"],
    });
  });

  it("keeps v2 recently used ids and starts recent searches empty", () => {
    expect(migrateTokenSelectPrefs({
      recentAssetIds: ["usdt-eth", "usdc-sol"],
      recentBlockchains: ["eth"],
    }, 2)).toEqual({
      recentAssetIds: ["usdt-eth", "usdc-sol"],
      recentSearchAssetIds: [],
      recentBlockchains: ["eth"],
    });
  });

  it("keeps v3 recent searches and caps stored history at 50", () => {
    const ids = Array.from({ length: 60 }, (_, index) => `id-${index}`);
    const migrated = migrateTokenSelectPrefs({
      recentAssetIds: ids,
      recentSearchAssetIds: ids,
      recentBlockchains: ["eth"],
    }, 3);
    expect(migrated.recentAssetIds).toHaveLength(MAX_RECENT_HISTORY);
    expect(migrated.recentSearchAssetIds).toHaveLength(MAX_RECENT_HISTORY);
  });
});

describe("recent searches", () => {
  it("dedupes and caps stored searches", () => {
    const stored = Array.from({ length: MAX_RECENT_HISTORY }, (_, index) => `id-${index}`);
    const next = rememberRecentSearch(stored, "id-10");
    expect(next).toHaveLength(MAX_RECENT_HISTORY);
    expect(next[0]).toBe("id-10");
    expect(next.filter((id) => id === "id-10")).toHaveLength(1);
  });

  it("removes only the requested search ids", () => {
    expect(withoutAssetIds(["a", "b", "c"], ["b", "missing"])).toEqual(["a", "c"]);
  });
});

describe("mapPayConfigSource", () => {
  it("unwraps a code and data envelope", () => {
    const source = mapPayConfigSource({
      code: 200,
      data: {
        chains: [
          { network: "eth", chain_id: "1", chain_name: "Ethereum", logo: "", explorer: "https://etherscan.io/tx/" },
        ],
        tokens: [
          {
            symbol: "USDT",
            network: "eth",
            decimals: 6,
            contract_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            price: "0.999725",
            support_payment: true,
            support_receive: true,
          },
        ],
      },
    });
    expect(source.chains).toEqual([
      {
        network: "eth",
        chainId: "1",
        chainName: "Ethereum",
        logo: "",
        explorer: "https://etherscan.io/tx/",
      },
    ]);
    expect(source.tokens[0]?.symbol).toBe("USDT");
    expect(source.tokens[0]?.contractAddress).toBe("0xdac17f958d2ee523a2206206994597c13d831ec7");
  });
});

describe("normalizePayConfig", () => {
  it("maps chains and tokens and drops native NEAR when wrap.near exists", () => {
    const source = mapPayConfigSource({
      chains: [
        { network: "eth", chain_id: "1", chain_name: "Ethereum", logo: "", explorer: "https://etherscan.io" },
        { network: "near", chain_id: "", chain_name: "Near", logo: "", explorer: "" },
      ],
      tokens: [
        { symbol: "USDT0", network: "eth", decimals: 6, contract_address: "0xabc", price: "1", support_payment: true, support_receive: false },
        { symbol: "NEAR", network: "near", decimals: 24, contract_address: "", price: "5", support_payment: true, support_receive: true },
        { symbol: "NEAR", network: "near", decimals: 24, contract_address: "wrap.near", price: "5", support_payment: true, support_receive: true },
      ],
    });
    const normalized = normalizePayConfig(source, { chainKinds: { eth: "evm", near: "near" } });
    expect(chainsFromTokens(normalized).map((chain) => chain.chainKind)).toEqual(["evm", "near"]);
    expect(normalized.map((token) => token.assetId)).toEqual([
      "eth:USDT:0xabc",
      "near:NEAR:wrap.near",
    ]);
    expect(source.tokens[0]?.supportReceive).toBe(false);
  });
});
