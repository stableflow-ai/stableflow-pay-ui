import type { CSSProperties } from "react";
import { cx } from "../token-select/format";
import type { WalletKindMeta } from "../token-select/types";

export function WalletKindIcon(props: {
  meta: WalletKindMeta;
  connected: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { meta, connected, className, style } = props;
  const src = connected ? meta.icon : meta.iconGray;
  return (
    <span
      className={cx(
        "relative flex h-6.5 w-6.5 shrink-0 items-center justify-center overflow-hidden rounded-full border",
        connected ? "border-transparent" : "border-dashed border-[#9FA7BA]",
        className,
      )}
      style={{
        backgroundColor: connected ? meta.bgColor ?? "#DFE7ED" : "#DFE7ED",
        ...style,
      }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
    </span>
  );
}
