import { describe, expect, it } from "vitest";
import { MAX_RECENT_ASSETS, MAX_RECENT_BLOCKCHAINS } from "./config";
import { mapPayConfigSource, normalizePayConfig } from "./pay-config";
import { migrateTokenSelectPrefs, rememberRecentAsset, rememberRecentBlockchain } from "./prefs";

describe("rememberRecentAsset", () => {
  it("drops empty ids and caps the list", () => {
    expect(rememberRecentAsset(["usdt-eth"], "  ")).toEqual(["usdt-eth"]);
    expect(rememberRecentAsset(["a", "b"], "c").slice(0, MAX_RECENT_ASSETS)).toHaveLength(3);
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
      recentBlockchains: ["sol"],
    });
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
    const normalized = normalizePayConfig(source, {});
    expect(normalized.chains.map((chain) => chain.chainKind)).toEqual(["evm", "near"]);
    expect(normalized.tokens.map((token) => token.assetId)).toEqual([
      "eth:USDT:0xabc",
      "near:NEAR:wrap.near",
    ]);
    expect(source.tokens[0]?.supportReceive).toBe(false);
  });
});
