import { Skeleton } from "@stableflow/pay-ui/skeleton";
import { cx, fontSans } from "./format";
import { LazyImage } from "./lazy-image";
import { DEFAULT_TOKEN_LOGO } from "./logos";
import type { PayToken } from "./types";

export function RecentTiles(props: {
  tokens: readonly PayToken[];
  onSelect: (token: PayToken) => void;
  isTokenDisabled?: (token: PayToken) => boolean;
}) {
  const { tokens, onSelect, isTokenDisabled } = props;
  if (tokens.length === 0) return null;

  return (
    <div className="grid grid-cols-5 gap-2 px-5 md:gap-3">
      {tokens.map((token) => {
        const disabled = Boolean(isTokenDisabled?.(token));
        return (
          <button
            key={token.assetId}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(token)}
            className={cx(
              "flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border-0 bg-[#f6f6f6] px-1 hover:bg-[#ededed]",
              disabled && "cursor-not-allowed opacity-40 hover:bg-[#f6f6f6]",
            )}
          >
            <span className="relative size-[26px] shrink-0">
              <LazyImage
                src={token.logo}
                fallbackSrc={DEFAULT_TOKEN_LOGO}
                className="size-[26px] rounded-[12px] object-cover"
              />
              <img
                src={token.chain.logo}
                alt=""
                className="absolute -right-1 -bottom-1 size-3 rounded-[4px] border border-white object-cover"
              />
            </span>
            <span className={cx("max-w-full truncate text-sm font-semibold text-black", fontSans)}>{token.symbol}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RecentTileSkeletons() {
  return (
    <div className="grid grid-cols-5 gap-2 px-5 md:gap-3" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-[72px] rounded-[12px]" />
      ))}
    </div>
  );
}
