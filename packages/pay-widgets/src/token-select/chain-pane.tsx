import type { ReactNode, Ref } from "react";
import { IconChevron } from "@stableflow/pay-ui/icons/chevron";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { ChainWalletStatus } from "./chain-wallet-status";
import { usePayWidgets } from "./context";
import { chainKindLabel, cx, fontSans, thinScrollbar } from "./format";
import type { ChainKind } from "./types";
import { isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

export type ChainPaneProps = {
  chains: SidebarChain[];
  showWalletStatus?: boolean;
  onSelectChain: (blockchain: string) => void;
  lockChainKind?: ChainKind | null;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
  scrollRef?: Ref<HTMLDivElement>;
};

function lockReason(lockChainKind: ChainKind, labels: Record<string, string>): string {
  return `Recipient address is on ${chainKindLabel(lockChainKind, labels)}; edit the recipient to change chain`;
}

export function ChainPane(props: ChainPaneProps) {
  const {
    chains,
    showWalletStatus = true,
    onSelectChain,
    lockChainKind = null,
    disabledBlockchains = null,
    disabledReason,
    scrollRef,
  } = props;
  const { chainKindLabels } = usePayWidgets();

  function wrapDisabled(disabled: boolean, reason: string | undefined, content: ReactNode) {
    if (!disabled || !reason) return content;
    return (
      <Tooltip side="right" triggerClassName="min-w-0 flex-1" content={reason}>
        {content}
      </Tooltip>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className={cx("min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
        <div className="px-2.5 pt-[17px] pb-3">
          <p className={cx("px-3.5 text-sm font-medium text-[#aaa]", fontSans)}>All Networks</p>
          <div className="mt-1">
            {chains.map((chain) => {
              const locked = isChainKindLocked(chain.chainKind, lockChainKind);
              const chainDisabled = isBlockchainDisabled(chain.blockchain, disabledBlockchains);
              const disabled = locked || chainDisabled;
              const reason = chainDisabled
                ? disabledReason
                : locked && lockChainKind
                  ? lockReason(lockChainKind, chainKindLabels)
                  : undefined;
              return (
                <div
                  key={chain.blockchain}
                  className={cx(
                    "flex h-[66px] w-full items-center gap-4 rounded-[12px] px-3.5",
                    disabled ? "opacity-40" : "hover:bg-[#f6f6f6]",
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
                        onSelectChain(chain.blockchain);
                      }}
                      className={cx(
                        "flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent text-left",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
                      <img src={chain.logo} alt="" className="size-8 shrink-0 object-cover" />
                      <span className={cx("truncate text-sm font-medium text-black", fontSans)}>{chain.chainName}</span>
                    </button>,
                  )}
                  {showWalletStatus ? <ChainWalletStatus kind={chain.chainKind} /> : <span className="min-w-0 flex-1" />}
                  <button
                    type="button"
                    aria-label={`Open ${chain.chainName}`}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      onSelectChain(chain.blockchain);
                    }}
                    className={cx(
                      "inline-flex shrink-0 border-0 bg-transparent p-0 text-[#606060]",
                      disabled ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                  >
                    <IconChevron />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
