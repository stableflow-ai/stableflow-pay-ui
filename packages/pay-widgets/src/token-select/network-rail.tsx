import type { ReactNode } from "react";
import { IconAllNetworks } from "@stableflow/pay-ui/icons/all-networks";
import { IconWallet } from "@stableflow/pay-ui/icons/wallet";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { ALL_CHAIN_FILTER } from "./config";
import { chainKindLabel, cx, fontSans } from "./format";
import type { ChainKind } from "./types";
import { isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

export type NetworkRailProps = {
  view: "token" | "network";
  chainFilter: string;
  chips: SidebarChain[];
  fundedBlockchains: ReadonlySet<string>;
  walletConnected: boolean;
  showAllLabel?: boolean;
  lockChainKind?: ChainKind | null;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
  onSelectFilter: (filter: string) => void;
  onOpenNetworks: () => void;
  className?: string;
};

function chipClass(selected: boolean, disabled: boolean) {
  return cx(
    "relative flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-solid md:size-[50px]",
    selected ? "border-[#06f] bg-[rgba(0,102,255,0.1)]" : "border-transparent bg-transparent",
    disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-black/5",
  );
}

export function NetworkRail(props: NetworkRailProps) {
  const {
    view,
    chainFilter,
    chips,
    fundedBlockchains,
    walletConnected,
    showAllLabel = false,
    lockChainKind = null,
    disabledBlockchains = null,
    disabledReason,
    onSelectFilter,
    onOpenNetworks,
    className,
  } = props;

  function wrapDisabled(disabled: boolean, reason: string | undefined, content: ReactNode) {
    if (!disabled || !reason) return content;
    return (
      <Tooltip side="right" content={reason}>
        {content}
      </Tooltip>
    );
  }

  return (
    <div className={cx("flex h-full w-[52px] shrink-0 flex-col items-center border-r border-[#e3e3e3] pr-2 md:w-[72px] md:pr-3", className)}>
      {showAllLabel ? (
        <button
          type="button"
          aria-label="All"
          onClick={() => onSelectFilter(ALL_CHAIN_FILTER)}
          className={chipClass(view === "token" && chainFilter === ALL_CHAIN_FILTER, false)}
        >
          <span className={cx("text-xs font-medium text-black md:text-sm", fontSans)}>All</span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Wallet"
          disabled={!walletConnected}
          onClick={() => {
            if (!walletConnected) return;
            onSelectFilter(ALL_CHAIN_FILTER);
          }}
          className={walletConnected
            ? chipClass(view === "token" && chainFilter === ALL_CHAIN_FILTER, false)
            : "relative flex size-10 shrink-0 cursor-not-allowed items-center justify-center rounded-[12px] border border-solid border-transparent md:size-[50px]"}
        >
          {walletConnected ? (
            <IconWallet className="size-4 text-black" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#EFEFEF]">
              <IconWallet className="size-4 text-[#9FA7BA]" />
            </span>
          )}
        </button>
      )}
      <div className="mt-2 flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
        {chips.map((chain) => {
          const locked = isChainKindLocked(chain.chainKind, lockChainKind);
          const chainDisabled = isBlockchainDisabled(chain.blockchain, disabledBlockchains);
          const disabled = locked || chainDisabled;
          const reason = chainDisabled
            ? disabledReason
            : locked
              ? `Recipient address is on ${chainKindLabel(lockChainKind!)}; edit the recipient to change chain`
              : undefined;
          const selected = view === "token" && chainFilter === chain.blockchain;
          return (
            <span key={chain.blockchain}>
              {wrapDisabled(
                disabled,
                reason,
                <button
                  type="button"
                  aria-label={chain.chainName}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onSelectFilter(chain.blockchain);
                  }}
                  className={chipClass(selected, disabled)}
                >
                  <img src={chain.logo} alt="" className="size-6 object-cover md:size-8" />
                  {fundedBlockchains.has(chain.blockchain) ? (
                    <span className="absolute top-1 right-1 size-2 rounded-full border border-white bg-[#06f] md:size-2.5" />
                  ) : null}
                </button>,
              )}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex w-full shrink-0 justify-center border-t border-[#e3e3e3] pt-2">
        <button
          type="button"
          aria-label="All networks"
          onClick={onOpenNetworks}
          className={chipClass(view === "network", false)}
        >
          <IconAllNetworks className="size-4 text-black" />
        </button>
      </div>
    </div>
  );
}
