import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import { ChainPane } from "./chain-pane";
import { cx, fontSans } from "./format";
import { NetworkRail, type RailSelection } from "./network-rail";
import { PaneTransition } from "./pane-transition";
import { getTokenSelectPrefs, setLastBlockchain, setLastToken, useTokenSelectPrefs } from "./prefs";
import { SearchResults } from "./search-results";
import { TokenPane, type TokenListSection, type TokenPaneHeader } from "./token-pane";
import { ownerKey, type ChainKind, type ChainOwners, type PayChain, type PayToken, type TokenSelectRole } from "./types";
import {
  chainHasBalance,
  chainsFromTokens,
  groupSearchResults,
  initialChainFilter,
  isBlockchainDisabled,
  isChainKindLocked,
  payerRailChains,
  popularTokensForWallets,
  positiveBalanceTokens,
  recentTokensInOrder,
  sortChainsAlpha,
  sortChainsForSidebar,
  sortTokensForChain,
  compareTokensByPriority,
  tokenBalanceUsd,
} from "./utils";

export type TokenSelectSelection = {
  token: PayToken;
};

export type PaneView =
  | { kind: "wallet" }
  | { kind: "all" }
  | { kind: "rail-chain"; blockchain: string }
  | { kind: "networks" }
  | { kind: "network-chain"; blockchain: string };

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
  headerClassName?: string;
  closeClassName?: string;
  contentClassName?: string;
  searchClassName?: string;
  railClassName?: string;
  rowClassName?: string;
};

const SEARCH_INPUT_CLASS = "h-[36px] rounded-[18px] border-[#e3e3e3] bg-[#f6f6f6] text-sm placeholder:text-black/30";

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

function railSelection(view: PaneView): RailSelection {
  if (view.kind === "wallet") return { kind: "wallet" };
  if (view.kind === "all") return { kind: "all" };
  if (view.kind === "rail-chain") return { kind: "chain", blockchain: view.blockchain };
  return { kind: "networks" };
}

function chainByCode(chains: readonly PayChain[], blockchain: string): PayChain | undefined {
  return chains.find((chain) => chain.blockchain === blockchain);
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
    headerClassName,
    closeClassName,
    contentClassName,
    searchClassName,
    railClassName,
    rowClassName,
  } = props;
  const payer = role === "payer";
  const showBalances = payer;
  const {
    wallet,
    popularTokens: popularRefs,
    tokens,
    loading,
    stableSymbols,
    balanceMode,
    getBalance: syncGetBalance,
    isBalanceLoading: syncIsBalanceLoading,
  } = usePayWidgets();
  const prefs = useTokenSelectPrefs();
  const balanceEntries = useSyncExternalStore(subscribePayTokenBalances, getPayTokenBalances, getPayTokenBalances);
  const connectedOwners = useMemo(() => {
    const owners: ChainOwners = {};
    for (const [kind, account] of Object.entries(wallet.accounts)) {
      const address = account?.address?.trim();
      if (address) owners[kind] = address;
    }
    return owners;
  }, [wallet.accounts]);
  const owners = useMemo(
    () => (showBalances ? { ...connectedOwners, ...balanceOwners } : {}),
    [showBalances, connectedOwners, balanceOwners],
  );
  const walletConnected = hasAnyOwner(connectedOwners);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<PaneView>(payer ? { kind: "networks" } : { kind: "all" });
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const networksScrollRef = useRef<HTMLDivElement>(null);
  const savedNetworksScroll = useRef(0);
  const walletConnectedRef = useRef(walletConnected);
  const payerRef = useRef(payer);
  const lockRef = useRef(lockChainKind);
  const tokensRef = useRef(tokens);
  walletConnectedRef.current = walletConnected;
  payerRef.current = payer;
  lockRef.current = lockChainKind;
  tokensRef.current = tokens;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    const lock = lockRef.current;
    if (lock) {
      const filter = initialChainFilter(
        lock,
        getTokenSelectPrefs().recentBlockchains,
        chainsFromTokens(tokensRef.current),
      );
      if (filter !== ALL_CHAIN_FILTER) {
        setView({ kind: "rail-chain", blockchain: filter });
        return;
      }
      return;
    }
    if (!payerRef.current) {
      setView({ kind: "all" });
      return;
    }
    setView(walletConnectedRef.current ? { kind: "wallet" } : { kind: "networks" });
  }, [open]);

  useEffect(() => {
    if (!open || !lockChainKind) return;
    const filter = initialChainFilter(lockChainKind, getTokenSelectPrefs().recentBlockchains, chainsFromTokens(tokens));
    if (filter === ALL_CHAIN_FILTER) return;
    setView((current) => (current.kind === "rail-chain" ? current : { kind: "rail-chain", blockchain: filter }));
  }, [open, lockChainKind, tokens]);

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

  const ownersKey = ownerKey(owners);
  const tokenKey = useMemo(() => scopedTokens.map((token) => token.assetId).join("|"), [scopedTokens]);
  const ownersRef = useRef(owners);
  const scopedRef = useRef(scopedTokens);
  ownersRef.current = owners;
  scopedRef.current = scopedTokens;

  useEffect(() => {
    if (balanceMode !== "async" || !showBalances || !open || !hasAnyOwner(ownersRef.current) || !tokenKey) return;
    void ensurePayTokenBalances(ownersRef.current, scopedRef.current);
    const id = window.setInterval(() => {
      void ensurePayTokenBalances(ownersRef.current, scopedRef.current, { force: true });
    }, TOKEN_BALANCE_POLL_MS);
    return () => window.clearInterval(id);
  }, [balanceMode, showBalances, open, ownersKey, tokenKey]);

  function balanceOf(token: PayToken) {
    const owner = ownerForToken(owners, token);
    if (!showBalances || !owner) return undefined;
    if (balanceMode === "sync" && syncGetBalance) return syncGetBalance(token, owner) ?? undefined;
    return getPayTokenBalance(owner, token.assetId)?.formatted;
  }

  function usdOf(token: PayToken) {
    if (!showBalances) return -1;
    return tokenBalanceUsd(token, balanceOf(token));
  }

  function loadingOf(token: PayToken) {
    if (!showBalances) return false;
    const owner = ownerForToken(owners, token);
    if (!owner) return false;
    const formatted = balanceOf(token);
    if (formatted != null && formatted !== "") return false;
    if (balanceMode === "sync") return syncIsBalanceLoading?.(token, owner) ?? false;
    const entry = getPayTokenBalance(owner, token.assetId);
    return !entry || entry.status === "loading";
  }

  const availableChains = useMemo(() => chainsFromTokens(scopedTokens), [scopedTokens]);

  const fundedBlockchains = useMemo(() => {
    const funded = new Set<string>();
    if (!showBalances) return funded;
    for (const chain of availableChains) {
      if (chainHasBalance(chain.blockchain, scopedTokens, (token) => balanceOf(token))) {
        funded.add(chain.blockchain);
      }
    }
    return funded;
  }, [availableChains, owners, scopedTokens, showBalances, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  const railChains = useMemo(() => {
    if (!payer) return sortChainsAlpha(availableChains);
    const connected = payerRailChains(availableChains, owners, fundedBlockchains);
    return sortChainsForSidebar(connected, scopedTokens, {
      showBalances,
      getBalanceUsd: (token) => tokenBalanceUsd(token, balanceOf(token)),
    });
  }, [payer, availableChains, owners, fundedBlockchains, scopedTokens, showBalances, balanceEntries, balanceMode, syncGetBalance]);

  const networkChains = useMemo(() => sortChainsAlpha(availableChains), [availableChains]);

  useEffect(() => {
    if (!open || !payer || lockChainKind) return;
    setView((current) => {
      if (current.kind === "wallet" && !walletConnected) return { kind: "networks" };
      if (current.kind === "rail-chain" && !railChains.some((chain) => chain.blockchain === current.blockchain)) {
        return walletConnected ? { kind: "wallet" } : { kind: "networks" };
      }
      return current;
    });
  }, [open, payer, lockChainKind, walletConnected, railChains]);

  const popularTokens = useMemo(
    () => popularTokensForWallets(scopedTokens, popularRefs, (kind) => Boolean(connectedOwners[kind])),
    [scopedTokens, popularRefs, connectedOwners],
  );

  const newestAssetId = showBalances ? prefs.recentAssetIds[0] ?? null : null;
  const searching = search.trim().length > 0;

  const sections = useMemo((): TokenListSection[] => {
    if (view.kind === "wallet") {
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

    if (view.kind === "all") {
      const next: TokenListSection[] = [];
      if (popularTokens.length > 0) {
        next.push({ id: "popular", title: POPULAR_SECTION_TITLE, tokens: popularTokens });
      }
      const sorted = scopedTokens.slice().sort((left, right) => compareTokensByPriority(left, right, stableSymbols));
      next.push({ id: "all", tokens: sorted });
      return next;
    }

    if (view.kind === "rail-chain" || view.kind === "network-chain") {
      const matched = scopedTokens.filter((token) => token.blockchain === view.blockchain);
      if (!payer) {
        const next: TokenListSection[] = [];
        const popular = popularTokens.filter((token) => token.blockchain === view.blockchain);
        if (popular.length > 0) {
          next.push({ id: "popular", title: POPULAR_SECTION_TITLE, tokens: popular });
        }
        next.push({
          id: view.blockchain,
          tokens: matched.slice().sort((left, right) => compareTokensByPriority(left, right, stableSymbols)),
        });
        return next;
      }
      const chain = chainByCode(availableChains, view.blockchain);
      return [{
        id: view.blockchain,
        tokens: sortTokensForChain(matched, {
          withBalances: Boolean(chain && owners[chain.chainKind]),
          usdOf,
          loadingOf,
          stableSymbols,
        }),
        badgeAssetId: newestAssetId,
      }];
    }

    return [];
  }, [
    view,
    payer,
    scopedTokens,
    prefs.recentAssetIds,
    newestAssetId,
    balanceEntries,
    owners,
    popularTokens,
    availableChains,
    stableSymbols,
    balanceMode,
    syncGetBalance,
    syncIsBalanceLoading,
  ]);

  const searchGroups = useMemo(() => {
    if (!searching) return [];
    return groupSearchResults(scopedTokens, search, {
      role: payer ? "payer" : "receiver",
      usdOf,
      loadingOf,
      hasOwner: (kind) => Boolean(owners[kind]),
      stableSymbols,
    });
  }, [searching, scopedTokens, search, payer, owners, stableSymbols, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  function handleSelectChain(blockchain: string, fromNetworks: boolean) {
    setLastBlockchain(blockchain);
    if (fromNetworks) {
      savedNetworksScroll.current = networksScrollRef.current?.scrollTop ?? 0;
      setSlideDirection(1);
      setView({ kind: "network-chain", blockchain });
      return;
    }
    setView({ kind: "rail-chain", blockchain });
  }

  function handleBackToNetworks() {
    setSlideDirection(-1);
    setView({ kind: "networks" });
  }

  useLayoutEffect(() => {
    if (view.kind !== "networks" || slideDirection !== -1) return;
    const node = networksScrollRef.current;
    if (!node) return;
    node.scrollTop = savedNetworksScroll.current;
  }, [view, slideDirection]);

  function handleSelectToken(token: PayToken) {
    if (isBlockchainDisabled(token.blockchain, disabledBlockchains)) return;
    if (isChainKindLocked(token.chain.chainKind, lockChainKind)) return;
    if (payer) setLastToken(token.assetId, token.blockchain);
    else setLastBlockchain(token.blockchain);
    onSelect({ token });
    onClose();
  }

  const activeChain = view.kind === "rail-chain" || view.kind === "network-chain"
    ? chainByCode(availableChains, view.blockchain)
    : undefined;
  const chainHeader: TokenPaneHeader | null = view.kind === "network-chain"
    ? { kind: "back", title: activeChain?.chainName ?? view.blockchain, onBack: handleBackToNetworks, walletKind: activeChain?.chainKind }
    : view.kind === "rail-chain"
      ? { kind: "chain", title: activeChain?.chainName ?? view.blockchain, walletKind: activeChain?.chainKind }
      : null;

  const awaitingBalances = showBalances
    && sections.every((section) => section.tokens.length === 0)
    && scopedTokens.some((token) => loadingOf(token));
  const tokenDisabled = (token: PayToken) => (
    isBlockchainDisabled(token.blockchain, disabledBlockchains)
    || isChainKindLocked(token.chain.chainKind, lockChainKind)
  );
  const sliding = view.kind === "networks" || view.kind === "network-chain";

  const tokenPane = (
    <TokenPane
      sections={sections}
      header={chainHeader}
      selectedAssetId={selectedAssetId}
      loading={loading || awaitingBalances}
      showBalances={showBalances}
      showWalletStatus={payer}
      getBalance={balanceOf}
      isBalanceLoading={loadingOf}
      onSelectToken={handleSelectToken}
      isTokenDisabled={tokenDisabled}
      rowClassName={rowClassName}
    />
  );

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
      headerClassName={cx("h-14 border-b border-[#e3e3e3] px-[22px] pr-4", headerClassName)}
      closeClassName={cx("md:ml-0", closeClassName)}
      contentClassName={cx("overflow-hidden", contentClassName)}
      headerAction={(
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="search or paste address"
          className="ml-auto hidden w-[215px] shrink-0 md:block"
          inputClassName={cx(SEARCH_INPUT_CLASS, searchClassName)}
        />
      )}
      cardClassName={cx(
        "w-full max-h-[90vh] gap-0 rounded-[12px] border border-[#e0e0e0] bg-[#fdfdfd] p-0 shadow-[0_0_40px_0_rgba(0,0,0,0.06)] md:w-[474px] md:rounded-[12px] md:p-0",
        className,
      )}
    >
      <div className="flex h-[min(520px,62vh)] min-h-0 flex-col overflow-hidden md:h-[min(555px,70vh)]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="search or paste address"
          className="mb-3 shrink-0 px-[22px] md:hidden"
          inputClassName={cx(SEARCH_INPUT_CLASS, searchClassName)}
        />
        <div className="flex min-h-0 flex-1">
          <NetworkRail
            role={payer ? "payer" : "receiver"}
            walletConnected={walletConnected}
            selection={railSelection(view)}
            chains={railChains}
            fundedBlockchains={fundedBlockchains}
            lockChainKind={lockChainKind}
            disabledBlockchains={disabledBlockchains}
            disabledReason={disabledReason}
            onSelectWallet={() => setView({ kind: "wallet" })}
            onSelectAll={() => setView({ kind: "all" })}
            onSelectNetworks={() => setView({ kind: "networks" })}
            onSelectChain={(blockchain) => handleSelectChain(blockchain, false)}
            className={railClassName}
          />
          {searching ? (
            <SearchResults
              groups={searchGroups}
              selectedAssetId={selectedAssetId}
              loading={loading}
              showBalances={showBalances}
              showWalletStatus={payer}
              getBalance={balanceOf}
              isBalanceLoading={loadingOf}
              onSelectToken={handleSelectToken}
              isTokenDisabled={tokenDisabled}
              rowClassName={rowClassName}
            />
          ) : sliding ? (
            <PaneTransition
              paneKey={view.kind === "network-chain" ? `network-chain:${view.blockchain}` : "networks"}
              direction={slideDirection}
            >
              {view.kind === "networks" ? (
                <ChainPane
                  chains={networkChains}
                  showWalletStatus={payer}
                  onSelectChain={(blockchain) => handleSelectChain(blockchain, true)}
                  lockChainKind={lockChainKind}
                  disabledBlockchains={disabledBlockchains}
                  disabledReason={disabledReason}
                  scrollRef={networksScrollRef}
                />
              ) : tokenPane}
            </PaneTransition>
          ) : (
            <div className="relative min-h-0 flex-1">{tokenPane}</div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
