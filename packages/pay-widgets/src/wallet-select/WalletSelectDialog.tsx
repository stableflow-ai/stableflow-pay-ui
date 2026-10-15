import type { ReactNode } from "react";
import { Dialog } from "@stableflow/pay-ui/dialog";
import { IconLoading } from "@stableflow/pay-ui/icons/outline/loading";
import { Skeleton } from "@stableflow/pay-ui/skeleton";
import type { WalletSelectDialogProps, WalletSelectOption } from "./types";
import { cx, fontSans, walletSelectClick, walletSubtitle } from "./utils";

const SKELETON_ROW_COUNT = 4;

const DEFAULT_EMPTY_TEXT = "No wallets available";

const DEFAULT_FOOTER = "By connecting a wallet, you agree to our Terms of Service and Privacy Policy";

function openInstallUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function WalletIcon(props: { wallet: WalletSelectOption }) {
  const icon = props.wallet.icon?.trim();
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F5F5F5]">
      {icon ? (
        <img src={icon} alt="" className="size-6 object-contain" />
      ) : (
        <span className="size-6 rounded-[6px] bg-[#E5E5E5]" />
      )}
    </span>
  );
}

function WalletRow(props: {
  wallet: WalletSelectOption;
  connecting: boolean;
  itemClassName?: string;
  onSelect: (wallet: WalletSelectOption) => void;
  connectingId?: string | null;
}) {
  const action = walletSelectClick(props.wallet, props.connectingId);
  const blocked = action.type === "none";

  return (
    <button
      type="button"
      disabled={blocked}
      aria-busy={props.connecting || undefined}
      onClick={() => {
        if (action.type === "install") {
          openInstallUrl(action.url);
          return;
        }
        if (action.type === "select") props.onSelect(props.wallet);
      }}
      className={cx(
        "flex w-full cursor-pointer items-center gap-4 rounded-[12px] border-0 bg-transparent p-4 text-left transition-colors hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50",
        fontSans,
        props.itemClassName,
      )}
    >
      <WalletIcon wallet={props.wallet} />
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 block text-base font-medium text-[#1A1A1A]">{props.wallet.name}</span>
        <span className="block truncate text-sm text-[#666666]">{walletSubtitle(props.wallet)}</span>
      </span>
      {props.wallet.detected ? (
        <span className="shrink-0 rounded-[4px] bg-[rgba(38,217,98,0.20)] px-1.5 py-0.5 text-xs uppercase text-[#26d962]">
          Detected
        </span>
      ) : null}
      {props.connecting ? <IconLoading className="size-5 shrink-0 animate-spin text-[#6284F5]" /> : null}
    </button>
  );
}

function WalletSkeletons() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className="flex items-center gap-4 p-4">
          <Skeleton className="size-10 shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-40" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function WalletSelectDialog(props: WalletSelectDialogProps) {
  const {
    open,
    onClose,
    title,
    wallets,
    onSelect,
    connectingId = null,
    loading = false,
    emptyText = DEFAULT_EMPTY_TEXT,
    footer,
    elevated,
    className,
    listClassName,
    itemClassName,
  } = props;
  const footerNode: ReactNode | null = footer === undefined ? DEFAULT_FOOTER : footer;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      elevated={elevated}
      cardClassName={cx("md:w-[400px]", className)}
      contentClassName="overflow-hidden"
    >
      <div className={cx("max-h-[400px] overflow-y-auto", listClassName)}>
        {loading ? (
          <WalletSkeletons />
        ) : wallets.length === 0 ? (
          <p className={cx("px-4 py-8 text-center text-sm text-[#666666]", fontSans)}>{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {wallets.map((wallet) => (
              <WalletRow
                key={wallet.id}
                wallet={wallet}
                connecting={connectingId === wallet.id}
                connectingId={connectingId}
                itemClassName={itemClassName}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
      {footerNode != null ? (
        <div className="mt-5 border-t border-[#E5E5E5] pt-4">
          <p className={cx("text-center text-xs text-[#999999]", fontSans)}>{footerNode}</p>
        </div>
      ) : null}
    </Dialog>
  );
}

export default WalletSelectDialog;
