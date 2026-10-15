import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { Button } from "@stableflow/pay-ui/button";
import { IconArrowDown } from "@stableflow/pay-ui/icons/outline/arrow-down";
import { IconCopy } from "@stableflow/pay-ui/icons/outline/copy";
import { IconLogout } from "@stableflow/pay-ui/icons/outline/logout";
import { IconWallet } from "@stableflow/pay-ui/icons/outline/wallet";
import { Skeleton } from "@stableflow/pay-ui/skeleton";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import {
  ensurePayTokenBalances,
  getPayTokenBalance,
  getPayTokenBalances,
  subscribePayTokenBalances,
} from "../token-select/balances";
import { TOKEN_BALANCE_POLL_MS } from "../token-select/config";
import { usePayWidgets } from "../token-select/context";
import { cx, formatAddress, formatDisplayAmount } from "../token-select/format";
import type { ChainKind, PayToken, WalletKindMeta } from "../token-select/types";
import { formattedBalancePositive } from "../token-select/utils";
import { walletKindsMatch } from "../token-select/wallet-kind-meta";
import {
  accountForKind,
  buildWalletHoldings,
  evmChainLogos,
  kindAddress,
  kindBalancesLoading,
  orderedWalletKinds,
  ownersForAccounts,
  tokensForKind,
  walletHoldingsTotal,
  type WalletHolding,
} from "../wallet-kinds/holdings";
import { WalletKindIcon } from "../wallet-kinds/WalletKindIcon";
import { MyWalletsPanel } from "./panel";

export type MyWalletsDrawerProps = {
  open: boolean;
  onClose: () => void;
  kinds?: ChainKind[];
  onSelectToken?: (token: PayToken) => void;
  getTokenDisabledReason?: (token: PayToken) => string | null;
  renderKindBadge?: (kind: ChainKind) => ReactNode;
  renderKindExtra?: (kind: ChainKind) => ReactNode;
  title?: string;
  connectTitle?: string;
  className?: string;
};

export function MyWalletsDrawer(props: MyWalletsDrawerProps) {
  const {
    open,
    onClose,
    kinds,
    onSelectToken,
    getTokenDisabledReason,
    renderKindBadge,
    renderKindExtra,
    title = "My Wallets",
    connectTitle = "Connect Wallet",
    className,
  } = props;
  const widgets = usePayWidgets();
  const { tokens, wallet, onCopyAddress, balanceMode, getBalance, isBalanceLoading, walletKinds } = widgets;
  const metas = useMemo(() => orderedWalletKinds(kinds, walletKinds), [kinds, walletKinds]);
  const anyConnected = metas.some((meta) => Boolean(kindAddress(wallet.accounts, meta.kind)));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const previousConnected = useRef<Record<string, boolean>>({});

  useSyncExternalStore(subscribePayTokenBalances, getPayTokenBalances, getPayTokenBalances);

  const connectedKey = metas.map((meta) => `${meta.kind}:${kindAddress(wallet.accounts, meta.kind) ?? ""}`).join("|");

  useEffect(() => {
    const updates: Record<string, boolean> = {};
    let changed = false;
    for (const meta of metas) {
      const connected = Boolean(kindAddress(wallet.accounts, meta.kind));
      const wasConnected = Boolean(previousConnected.current[meta.kind]);
      if (connected !== wasConnected) {
        updates[meta.kind] = connected;
        changed = true;
      }
      previousConnected.current[meta.kind] = connected;
    }
    if (changed) setExpanded((current) => ({ ...current, ...updates }));
  }, [connectedKey, metas, wallet.accounts]);

  const owners = useMemo(() => ownersForAccounts(wallet.accounts), [wallet.accounts]);
  const pollTokens = useMemo(
    () => tokens.filter((token) => metas.some((meta) => walletKindsMatch(meta.kind, token.chain.chainKind) && kindAddress(wallet.accounts, meta.kind))),
    [tokens, metas, wallet.accounts],
  );
  const ownersKey = useMemo(
    () => Object.keys(owners).sort().map((kind) => `${kind}:${owners[kind] ?? ""}`).join("|"),
    [owners],
  );
  const pollKey = useMemo(() => pollTokens.map((token) => token.assetId).join("|"), [pollTokens]);
  const ownersRef = useRef(owners);
  const pollRef = useRef(pollTokens);
  ownersRef.current = owners;
  pollRef.current = pollTokens;

  useEffect(() => {
    if (!open || balanceMode !== "async" || !pollKey) return;
    const load = () => {
      void ensurePayTokenBalances(ownersRef.current, pollRef.current);
    };
    load();
    // The provider installs the balance reader in its own effect, which runs after this one.
    const kick = window.setTimeout(load, 0);
    const id = window.setInterval(() => {
      void ensurePayTokenBalances(ownersRef.current, pollRef.current, { force: true });
    }, TOKEN_BALANCE_POLL_MS);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, [open, balanceMode, ownersKey, pollKey]);

  function amountOf(token: PayToken): string | null | undefined {
    const owner = owners[token.chain.chainKind];
    if (!owner) return undefined;
    if (balanceMode === "sync" && getBalance) return getBalance(token, owner) ?? undefined;
    return getPayTokenBalance(owner, token.assetId)?.formatted;
  }

  function loadingOf(token: PayToken): boolean {
    const owner = owners[token.chain.chainKind];
    if (!owner) return false;
    const formatted = amountOf(token);
    if (balanceMode === "none") return false;
    if (balanceMode === "sync") {
      const loading = isBalanceLoading?.(token, owner) ?? false;
      return loading && !formattedBalancePositive(formatted);
    }
    if (formattedBalancePositive(formatted)) return false;
    const entry = getPayTokenBalance(owner, token.assetId);
    return !entry || entry.status === "loading";
  }

  return (
    <MyWalletsPanel
      open={open}
      onClose={onClose}
      title={anyConnected ? title : connectTitle}
      className={className}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-[10px] pt-2 pb-5">
        {metas.map((meta) => (
          <KindCard
            key={meta.kind}
            meta={meta}
            tokens={tokens}
            address={kindAddress(wallet.accounts, meta.kind)}
            account={accountForKind(wallet.accounts, meta.kind)}
            expanded={Boolean(expanded[meta.kind])}
            onToggle={() => setExpanded((current) => ({ ...current, [meta.kind]: !current[meta.kind] }))}
            onConnect={() => {
              void wallet.connect(meta.kind);
            }}
            onDisconnect={() => {
              void wallet.disconnect(meta.kind);
            }}
            onCopy={onCopyAddress}
            amountOf={amountOf}
            loadingOf={loadingOf}
            badge={renderKindBadge?.(meta.kind)}
            extra={renderKindExtra?.(meta.kind)}
            onSelectToken={onSelectToken}
            getTokenDisabledReason={getTokenDisabledReason}
            onClose={onClose}
          />
        ))}
      </div>
    </MyWalletsPanel>
  );
}

function KindCard(props: {
  meta: WalletKindMeta;
  tokens: PayToken[];
  address: string | null;
  account: ReturnType<typeof accountForKind>;
  expanded: boolean;
  onToggle: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onCopy?: (address: string) => void;
  amountOf: (token: PayToken) => string | null | undefined;
  loadingOf: (token: PayToken) => boolean;
  badge?: ReactNode;
  extra?: ReactNode;
  onSelectToken?: (token: PayToken) => void;
  getTokenDisabledReason?: (token: PayToken) => string | null;
  onClose: () => void;
}) {
  const kindTokens = tokensForKind(props.tokens, props.meta.kind);
  const logos = props.meta.kind === "evm" || walletKindsMatch(props.meta.kind, "evm")
    ? evmChainLogos(props.tokens)
    : [];
  const connected = Boolean(props.address);
  const holdings = buildWalletHoldings(kindTokens, props.amountOf);
  const total = walletHoldingsTotal(holdings);
  const loading = kindBalancesLoading(kindTokens, props.amountOf, props.loadingOf);

  if (!connected) {
    return (
      <div
        className="flex shrink-0 flex-col gap-2 rounded-[12px] border border-[#EDF0F7] px-[15px] py-3"
        style={{ backgroundImage: props.meta.bg }}
      >
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-[10px]">
            <WalletKindIcon meta={props.meta} connected={false} />
            <span className="text-[16px] font-medium text-black">{props.meta.label}</span>
            {props.badge}
          </div>
          <Button
            type="button"
            loading={Boolean(props.account?.connecting)}
            onClick={props.onConnect}
            className="h-8 min-w-[90px] rounded-[16px] border-0 bg-white px-3 text-[14px] font-normal text-[#444C59] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.10)] hover:bg-white hover:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] md:h-8 md:px-3 md:text-[14px]"
          >
            Connect
          </Button>
        </div>
        {logos.length > 0 ? <ChainLogoRow logos={logos} /> : null}
      </div>
    );
  }

  return (
    <div
      className="shrink-0 overflow-hidden rounded-[12px] border border-[#EDF0F7]"
      style={{ backgroundImage: props.meta.bg }}
    >
      <div className="flex items-center justify-between px-[15px] pt-4 pb-[10px]">
        <div className="flex min-w-0 items-center gap-[10px]">
          <WalletKindIcon meta={props.meta} connected />
          <span className="text-[16px] font-medium text-black">{props.meta.label}</span>
          {props.badge}
        </div>
        <span className="text-[16px] font-medium text-black">
          {formatDisplayAmount(total, { maxDecimals: 2, prefix: "$" })}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-[15px] pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center">
            <span className="flex items-center gap-2">
              {props.account?.icon ? (
                <img src={props.account.icon} alt="" className="size-3 shrink-0 object-contain" />
              ) : (
                <IconWallet className="size-3 shrink-0 text-[#444C59]" />
              )}
              <span className="text-[14px] font-medium text-black">{formatAddress(props.address)}</span>
            </span>
            <span className="flex items-center pl-1">
              <button
                type="button"
                aria-label="Copy address"
                className="cursor-pointer rounded-[8px] p-1 text-[#B3BBCE] hover:bg-white hover:shadow-[0_0_4px_0_rgba(0,0,0,0.15)]"
                onClick={() => {
                  if (props.address) props.onCopy?.(props.address);
                }}
              >
                <IconCopy className="size-[14px]" />
              </button>
              {props.account?.canDisconnect === false ? null : (
                <button
                  type="button"
                  aria-label="Disconnect"
                  className="cursor-pointer rounded-[8px] p-1 text-[#FF584A] hover:bg-white hover:shadow-[0_0_4px_0_rgba(0,0,0,0.15)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onDisconnect();
                  }}
                >
                  <IconLogout className="size-[14px]" />
                </button>
              )}
            </span>
          </div>
          <button type="button" aria-label={props.expanded ? "Collapse holdings" : "Expand holdings"} className="cursor-pointer shrink-0 p-1 text-[#9FA7BA]" onClick={props.onToggle}>
            <IconArrowDown className={props.expanded ? "rotate-180 transition-transform duration-150" : "transition-transform duration-150"} />
          </button>
        </div>
        {!props.expanded && logos.length > 0 ? <ChainLogoRow logos={logos} /> : null}
      </div>
      {props.expanded ? (
        <>
          <div className="mx-[10px] border-t border-[#EDF0F7]" />
          <div className="flex max-h-[300px] flex-col gap-[14px] overflow-y-auto px-[15px] py-[14px]">
            {holdings.length === 0 ? (
              loading ? <HoldingsSkeleton /> : <div className="text-center text-[12px] text-[#9FA7BA]">No balances</div>
            ) : (
              holdings.map((row) => (
                <HoldingRow
                  key={row.token.assetId}
                  row={row}
                  onSelectToken={props.onSelectToken}
                  reason={props.onSelectToken ? props.getTokenDisabledReason?.(row.token) ?? null : null}
                  onClose={props.onClose}
                />
              ))
            )}
          </div>
        </>
      ) : null}
      {props.extra ? <div className="px-[15px] pb-3">{props.extra}</div> : null}
    </div>
  );
}

function ChainLogoRow(props: { logos: string[] }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {props.logos.map((logo) => (
        <img key={logo} src={logo} alt="" className="size-4 shrink-0 rounded-[6px] object-cover" />
      ))}
    </div>
  );
}

function HoldingsSkeleton() {
  return (
    <div className="flex flex-col gap-[14px]">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <Skeleton className="size-6 rounded-full" />
            <span className="flex flex-col gap-1">
              <Skeleton className="h-[14px] w-12" />
              <Skeleton className="h-[10px] w-16" />
            </span>
          </div>
          <span className="flex flex-col items-end gap-1">
            <Skeleton className="h-[14px] w-14" />
            <Skeleton className="h-[10px] w-10" />
          </span>
        </div>
      ))}
    </div>
  );
}

function HoldingRow(props: {
  row: WalletHolding;
  onSelectToken?: (token: PayToken) => void;
  reason: string | null;
  onClose: () => void;
}) {
  const { row, onSelectToken, reason, onClose } = props;
  const body = (
    <>
      <span className="flex items-center gap-[10px]">
        <span className="relative size-6">
          {row.token.logo ? (
            <img src={row.token.logo} alt="" className="size-6 rounded-full object-cover" />
          ) : (
            <span className="block size-6 rounded-full bg-[#E8E8E8]" />
          )}
          {row.token.chain.logo ? (
            <img
              src={row.token.chain.logo}
              alt=""
              className="absolute -right-[2px] -bottom-[2px] z-10 size-3 rounded-[4px] border border-white"
            />
          ) : null}
        </span>
        <span>
          <span className="block text-[14px] font-medium text-[#444C59]">{row.token.symbol}</span>
          <span className="block text-[10px] text-[#9FA7BA]">{row.token.chain.chainName}</span>
        </span>
      </span>
      <span className="text-right">
        <span className="block text-[14px] font-medium text-[#444C59]">
          {formatDisplayAmount(row.amount, { maxDecimals: 4 })}
        </span>
        <span className="block text-[10px] text-[#9FA7BA]">
          {formatDisplayAmount(row.usd, { maxDecimals: 2, prefix: "$" })}
        </span>
      </span>
    </>
  );

  if (!onSelectToken) {
    return <div className="flex w-full items-center justify-between text-left">{body}</div>;
  }

  if (reason) {
    return (
      <Tooltip content={reason} triggerClassName="w-full">
        <button
          type="button"
          aria-disabled="true"
          className="flex w-full cursor-not-allowed items-center justify-between text-left opacity-40"
          onClick={(event) => event.preventDefault()}
        >
          {body}
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      className="cursor-pointer hover:opacity-90 duration-150 flex w-full items-center justify-between text-left"
      onClick={() => {
        onSelectToken(row.token);
        onClose();
      }}
    >
      {body}
    </button>
  );
}
