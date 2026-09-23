import type { ReactNode } from "react";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { ChainWalletStatus } from "./chain-wallet-status";
import { chainKindLabel, cx, fontSans } from "./format";
import type { ChainKind } from "./types";
import { isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

export type ChainPaneProps = {
  chains: SidebarChain[];
  fundedBlockchains: ReadonlySet<string>;
  showWalletStatus?: boolean;
  onSelectFilter: (filter: string) => void;
  lockChainKind?: ChainKind | null;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
};

function lockReason(lockChainKind: ChainKind): string {
  return `Recipient address is on ${chainKindLabel(lockChainKind)}; edit the recipient to change chain`;
}

export function ChainPane(props: ChainPaneProps) {
  const {
    chains,
    fundedBlockchains,
    showWalletStatus = true,
    onSelectFilter,
    lockChainKind = null,
    disabledBlockchains = null,
    disabledReason,
  } = props;

  function wrapDisabled(disabled: boolean, reason: string | undefined, content: ReactNode) {
    if (!disabled || !reason) return content;
    return (
      <Tooltip side="right" triggerClassName="min-w-0 flex-1" content={reason}>
        {content}
      </Tooltip>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className={cx("shrink-0 text-sm font-medium text-[#aaa]", fontSans)}>All Networks</p>
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {chains.map((chain) => {
          const locked = isChainKindLocked(chain.chainKind, lockChainKind);
          const chainDisabled = isBlockchainDisabled(chain.blockchain, disabledBlockchains);
          const disabled = locked || chainDisabled;
          const reason = chainDisabled
            ? disabledReason
            : locked && lockChainKind
              ? lockReason(lockChainKind)
              : undefined;
          return (
            <div
              key={chain.blockchain}
              className={cx(
                "flex min-h-14 w-full items-center gap-2 rounded-[12px] px-2 md:min-h-[66px] md:gap-3 md:px-3",
                disabled ? "opacity-40" : "hover:bg-[#F6F6F6]",
              )}
            >
              {wrapDisabled(
                disabled,
                reason,
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onSelectFilter(chain.blockchain);
                  }}
                  className={cx(
                    "flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent text-left",
                    disabled ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  <span className="relative size-8 shrink-0">
                    <img src={chain.logo} alt="" className="size-8 object-cover" />
                    {fundedBlockchains.has(chain.blockchain) ? (
                      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border border-white bg-[#06f] md:size-2.5" />
                    ) : null}
                  </span>
                  <span className={cx("truncate text-sm font-medium text-black md:text-base", fontSans)}>{chain.chainName}</span>
                </button>,
              )}
              {showWalletStatus ? <ChainWalletStatus kind={chain.chainKind} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
