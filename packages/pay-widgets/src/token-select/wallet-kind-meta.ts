import type { ChainKind, WalletKindMeta } from "./types";

const ICON_HOST = "https://assets.dapdap.net/stableflow/networks";

type WalletKindSpec = {
  label: string;
  file: string;
  bg: string;
  bgColor: string;
};

/** Visual defaults from the interface all-tokens chain types. `sol` and `zec` alias onto these keys. */
const WALLET_KIND_SPECS: Record<string, WalletKindSpec> = {
  evm: {
    label: "EVM",
    file: "evm",
    bgColor: "#6284F5",
    bg: "linear-gradient(90deg, rgba(185, 215, 255, 0.20) 0%, rgba(185, 215, 255, 0.00) 50%)",
  },
  near: {
    label: "Near",
    file: "near",
    bgColor: "#01ED97",
    bg: "linear-gradient(90deg, rgba(1, 237, 151, 0.20) 0%, rgba(1, 237, 151, 0.00) 50%)",
  },
  solana: {
    label: "Solana",
    file: "solana",
    bgColor: "#282C34",
    bg: "linear-gradient(90deg, rgba(248, 108, 255, 0.20) 0%, rgba(248, 108, 255, 0.00) 50%)",
  },
  tron: {
    label: "Tron",
    file: "tron",
    bgColor: "#D21F10",
    bg: "linear-gradient(90deg, rgba(210, 31, 16, 0.20) 0%, rgba(210, 31, 16, 0.00) 50%)",
  },
  zcash: {
    label: "Zcash",
    file: "zcash",
    bgColor: "#F4B728",
    bg: "linear-gradient(90deg, rgba(244, 183, 40, 0.20) 0%, rgba(244, 183, 40, 0.00) 50%)",
  },
  aptos: {
    label: "Aptos",
    file: "aptos",
    bgColor: "#000000",
    bg: "linear-gradient(90deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 50%)",
  },
  ton: {
    label: "Ton",
    file: "ton",
    bgColor: "#0098EA",
    bg: "linear-gradient(90deg, rgba(0, 152, 234, 0.20) 0%, rgba(0, 152, 234, 0.00) 50%)",
  },
  sui: {
    label: "Sui",
    file: "sui",
    bgColor: "#298DFF",
    bg: "linear-gradient(90deg, rgba(41, 141, 255, 0.20) 0%, rgba(0, 152, 234, 0.00) 50%)",
  },
  btc: {
    label: "Bitcoin",
    file: "btc",
    bgColor: "#F7931A",
    bg: "linear-gradient(90deg, rgba(247, 147, 26, 0.20) 0%, rgba(247, 147, 26, 0.00) 50%)",
  },
};

const KIND_ALIASES: Record<string, string> = {
  sol: "solana",
  solana: "solana",
  zec: "zcash",
  zcash: "zcash",
};

export function canonicalWalletKind(kind: string): string {
  return KIND_ALIASES[kind] ?? kind;
}

export function walletKindsMatch(left: string, right: string): boolean {
  return canonicalWalletKind(left) === canonicalWalletKind(right);
}

/** Built-in label, gradient, and CDN icons for a wallet kind. Unknown kinds return null. */
export function defaultWalletKindMeta(kind: ChainKind): WalletKindMeta | null {
  const spec = WALLET_KIND_SPECS[canonicalWalletKind(kind)];
  if (!spec) return null;
  return {
    kind,
    label: spec.label,
    icon: `${ICON_HOST}/type-${spec.file}.svg`,
    iconGray: `${ICON_HOST}/type-${spec.file}-gray.svg`,
    bg: spec.bg,
    bgColor: spec.bgColor,
  };
}
