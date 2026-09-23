import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Host-independent sans stack. Underscores in the arbitrary value become spaces. */
export const fontSans = "[font-family:Montserrat,PingFang_SC,system-ui,sans-serif]";

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string | null | undefined, prefix = 4, suffix = 5): string {
  if (!address) return "";
  if (!address.startsWith("0x") && address.length <= 32) return address;
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
}

export function chainKindLabel(kind: string): string {
  if (kind === "evm") return "EVM";
  if (kind === "near") return "Near";
  if (kind === "solana") return "Solana";
  if (kind === "tron") return "Tron";
  if (kind === "zec") return "Zcash";
  return kind;
}

/** Truncate a decimal string toward zero and group the integer part. */
export function formatDisplayAmount(
  value: string | number,
  options: { maxDecimals?: number; prefix?: string; showDust?: boolean } = {},
): string {
  const maxDecimals = options.maxDecimals ?? 2;
  const prefix = options.prefix ?? "";
  const text = String(value).trim();
  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  if (!/^\d+(\.\d+)?$/.test(unsigned)) return `${prefix}0`;

  const numeric = Number(unsigned);
  const minUnit = 10 ** -maxDecimals;
  if (options.showDust && numeric > 0 && numeric < minUnit) {
    const dust = `<${minUnit.toFixed(maxDecimals)}`;
    return prefix ? `${prefix} ${dust}` : dust;
  }

  const [intPart, fracPart = ""] = unsigned.split(".");
  const fraction = fracPart.slice(0, maxDecimals).replace(/0+$/, "");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fraction.length > 0 ? `${grouped}.${fraction}` : grouped;
  return `${prefix}${negative ? "-" : ""}${body}`;
}
