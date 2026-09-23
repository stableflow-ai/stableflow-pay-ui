import { useState } from "react";
import { Button } from "@stableflow/pay-ui/button";
import {
  PayWidgetsProvider,
  TokenSelectDialog,
  usePayConfig,
  type ChainKind,
  type PayToken,
  type ReadBalances,
} from "@stableflow/pay-widgets/token-select";

const POPULAR = [
  { blockchain: "eth", symbol: "USDT" },
  { blockchain: "sol", symbol: "USDC" },
];

const readBalances: ReadBalances = async (batch) => batch.tokens.map((token) => ({
  assetId: token.assetId,
  raw: "1000000",
  formatted: "1",
}));

export function TokenSelectPage() {
  return (
    <PayWidgetsProvider
      popularTokens={POPULAR}
      wallet={{
        accounts: {
          evm: { address: "0x1111111111111111111111111111111111111111", canDisconnect: true },
        },
        connect: (kind: ChainKind) => {
          console.info("connect", kind);
        },
        disconnect: (kind: ChainKind) => {
          console.info("disconnect", kind);
        },
      }}
      readBalances={readBalances}
      onCopyAddress={(address) => {
        console.info("copy", address);
      }}
    >
      <TokenSelectExamples />
    </PayWidgetsProvider>
  );
}

function TokenSelectExamples() {
  const config = usePayConfig();
  const [payerOpen, setPayerOpen] = useState(false);
  const [receiverOpen, setReceiverOpen] = useState(false);
  const [payer, setPayer] = useState<PayToken | null>(null);
  const [receiver, setReceiver] = useState<PayToken | null>(null);

  return (
    <div>
      <p>Config: {config.status} · {config.tokens.length} tokens</p>
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
