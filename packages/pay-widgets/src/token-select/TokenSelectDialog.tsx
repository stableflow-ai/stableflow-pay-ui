import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Dialog } from "@stableflow/pay-ui/dialog";
import { SearchInput } from "@stableflow/pay-ui/search-input";
import {
  ensurePayTokenBalances,
  getPayTokenBalance,
  getPayTokenBalances,
  subscribePayTokenBalances,
} from "./balances";
import { ALL_CHAIN_FILTER, POPULAR_SECTION_TITLE, TOKEN_BALANCE_POLL_MS } from "./config";
import { usePayWidgets } from "./context";
import { usePayConfigSnapshot } from "./pay-config";
import { getTokenSelectPrefs, setLastBlockchain, setLastToken, useTokenSelectPrefs } from "./prefs";
import { cx, fontSans } from "./format";
import { ChainPane } from "./chain-pane";
import { NetworkRail } from "./network-rail";
import { TokenPane, type TokenListSection } from "./token-pane";
import type { ChainKind, ChainOwners, PayToken, TokenSelectRole } from "./types";
import {
  chainHasBalance,
  initialChainFilter,
  isBlockchainDisabled,
  isChainKindLocked,
  matchesChainFilter,
  popularTokensForWallets,
  positiveBalanceTokens,
  recentTokensInOrder,
  sortChainsForSidebar,
  sortTokensByBalance,
  sortTokensBySymbol,
  tokenBalanceUsd,
  tokenMatchesSearch,
} from "./utils";

export type TokenSelectSelection = {
  token: PayToken;
};

export type TokenSelectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: TokenSelectSelection) => void;
  role?: TokenSelectRole;
  title?: string;
  selectedAssetId?: string | null;
  balanceOwners?: ChainOwners;
  allowedBlockchains?: string[] | null;
  lockChainKind?: ChainKind | null;
  excludeNative?: boolean;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
  className?: string;
  titleClassName?: string;
  closeClassName?: string;
  contentClassName?: string;
  searchClassName?: string;
  railClassName?: string;
  rowClassName?: string;
};

const SEARCH_INPUT_CLASS = "h-[36px] rounded-[18px] border-[#e3e3e3] bg-[#f6f6f6] text-sm placeholder:text-black/30";

function chainsFromTokens(tokens: PayToken[]) {
  const byCode = new Map<string, PayToken["chain"]>();
  for (const token of tokens) {
    if (!byCode.has(token.blockchain)) byCode.set(token.blockchain, token.chain);
  }
  return Array.from(byCode.values());
}

function ownerForToken(owners: ChainOwners, token: PayToken): string | null {
  return owners[token.chain.chainKind] ?? null;
}

function hasAnyOwner(owners: ChainOwners): boolean {
  return Object.values(owners).some((address) => Boolean(address));
}

function isNativeToken(token: PayToken): boolean {
  const addr = String(token.contractAddress || "").trim().toLowerCase();
  return !addr || addr === "native" || addr === "0x0000000000000000000000000000000000000000";
}

export function TokenSelectDialog(props: TokenSelectDialogProps) {
  const {
    open,
    onClose,
    onSelect,
    role = "payer",
    title = "Select Token",
    selectedAssetId,
    balanceOwners,
    allowedBlockchains = null,
    lockChainKind = null,
    excludeNative = false,
    disabledBlockchains = null,
    disabledReason,
    className,
    titleClassName,
    closeClassName,
    contentClassName,
    searchClassName,
    railClassName,
    rowClassName,
  } = props;
  const payer = role === "payer";
  const showBalances = payer;
  const { wallet, popularTokens: popularRefs } = usePayWidgets();
  const { tokens, status } = usePayConfigSnapshot();
  const prefs = useTokenSelectPrefs();
  const balanceEntries = useSyncExternalStore(subscribePayTokenBalances, getPayTokenBalances, getPayTokenBalances);
  const connectedOwners = useMemo(() => {
    const owners: ChainOwners = {};
    for (const [kind, account] of Object.entries(wallet.accounts)) {
      const address = account?.address?.trim();
      if (address) owners[kind as ChainKind] = address;
    }
    return owners;
  }, [wallet.accounts]);
  const owners = showBalances ? { ...connectedOwners, ...balanceOwners } : {};
  const walletConnected = hasAnyOwner(connectedOwners);
  const walletWasConnected = useRef<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState(ALL_CHAIN_FILTER);
  const [view, setView] = useState<"token" | "network">("token");
  const loading = status === "loading" || status === "idle";

  useEffect(() => {
    if (!open) return;
    setSearch("");
    if (lockChainKind) {
      setView("token");
      return;
    }
    if (!payer) {
      setView("token");
      setChainFilter(ALL_CHAIN_FILTER);
    }
  }, [open, lockChainKind, payer]);

  useEffect(() => {
    if (!open || !lockChainKind || tokens.length === 0) return;
    setChainFilter(initialChainFilter(
      lockChainKind,
      getTokenSelectPrefs().recentBlockchains,
      chainsFromTokens(tokens),
    ));
  }, [open, lockChainKind, tokens]);

  useEffect(() => {
    if (!open) {
      walletWasConnected.current = null;
      return;
    }
    if (lockChainKind || !payer) {
      walletWasConnected.current = walletConnected;
      return;
    }
    const previous = walletWasConnected.current;
    walletWasConnected.current = walletConnected;
    if (previous !== null && previous === walletConnected) return;
    setView(walletConnected ? "token" : "network");
    setChainFilter(ALL_CHAIN_FILTER);
  }, [open, lockChainKind, payer, walletConnected]);

  const allowed = useMemo(() => {
    if (!allowedBlockchains || allowedBlockchains.length === 0) return null;
    return new Set(allowedBlockchains.map((code) => code.toLowerCase()));
  }, [allowedBlockchains]);

  const scopedTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (allowed && !allowed.has(token.blockchain.toLowerCase())) return false;
      if (excludeNative && isNativeToken(token)) return false;
      if (payer && !token.supportPayment) return false;
      if (!payer && !token.supportReceive) return false;
      return true;
    });
  }, [tokens, allowed, excludeNative, payer]);

  const ownerKey = (["evm", "near", "solana", "tron", "zec"] as const)
    .map((kind) => `${kind}:${owners[kind] ?? ""}`)
    .join("|");
  const tokenKey = useMemo(() => scopedTokens.map((token) => token.assetId).join("|"), [scopedTokens]);
  const ownersRef = useRef(owners);
  const tokensRef = useRef(scopedTokens);
  ownersRef.current = owners;
  tokensRef.current = scopedTokens;

  useEffect(() => {
    if (!showBalances || !open || !hasAnyOwner(ownersRef.current) || !tokenKey) return;
    void ensurePayTokenBalances(ownersRef.current, tokensRef.current);
    const id = window.setInterval(() => {
      void ensurePayTokenBalances(ownersRef.current, tokensRef.current, { force: true });
    }, TOKEN_BALANCE_POLL_MS);
    return () => window.clearInterval(id);
  }, [showBalances, open, ownerKey, tokenKey]);

  function balanceOf(token: PayToken) {
    return getPayTokenBalance(ownerForToken(owners, token), token.assetId)?.formatted;
  }

  function usdOf(token: PayToken) {
    if (!showBalances) return -1;
    return tokenBalanceUsd(token, balanceOf(token));
  }

  function loadingOf(token: PayToken) {
    if (!showBalances) return false;
    const owner = ownerForToken(owners, token);
    if (!owner) return false;
    const entry = getPayTokenBalance(owner, token.assetId);
    return entry?.formatted == null && (!entry || entry.status === "loading");
  }

  const availableChains = useMemo(() => {
    const codes = new Set(scopedTokens.map((token) => token.blockchain));
    const byCode = new Map<string, PayToken["chain"]>();
    for (const token of scopedTokens) {
      if (codes.has(token.blockchain) && !byCode.has(token.blockchain)) byCode.set(token.blockchain, token.chain);
    }
    return Array.from(byCode.values());
  }, [scopedTokens]);

  const sortedChains = useMemo(
    () => sortChainsForSidebar(availableChains, scopedTokens, {
      showBalances,
      walletConnected,
      getBalanceUsd: (token) => tokenBalanceUsd(token, getPayTokenBalance(ownerForToken(owners, token), token.assetId)?.formatted),
    }),
    [availableChains, scopedTokens, showBalances, walletConnected, owners, balanceEntries],
  );

  const fundedBlockchains = useMemo(() => {
    const funded = new Set<string>();
    if (!showBalances) return funded;
    for (const chain of availableChains) {
      if (chainHasBalance(chain.blockchain, scopedTokens, (token) => (
        getPayTokenBalance(ownerForToken(owners, token), token.assetId)?.formatted
      ))) {
        funded.add(chain.blockchain);
      }
    }
    return funded;
  }, [availableChains, owners, scopedTokens, showBalances, balanceEntries]);

  const popularTokens = useMemo(
    () => popularTokensForWallets(scopedTokens, popularRefs, (kind) => Boolean(connectedOwners[kind])),
    [scopedTokens, popularRefs, connectedOwners],
  );

  const newestAssetId = showBalances ? prefs.recentAssetIds[0] ?? null : null;
  const searchingAll = chainFilter === ALL_CHAIN_FILTER && search.trim().length > 0;
  const walletKind = chainFilter === ALL_CHAIN_FILTER
    ? null
    : availableChains.find((chain) => chain.blockchain === chainFilter)?.chainKind ?? null;

  const sections = useMemo((): TokenListSection[] => {
    if (showBalances && chainFilter === ALL_CHAIN_FILTER && searchingAll) {
      const matched = scopedTokens.filter((token) => tokenMatchesSearch(token, search));
      return [{
        id: "search",
        tokens: sortTokensByBalance(matched, usdOf, loadingOf),
        badgeAssetId: newestAssetId,
      }];
    }

    if (showBalances && chainFilter === ALL_CHAIN_FILTER) {
      const next: TokenListSection[] = [];
      const recent = recentTokensInOrder(scopedTokens, prefs.recentAssetIds);
      if (recent.length > 0) {
        next.push({
          id: "recent",
          title: "Recently Used",
          tokens: recent,
          badgeAssetId: newestAssetId,
        });
      }
      const yours = positiveBalanceTokens(scopedTokens, usdOf);
      if (yours.length > 0) {
        next.push({ id: "yours", title: "Your Tokens", tokens: yours });
      }
      if (popularTokens.length > 0) {
        next.push({ id: "popular", title: POPULAR_SECTION_TITLE, tokens: popularTokens });
      }
      return next;
    }

    const matched = scopedTokens.filter((token) => (
      matchesChainFilter(token, chainFilter) && tokenMatchesSearch(token, search)
    ));

    if (!showBalances && chainFilter === ALL_CHAIN_FILTER && !search.trim()) {
      const next: TokenListSection[] = [];
      if (popularTokens.length > 0) {
        next.push({ id: "popular", title: POPULAR_SECTION_TITLE, tokens: popularTokens });
      }
      next.push({ id: "all", tokens: sortTokensBySymbol(matched) });
      return next;
    }

    const chainName = availableChains.find((chain) => chain.blockchain === chainFilter)?.chainName ?? chainFilter;
    return [{
      id: chainFilter,
      title: chainName,
      walletKind,
      tokens: showBalances ? sortTokensByBalance(matched, usdOf, loadingOf) : sortTokensBySymbol(matched),
      badgeAssetId: showBalances ? newestAssetId : null,
    }];
  }, [
    showBalances,
    chainFilter,
    searchingAll,
    search,
    scopedTokens,
    prefs.recentAssetIds,
    newestAssetId,
    walletKind,
    balanceEntries,
    owners,
    popularTokens,
    availableChains,
  ]);

  function handleSelectFilter(filter: string) {
    setChainFilter(filter);
    if (filter !== ALL_CHAIN_FILTER) setLastBlockchain(filter);
    setView("token");
  }

  function handleSelectToken(token: PayToken) {
    if (isBlockchainDisabled(token.blockchain, disabledBlockchains)) return;
    if (isChainKindLocked(token.chain.chainKind, lockChainKind)) return;
    if (payer) setLastToken(token.assetId, token.blockchain);
    else setLastBlockchain(token.blockchain);
    onSelect({ token });
    onClose();
  }

  const awaitingBalances = showBalances
    && chainFilter === ALL_CHAIN_FILTER
    && !searchingAll
    && scopedTokens.some((token) => loadingOf(token));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      titleClassName={cx(
        "min-w-0 flex-1 truncate text-base font-medium text-[#606060] md:flex-none",
        fontSans,
        titleClassName,
      )}
      closeClassName={cx(view === "token" ? "ml-0" : undefined, closeClassName)}
      contentClassName={contentClassName}
      headerAction={view === "token" ? (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="search or paste address"
          className="ml-auto hidden w-[215px] shrink-0 md:block"
          inputClassName={cx(SEARCH_INPUT_CLASS, searchClassName)}
        />
      ) : null}
      cardClassName={cx("w-full max-h-[90vh] md:w-[474px]", className)}
    >
      <div className="flex h-[min(520px,62vh)] min-h-0 flex-col overflow-hidden md:h-[min(555px,70vh)]">
        {view === "token" ? (
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="search or paste address"
            className="mb-3 shrink-0 md:hidden"
            inputClassName={cx(SEARCH_INPUT_CLASS, searchClassName)}
          />
        ) : null}
        <div className="flex min-h-0 flex-1">
          <NetworkRail
            view={view}
            chainFilter={chainFilter}
            chips={sortedChains}
            fundedBlockchains={fundedBlockchains}
            walletConnected={walletConnected}
            showAllLabel={!payer}
            lockChainKind={lockChainKind}
            disabledBlockchains={disabledBlockchains}
            disabledReason={disabledReason}
            onSelectFilter={handleSelectFilter}
            onOpenNetworks={() => setView("network")}
            className={railClassName}
          />
          {view === "network" ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-3 md:pl-4">
              <ChainPane
                chains={sortedChains}
                fundedBlockchains={fundedBlockchains}
                showWalletStatus={payer}
                onSelectFilter={handleSelectFilter}
                lockChainKind={lockChainKind}
                disabledBlockchains={disabledBlockchains}
                disabledReason={disabledReason}
              />
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-3 md:pl-4">
              <TokenPane
                sections={sections}
                selectedAssetId={selectedAssetId}
                loading={loading || awaitingBalances}
                showBalances={showBalances}
                showWalletStatus={payer}
                getBalance={balanceOf}
                isBalanceLoading={loadingOf}
                onSelectToken={handleSelectToken}
                isTokenDisabled={(token) => (
                  isBlockchainDisabled(token.blockchain, disabledBlockchains)
                  || isChainKindLocked(token.chain.chainKind, lockChainKind)
                )}
                searchClassName={searchClassName}
                rowClassName={rowClassName}
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
