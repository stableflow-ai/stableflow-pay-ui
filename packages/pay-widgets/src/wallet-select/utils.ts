import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WalletSelectOption } from "./types";

export const fontSans = "[font-family:Montserrat,PingFang_SC,system-ui,sans-serif]";

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WalletSelectClick =
  | { type: "select" }
  | { type: "install"; url: string }
  | { type: "none" };

export function walletSubtitle(wallet: WalletSelectOption): string {
  const description = wallet.description?.trim();
  return description ? description : wallet.name;
}

/**
 * `detected === false` opens `installUrl` and skips `onSelect`.
 * A disabled row, the connecting row, and a not-installed wallet with no URL do nothing.
 */
export function walletSelectClick(wallet: WalletSelectOption, connectingId?: string | null): WalletSelectClick {
  if (wallet.disabled || (connectingId != null && connectingId !== "" && connectingId === wallet.id)) {
    return { type: "none" };
  }
  if (wallet.detected === false) {
    const url = wallet.installUrl?.trim();
    return url ? { type: "install", url } : { type: "none" };
  }
  return { type: "select" };
}
