import { useMemo, useState } from "react";
import { Button } from "@stableflow/pay-ui/button";
import {
  PayWidgetsProvider,
  TokenSelectDialog,
  usePayConfig,
  type ChainKind,
  type PayToken,
  type PayWallet,
  type ReadBalances,
} from "@stableflow/pay-widgets/token-select";

const POPULAR = [
  { blockchain: "eth", symbol: "USDT" },
  { blockchain: "sol", symbol: "USDC" },
];

const DEMO_ADDRESSES: Record<ChainKind, string> = {
  evm: "0x1111111111111111111111111111111111111111",
  near: "demo.token-select.near",
  solana: "So1anaDemoAddress111111111111111111111111111",
  tron: "TDemoTronAddress111111111111111111111",
  zec: "t1DemoZcashAddress111111111111111111111",
};

const readBalances: ReadBalances = async (batch) => batch.tokens.map((token) => ({
  assetId: token.assetId,
  raw: "1000000",
  formatted: "1",
}));

export function TokenSelectPage() {
  const [accounts, setAccounts] = useState<PayWallet["accounts"]>({
    evm: { address: DEMO_ADDRESSES.evm, canDisconnect: true },
  });
  const [notice, setNotice] = useState("");
  const wallet = useMemo<PayWallet>(() => ({
    accounts,
    connect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { address: "", connecting: true, canDisconnect: true },
      }));
      window.setTimeout(() => {
        setAccounts((current) => ({
          ...current,
          [kind]: { address: DEMO_ADDRESSES[kind], connecting: false, canDisconnect: true },
        }));
        setNotice(`Connected ${kind}`);
      }, 400);
    },
    disconnect: (kind) => {
      setAccounts((current) => ({
        ...current,
        [kind]: { address: "", connecting: false, canDisconnect: true },
      }));
      setNotice(`Disconnected ${kind}`);
    },
  }), [accounts]);

  return (
    <PayWidgetsProvider
      popularTokens={POPULAR}
      wallet={wallet}
      readBalances={readBalances}
      onCopyAddress={(address) => {
        setNotice(`Copied ${address}`);
        void navigator.clipboard.writeText(address).catch(() => undefined);
      }}
    >
      <TokenSelectExamples notice={notice} />
    </PayWidgetsProvider>
  );
}

function TokenSelectExamples(props: { notice: string }) {
  const config = usePayConfig();
  const [payerOpen, setPayerOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [payer, setPayer] = useState<PayToken | null>(null);
  const [receiver, setReceiver] = useState<PayToken | null>(null);

  return (
    <div>
      <p>Config: {config.status} · {config.tokens.length} tokens</p>
      {props.notice ? <p>{props.notice}</p> : null}
      <Button onClick={() => setPayerOpen(true)} className="mt-2">Payer: {payer?.symbol ?? "Select"}</Button>
      <Button onClick={() => setReceiverOpen(true)} className="ml-2 mt-2">Receiver: {receiver?.symbol ?? "Select"}</Button>
      <TokenSelectDialog
        open={payerOpen}
        role="payer"
        onClose={() => setPayerOpen(false)}
        selectedAssetId={payer?.assetId}
        onSelect={({ token }) => setPayer(token)}
      />
      <TokenSelectDialog
        open={receiverOpen}
        role="receiver"
        title="Receiving token"
        onClose={() => setReceiverOpen(false)}
        selectedAssetId={receiver?.assetId}
        onSelect={({ token }) => setReceiver(token)}
        className="md:w-[420px]"
      />
    </div>
  );
}
