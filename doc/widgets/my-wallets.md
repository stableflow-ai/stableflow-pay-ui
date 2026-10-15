# my-wallets

Wallet drawer for the connected chain kinds. Import `@stableflow/pay-widgets/my-wallets` and render `MyWalletsDrawer` inside `PayWidgetsProvider`.

```tsx
import { MyWalletsDrawer } from "@stableflow/pay-widgets/my-wallets";
import { PayWidgetsProvider, defaultWalletKindMeta } from "@stableflow/pay-widgets/token-select";
```

The widget does not read application stores. Tokens, accounts, connect, disconnect, copy, and balances come from the provider. Card art comes from `walletKinds` on that provider. `defaultWalletKindMeta` builds the built-in entries.

## Balances

Async mode (`readBalances`) calls `ensurePayTokenBalances` for tokens on connected kinds while the drawer is open, then again every `TOKEN_BALANCE_POLL_MS`. Sync mode reads `getBalance` and `isBalanceLoading` and does not poll. A sync row stays a skeleton while `isBalanceLoading` is true and the amount is still zero or missing.

`formatted` is a plain decimal string with no thousands separators. USD is `Number(formatted) * price`. A row with amount `0` is hidden. Remaining rows sort by USD, high to low. Amounts show up to 4 decimal places, truncated toward zero. USD shows up to 2. While a connected card has no positive row yet and a balance is still loading, the list is a skeleton. After that, an empty list says "No balances".

## Selection

| `onSelectToken` | `getTokenDisabledReason` | Result |
| --- | --- | --- |
| omitted | ignored | The row is not a button. The drawer stays open. |
| set | returns a string | The row is dimmed and does not select. Hover, or a tap on a narrow viewport, shows that string in a tooltip. |
| set | returns `null` or is omitted | Calls `onSelectToken(token)`, then `onClose()`. |

## Layout

The breakpoint is 768px.

Desktop is a floating panel, 320px wide, 10px from the top and the right, with no mask. The page behind it stays usable, including scroll. A collapse tab on the left closes it. The tab uses the chevron icon.

Below 768px the panel is a bottom sheet, height `calc(100% - 70px)`, with a mask. The mask click closes it and the page scroll locks.

The panel is portaled at `z-index: 51`. `WalletSelectDialog` and other pay-ui overlays start at 1010, and wallet portals sit at 10000, so a connect dialog opened from a card paints above the drawer.

pay-ui `Drawer` always locks body scroll and is a full-height edge panel, so this widget composes the panel with `motion` instead.

## Props

| Prop | Role |
| --- | --- |
| `open`, `onClose` | Visibility. |
| `kinds` | Subset and order. Defaults to provider `walletKinds`. |
| `onSelectToken` | Called with the `PayToken` when a row is selectable. |
| `getTokenDisabledReason` | Return a string to disable that token, or `null` to allow it. |
| `renderKindBadge` | Node after the kind label. |
| `renderKindExtra` | Node at the bottom of a connected card. |
| `title` | Connected heading. Defaults to `My Wallets`. |
| `connectTitle` | Heading when nothing in `kinds` is connected. Defaults to `Connect Wallet`. |
| `className` | Merged onto the white card. |

Each kind is one card. A disconnected card shows the gray icon, the label, and Connect. Connect calls `wallet.connect(kind)` and shows a spinner while `accounts[kind].connecting` is true. An EVM card also lists the distinct `chain.logo` values from EVM tokens.

A connected card shows the color icon, the label, and the USD total. The address row shows the wallet icon (or the wallet glyph), `formatAddress`, copy (`onCopyAddress`), and disconnect. Disconnect is hidden when `canDisconnect` is `false`. The address row's arrow expands the holdings. A kind that just connected starts expanded.

`sol` matches `solana` accounts and tokens, and `zec` matches `zcash`.
