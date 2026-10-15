import { WalletChainsButton } from "@stableflow/pay-widgets/wallet-chains-button";
import { MyWalletsDrawer } from "@stableflow/pay-widgets/my-wallets";
import { Page } from "./theme";
import { WalletDemo } from "./wallet-demo";

export function WalletChainsButtonPage() {
  return (
    <Page title="Wallet chains button">
      <WalletDemo pagePath="/wallet-chains-button">
        {({ open, setOpen, onSelectToken, getTokenDisabledReason }) => (
          <>
            <WalletChainsButton onClick={() => setOpen(true)} />
            <MyWalletsDrawer
              open={open}
              onClose={() => setOpen(false)}
              onSelectToken={onSelectToken}
              getTokenDisabledReason={getTokenDisabledReason}
            />
          </>
        )}
      </WalletDemo>
    </Page>
  );
}
