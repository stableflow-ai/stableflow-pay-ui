# wallet-select

Presentational wallet list. The host owns discovery, sorting, connect, and signing. The widget does not read a store, call a wallet SDK, or send HTTP.

Import `@stableflow/pay-widgets/wallet-select`. `WalletSelectDialog` does not use `PayWidgetsProvider`.

```tsx
import { WalletSelectDialog, type WalletSelectOption } from "@stableflow/pay-widgets/wallet-select";
```

## Option

| Field | Role |
| --- | --- |
| `id` | Stable row key. `connectingId` matches this value. |
| `name` | Primary label. |
| `icon` | Image URL inside a 40px tile. Missing, blank, or `null` shows a gray placeholder tile. |
| `description` | Subtitle. A missing or blank value uses `name`. |
| `detected` | `true` shows the green DETECTED badge. Omitted does not show the badge and still calls `onSelect`. |
| `installUrl` | Used only when `detected` is `false`. A click opens this URL in a new tab and does not call `onSelect`. A blank URL does nothing. |
| `disabled` | The row does not accept a click. |

The widget renders `wallets` in the given order. It does not sort, filter, or move detected rows to the top.

## Dialog

| Prop | Role |
| --- | --- |
| `open`, `onClose` | Visibility. Below 768px, Dialog renders a bottom drawer. |
| `title` | Header text, for example `Select Solana Wallet`. |
| `wallets` | Rows. |
| `onSelect` | Called with the option after a click that is not an install link, a disabled row, or the connecting row. |
| `connectingId` | That row shows a spinner and ignores clicks. Other rows stay clickable. |
| `loading` | Four skeleton rows. `wallets` and `emptyText` stay hidden. |
| `emptyText` | Shown when `loading` is false and `wallets` is empty. Defaults to `No wallets available`. |
| `footer` | Terms line under the list. The default is `By connecting a wallet, you agree to our Terms of Service and Privacy Policy`. `null` hides the footer. |
| `elevated` | Forwarded to Dialog so the card uses the wallet-portal layer. |

A click closes nothing by itself. The host should close the dialog in `onSelect`, then start connect, so a later wallet popup is not covered by this dialog.

The desktop card is 400px wide. Each row is a 40px icon tile, the name, a subtitle, and an optional DETECTED badge. The list scrolls after 400px. Type and radius follow the Dialog card.

Class slots, merged after the defaults: `className` (dialog card), `listClassName`, `itemClassName`.
