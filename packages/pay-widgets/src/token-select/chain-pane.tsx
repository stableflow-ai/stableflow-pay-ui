import { useState, type ReactNode } from "react";
import { IconArrowDown } from "@stableflow/pay-ui/icons/arrow-down";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { ChainWalletStatus } from "./chain-wallet-status";
import { chainKindLabel, cx, fontSans } from "./format";
import { evmTypeLogoUrl } from "./logos";
import type { ChainKind } from "./types";
import { groupEvmChains, isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

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
  const [evmExpanded, setEvmExpanded] = useState(true);

  function wrapDisabled(disabled: boolean, reason: string | undefined, content: ReactNode) {
    if (!disabled || !reason) return content;
    return (
      <Tooltip side="right" triggerClassName="min-w-0 flex-1" content={reason}>
        {content}
      </Tooltip>
    );
  }

  function chainRow(chain: SidebarChain, nested: boolean) {
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
          nested ? "min-h-12 md:min-h-14" : "",
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
        {showWalletStatus && !nested ? <ChainWalletStatus kind={chain.chainKind} /> : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className={cx("shrink-0 text-sm font-medium text-[#aaa]", fontSans)}>All Networks</p>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {groupEvmChains(chains).map((entry) => {
          if (entry.kind === "chain") return chainRow(entry.chain, false);
          return (
            <div key="evm" className="rounded-[12px] px-2 md:px-3 py-2 hover:bg-[rgba(185,215,255,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#627EEA]">
                    <img src={evmTypeLogoUrl()} alt="" className="size-5 object-contain" />
                  </span>
                  <span className={cx("truncate text-sm font-medium text-black md:text-base", fontSans)}>EVM-based</span>
                </div>
                {showWalletStatus ? <ChainWalletStatus kind="evm" /> : <span className="min-w-0 flex-1" />}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {evmExpanded ? <span className="min-w-0 flex-1" /> : (
                  <span className="flex min-w-0 flex-1 overflow-hidden">
                    {entry.chains.map((chain, index) => (
                      <img
                        key={chain.blockchain}
                        src={chain.logo}
                        alt=""
                        style={{ zIndex: entry.chains.length - index }}
                        className={index === 0
                          ? "relative size-4 shrink-0 rounded-[4px] border border-white object-cover"
                          : "relative -ml-1.5 size-4 shrink-0 rounded-[4px] border border-white object-cover"}
                      />
                    ))}
                  </span>
                )}
                <button
                  type="button"
                  aria-expanded={evmExpanded}
                  aria-label={evmExpanded ? "Collapse EVM-based" : "Expand EVM-based"}
                  onClick={() => setEvmExpanded((open) => !open)}
                  className="ml-auto inline-flex shrink-0 cursor-pointer border-0 bg-transparent p-1 text-[#606060]"
                >
                  <IconArrowDown className={cx("size-3 transition-transform", evmExpanded ? "rotate-180" : "")} />
                </button>
              </div>
              {evmExpanded ? (
                <div className="mt-2 border-t border-[#e3e3e3] pt-1">
                  {entry.chains.map((chain) => chainRow(chain, true))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
