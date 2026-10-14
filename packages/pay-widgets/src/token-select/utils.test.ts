import { describe, expect, it } from "vitest";
import type { ChainKind } from "./types";
import {
  allChainPreview,
  chainBalanceUsd,
  chainHasBalance,
  chainMenuOrder,
  chainsFromTokens,
  compareTokensByPriority,
  initialChainFilter,
  isGasToken,
  matchesChainFilter,
  payerRailChains,
  positiveBalanceTokens,
  recentTokensInOrder,
  searchTokens,
  sortChainsAlpha,
  sortChainsForSidebar,
  sortTokensByBalance,
  sortTokensBySymbol,
  sortTokensForChain,
  tokenBalanceUsd,
  tokenMatchesSearch,
  tokenPriority,
  trendTokensIn,
  withoutDustTokens,
  type SidebarChain,
} from "./utils";
import { ALL_CHAIN_FILTER, TRENDS_TOKENS } from "./config";

function chain(blockchain: string, chainName = blockchain): SidebarChain {
  const chainKind: ChainKind = blockchain === "near"
    ? "near"
    : blockchain === "sol"
      ? "solana"
      : "evm";
  return { blockchain, chainName, chainKind, logo: "" };
}

function token(assetId: string, symbol: string, chainName: string, extras?: {
  providerSymbol?: string;
  contractAddress?: string | null;
  blockchain?: string;
  price?: number;
}): {
  assetId: string;
  symbol: string;
  providerSymbol: string;
  contractAddress: string | null;
  blockchain: string;
  price: number;
  chain: { chainName: string };
} {
  return {
    assetId,
    symbol,
    providerSymbol: extras?.providerSymbol ?? symbol,
    contractAddress: extras?.contractAddress ?? null,
    blockchain: extras?.blockchain ?? "eth",
    price: extras?.price ?? 1,
    chain: { chainName },
  };
}

describe("tokenBalanceUsd", () => {
  it("multiplies balance by price", () => {
    expect(tokenBalanceUsd({ price: 4000 }, "0.05")).toBe(200);
    expect(tokenBalanceUsd({ price: 1 }, "100")).toBe(100);
  });

  it("returns -1 for unknown balance", () => {
    expect(tokenBalanceUsd({ price: 1 }, null)).toBe(-1);
    expect(tokenBalanceUsd({ price: 1 }, undefined)).toBe(-1);
    expect(tokenBalanceUsd({ price: 1 }, "—")).toBe(-1);
  });

  it("returns 0 for a zero balance", () => {
    expect(tokenBalanceUsd({ price: 1 }, "0")).toBe(0);
  });

  it("treats a non-finite price as 0", () => {
    expect(tokenBalanceUsd({ price: Number.NaN }, "10")).toBe(0);
  });
});

describe("tokenMatchesSearch", () => {
  const usdt = token("eth-usdt", "USDT", "Ethereum", {
    providerSymbol: "USDT0",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  });

  it("matches symbol, provider symbol, and address", () => {
    expect(tokenMatchesSearch(usdt, "usdt")).toBe(true);
    expect(tokenMatchesSearch(usdt, "USDT0")).toBe(true);
    expect(tokenMatchesSearch(usdt, "0xa0b86991")).toBe(true);
  });

  it("does not match chain name", () => {
    expect(tokenMatchesSearch(usdt, "ethereum")).toBe(false);
  });

  it("matches an empty query", () => {
    expect(tokenMatchesSearch(usdt, "  ")).toBe(true);
  });
});

describe("matchesChainFilter", () => {
  it("lets every chain through All", () => {
    expect(matchesChainFilter({ blockchain: "near" }, ALL_CHAIN_FILTER)).toBe(true);
    expect(matchesChainFilter({ blockchain: "eth" }, "eth")).toBe(true);
    expect(matchesChainFilter({ blockchain: "eth" }, "base")).toBe(false);
  });
});

describe("sortChainsForSidebar", () => {
  const available = [
    chain("eth", "Ethereum"),
    chain("base", "Base"),
    chain("near", "Near"),
  ];
  const tokens = [
    token("usdt-eth", "USDT", "Ethereum", { blockchain: "eth", price: 1 }),
    token("usdc-base", "USDC", "Base", { blockchain: "base", price: 1 }),
    token("eth-near", "ETH", "Near", { blockchain: "near", price: 1 }),
  ];
  const usd: Record<string, number> = { "usdt-eth": 10, "usdc-base": 50, "eth-near": 0 };

  it("orders funded chains by USD and leaves unfunded last", () => {
    const sorted = sortChainsForSidebar(available, tokens, {
      showBalances: true,
      getBalanceUsd: (item) => usd[item.assetId] ?? 0,
    });
    expect(sorted.map((item) => item.blockchain)).toEqual(["base", "eth", "near"]);
  });

  it("sums every positive token on the chain", () => {
    expect(chainBalanceUsd("eth", [
      token("a", "A", "Ethereum", { blockchain: "eth" }),
      token("b", "B", "Ethereum", { blockchain: "eth" }),
      token("c", "C", "Base", { blockchain: "base" }),
    ], (item) => (item.assetId === "a" ? 4 : item.assetId === "b" ? -1 : 9))).toBe(4);
  });

  it("keeps incoming order when balances are hidden", () => {
    const sorted = sortChainsForSidebar(available, tokens, {
      showBalances: false,
      getBalanceUsd: () => 100,
    });
    expect(sorted.map((item) => item.blockchain)).toEqual(["eth", "base", "near"]);
  });
});

describe("initialChainFilter", () => {
  const chains = [
    chain("eth", "Ethereum"),
    chain("base", "Base"),
    chain("sol", "Solana"),
    chain("near", "Near"),
  ];

  it("returns All when unlocked", () => {
    expect(initialChainFilter(null, ["sol"], chains)).toBe(ALL_CHAIN_FILTER);
  });

  it("selects the only chain for a locked kind", () => {
    expect(initialChainFilter("solana", ["eth"], chains)).toBe("sol");
  });

  it("prefers the most recent matching EVM chain", () => {
    expect(initialChainFilter("evm", ["sol", "base", "eth"], chains)).toBe("base");
  });

  it("falls back to the first matching chain", () => {
    expect(initialChainFilter("evm", ["sol", "near"], chains)).toBe("eth");
  });
});

describe("chainHasBalance", () => {
  const tokens = [
    { blockchain: "eth" },
    { blockchain: "eth" },
    { blockchain: "near" },
  ];

  it("is true when any token on that chain has a positive balance", () => {
    const balances = ["0", "1.2", "0"];
    expect(chainHasBalance("eth", tokens, (token) => balances[tokens.indexOf(token)])).toBe(true);
    expect(chainHasBalance("near", tokens, () => "0")).toBe(false);
  });
});

describe("sortTokensByBalance", () => {
  const usdtEth = token("usdt-eth", "USDT", "Ethereum");
  const usdcArb = token("usdc-arb", "USDC", "Arbitrum");
  const usdtNear = token("usdt-near", "USDT", "NEAR");
  const zero = token("dai-eth", "DAI", "Ethereum");
  const usd: Record<string, number> = {
    "usdt-eth": 10,
    "usdc-arb": 50,
    "usdt-near": -1,
    "dai-eth": 0,
  };

  it("orders funded, then loading, then zero or unknown", () => {
    const sorted = sortTokensByBalance(
      [zero, usdtNear, usdtEth, usdcArb],
      (item) => usd[item.assetId] ?? -1,
      (item) => item.assetId === "usdt-near",
    );
    expect(sorted.map((item) => item.assetId)).toEqual([
      "usdc-arb",
      "usdt-eth",
      "usdt-near",
      "dai-eth",
    ]);
  });

  it("sorts by symbol when balances are not used", () => {
    expect(sortTokensBySymbol([usdtNear, usdcArb, usdtEth]).map((item) => item.assetId)).toEqual([
      "usdc-arb",
      "usdt-eth",
      "usdt-near",
    ]);
  });
});

describe("positiveBalanceTokens", () => {
  const funded = token("usdt-eth", "USDT", "Ethereum");
  const zero = token("dai-eth", "DAI", "Ethereum");

  it("drops zero and unknown balances", () => {
    const usd: Record<string, number> = { "usdt-eth": 10, "dai-eth": 0 };
    expect(positiveBalanceTokens([zero, funded], (item) => usd[item.assetId] ?? -1).map((item) => item.assetId)).toEqual([
      "usdt-eth",
    ]);
  });
});

describe("withoutDustTokens", () => {
  const large = token("usdt-eth", "USDT", "Ethereum");
  const exact = token("usdc-eth", "USDC", "Ethereum");
  const dust = token("dai-eth", "DAI", "Ethereum");
  const tokens = [large, exact, dust];
  const usd: Record<string, number> = { "usdt-eth": 10, "usdc-eth": 1, "dai-eth": 0.4 };

  it("hides balances under $1 and keeps $1", () => {
    expect(withoutDustTokens(tokens, (item) => usd[item.assetId] ?? -1, false).map((item) => item.assetId)).toEqual([
      "usdt-eth",
      "usdc-eth",
    ]);
  });

  it("keeps dust when show dust is on", () => {
    expect(withoutDustTokens(tokens, (item) => usd[item.assetId] ?? -1, true)).toBe(tokens);
  });
});

describe("recentTokensInOrder", () => {
  const tokens = [
    token("usdt-eth", "USDT", "Ethereum"),
    token("usdc-arb", "USDC", "Arbitrum"),
    token("dai-eth", "DAI", "Ethereum"),
  ];

  it("follows most-recent-first and skips missing ids", () => {
    expect(recentTokensInOrder(tokens, ["dai-eth", "missing", "usdt-eth"]).map((item) => item.assetId)).toEqual([
      "dai-eth",
      "usdt-eth",
    ]);
  });

  it("all-search can match a token outside recent and funded lists", () => {
    const usd: Record<string, number> = { "usdt-eth": 10, "usdc-arb": 0, "dai-eth": 0 };
    const recent = recentTokensInOrder(tokens, ["usdt-eth"]);
    const yours = positiveBalanceTokens(tokens, (item) => usd[item.assetId] ?? -1);
    const searched = tokens.filter((item) => tokenMatchesSearch(item, "usdc"));
    expect(recent.map((item) => item.assetId)).toEqual(["usdt-eth"]);
    expect(yours.map((item) => item.assetId)).toEqual(["usdt-eth"]);
    expect(searched.map((item) => item.assetId)).toEqual(["usdc-arb"]);
  });
});

function rankedToken(assetId: string, symbol: string, chainName: string, extras?: {
  blockchain?: string;
  contractAddress?: string | null;
  chainKind?: string;
}) {
  const blockchain = extras?.blockchain ?? "eth";
  return {
    ...token(assetId, symbol, chainName, {
      blockchain,
      contractAddress: extras && "contractAddress" in extras ? extras.contractAddress : "0xabc",
    }),
    chain: { chainName, chainKind: extras?.chainKind ?? "evm" },
  };
}

describe("isGasToken", () => {
  it("treats an empty address, native, the zero address, and NEAR as gas", () => {
    expect(isGasToken({ symbol: "ETH", blockchain: "eth", contractAddress: "" })).toBe(true);
    expect(isGasToken({ symbol: "ETH", blockchain: "eth", contractAddress: "native" })).toBe(true);
    expect(isGasToken({ symbol: "ETH", blockchain: "eth", contractAddress: "0x0000000000000000000000000000000000000000" })).toBe(true);
    expect(isGasToken({ symbol: "NEAR", blockchain: "near", contractAddress: "wrap.near" })).toBe(true);
    expect(isGasToken({ symbol: "USDT", blockchain: "eth", contractAddress: "0xabc" })).toBe(false);
  });
});

describe("tokenPriority", () => {
  it("orders stablecoins by list index, then gas, then everything else", () => {
    const usdt = rankedToken("usdt", "USDT", "Ethereum");
    const usdc = rankedToken("usdc", "USDC", "Ethereum");
    const near = rankedToken("near", "NEAR", "Near", { blockchain: "near", contractAddress: "wrap.near", chainKind: "near" });
    const dai = rankedToken("dai", "DAI", "Ethereum");
    expect(tokenPriority(usdt)).toBe(0);
    expect(tokenPriority(dai)).toBe(0);
    expect(tokenPriority(near)).toBe(1);
    expect([dai, near, usdc, usdt].slice().sort(compareTokensByPriority).map((item) => item.symbol)).toEqual([
      "USDT",
      "USDC",
      "DAI",
      "NEAR",
    ]);
  });

  it("uses a caller stablecoin list", () => {
    const usdc = rankedToken("usdc", "USDC", "Ethereum");
    const usdt = rankedToken("usdt", "USDT", "Ethereum");
    expect(compareTokensByPriority(usdt, usdc, ["USDC", "USDT"])).toBeGreaterThan(0);
  });
});

describe("sortTokensForChain", () => {
  const usdt = rankedToken("usdt", "USDT", "Ethereum");
  const usdc = rankedToken("usdc", "USDC", "Ethereum");
  const eth = rankedToken("eth", "ETH", "Ethereum", { contractAddress: null });
  const dai = rankedToken("dai", "DAI", "Ethereum");

  it("puts funded balances first, then loading, then priority", () => {
    const usd: Record<string, number> = { usdt: 10, usdc: 0, eth: 0, dai: 40 };
    const sorted = sortTokensForChain([eth, dai, usdc, usdt], {
      withBalances: true,
      usdOf: (item) => usd[item.assetId] ?? -1,
      loadingOf: (item) => item.assetId === "usdc",
    });
    expect(sorted.map((item) => item.assetId)).toEqual(["dai", "usdt", "usdc", "eth"]);
  });

  it("uses priority when balances are off", () => {
    const sorted = sortTokensForChain([dai, eth, usdc, usdt], {
      withBalances: false,
      usdOf: () => 100,
      loadingOf: () => false,
    });
    expect(sorted.map((item) => item.assetId)).toEqual(["usdt", "usdc", "dai", "eth"]);
  });
});

describe("sortChainsAlpha", () => {
  it("sorts by chain name", () => {
    expect(sortChainsAlpha([
      chain("near", "Near"),
      chain("base", "Base"),
      chain("eth", "Ethereum"),
    ]).map((item) => item.blockchain)).toEqual(["base", "eth", "near"]);
  });
});

describe("payerRailChains", () => {
  const chains = [
    chain("eth", "Ethereum"),
    chain("base", "Base"),
    chain("near", "Near"),
    chain("sol", "Solana"),
  ];

  it("keeps connected kinds and only funded EVM chains", () => {
    const picked = payerRailChains(chains, { evm: "0xabc", near: "demo.near" }, new Set(["base"]));
    expect(picked.map((item) => item.blockchain)).toEqual(["base", "near"]);
  });
});

describe("chainsFromTokens", () => {
  it("keeps the first chain object for a blockchain", () => {
    const first = { blockchain: "eth", chainName: "Ethereum", chainKind: "evm", logo: "a", explorer: "" };
    const second = { blockchain: "eth", chainName: "Eth", chainKind: "evm", logo: "b", explorer: "" };
    const chains = chainsFromTokens([
      { blockchain: "eth", chain: first },
      { blockchain: "eth", chain: second },
      { blockchain: "near", chain: { blockchain: "near", chainName: "Near", chainKind: "near", logo: "", explorer: "" } },
    ]);
    expect(chains).toEqual([
      first,
      { blockchain: "near", chainName: "Near", chainKind: "near", logo: "", explorer: "" },
    ]);
  });
});

describe("allChainPreview", () => {
  it("shows every chain when there are four or fewer", () => {
    const chains = [chain("base", "Base"), chain("near", "Near"), chain("sol", "Solana")];
    expect(allChainPreview(chains).map((item) => item.blockchain)).toEqual(["base", "near", "sol"]);
  });

  it("uses the first EVM chain when eth is missing", () => {
    const chains = [
      chain("base", "Base"),
      chain("arb", "Arbitrum"),
      chain("near", "Near"),
      chain("sol", "Solana"),
      chain("tron", "Tron"),
      chain("op", "Optimism"),
    ];
    expect(allChainPreview(chains).map((item) => item.blockchain)).toEqual(["base", "near", "sol", "tron"]);
  });

  it("fills missing preview slots from the remaining EVM chains by name", () => {
    const chains = [
      chain("base", "Base"),
      chain("op", "Optimism"),
      chain("arb", "Arbitrum"),
      chain("bsc", "BNB Chain"),
      chain("pol", "Polygon"),
    ];
    expect(allChainPreview(chains).map((item) => item.blockchain)).toEqual(["base", "arb", "bsc", "op"]);
  });
});

describe("trendTokensIn", () => {
  const tokens = [
    rankedToken("usdt-tron", "USDT", "Tron", { blockchain: "tron", chainKind: "tron" }),
    rankedToken("usdt-eth", "USDT", "Ethereum", { blockchain: "eth" }),
    rankedToken("dai-eth", "DAI", "Ethereum", { blockchain: "eth" }),
    rankedToken("usdc-eth", "usdc", "Ethereum", { blockchain: "eth" }),
  ];

  it("keeps trend order and appends the rest for All", () => {
    const picked = trendTokensIn(tokens, {
      chainFilter: ALL_CHAIN_FILTER,
      trends: TRENDS_TOKENS,
      sortRest: (rest) => rest.slice().sort((left, right) => left.symbol.localeCompare(right.symbol)),
    });
    expect(picked.map((item) => item.assetId)).toEqual(["usdt-tron", "usdt-eth", "usdc-eth", "dai-eth"]);
  });

  it("limits trends to the selected chain", () => {
    const picked = trendTokensIn(tokens, {
      chainFilter: "eth",
      trends: TRENDS_TOKENS,
      sortRest: (rest) => rest,
    });
    expect(picked.map((item) => item.assetId)).toEqual(["usdt-eth", "usdc-eth", "dai-eth"]);
  });
});

describe("chainMenuOrder", () => {
  const chains = [
    chain("op", "Optimism"),
    chain("eth", "Ethereum"),
    chain("base", "Base"),
    chain("near", "Near"),
  ];
  const tokens = [
    token("usdt-eth", "USDT", "Ethereum", { blockchain: "eth", price: 1 }),
    token("usdc-base", "USDC", "Base", { blockchain: "base", price: 1 }),
  ];

  it("puts dotted chains first by USD, then the rest by name", () => {
    const ordered = chainMenuOrder(chains, tokens, {
      dotted: new Set(["eth", "base"]),
      showBalances: true,
      getBalanceUsd: (item) => (item.assetId === "usdc-base" ? 50 : item.assetId === "usdt-eth" ? 10 : 0),
    });
    expect(ordered.map((item) => item.blockchain)).toEqual(["base", "eth", "near", "op"]);
  });
});

describe("searchTokens", () => {
  const tokens = [
    rankedToken("usdt-near", "USDT", "Near", { blockchain: "near", chainKind: "near" }),
    rankedToken("usdt-eth", "USDT", "Ethereum", { blockchain: "eth" }),
    rankedToken("usdc-base", "USDC", "Base", { blockchain: "base" }),
  ];
  const usd: Record<string, number> = { "usdt-near": 5, "usdt-eth": 20, "usdc-base": 0 };

  it("sorts a payer by balance", () => {
    const found = searchTokens(tokens, "us", {
      role: "payer",
      usdOf: (item) => usd[item.assetId] ?? -1,
      loadingOf: () => false,
    });
    expect(found.map((item) => item.assetId)).toEqual(["usdt-eth", "usdt-near", "usdc-base"]);
  });

  it("sorts a receiver by symbol, then chain name", () => {
    const found = searchTokens(tokens, "usdt", {
      role: "receiver",
      usdOf: () => 0,
      loadingOf: () => false,
    });
    expect(found.map((item) => item.assetId)).toEqual(["usdt-eth", "usdt-near"]);
  });
});
