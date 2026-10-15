import { Button } from "@stableflow/pay-ui/button";
import { MyWalletsDrawer } from "@stableflow/pay-widgets/my-wallets";
import { WalletChainsButton } from "@stableflow/pay-widgets/wallet-chains-button";
import { Page } from "./theme";
import { WalletDemo } from "./wallet-demo";

export function MyWalletsPage() {
  return (
    <Page title="My Wallets">
      <WalletDemo pagePath="/my-wallets">
        {({ open, setOpen, onSelectToken, getTokenDisabledReason }) => (
          <>
            <WalletChainsButton onClick={() => setOpen(true)} />
            <Button onClick={() => setOpen(!open)}>{open ? "Close drawer" : "Open drawer"}</Button>
            <MyWalletsDrawer
              open={open}
              onClose={() => setOpen(false)}
              onSelectToken={onSelectToken}
              getTokenDisabledReason={getTokenDisabledReason}
              renderKindBadge={(kind) => (kind === "solana" ? (
                <span className="rounded-[6px] bg-white px-1.5 py-0.5 text-[10px] text-[#444C59]">Squads</span>
              ) : null)}
              renderKindExtra={(kind) => (kind === "solana" ? (
                <span className="text-[12px] text-[#444C59]">Pay from Squads</span>
              ) : null)}
            />
          </>
        )}
      </WalletDemo>
    </Page>
  );
}
