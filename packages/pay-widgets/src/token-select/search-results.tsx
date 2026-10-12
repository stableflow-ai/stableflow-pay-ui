import { ChainWalletStatus } from "./chain-wallet-status";
import { cx, fontSans, thinScrollbar } from "./format";
import { TokenRow } from "./token-pane";
import type { PayToken } from "./types";
import type { SearchResultGroup } from "./utils";

export type SearchResultsProps = {
  groups: SearchResultGroup<PayToken>[];
  selectedAssetId?: string | null;
  loading: boolean;
  showBalances?: boolean;
  showWalletStatus?: boolean;
  getBalance: (token: PayToken) => string | null | undefined;
  isBalanceLoading: (token: PayToken) => boolean;
  onSelectToken: (token: PayToken) => void;
  isTokenDisabled?: (token: PayToken) => boolean;
  rowClassName?: string;
};

export function SearchResults(props: SearchResultsProps) {
  const {
    groups,
    selectedAssetId,
    loading,
    showBalances = false,
    showWalletStatus = true,
    getBalance,
    isBalanceLoading,
    onSelectToken,
    isTokenDisabled,
    rowClassName,
  } = props;
  const hasTokens = groups.some((group) => group.tokens.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className={cx("min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
        <div className="px-2.5 pt-[17px] pb-3">
          {groups.map((group) => (
            <section key={group.blockchain} className="mb-2">
              <div className="mb-1 flex items-center justify-between gap-2 px-3.5">
                <p className={cx("min-w-0 truncate text-sm font-medium text-[#aaa]", fontSans)}>{group.chainName}</p>
                {showWalletStatus ? <ChainWalletStatus kind={group.chainKind} /> : null}
              </div>
              {group.tokens.map((token) => (
                <TokenRow
                  key={token.assetId}
                  token={token}
                  selected={token.assetId === selectedAssetId}
                  recent={false}
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
          {!loading && !hasTokens ? (
            <p className={cx("px-3.5 py-4 text-[13px] text-[#606060]", fontSans)}>No tokens found</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
