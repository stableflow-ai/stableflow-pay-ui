import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Dialog } from "@stableflow/pay-ui/dialog";
import { SearchInput } from "@stableflow/pay-ui/search-input";
import { Switch } from "@stableflow/pay-ui/switch";
import {
  ensurePayTokenBalances,
  getPayTokenBalance,
  getPayTokenBalances,
  subscribePayTokenBalances,
} from "./balances";
import {
  ALL_CHAIN_FILTER,
  MAX_RECENT_SEARCHES,
  MAX_RECENTLY_USED,
  RECENT_SEARCHES_TITLE,
  TOKEN_BALANCE_POLL_MS,
  TRENDS_TOKEN_TITLE,
  YOUR_TOKENS_DUST_EMPTY,
  YOUR_TOKENS_TITLE,
} from "./config";
import { ChainSelect } from "./chain-select";
import { usePayWidgets } from "./context";
import { cx, fontSans } from "./format";
import { getTokenSelectPrefs, removeRecentSearches, setLastBlockchain, setLastToken, setRecentSearch, setShowDust, useTokenSelectPrefs } from "./prefs";
import { RecentTileSkeletons, RecentTiles } from "./recent-tiles";
import { SearchResults } from "./search-results";
import { TokenListSkeleton, TokenPane, type TokenListSection } from "./token-pane";
import { ownerKey, type ChainKind, type ChainOwners, type PayToken, type TokenSelectRole } from "./types";
import {
  allChainPreview,
  chainHasBalance,
  chainMenuOrder,
  chainsFromTokens,
  compareTokensByPriority,
  initialChainFilter,
  isBlockchainDisabled,
  isChainKindLocked,
  matchesChainFilter,
  payerRailChains,
  positiveBalanceTokens,
  recentTokensInOrder,
  searchTokens,
  sortTokensForChain,
  tokenBalanceUsd,
  trendTokensIn,
  withoutDustTokens,
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
  headerClassName?: string;
  closeClassName?: string;
  contentClassName?: string;
  searchClassName?: string;
  rowClassName?: string;
};

const TOKEN_SEARCH_CLASS = "h-[50px] rounded-[12px] border-[#e3e3e3] bg-[#f6f6f6] pl-[43px] text-sm placeholder:text-black/30";
const TOKEN_SEARCH_ICON_CLASS = "left-4 size-[19px] text-black";

function ownerForToken(owners: ChainOwners, token: PayToken): string | null {
  return owners[token.chain.chainKind] ?? null;
}

function hasAnyOwner(owners: ChainOwners): boolean {
  return Object.values(owners).some((address) => Boolean(address));
}

function ShowDustSwitch(props: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-[5px]">
      <span className={cx("text-sm font-medium leading-[normal] text-[#aaa]", fontSans)}>Show dust</span>
      <Switch checked={props.checked} onCheckedChange={props.onCheckedChange} aria-label="Show dust" />
    </label>
  );
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
    headerClassName,
    closeClassName,
    contentClassName,
    searchClassName,
    rowClassName,
  } = props;
  const payer = role === "payer";
  const showBalances = payer;
  const {
    wallet,
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
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState(ALL_CHAIN_FILTER);
  const userPickedChain = useRef(false);
  const lockRef = useRef(lockChainKind);
  const tokensRef = useRef(tokens);
  lockRef.current = lockChainKind;
  tokensRef.current = tokens;

  useEffect(() => {
    if (!open) return;
    userPickedChain.current = false;
    setSearch("");
    setChainFilter(initialChainFilter(
      lockRef.current,
      getTokenSelectPrefs().recentBlockchains,
      chainsFromTokens(tokensRef.current),
    ));
  }, [open]);

  useEffect(() => {
    if (!open || !lockChainKind || userPickedChain.current) return;
    setChainFilter(initialChainFilter(lockChainKind, getTokenSelectPrefs().recentBlockchains, chainsFromTokens(tokens)));
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
  const rangeTokens = useMemo(
    () => scopedTokens.filter((token) => matchesChainFilter(token, chainFilter)),
    [scopedTokens, chainFilter],
  );

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

  const dottedChains = useMemo(() => {
    if (!payer) return [];
    return payerRailChains(availableChains, owners, fundedBlockchains);
  }, [payer, availableChains, owners, fundedBlockchains]);

  const dottedSet = useMemo(() => new Set(dottedChains.map((chain) => chain.blockchain)), [dottedChains]);

  const menuChains = useMemo(() => chainMenuOrder(availableChains, scopedTokens, {
    dotted: dottedSet,
    showBalances,
    getBalanceUsd: (token) => tokenBalanceUsd(token as PayToken, balanceOf(token as PayToken)),
  }), [availableChains, scopedTokens, dottedSet, showBalances, balanceEntries, owners, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  const previewChains = useMemo(() => allChainPreview(availableChains), [availableChains]);
  const searching = search.trim().length > 0;
  const rangeWalletConnected = rangeTokens.some((token) => Boolean(owners[token.chain.chainKind]));

  const recentTokens = useMemo(
    () => recentTokensInOrder(rangeTokens, prefs.recentAssetIds).slice(0, MAX_RECENTLY_USED),
    [rangeTokens, prefs.recentAssetIds],
  );
  const recentSearches = useMemo(
    () => recentTokensInOrder(rangeTokens, prefs.recentSearchAssetIds).slice(0, MAX_RECENT_SEARCHES),
    [rangeTokens, prefs.recentSearchAssetIds],
  );

  const yours = useMemo(() => {
    if (!payer || !rangeWalletConnected) return [];
    return positiveBalanceTokens(rangeTokens, usdOf);
  }, [payer, rangeWalletConnected, rangeTokens, owners, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  const visibleYours = useMemo(
    () => withoutDustTokens(yours, usdOf, prefs.showDust),
    [yours, prefs.showDust, owners, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading],
  );

  const trends = useMemo(() => trendTokensIn(rangeTokens, {
    chainFilter,
    sortRest: (rest) => {
      if (chainFilter === ALL_CHAIN_FILTER) {
        return rest.slice().sort((left, right) => compareTokensByPriority(left, right, stableSymbols));
      }
      const chain = availableChains.find((item) => item.blockchain === chainFilter);
      return sortTokensForChain(rest, {
        withBalances: Boolean(chain && owners[chain.chainKind]),
        usdOf,
        loadingOf,
        stableSymbols,
      });
    },
  }), [rangeTokens, chainFilter, availableChains, owners, stableSymbols, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  const receiverTokens = useMemo(
    () => rangeTokens.slice().sort((left, right) => compareTokensByPriority(left, right, stableSymbols)),
    [rangeTokens, stableSymbols],
  );

  const results = useMemo(() => {
    if (!searching) return [];
    return searchTokens(rangeTokens, search, {
      role: payer ? "payer" : "receiver",
      usdOf,
      loadingOf,
    });
  }, [searching, rangeTokens, search, payer, owners, balanceEntries, balanceMode, syncGetBalance, syncIsBalanceLoading]);

  function handleSelectToken(token: PayToken, fromSearch: boolean) {
    if (isBlockchainDisabled(token.blockchain, disabledBlockchains)) return;
    if (isChainKindLocked(token.chain.chainKind, lockChainKind)) return;
    if (payer) setLastToken(token.assetId, token.blockchain);
    else setLastBlockchain(token.blockchain);
    if (fromSearch && search.trim()) setRecentSearch(token.assetId);
    onSelect({ token });
    onClose();
  }

  function clearVisibleSearches() {
    if (chainFilter === ALL_CHAIN_FILTER) {
      removeRecentSearches(prefs.recentSearchAssetIds);
      return;
    }
    const byId = new Map(scopedTokens.map((token) => [token.assetId, token]));
    removeRecentSearches(prefs.recentSearchAssetIds.filter((assetId) => byId.get(assetId)?.blockchain === chainFilter));
  }

  const tokenDisabled = (token: PayToken) => (
    isBlockchainDisabled(token.blockchain, disabledBlockchains)
    || isChainKindLocked(token.chain.chainKind, lockChainKind)
  );

  const sections = useMemo((): TokenListSection[] => {
    const showDustSwitch = payer ? (
      <ShowDustSwitch checked={prefs.showDust} onCheckedChange={setShowDust} />
    ) : null;
    if (loading) {
      const next: TokenListSection[] = [];
      if (payer && rangeWalletConnected) {
        next.push({
          id: "yours",
          title: YOUR_TOKENS_TITLE,
          icon: "database",
          tokens: [],
          skeletonRows: 2,
          trailing: showDustSwitch,
        });
      }
      if (payer && recentSearches.length > 0) {
        next.push({
          id: "searches",
          title: RECENT_SEARCHES_TITLE,
          icon: "duration",
          tokens: [],
          skeletonRows: 2,
          action: { label: "Clear", onClick: clearVisibleSearches },
        });
      }
      if (payer) {
        next.push({ id: "trends", title: TRENDS_TOKEN_TITLE, icon: "trends", tokens: [], skeletonRows: 6 });
      }
      return next;
    }
    if (!payer) return [];
    const next: TokenListSection[] = [];
    if (yours.length > 0) {
      next.push({
        id: "yours",
        title: YOUR_TOKENS_TITLE,
        icon: "database",
        tokens: visibleYours,
        trailing: showDustSwitch,
        emptyLabel: visibleYours.length === 0 ? YOUR_TOKENS_DUST_EMPTY : null,
      });
    }
    if (recentSearches.length > 0) {
      next.push({
        id: "searches",
        title: RECENT_SEARCHES_TITLE,
        icon: "duration",
        tokens: recentSearches,
        action: { label: "Clear", onClick: clearVisibleSearches },
      });
    }
    if (trends.length > 0) {
      next.push({ id: "trends", title: TRENDS_TOKEN_TITLE, icon: "trends", tokens: trends });
    }
    return next;
  }, [loading, payer, rangeWalletConnected, recentSearches, yours, visibleYours, trends, chainFilter, prefs.recentSearchAssetIds, prefs.showDust, scopedTokens]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      titleClassName={cx("text-[18px] font-semibold text-black", fontSans, titleClassName)}
      headerClassName={cx("border-0 px-6 pt-[25px] pb-0", headerClassName)}
      closeClassName={closeClassName}
      contentClassName={cx("overflow-hidden", contentClassName)}
      cardClassName={cx(
        "w-full max-h-[90vh] gap-3 rounded-[12px] border border-[#e0e0e0] bg-[#fdfdfd] p-0 shadow-[0_0_40px_0_rgba(0,0,0,0.06)] md:w-[448px] md:rounded-[12px] md:p-0",
        className,
      )}
    >
      <div className="flex h-[min(620px,70vh)] min-h-0 flex-col gap-2.5">
        <div className="flex shrink-0 items-center gap-3.5 px-5">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="search or paste address"
            className="min-w-0 flex-1"
            iconClassName={TOKEN_SEARCH_ICON_CLASS}
            inputClassName={cx(TOKEN_SEARCH_CLASS, searchClassName)}
          />
          <ChainSelect
            chains={menuChains}
            previewChains={previewChains}
            dotted={dottedSet}
            value={chainFilter}
            onChange={(blockchain) => {
              userPickedChain.current = true;
              setChainFilter(blockchain);
            }}
            lockChainKind={lockChainKind}
            disabledBlockchains={disabledBlockchains}
            disabledReason={disabledReason}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5">
          {payer && loading && recentTokens.length > 0 ? <RecentTileSkeletons /> : null}
          {payer && !loading ? (
            <RecentTiles tokens={recentTokens} onSelect={(token) => handleSelectToken(token, false)} isTokenDisabled={tokenDisabled} />
          ) : null}
          {searching ? (
            <SearchResults
              tokens={results}
              selectedAssetId={selectedAssetId}
              loading={loading}
              showBalances={showBalances}
              getBalance={balanceOf}
              isBalanceLoading={loadingOf}
              onSelectToken={(token) => handleSelectToken(token, true)}
              isTokenDisabled={tokenDisabled}
              rowClassName={rowClassName}
            />
          ) : payer ? (
            <TokenPane
              sections={sections}
              selectedAssetId={selectedAssetId}
              showBalances={showBalances}
              getBalance={balanceOf}
              isBalanceLoading={loadingOf}
              onSelectToken={(token) => handleSelectToken(token, false)}
              isTokenDisabled={tokenDisabled}
              rowClassName={rowClassName}
              emptyLabel={
                recentTokens.length === 0 && sections.every((section) => (
                  section.tokens.length === 0 && !section.skeletonRows && !section.emptyLabel
                ))
                  ? "No tokens found"
                  : null
              }
            />
          ) : loading ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-3">
              <TokenListSkeleton rows={6} />
            </div>
          ) : (
            <TokenPane
              sections={[{
                id: "all",
                title: "",
                icon: "trends",
                tokens: receiverTokens,
              }]}
              selectedAssetId={selectedAssetId}
              showBalances={false}
              getBalance={balanceOf}
              isBalanceLoading={loadingOf}
              onSelectToken={(token) => handleSelectToken(token, false)}
              isTokenDisabled={tokenDisabled}
              rowClassName={rowClassName}
              emptyLabel={receiverTokens.length === 0 ? "No tokens found" : null}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
