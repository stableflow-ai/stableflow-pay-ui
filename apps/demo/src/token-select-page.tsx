import { useEffect, useMemo, useState } from "react";
import { Button } from "@stableflow/pay-ui/button";
import {
  mapPayConfigSource,
  normalizePayConfig,
  PayWidgetsProvider,
  TokenSelectDialog,
  type PayToken,
  type PayWallet,
  type ReadBalances,
  type TokenSelectRole,
} from "@stableflow/pay-widgets/token-select";

const POPULAR = [
  { blockchain: "eth", symbol: "USDT" },
  { blockchain: "sol", symbol: "USDC" },
];

const DEMO_ADDRESSES: Record<string, string> = {
  evm: "0x1111111111111111111111111111111111111111",
  near: "demo.token-select.near",
  solana: "So1anaDemoAddress111111111111111111111111111",
  tron: "TDemoTronAddress111111111111111111111",
  zec: "t1DemoZcashAddress111111111111111111111",
};

const readBalances: ReadBalances = async (batch) => batch.tokens.map((token) => ({
  assetId: token.assetId,
  raw: "1000000",
  formatted: token.symbol === "USDC" ? "6000.78" : "25000",
}));

function syncBalance(token: PayToken): string {
  if (token.symbol === "USDC") return "6000.78";
  if (token.symbol === "USDT") return "25000";
  return "0";
}

export function TokenSelectPage() {
  const [tokens, setTokens] = useState<PayToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [connected, setConnected] = useState(true);
  const [balanceMode, setBalanceMode] = useState<"async" | "sync">("async");
  const [role, setRole] = useState<TokenSelectRole>("payer");
  const [accounts, setAccounts] = useState<PayWallet["accounts"]>({
    evm: { address: DEMO_ADDRESSES.evm, canDisconnect: true },
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("https://api.stableflow.ai/v1/pay/config")
      .then((response) => {
        if (!response.ok) throw new Error(`Config request failed (${response.status})`);
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        setTokens(normalizePayConfig(mapPayConfigSource(json)));
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setConfigError(cause instanceof Error ? cause.message : "Failed to load config");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const wallet = useMemo<PayWallet>(() => ({
    accounts: connected ? accounts : {},
    connect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { address: "", connecting: true, canDisconnect: true },
      }));
      window.setTimeout(() => {
        setAccounts((current) => ({
          ...current,
          [kind]: { address: DEMO_ADDRESSES[kind] ?? `${kind}.demo`, connecting: false, canDisconnect: true },
        }));
        setNotice(`Connected ${kind}`);
      }, 400);
    },
    disconnect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { address: "", connecting: false, canDisconnect: true },
      }));
      setNotice(`Disconnected ${kind}`);
    },
  }), [accounts, connected]);

  return (
    <PayWidgetsProvider
      tokens={tokens}
      loading={loading}
      popularTokens={POPULAR}
      wallet={wallet}
      readBalances={balanceMode === "async" ? readBalances : undefined}
      getBalance={balanceMode === "sync" ? (token) => syncBalance(token) : undefined}
      isBalanceLoading={balanceMode === "sync" ? () => false : undefined}
      onCopyAddress={(address) => {
        setNotice(`Copied ${address}`);
        void navigator.clipboard.writeText(address).catch(() => undefined);
      }}
    >
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setConnected((value) => !value)}>{connected ? "Connected" : "Disconnected"}</Button>
        <Button onClick={() => setBalanceMode((value) => (value === "async" ? "sync" : "async"))}>
          Balances: {balanceMode}
        </Button>
        <Button onClick={() => setRole((value) => (value === "payer" ? "receiver" : "payer"))}>Role: {role}</Button>
      </div>
      <TokenSelectExamples
        notice={notice}
        role={role}
        tokenCount={tokens.length}
        loading={loading}
        configError={configError}
      />
    </PayWidgetsProvider>
  );
}

function TokenSelectExamples(props: {
  notice: string;
  role: TokenSelectRole;
  tokenCount: number;
  loading: boolean;
  configError: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PayToken | null>(null);

  return (
    <div>
      <p className="mt-3">
        Config: {props.loading ? "loading" : props.configError || "ready"} · {props.tokenCount} tokens
      </p>
      {props.notice ? <p>{props.notice}</p> : null}
      <Button onClick={() => setOpen(true)} className="mt-2">
        {props.role === "payer" ? "Payer" : "Receiver"}: {selected?.symbol ?? "Select"}
      </Button>
      <TokenSelectDialog
        open={open}
        role={props.role}
        onClose={() => setOpen(false)}
        selectedAssetId={selected?.assetId}
        onSelect={({ token }) => setSelected(token)}
      />
    </div>
  );
}
