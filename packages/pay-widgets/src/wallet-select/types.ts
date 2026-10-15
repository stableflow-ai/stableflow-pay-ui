import type { ReactNode } from "react";

export type WalletSelectOption = {
  id: string;
  name: string;
  /** Image URL. A missing icon falls back to a gray placeholder tile. */
  icon?: string | null;
  /** Subtitle. Defaults to `name` when empty. */
  description?: string;
  /** `true` shows the DETECTED badge. */
  detected?: boolean;
  /**
   * When `detected` is `false` and this URL is set, a click opens it in a new tab
   * and does not call `onSelect`.
   */
  installUrl?: string;
  disabled?: boolean;
};

export type WalletSelectDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Rendered in the given order. The widget does not sort or filter. */
  wallets: WalletSelectOption[];
  onSelect: (wallet: WalletSelectOption) => void;
  /** Spinner on this row, and the row does not accept a click. */
  connectingId?: string | null;
  /** Skeleton rows instead of `wallets`. */
  loading?: boolean;
  emptyText?: ReactNode;
  /** Terms copy by default. `null` hides the footer. */
  footer?: ReactNode | null;
  /** Forwarded to Dialog so the card sits in the wallet-portal layer. */
  elevated?: boolean;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
};
