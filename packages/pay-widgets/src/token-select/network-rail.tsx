import type { ReactNode } from "react";
import { IconAllNetworks } from "@stableflow/pay-ui/icons/all-networks";
import { IconWallet } from "@stableflow/pay-ui/icons/wallet";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { usePayWidgets } from "./context";
import { chainKindLabel, cx, fontSans, thinScrollbar } from "./format";
import type { ChainKind } from "./types";
import { isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

export type RailSelection =
  | { kind: "wallet" }
  | { kind: "all" }
  | { kind: "networks" }
  | { kind: "chain"; blockchain: string };

export type NetworkRailProps = {
  role: "payer" | "receiver";
  walletConnected: boolean;
  selection: RailSelection;
  chains: SidebarChain[];
  fundedBlockchains: ReadonlySet<string>;
  lockChainKind?: ChainKind | null;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
  onSelectWallet: () => void;
  onSelectAll: () => void;
  onSelectNetworks: () => void;
  onSelectChain: (blockchain: string) => void;
  className?: string;
};

function chipClass(selected: boolean, disabled: boolean) {
  return cx(
    "relative flex size-[50px] shrink-0 items-center justify-center rounded-[12px] border border-solid",
    selected ? "border-[#06f] bg-[rgba(0,102,255,0.1)]" : "border-transparent bg-transparent",
    disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-black/5",
  );
}

export function NetworkRail(props: NetworkRailProps) {
  const {
    role,
    walletConnected,
    selection,
    chains,
    fundedBlockchains,
    lockChainKind = null,
    disabledBlockchains = null,
    disabledReason,
    onSelectWallet,
    onSelectAll,
    onSelectNetworks,
    onSelectChain,
    className,
  } = props;
  const { chainKindLabels } = usePayWidgets();
  const payer = role === "payer";
  const networksSelected = selection.kind === "networks";
  const allSelected = selection.kind === "all";
  const walletSelected = selection.kind === "wallet";

  function wrapDisabled(disabled: boolean, reason: string | undefined, content: ReactNode) {
    if (!disabled || !reason) return content;
    return (
      <Tooltip side="right" content={reason}>
        {content}
      </Tooltip>
    );
  }

  function chainButton(chain: SidebarChain) {
    const locked = isChainKindLocked(chain.chainKind, lockChainKind);
    const chainDisabled = isBlockchainDisabled(chain.blockchain, disabledBlockchains);
    const disabled = locked || chainDisabled;
    const reason = chainDisabled
      ? disabledReason
      : locked
        ? `Recipient address is on ${chainKindLabel(lockChainKind!, chainKindLabels)}; edit the recipient to change chain`
        : undefined;
    const selected = selection.kind === "chain" && selection.blockchain === chain.blockchain;
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
              onSelectChain(chain.blockchain);
            }}
            className={chipClass(selected, disabled)}
          >
            <img src={chain.logo} alt="" className="size-8 object-cover" />
            {fundedBlockchains.has(chain.blockchain) ? (
              <span className="absolute top-1 right-1 size-2.5 rounded-full border border-white bg-[#06f]" />
            ) : null}
          </button>,
        )}
      </span>
    );
  }

  return (
    <div className={cx("box-border flex h-full w-[76px] shrink-0 flex-col items-center border-r border-[#e3e3e3] pt-3", className)}>
      {payer && walletConnected ? (
        <button type="button" aria-label="Wallet" onClick={onSelectWallet} className={chipClass(walletSelected, false)}>
          <IconWallet className={walletSelected ? "size-5 text-[#06f]" : "size-5 text-black"} />
        </button>
      ) : null}
      {payer && !walletConnected ? (
        <button type="button" aria-label="All networks" onClick={onSelectNetworks} className={chipClass(networksSelected, false)}>
          <IconAllNetworks className="size-5 text-black" />
        </button>
      ) : null}
      {!payer ? (
        <button type="button" aria-label="All" onClick={onSelectAll} className={chipClass(allSelected, false)}>
          <span className={cx("text-sm font-medium text-black", fontSans)}>All</span>
        </button>
      ) : null}
      {payer && walletConnected ? (
        <div className={cx("mt-3.5 flex min-h-0 w-full flex-1 flex-col items-center gap-3.5 overflow-y-auto", thinScrollbar)}>
          {chains.map((chain) => chainButton(chain))}
          <div className="h-px w-8 shrink-0 bg-[#e3e3e3]" />
          <button type="button" aria-label="All networks" onClick={onSelectNetworks} className={chipClass(networksSelected, false)}>
            <IconAllNetworks className="size-5 text-black" />
          </button>
          <div className="pb-3" />
        </div>
      ) : null}
      {!payer ? (
        <div className={cx("mt-3.5 flex min-h-0 w-full flex-1 flex-col items-center gap-3.5 overflow-y-auto", thinScrollbar)}>
          {chains.map((chain) => chainButton(chain))}
          <div className="pb-3" />
        </div>
      ) : null}
    </div>
  );
}
