export type ChainKind = "evm" | "near" | "solana" | "tron" | "zec";

export const CHAIN_KINDS: readonly ChainKind[] = ["evm", "near", "solana", "tron", "zec"];

export type PayChain = {
  blockchain: string;
  chainName: string;
  chainKind: ChainKind;
  chainId?: string;
  logo: string;
  explorer: string;
};

export type PayToken = {
  assetId: string;
  symbol: string;
  providerSymbol: string;
  blockchain: string;
  decimals: number;
  contractAddress: string | null;
  price: number;
  logo: string;
  supportPayment: boolean;
  supportReceive: boolean;
  chain: PayChain;
};

/** API-shaped payload. Callers can pass this into their own chain registry. */
export type PayConfigSource = {
  chains: PayConfigSourceChain[];
  tokens: PayConfigSourceToken[];
};

export type PayConfigSourceChain = {
  network: string;
  chainId: string;
  chainName: string;
  logo: string;
  explorer: string;
};

export type PayConfigSourceToken = {
  symbol: string;
  network: string;
  decimals: number;
  contractAddress: string;
  price: string;
  supportPayment: boolean;
  supportReceive: boolean;
};

export type PopularTokenRef = {
  blockchain: string;
  symbol: string;
};

export type WalletAccountInput = {
  address?: string | null;
  icon?: string | null;
  connecting?: boolean;
  /** False inside a Safe App, where the host owns the connection. */
  canDisconnect?: boolean;
};

export type PayWallet = {
  accounts: Partial<Record<ChainKind, WalletAccountInput>>;
  connect: (kind: ChainKind) => void | Promise<void>;
  disconnect: (kind: ChainKind) => void | Promise<void>;
};

export type BalanceReadSuccess = {
  assetId: string;
  formatted: string;
  /** Integer token units, as a decimal string. */
  raw?: string;
};

export type BalanceReadFailure = {
  assetId: string;
  error: string;
};

export type BalanceReadResult = BalanceReadSuccess | BalanceReadFailure;

export type ReadBalances = (batch: {
  owner: string;
  chainKind: ChainKind;
  blockchain: string;
  tokens: PayToken[];
}) => Promise<BalanceReadResult[]>;

export type TokenSelectRole = "payer" | "receiver";

export type ChainOwners = Partial<Record<ChainKind, string>>;

export type TokenBalanceStatus = "idle" | "loading" | "success" | "error";
