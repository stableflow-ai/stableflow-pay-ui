import { useEffect, useState } from "react";
import { Button } from "@stableflow/pay-ui/button";
import { WalletSelectDialog, type WalletSelectOption } from "@stableflow/pay-widgets/wallet-select";

type DemoState = "mixed" | "connecting" | "loading" | "empty" | "long";

const DEMO_STATES: DemoState[] = ["mixed", "connecting", "loading", "empty", "long"];

function icon(letter: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="42" text-anchor="middle" font-size="28" fill="white" font-family="sans-serif">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MIXED_WALLETS: WalletSelectOption[] = [
  {
    id: "phantom",
    name: "Phantom",
    description: "phantom.app",
    icon: icon("P", "#AB9FF2"),
    detected: true,
  },
  {
    id: "solflare",
    name: "Solflare",
    description: "solflare.com",
    icon: icon("S", "#FC7227"),
    detected: false,
    installUrl: "https://example.com/solflare",
  },
  {
    id: "backpack",
    name: "Backpack",
    detected: true,
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Hardware wallet",
    icon: icon("L", "#111111"),
    detected: true,
  },
];

const LONG_WALLETS: WalletSelectOption[] = Array.from({ length: 12 }, (_, index) => ({
  id: `wallet-${index + 1}`,
  name: `Wallet ${index + 1}`,
  description: `wallet-${index + 1}.example`,
  icon: index % 4 === 0 ? null : icon(String(index + 1), index % 2 === 0 ? "#3D6FFF" : "#111111"),
  detected: index % 3 === 0,
  installUrl: index % 3 === 0 ? undefined : "https://example.com/install",
}));

function walletsFor(state: DemoState): WalletSelectOption[] {
  if (state === "empty" || state === "loading") return [];
  if (state === "long") return LONG_WALLETS;
  return MIXED_WALLETS;
}

function readState(search: string): DemoState {
  const value = new URLSearchParams(search).get("state");
  return DEMO_STATES.includes(value as DemoState) ? (value as DemoState) : "mixed";
}

export function WalletSelectPage() {
  const [state, setState] = useState<DemoState>(() => readState(window.location.search));
  const [open, setOpen] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("state", state);
    const next = `${window.location.pathname}?${params.toString()}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next !== current) window.history.replaceState(null, "", next);
  }, [state]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {DEMO_STATES.map((item) => (
          <Button
            key={item}
            onClick={() => {
              setState(item);
              setOpen(true);
              setNotice("");
            }}
          >
            {item}
          </Button>
        ))}
        <Button onClick={() => setOpen(true)}>Open</Button>
      </div>
      <p className="mt-3">State: {state}{notice ? ` · ${notice}` : ""}</p>
      <WalletSelectDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Select Solana Wallet"
        wallets={walletsFor(state)}
        loading={state === "loading"}
        connectingId={state === "connecting" ? "phantom" : null}
        onSelect={(wallet) => {
          setNotice(`Selected ${wallet.name}`);
          setOpen(false);
        }}
      />
    </div>
  );
}
