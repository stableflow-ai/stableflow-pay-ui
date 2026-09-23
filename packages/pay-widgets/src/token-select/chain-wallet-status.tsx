import type { MouseEvent } from "react";
import { IconLogout } from "@stableflow/pay-ui/icons/logout";
import { usePayWidgets } from "./context";
import { cx, fontSans, formatAddress } from "./format";
import type { ChainKind } from "./types";

function stop(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function ChainWalletStatus({ kind }: { kind: ChainKind }) {
  const { wallet, onCopyAddress } = usePayWidgets();
  const account = wallet.accounts[kind];
  const address = account?.address?.trim() || "";
  const hideDisconnect = account?.canDisconnect === false;

  if (!address) {
    return (
      <button
        type="button"
        onClick={(event) => {
          stop(event);
          void wallet.connect(kind);
        }}
        className={cx("shrink-0 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#3F8AFB] hover:underline", fontSans)}
      >
        {account?.connecting ? "Connecting…" : "Connect"}
      </button>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1" onClick={stop}>
      <button
        type="button"
        onClick={async (event) => {
          stop(event);
          if (!onCopyAddress) return;
          onCopyAddress(address);
        }}
        className={cx("truncate border-0 bg-transparent p-0 text-xs text-[#606060] hover:text-black", fontSans)}
      >
        {formatAddress(address)}
      </button>
      {hideDisconnect ? null : (
        <button
          type="button"
          aria-label="Disconnect"
          onClick={(event) => {
            stop(event);
            void wallet.disconnect(kind);
          }}
          className="inline-flex shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[#ff5656]"
        >
          <IconLogout className="size-3" />
        </button>
      )}
    </div>
  );
}
