import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconCheck } from "@stableflow/pay-ui/icons/outline/check";
import { IconChevron } from "@stableflow/pay-ui/icons/outline/chevron";
import { Drawer } from "@stableflow/pay-ui/drawer";
import { SearchInput } from "@stableflow/pay-ui/search-input";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { ChainStack } from "./chain-stack";
import { ALL_CHAIN_FILTER } from "./config";
import { usePayWidgets } from "./context";
import { chainKindLabel, cx, fontSans, thinScrollbar } from "./format";
import type { ChainKind, PayChain } from "./types";
import { useDesktop } from "./use-desktop";
import { isBlockchainDisabled, isChainKindLocked, type SidebarChain } from "./utils";

const SEARCH_FIELD_CLASS = "h-[42px] rounded-[12px] border-[#e3e3e3] bg-[#f6f6f6] text-sm placeholder:text-black/30";
const SEARCH_ICON_CLASS = "left-4 size-[19px] text-black";

export type ChainSelectProps = {
  chains: readonly SidebarChain[];
  previewChains: readonly PayChain[];
  dotted: ReadonlySet<string>;
  value: string;
  onChange: (blockchain: string) => void;
  lockChainKind?: ChainKind | null;
  disabledBlockchains?: string[] | null;
  disabledReason?: string;
};

export function ChainSelect(props: ChainSelectProps) {
  const {
    chains,
    previewChains,
    dotted,
    value,
    onChange,
    lockChainKind = null,
    disabledBlockchains = null,
    disabledReason,
  } = props;
  const { chainKindLabels } = usePayWidgets();
  const isDesktop = useDesktop();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = value === ALL_CHAIN_FILTER ? undefined : chains.find((chain) => chain.blockchain === value);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, isDesktop]);

  function reasonFor(chain: SidebarChain): string | undefined {
    if (isBlockchainDisabled(chain.blockchain, disabledBlockchains)) return disabledReason;
    if (isChainKindLocked(chain.chainKind, lockChainKind) && lockChainKind) {
      return `Recipient address is on ${chainKindLabel(lockChainKind, chainKindLabels)}; edit the recipient to change chain`;
    }
    return undefined;
  }

  const trimmed = query.trim().toLowerCase();
  const showAll = !trimmed || "all".includes(trimmed);
  const visible = chains.filter((chain) => {
    if (!trimmed) return true;
    return chain.chainName.toLowerCase().includes(trimmed) || chain.blockchain.toLowerCase().includes(trimmed);
  });
  const empty = !showAll && visible.length === 0;

  function select(blockchain: string) {
    onChange(blockchain);
    setOpen(false);
  }

  const menu = (
    <ChainMenu
      showAll={showAll}
      chains={visible}
      previewChains={previewChains}
      dotted={dotted}
      value={value}
      query={query}
      onQueryChange={setQuery}
      empty={empty}
      isDesktop={isDesktop}
      reasonFor={reasonFor}
      onSelect={select}
    />
  );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-[50px] w-[70px] cursor-pointer items-center justify-between pl-[9px] pr-[12px] gap-1.5 rounded-[12px] border border-[#e0e0e0] bg-[#fdfdfd] shadow-[0_0_40px_0_rgba(0,0,0,0.06)]"
      >
        {selected ? (
          <img src={selected.logo} alt="" className="size-7 rounded-[8px] object-cover" />
        ) : (
          <ChainStack chains={previewChains} logoClassName="size-[12px] rounded-[2px] object-cover" />
        )}
        <IconChevron className={cx("size-2.5 text-black duration-150", open ? "-rotate-90" : "rotate-90")} />
      </button>
      {open && isDesktop ? (
        <div
          role="listbox"
          aria-label="Select network"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.stopPropagation();
            event.preventDefault();
            setOpen(false);
          }}
          className="absolute top-[59px] right-0 z-20 flex max-h-[483px] w-[302px] flex-col rounded-[12px] border border-[#e0e0e0] bg-[#fdfdfd] p-4 shadow-[0_0_40px_0_rgba(0,0,0,0.06)]"
        >
          {menu}
        </div>
      ) : null}
      {!isDesktop ? (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Select Network"
          titleClassName={cx("text-lg font-semibold text-black", fontSans)}
          cardClassName="max-h-[80vh]"
          contentClassName="overflow-hidden"
        >
          <div className="flex h-[min(483px,60vh)] min-h-0 flex-col">{menu}</div>
        </Drawer>
      ) : null}
    </div>
  );
}

function ChainMenu(props: {
  showAll: boolean;
  chains: readonly SidebarChain[];
  previewChains: readonly PayChain[];
  dotted: ReadonlySet<string>;
  value: string;
  query: string;
  onQueryChange: (value: string) => void;
  empty: boolean;
  isDesktop: boolean;
  reasonFor: (chain: SidebarChain) => string | undefined;
  onSelect: (blockchain: string) => void;
}) {
  const {
    showAll,
    chains,
    previewChains,
    dotted,
    value,
    query,
    onQueryChange,
    empty,
    isDesktop,
    reasonFor,
    onSelect,
  } = props;

  return (
    <>
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="search network"
        iconClassName={SEARCH_ICON_CLASS}
        inputClassName={cx(SEARCH_FIELD_CLASS, "pl-[43px]")}
      />
      <div className={cx("mt-2.5 min-h-0 flex-1 overflow-y-auto", thinScrollbar)}>
        {showAll ? (
          <ChainOption
            selected={value === ALL_CHAIN_FILTER}
            onSelect={() => onSelect(ALL_CHAIN_FILTER)}
            label="All"
          >
            <ChainStack chains={previewChains} logoClassName="size-[15px] rounded-[4px] object-cover" />
          </ChainOption>
        ) : null}
        {chains.map((chain) => {
          const reason = reasonFor(chain);
          const disabled = Boolean(reason);
          return (
            <ChainOption
              key={chain.blockchain}
              selected={value === chain.blockchain}
              disabled={disabled}
              reason={reason}
              showReason={!isDesktop}
              dotted={dotted.has(chain.blockchain)}
              onSelect={() => onSelect(chain.blockchain)}
              label={chain.chainName}
            >
              <img src={chain.logo} alt="" className="size-8 rounded-[8px] object-cover" />
            </ChainOption>
          );
        })}
        {empty ? (
          <p className={cx("px-[13px] py-4 text-[13px] text-[#606060]", fontSans)}>No networks found</p>
        ) : null}
      </div>
    </>
  );
}

function ChainOption(props: {
  selected: boolean;
  disabled?: boolean;
  reason?: string;
  showReason?: boolean;
  dotted?: boolean;
  onSelect: () => void;
  label: string;
  children: ReactNode;
}) {
  const { selected, disabled = false, reason, showReason = false, dotted = false, onSelect, label, children } = props;
  const button = (
    <button
      type="button"
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        onSelect();
      }}
      className={cx(
        "flex w-full cursor-pointer items-center gap-3 rounded-[6px] border-0 bg-transparent px-1.5 py-1.5 text-left hover:bg-[#f6f6f6]",
        selected && "bg-[#f6f6f6]",
        disabled && "cursor-not-allowed hover:bg-transparent",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className={cx("flex min-w-0 items-center gap-3", disabled && "opacity-40")}>
          <span className="flex size-8 shrink-0 items-center justify-center">{children}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={cx("truncate text-sm font-medium text-black", fontSans)}>{label}</span>
            {dotted ? <span className="size-2 shrink-0 rounded-full bg-[#6284f5]" /> : null}
          </span>
        </span>
        {disabled && showReason && reason ? (
          <span className={cx("mt-0.5 block pl-11 text-xs font-normal text-[#606060]", fontSans)}>{reason}</span>
        ) : null}
      </span>
      {selected ? <IconCheck className="mr-1 size-2.5 shrink-0 text-black" /> : null}
    </button>
  );

  if (disabled && reason && !showReason) {
    return (
      <Tooltip content={reason} triggerClassName="flex w-full">
        {button}
      </Tooltip>
    );
  }
  return button;
}
