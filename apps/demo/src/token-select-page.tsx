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
  formatted: token.symbol === "USDC" ? "0.000002" : "25000",
}));

function syncBalance(token: PayToken): string {
  if (token.symbol === "USDC") return "6000.78";
  if (token.symbol === "USDT") return "25000";
  return "0";
}

type BalanceMode = "async" | "sync";

type TokenSelectQuery = {
  connected: boolean;
  balanceMode: BalanceMode;
  role: TokenSelectRole;
  simulateLoading: boolean;
};

const DEFAULT_QUERY: TokenSelectQuery = {
  connected: true,
  balanceMode: "async",
  role: "payer",
  simulateLoading: false,
};

function flag(value: string | null, truthy: string, falsy: string): boolean | null {
  if (value === truthy) return true;
  if (value === falsy) return false;
  return null;
}

function readTokenSelectQuery(search: string): TokenSelectQuery {
  const params = new URLSearchParams(search);
  const balanceMode = params.get("balances");
  const role = params.get("role");
  return {
    connected: flag(params.get("connected"), "true", "false") ?? DEFAULT_QUERY.connected,
    balanceMode: balanceMode === "async" || balanceMode === "sync" ? balanceMode : DEFAULT_QUERY.balanceMode,
    role: role === "payer" || role === "receiver" ? role : DEFAULT_QUERY.role,
    simulateLoading: flag(params.get("loading"), "on", "off") ?? DEFAULT_QUERY.simulateLoading,
  };
}

function tokenSelectQueryString(state: TokenSelectQuery): string {
  const params = new URLSearchParams();
  params.set("connected", state.connected ? "true" : "false");
  params.set("balances", state.balanceMode);
  params.set("role", state.role);
  params.set("loading", state.simulateLoading ? "on" : "off");
  return params.toString();
}

function writeTokenSelectQuery(state: TokenSelectQuery) {
  const next = `${window.location.pathname}?${tokenSelectQueryString(state)}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState(null, "", next);
}

export function TokenSelectPage() {
  const initialQuery = readTokenSelectQuery(window.location.search);
  const [tokens, setTokens] = useState<PayToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [connected, setConnected] = useState(initialQuery.connected);
  const [balanceMode, setBalanceMode] = useState<BalanceMode>(initialQuery.balanceMode);
  const [role, setRole] = useState<TokenSelectRole>(initialQuery.role);
  const [accounts, setAccounts] = useState<PayWallet["accounts"]>({
    evm: { address: DEMO_ADDRESSES.evm, canDisconnect: true },
  });
  const [simulateLoading, setSimulateLoading] = useState(initialQuery.simulateLoading);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    writeTokenSelectQuery({ connected, balanceMode, role, simulateLoading });
  }, [connected, balanceMode, role, simulateLoading]);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname.replace(/\/$/, "") !== "/token-select") return;
      const next = readTokenSelectQuery(window.location.search);
      setConnected(next.connected);
      setBalanceMode(next.balanceMode);
      setRole(next.role);
      setSimulateLoading(next.simulateLoading);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
      loading={loading || simulateLoading}
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
        <Button onClick={() => setSimulateLoading((value) => !value)}>
          Simulate loading: {simulateLoading ? "on" : "off"}
        </Button>
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
