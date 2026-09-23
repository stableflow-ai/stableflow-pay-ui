import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { clearPayTokenBalances, setBalanceReader } from "./balances";
import { setChainKindOverrides, usePayConfig } from "./pay-config";
import type { ChainKind, PayConfigSource, PayWallet, PopularTokenRef, ReadBalances } from "./types";

type PayWidgetsContextValue = {
  wallet: PayWallet;
  popularTokens: PopularTokenRef[];
  onCopyAddress?: (address: string) => void;
};

const PayWidgetsContext = createContext<PayWidgetsContextValue | null>(null);

export type PayWidgetsProviderProps = {
  apiHost?: string;
  popularTokens?: PopularTokenRef[];
  wallet: PayWallet;
  readBalances: ReadBalances;
  onConfig?: (config: PayConfigSource) => void;
  onCopyAddress?: (address: string) => void;
  chainKinds?: Partial<Record<string, ChainKind>>;
  children: ReactNode;
};

export function PayWidgetsProvider(props: PayWidgetsProviderProps) {
  const {
    apiHost,
    popularTokens = [],
    wallet,
    readBalances,
    onConfig,
    onCopyAddress,
    chainKinds,
    children,
  } = props;
  const config = usePayConfig({ apiHost });

  useEffect(() => {
    setChainKindOverrides(chainKinds);
  }, [chainKinds]);

  useEffect(() => {
    setBalanceReader(readBalances);
    return () => setBalanceReader(null);
  }, [readBalances]);

  useEffect(() => {
    if (config.status === "success" && config.source) onConfig?.(config.source);
  }, [config.source, config.status, onConfig]);

  const connected = Object.values(wallet.accounts).some((account) => Boolean(account?.address?.trim()));
  useEffect(() => {
    if (!connected) clearPayTokenBalances();
  }, [connected]);

  const value = useMemo(
    () => ({ wallet, popularTokens, onCopyAddress }),
    [wallet, popularTokens, onCopyAddress],
  );

  return <PayWidgetsContext.Provider value={value}>{children}</PayWidgetsContext.Provider>;
}

export function usePayWidgets(): PayWidgetsContextValue {
  const value = useContext(PayWidgetsContext);
  if (!value) {
    throw new Error("Token select must be rendered inside PayWidgetsProvider");
  }
  return value;
}
