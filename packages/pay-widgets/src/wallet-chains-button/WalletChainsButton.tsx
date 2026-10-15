import { Button } from "@stableflow/pay-ui/button";
import { IconArrowDown } from "@stableflow/pay-ui/icons/outline/arrow-down";
import { cx } from "../token-select/format";
import { usePayWidgets } from "../token-select/context";
import type { ChainKind } from "../token-select/types";
import { kindAddress, orderedWalletKinds } from "../wallet-kinds/holdings";
import { WalletKindIcon } from "../wallet-kinds/WalletKindIcon";

export type WalletChainsButtonProps = {
  onClick: () => void;
  kinds?: ChainKind[];
  connectLabel?: string;
  className?: string;
};

export function WalletChainsButton(props: WalletChainsButtonProps) {
  const { onClick, kinds, connectLabel = "Connect", className } = props;
  const { wallet, walletKinds } = usePayWidgets();
  const metas = orderedWalletKinds(kinds, walletKinds);
  const anyConnected = metas.some((meta) => Boolean(kindAddress(wallet.accounts, meta.kind)));

  if (!anyConnected) {
    return (
      <Button
        type="button"
        onClick={onClick}
        className={cx(
          "h-9 rounded-[18px] border-0 bg-[#6284F5] px-[15px] text-[16px] font-medium leading-none text-white shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] hover:bg-[#6284F5] hover:opacity-90 md:h-9 md:px-[15px] md:text-[16px]",
          className,
        )}
      >
        {connectLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      className={cx(
        "h-auto gap-0 rounded-[18px] border-0 bg-white p-[6px] text-[#A1A699] shadow-[0_0_6px_0_rgba(0,0,0,0.10)] hover:bg-white md:h-auto md:p-[6px] md:px-[6px]",
        className,
      )}
    >
      {metas.map((meta, index) => (
        <WalletKindIcon
          key={meta.kind}
          meta={meta}
          connected={Boolean(kindAddress(wallet.accounts, meta.kind))}
          className={index > 0 ? "relative ml-[-8px]" : "relative"}
          style={{ zIndex: index }}
        />
      ))}
      <IconArrowDown className="ml-[10px] text-[#A1A699]" />
    </Button>
  );
}
