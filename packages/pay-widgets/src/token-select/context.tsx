import { useEffect, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { clearPayTokenBalances, configureBalanceReaders, setBalanceTokens } from "./balances";
import { DEFAULT_STABLE_SYMBOLS } from "./config";
import type { PayToken, PayWallet, ReadBalances } from "./types";

export type PayBalanceMode = "async" | "sync" | "none";

type PayWidgetsContextValue = {
  tokens: PayToken[];
  loading: boolean;
  wallet: PayWallet;
  stableSymbols: string[];
  chainKindLabels: Record<string, string>;
  onCopyAddress?: (address: string) => void;
  balanceMode: PayBalanceMode;
  getBalance: ((token: PayToken, owner: string) => string | null | undefined) | null;
  isBalanceLoading: ((token: PayToken, owner: string) => boolean) | null;
};

const PayWidgetsContext = createContext<PayWidgetsContextValue | null>(null);

export type PayWidgetsProviderProps = {
  tokens: PayToken[];
  loading?: boolean;
  wallet: PayWallet;
  readBalances?: ReadBalances;
  getBalance?: (token: PayToken, owner: string) => string | null | undefined;
  isBalanceLoading?: (token: PayToken, owner: string) => boolean;
  stableSymbols?: string[];
  chainKindLabels?: Record<string, string>;
  onCopyAddress?: (address: string) => void;
  children: ReactNode;
};

function isProduction() {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
  return env === "production";
}

function warnBalanceMode(readBalances: ReadBalances | undefined, getBalance: PayWidgetsProviderProps["getBalance"]) {
  if (isProduction()) return;
  if (readBalances && getBalance) {
    console.warn("PayWidgetsProvider: both readBalances and getBalance were passed; using readBalances.");
    return;
  }
  if (!readBalances && !getBalance) {
    console.warn("PayWidgetsProvider: pass readBalances or getBalance so token balances can load.");
  }
}

export function PayWidgetsProvider(props: PayWidgetsProviderProps) {
  const {
    tokens,
    loading = false,
    wallet,
    readBalances,
    getBalance,
    isBalanceLoading,
    onCopyAddress,
    stableSymbols = [...DEFAULT_STABLE_SYMBOLS],
    chainKindLabels = {},
    children,
  } = props;

  useEffect(() => {
    warnBalanceMode(readBalances, getBalance);
    configureBalanceReaders({
      readBalances: readBalances ?? null,
      getBalance: getBalance ?? null,
      isBalanceLoading: isBalanceLoading ?? null,
    });
    return () => configureBalanceReaders({});
  }, [readBalances, getBalance, isBalanceLoading]);

  useEffect(() => {
    setBalanceTokens(tokens);
  }, [tokens]);

  const connected = Object.values(wallet.accounts).some((account) => Boolean(account?.address?.trim()));
  useEffect(() => {
    if (!connected) clearPayTokenBalances();
  }, [connected]);

  const balanceMode: PayBalanceMode = readBalances ? "async" : getBalance ? "sync" : "none";
  const value: PayWidgetsContextValue = {
    tokens,
    loading,
    wallet,
    stableSymbols,
    chainKindLabels,
    onCopyAddress,
    balanceMode,
    getBalance: balanceMode === "sync" ? getBalance ?? null : null,
    isBalanceLoading: balanceMode === "sync" ? isBalanceLoading ?? null : null,
  };

  return <PayWidgetsContext.Provider value={value}>{children}</PayWidgetsContext.Provider>;
}

export function usePayWidgets(): PayWidgetsContextValue {
  const value = useContext(PayWidgetsContext);
  if (!value) {
    throw new Error("Token select must be rendered inside PayWidgetsProvider");
  }
  return value;
}
