import { IconChevron } from "@stableflow/pay-ui/icons/chevron";
import { Skeleton } from "@stableflow/pay-ui/skeleton";
import { ChainWalletStatus } from "./chain-wallet-status";
import { cx, fontSans, formatDisplayAmount, thinScrollbar } from "./format";
import { LazyImage } from "./lazy-image";
import { DEFAULT_TOKEN_LOGO } from "./logos";
import type { ChainKind, PayToken } from "./types";
import { tokenBalanceUsd } from "./utils";

export type TokenListSection = {
  id: string;
  title?: string | null;
  walletKind?: ChainKind | null;
  tokens: PayToken[];
  badgeAssetId?: string | null;
};

export type TokenPaneHeader =
  | { kind: "back"; title: string; onBack: () => void; walletKind?: ChainKind | null }
  | { kind: "chain"; title: string; walletKind?: ChainKind | null };

export type TokenPaneProps = {
  sections: TokenListSection[];
  selectedAssetId?: string | null;
  loading: boolean;
  showBalances?: boolean;
  showWalletStatus?: boolean;
  header?: TokenPaneHeader | null;
  getBalance: (token: PayToken) => string | null | undefined;
  isBalanceLoading: (token: PayToken) => boolean;
  onSelectToken: (token: PayToken) => void;
  isTokenDisabled?: (token: PayToken) => boolean;
  rowClassName?: string;
};

export function TokenPane(props: TokenPaneProps) {
  const {
    sections,
    selectedAssetId,
    loading,
    showBalances = false,
    showWalletStatus = true,
    header = null,
    getBalance,
    isBalanceLoading,
    onSelectToken,
    isTokenDisabled,
    rowClassName,
  } = props;
  const visibleSections = sections.filter((section) => section.title || section.tokens.length > 0);
  const hasTokens = sections.some((section) => section.tokens.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className={cx("min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
        <div className="px-2.5 pt-[17px] pb-3">
          {header ? (
            <ChainListHeader header={header} showWalletStatus={showWalletStatus} />
          ) : null}
          {visibleSections.map((section) => (
            <section key={section.id} className="mb-2">
              {section.title ? (
                <div className="mb-1 flex items-center justify-between gap-2 px-3.5">
                  <p className={cx("min-w-0 truncate text-sm font-medium text-[#aaa]", fontSans)}>{section.title}</p>
                  {showWalletStatus && section.walletKind ? <ChainWalletStatus kind={section.walletKind} /> : null}
                </div>
              ) : null}
              {section.tokens.map((token) => (
                <TokenRow
                  key={`${section.id}-${token.assetId}`}
                  token={token}
                  selected={token.assetId === selectedAssetId}
                  recent={token.assetId === section.badgeAssetId}
                  showBalances={showBalances}
                  formatted={showBalances ? getBalance(token) : null}
                  loadingBalance={showBalances && isBalanceLoading(token)}
                  disabled={Boolean(isTokenDisabled?.(token))}
                  onSelect={() => onSelectToken(token)}
                  className={rowClassName}
                />
              ))}
            </section>
          ))}
          {loading && !hasTokens ? <TokenListSkeleton /> : null}
          {!loading && !hasTokens ? (
            <p className={cx("px-3.5 py-4 text-[13px] text-[#606060]", fontSans)}>No tokens found</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChainListHeader(props: { header: TokenPaneHeader; showWalletStatus: boolean }) {
  const { header, showWalletStatus } = props;
  const walletKind = header.walletKind;
  return (
    <div className="mb-1 flex items-center justify-between gap-3 px-3.5">
      {header.kind === "back" ? (
        <button
          type="button"
          onClick={header.onBack}
          className={cx("flex min-w-0 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-sm font-medium text-[#aaa]", fontSans)}
        >
          <IconChevron className="rotate-180 text-[#aaa]" />
          <span className="truncate">{header.title}</span>
        </button>
      ) : (
        <p className={cx("min-w-0 truncate text-sm font-medium text-[#aaa]", fontSans)}>{header.title}</p>
      )}
      {showWalletStatus && walletKind ? <ChainWalletStatus kind={walletKind} /> : null}
    </div>
  );
}

function TokenListSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex h-[66px] items-center gap-2.5 px-3.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function TokenRow(props: {
  token: PayToken;
  selected: boolean;
  recent: boolean;
  showBalances: boolean;
  formatted: string | null | undefined;
  loadingBalance: boolean;
  disabled: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const { token, selected, recent, showBalances, formatted, loadingBalance, disabled, onSelect, className } = props;
  const usd = showBalances && !loadingBalance && formatted != null ? tokenBalanceUsd(token, formatted) : -1;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cx(
        "flex h-[66px] w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] border-0 bg-transparent px-3.5 text-left hover:bg-[#f6f6f6]",
        selected && "bg-[#f6f6f6]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="relative size-8 shrink-0">
          <LazyImage
            src={token.logo}
            fallbackSrc={DEFAULT_TOKEN_LOGO}
            className="size-8 rounded-[12px] object-cover"
          />
          <img
            src={token.chain.logo}
            alt=""
            className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-[4px] border border-white object-cover"
          />
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cx("truncate text-sm font-semibold text-black", fontSans)}>{token.symbol}</span>
            {recent ? (
              <span className={cx("shrink-0 rounded-[9px] bg-[#06f]/10 px-1.5 text-[10px] font-medium leading-[18px] text-[#06f]", fontSans)}>
                Recently Used
              </span>
            ) : null}
          </span>
          <span className={cx("mt-0.5 block truncate text-xs text-[#606060]", fontSans)}>{token.chain.chainName}</span>
        </span>
      </span>
      {showBalances ? (
        <span className="shrink-0 text-right">
          {loadingBalance ? (
            <span
              className="inline-block size-3.5 animate-spin rounded-full border-2 border-[#606060] border-r-transparent"
              aria-label="Loading balance"
            />
          ) : formatted != null ? (
            <>
              <span className={cx("block text-sm font-medium text-black", fontSans)}>
                {formatDisplayAmount(formatted, { prefix: "", maxDecimals: 4 })}
              </span>
              {usd >= 0 ? (
                <span className={cx("block text-xs text-[#606060]", fontSans)}>
                  {formatDisplayAmount(usd, { prefix: "$", showDust: true })}
                </span>
              ) : null}
            </>
          ) : (
            <span className={cx("text-sm font-medium text-black", fontSans)}>-</span>
          )}
        </span>
      ) : null}
    </button>
  );
}
