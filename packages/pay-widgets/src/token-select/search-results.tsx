import { cx, fontSans, thinScrollbar } from "./format";
import { TokenListSkeleton, TokenRow } from "./token-pane";
import type { PayToken } from "./types";

export type SearchResultsProps = {
  tokens: PayToken[];
  selectedAssetId?: string | null;
  loading: boolean;
  showBalances?: boolean;
  getBalance: (token: PayToken) => string | null | undefined;
  isBalanceLoading: (token: PayToken) => boolean;
  onSelectToken: (token: PayToken) => void;
  isTokenDisabled?: (token: PayToken) => boolean;
  rowClassName?: string;
};

export function SearchResults(props: SearchResultsProps) {
  const {
    tokens,
    selectedAssetId,
    loading,
    showBalances = false,
    getBalance,
    isBalanceLoading,
    onSelectToken,
    isTokenDisabled,
    rowClassName,
  } = props;

  return (
    <div className={cx("min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
      <div className="px-3 pt-3 pb-3">
        {loading && tokens.length === 0 ? <TokenListSkeleton rows={6} /> : null}
        {tokens.map((token) => (
          <TokenRow
            key={token.assetId}
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
        {!loading && tokens.length === 0 ? (
          <p className={cx("px-[13px] py-4 text-[13px] text-[#606060]", fontSans)}>No tokens found</p>
        ) : null}
      </div>
    </div>
  );
}
