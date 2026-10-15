import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@stableflow/pay-ui/button";
import {
  defaultWalletKindMeta,
  PayWidgetsProvider,
  type ChainKind,
  type PayChain,
  type PayToken,
  type PayWallet,
  type ReadBalances,
  type WalletKindMeta,
} from "@stableflow/pay-widgets/token-select";
import { WalletSelectDialog, type WalletSelectOption } from "@stableflow/pay-widgets/wallet-select";

export const DEMO_KINDS = ["evm", "near", "solana", "tron", "zec"] as const;

export type ConnectedMode = "none" | "some" | "all";
export type BalancePreview = "loading" | "empty" | "ok";
export type TargetMode = "none" | "on" | "disabled";

export type WalletDemoQuery = {
  connected: ConnectedMode;
  balances: BalancePreview;
  target: TargetMode;
};

const DEFAULT_QUERY: WalletDemoQuery = {
  connected: "some",
  balances: "ok",
  target: "on",
};

const DEMO_ADDRESSES: Record<string, string> = {
  evm: "0x1111111111111111111111111111111111111111",
  near: "demo.wallet.near",
  solana: "So1anaDemoAddress111111111111111111111111111",
  tron: "TDemoTronAddress111111111111111111111",
  zec: "t1DemoZcashAddress111111111111111111111",
};

const OK_AMOUNTS: Record<string, string> = {
  "eth:USDT": "25000",
  "eth:ETH": "1.5",
  "base:USDC": "0",
  "near:USDT": "100",
  "sol:USDC": "6000.78",
  "sol:SOL": "0",
  "tron:USDT": "12.34567",
  "zec:ZEC": "0.25",
};

const CHAIN_LOGO = "https://assets.dapdap.net/stableflow/networks/type-evm.svg";
const TOKEN_LOGO = "https://assets.dapdap.net/tokens/default_icon.png";

function logoFile(blockchain: string, chainKind: string): string {
  if (blockchain === "base") return "btc";
  if (chainKind === "zec") return "zcash";
  if (chainKind === "solana") return "solana";
  return chainKind;
}

function chain(blockchain: string, chainName: string, chainKind: string, logo = CHAIN_LOGO): PayChain {
  return { blockchain, chainName, chainKind, logo, explorer: "" };
}

export function demoTokens(): PayToken[] {
  const rows: Array<[string, string, string, string, number, string]> = [
    ["eth:USDT", "USDT", "eth", "Ethereum", 1, "evm"],
    ["eth:ETH", "ETH", "eth", "Ethereum", 2000, "evm"],
    ["base:USDC", "USDC", "base", "Base", 1, "evm"],
    ["near:USDT", "USDT", "near", "Near", 1, "near"],
    ["sol:USDC", "USDC", "sol", "Solana", 1, "solana"],
    ["sol:SOL", "SOL", "sol", "Solana", 150, "solana"],
    ["tron:USDT", "USDT", "tron", "Tron", 1, "tron"],
    ["zec:ZEC", "ZEC", "zec", "Zcash", 40, "zec"],
  ];
  return rows.map(([assetId, symbol, blockchain, chainName, price, chainKind]) => ({
    assetId,
    symbol,
    providerSymbol: symbol,
    blockchain,
    decimals: 6,
    contractAddress: symbol === "ETH" || symbol === "SOL" || symbol === "ZEC" ? "" : `0x${symbol}`,
    price,
    logo: TOKEN_LOGO,
    supportPayment: true,
    supportReceive: true,
    chain: chain(
      blockchain,
      chainName,
      chainKind,
      `https://assets.dapdap.net/stableflow/networks/type-${logoFile(blockchain, chainKind)}.svg`,
    ),
  }));
}

export function demoWalletKinds(): WalletKindMeta[] {
  return DEMO_KINDS.map((kind) => defaultWalletKindMeta(kind)).filter((item): item is WalletKindMeta => item != null);
}

function accountsFor(mode: ConnectedMode): PayWallet["accounts"] {
  if (mode === "none") return {};
  const kinds = mode === "all" ? DEMO_KINDS : (["evm", "solana"] as const);
  return Object.fromEntries(kinds.map((kind) => [kind, {
    address: DEMO_ADDRESSES[kind],
    icon: kind === "evm" ? TOKEN_LOGO : undefined,
    canDisconnect: true,
  }]));
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function readWalletDemoQuery(search: string): WalletDemoQuery {
  const params = new URLSearchParams(search);
  return {
    connected: oneOf(params.get("connected"), ["none", "some", "all"] as const, DEFAULT_QUERY.connected),
    balances: oneOf(params.get("balances"), ["loading", "empty", "ok"] as const, DEFAULT_QUERY.balances),
    target: oneOf(params.get("target"), ["none", "on", "disabled"] as const, DEFAULT_QUERY.target),
  };
}

function queryString(state: WalletDemoQuery): string {
  const params = new URLSearchParams();
  params.set("connected", state.connected);
  params.set("balances", state.balances);
  params.set("target", state.target);
  return params.toString();
}

const WALLETS: WalletSelectOption[] = [
  { id: "demo", name: "Demo Wallet", icon: TOKEN_LOGO, detected: true },
];

export function WalletDemo(props: {
  pagePath: string;
  children: (state: {
    open: boolean;
    setOpen: (open: boolean) => void;
    target: TargetMode;
    onSelectToken?: (token: PayToken) => void;
    getTokenDisabledReason?: (token: PayToken) => string | null;
    notice: string;
  }) => ReactNode;
}) {
  const initial = readWalletDemoQuery(window.location.search);
  const [connected, setConnected] = useState<ConnectedMode>(initial.connected);
  const [balances, setBalances] = useState<BalancePreview>(initial.balances);
  const [target, setTarget] = useState<TargetMode>(initial.target);
  const [accounts, setAccounts] = useState<PayWallet["accounts"]>(() => accountsFor(initial.connected));
  const [open, setOpen] = useState(props.pagePath === "/my-wallets");
  const [notice, setNotice] = useState("");
  const [picking, setPicking] = useState<ChainKind | null>(null);
  const balanceRef = useRef(balances);
  balanceRef.current = balances;

  useEffect(() => {
    const next = `${props.pagePath}?${queryString({ connected, balances, target })}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) window.history.replaceState(null, "", next);
  }, [props.pagePath, connected, balances, target]);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname.replace(/\/$/, "") !== props.pagePath) return;
      const next = readWalletDemoQuery(window.location.search);
      setConnected(next.connected);
      setBalances(next.balances);
      setTarget(next.target);
      setAccounts(accountsFor(next.connected));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [props.pagePath]);

  const tokens = useMemo(() => demoTokens(), []);
  const walletKinds = useMemo(() => demoWalletKinds(), []);

  const readBalances = useMemo<ReadBalances>(() => async (batch) => {
    while (balanceRef.current === "loading") {
      await new Promise((resolve) => window.setTimeout(resolve, 40));
    }
    return batch.tokens.map((token) => ({
      assetId: token.assetId,
      formatted: balanceRef.current === "empty" ? "0" : OK_AMOUNTS[token.assetId] ?? "0",
    }));
  }, []);

  const wallet = useMemo<PayWallet>(() => ({
    accounts,
    connect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { ...current[kind], address: current[kind]?.address, connecting: true, canDisconnect: true },
      }));
      setPicking(kind);
    },
    disconnect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { address: "", connecting: false, canDisconnect: true },
      }));
      setNotice(`Disconnected ${kind}`);
    },
  }), [accounts]);

  function cycle<T extends string>(value: T, order: readonly T[]): T {
    const index = order.indexOf(value);
    return order[(index + 1) % order.length] ?? order[0];
  }

  const onSelectToken = target === "none"
    ? undefined
    : (token: PayToken) => {
        setNotice(`Selected ${token.symbol} on ${token.chain.chainName}`);
      };

  const getTokenDisabledReason = target === "disabled"
    ? (token: PayToken) => (token.chain.chainKind === "zec" ? "Zcash is not supported for this payment" : null)
    : undefined;

  return (
    <PayWidgetsProvider
      tokens={tokens}
      wallet={wallet}
      walletKinds={walletKinds}
      readBalances={readBalances}
      onCopyAddress={(address) => setNotice(`Copied ${address}`)}
    >
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => {
          const next = cycle(connected, ["none", "some", "all"] as const);
          setConnected(next);
          setAccounts(accountsFor(next));
        }}
        >
          Connected: {connected}
        </Button>
        <Button onClick={() => setBalances(cycle(balances, ["loading", "empty", "ok"] as const))}>
          Balances: {balances}
        </Button>
        <Button onClick={() => setTarget(cycle(target, ["none", "on", "disabled"] as const))}>
          Target: {target}
        </Button>
      </div>
      {notice ? <p className="w-full">{notice}</p> : null}
      {props.children({ open, setOpen, target, onSelectToken, getTokenDisabledReason, notice })}
      <WalletSelectDialog
        open={picking != null}
        title={picking ? `Connect ${picking}` : "Connect"}
        wallets={WALLETS}
        onClose={() => {
          if (picking) {
            setAccounts((current) => ({
              ...current,
              [picking]: { ...current[picking], connecting: false },
            }));
          }
          setPicking(null);
        }}
        onSelect={() => {
          if (!picking) return;
          const kind = picking;
          setAccounts((current) => ({
            ...current,
            [kind]: {
              address: DEMO_ADDRESSES[kind] ?? `${kind}.demo`,
              icon: TOKEN_LOGO,
              connecting: false,
              canDisconnect: true,
            },
          }));
          setNotice(`Connected ${kind}`);
          setPicking(null);
        }}
      />
    </PayWidgetsProvider>
  );
}
