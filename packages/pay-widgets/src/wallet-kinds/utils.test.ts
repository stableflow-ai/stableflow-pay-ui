import { describe, expect, it } from "vitest";
import type { PayToken, WalletKindMeta } from "../token-select/types";
import { defaultWalletKindMeta } from "../token-select/wallet-kind-meta";
import {
  buildWalletHoldings,
  kindBalancesLoading,
  orderedWalletKinds,
  tokensForKind,
  walletHoldingsTotal,
} from "./holdings";

function token(symbol: string, kind: string, price: number, blockchain = kind): PayToken {
  return {
    assetId: `${blockchain}:${symbol}`,
    symbol,
    providerSymbol: symbol,
    blockchain,
    decimals: 6,
    contractAddress: symbol,
    price,
    logo: "",
    supportPayment: true,
    supportReceive: true,
    chain: {
      blockchain,
      chainName: blockchain,
      chainKind: kind,
      logo: `${blockchain}.png`,
      explorer: "",
    },
  };
}

const provided: WalletKindMeta[] = [
  { kind: "evm", label: "EVM", icon: "evm.svg", iconGray: "evm-gray.svg" },
  { kind: "solana", label: "Solana", icon: "sol.svg", iconGray: "sol-gray.svg" },
  { kind: "near", label: "Near", icon: "near.svg", iconGray: "near-gray.svg" },
];

describe("defaultWalletKindMeta", () => {
  it("aliases sol and zec onto the CDN icons and labels", () => {
    const sol = defaultWalletKindMeta("sol");
    const solana = defaultWalletKindMeta("solana");
    const zec = defaultWalletKindMeta("zec");
    const zcash = defaultWalletKindMeta("zcash");
    expect(sol?.kind).toBe("sol");
    expect(sol?.label).toBe("Solana");
    expect(sol?.icon).toBe("https://assets.dapdap.net/stableflow/networks/type-solana.svg");
    expect(sol?.iconGray).toBe(solana?.iconGray);
    expect(sol?.bgColor).toBe("#282C34");
    expect(zec?.kind).toBe("zec");
    expect(zec?.label).toBe("Zcash");
    expect(zec?.icon).toBe(zcash?.icon);
    expect(zec?.icon).toContain("type-zcash.svg");
    expect(defaultWalletKindMeta("evm")?.label).toBe("EVM");
    expect(defaultWalletKindMeta("unknown")).toBeNull();
  });
});

describe("orderedWalletKinds", () => {
  it("keeps provider order when kinds is omitted and filters to the requested order", () => {
    expect(orderedWalletKinds(undefined, provided).map((item) => item.kind)).toEqual(["evm", "solana", "near"]);
    expect(orderedWalletKinds(["near", "sol"], provided).map((item) => item.kind)).toEqual(["near", "sol"]);
    expect(orderedWalletKinds(["near", "sol"], provided)[1]?.icon).toBe("sol.svg");
    expect(orderedWalletKinds(["btc"], []).map((item) => item.kind)).toEqual(["btc"]);
  });
});

describe("wallet holdings", () => {
  const tokens = [
    token("USDT", "evm", 1, "eth"),
    token("ETH", "evm", 2000, "eth"),
    token("USDC", "solana", 1, "sol"),
    token("ZEC", "zcash", 40, "zec"),
  ];

  it("drops zero amounts, sorts by USD, and totals the visible rows", () => {
    const amounts: Record<string, string> = {
      "eth:USDT": "10",
      "eth:ETH": "0",
      "sol:USDC": "6000.5",
      "zec:ZEC": "0.000",
    };
    const rows = buildWalletHoldings(tokens, (item) => amounts[item.assetId]);
    expect(rows.map((row) => row.token.symbol)).toEqual(["USDC", "USDT"]);
    expect(rows[0]?.usd).toBe(6000.5);
    expect(walletHoldingsTotal(rows)).toBe(6010.5);
  });

  it("matches kind aliases when collecting a card's tokens", () => {
    expect(tokensForKind(tokens, "sol").map((item) => item.symbol)).toEqual(["USDC"]);
    expect(tokensForKind(tokens, "zec").map((item) => item.symbol)).toEqual(["ZEC"]);
  });

  it("treats a card as loading only while no positive balance is ready", () => {
    const evm = tokensForKind(tokens, "evm");
    expect(kindBalancesLoading(evm, () => null, () => true)).toBe(true);
    expect(kindBalancesLoading(evm, (item) => (item.symbol === "USDT" ? "1" : null), () => true)).toBe(false);
    expect(kindBalancesLoading(evm, () => "0", () => false)).toBe(false);
  });
});
