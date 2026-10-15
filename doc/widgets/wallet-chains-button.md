# wallet-chains-button

Header control that is either Connect or a stack of chain-kind icons. Import `@stableflow/pay-widgets/wallet-chains-button` and render it inside `PayWidgetsProvider`.

```tsx
import { WalletChainsButton } from "@stableflow/pay-widgets/wallet-chains-button";
```

The widget does not open the drawer itself. Both states call `onClick`.

Accounts and `walletKinds` come from `PayWidgetsProvider`. See [token-select.md](token-select.md) for `walletKinds` and `defaultWalletKindMeta`.

## States

When no kind in the set has an address, the control is a blue Connect button. The label defaults to `Connect`.

When any kind has an address, the control shows every kind in order: a solid color disc and color icon when that kind is connected, a dashed gray disc and gray icon when it is not. Icons overlap by 8px, later icons stack above earlier ones, and an arrow sits on the right.

`kinds` limits and reorders that set. Omit it to use provider `walletKinds` in that array's order. `className` merges onto the button in either state.

`sol` and `solana` count as the same kind, and `zec` and `zcash` count as the same kind.
