import type { ReactNode } from "react";
import { IconDatabase } from "@stableflow/pay-ui/icons/solid/database";
import { IconDuration } from "@stableflow/pay-ui/icons/solid/duration";
import { IconTrends } from "@stableflow/pay-ui/icons/outline/trends";
import { Skeleton } from "@stableflow/pay-ui/skeleton";
import { cx, fontSans, formatDisplayAmount, thinScrollbar } from "./format";
import { LazyImage } from "./lazy-image";
import { DEFAULT_TOKEN_LOGO } from "./logos";
import type { PayToken } from "./types";
import { tokenBalanceUsd } from "./utils";

export type TokenSectionIcon = "database" | "duration" | "trends";

export type TokenListSection = {
  id: string;
  title: string;
  icon: TokenSectionIcon;
  tokens: PayToken[];
  skeletonRows?: number;
  trailing?: ReactNode;
  emptyLabel?: string | null;
  action?: { label: string; onClick: () => void };
};

export type TokenPaneProps = {
  sections: TokenListSection[];
  selectedAssetId?: string | null;
  showBalances?: boolean;
  getBalance: (token: PayToken) => string | null | undefined;
  isBalanceLoading: (token: PayToken) => boolean;
  onSelectToken: (token: PayToken) => void;
  isTokenDisabled?: (token: PayToken) => boolean;
  rowClassName?: string;
  emptyLabel?: string | null;
};

export function TokenPane(props: TokenPaneProps) {
  const {
    sections,
    selectedAssetId,
    showBalances = false,
    getBalance,
    isBalanceLoading,
    onSelectToken,
    isTokenDisabled,
    rowClassName,
    emptyLabel = null,
  } = props;

  return (
    <div className={cx("min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
      <div className="px-3 pt-3 pb-3">
        {sections.map((section) => (
          <section key={section.id} className="mb-2">
            {section.title ? (
            <div className="mb-1 flex items-center justify-between gap-2 px-[13px]">
              <span className="flex min-w-0 items-center gap-2 text-[#aaa]">
                <SectionIcon icon={section.icon} />
                <span className={cx("truncate text-sm font-medium text-[#aaa]", fontSans)}>{section.title}</span>
              </span>
              {section.trailing || section.action ? (
                <span className="flex shrink-0 items-center gap-2">
                  {section.trailing}
                  {section.action ? (
                    <button
                      type="button"
                      onClick={section.action.onClick}
                      className={cx("cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-[#aaa]", fontSans)}
                    >
                      {section.action.label}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </div>
            ) : null}
            {!section.skeletonRows && section.tokens.length === 0 && section.emptyLabel ? (
              <p className={cx("px-[13px] py-4 text-[13px] text-[#606060]", fontSans)}>{section.emptyLabel}</p>
            ) : null}
            {section.skeletonRows ? <TokenListSkeleton rows={section.skeletonRows} /> : null}
            {section.tokens.map((token) => (
              <TokenRow
                key={`${section.id}-${token.assetId}`}
                token={token}
                selected={token.assetId === selectedAssetId}
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
        {emptyLabel ? (
          <p className={cx("px-[13px] py-4 text-[13px] text-[#606060]", fontSans)}>{emptyLabel}</p>
        ) : null}
      </div>
    </div>
  );
}

function SectionIcon(props: { icon: TokenSectionIcon }) {
  const className = "size-3.5 text-[#aaa]";
  if (props.icon === "database") return <IconDatabase className={className} />;
  if (props.icon === "duration") return <IconDuration className={className} />;
  return <IconTrends className={className} />;
}

export function TokenListSkeleton(props: { rows: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: props.rows }, (_, index) => (
        <div key={index} className="flex h-[66px] items-center gap-2.5 px-[13px]">
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
  showBalances: boolean;
  formatted: string | null | undefined;
  loadingBalance: boolean;
  disabled: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const { token, selected, showBalances, formatted, loadingBalance, disabled, onSelect, className } = props;
  const usd = showBalances && !loadingBalance && formatted != null ? tokenBalanceUsd(token, formatted) : -1;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cx(
        "flex h-[66px] w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] border-0 bg-transparent px-[13px] text-left hover:bg-[#f6f6f6]",
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
          <span className={cx("block truncate text-sm font-semibold text-black", fontSans)}>{token.symbol}</span>
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
                {formatDisplayAmount(formatted, { prefix: "", maxDecimals: 4, showDust: true })}
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
