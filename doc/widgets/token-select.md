# token-select

Business widget. It loads pay config, reads balances through a caller callback, and opens a token picker. It is not a presentational component.

Import `@stableflow/pay-widgets/token-select`.

```tsx
import {
  PayWidgetsProvider,
  TokenSelectDialog,
} from "@stableflow/pay-widgets/token-select";
```

Render `TokenSelectDialog` inside `PayWidgetsProvider`. The dialog throws if that provider is missing.

## Provider

`PayWidgetsProvider` is the data boundary. The widget does not read application stores.

| Prop | Role |
| --- | --- |
| `wallet` | Accounts plus `connect` and `disconnect`, keyed by `ChainKind` (`evm`, `near`, `solana`, `tron`, `zec`). |
| `readBalances` | Called with an owner, chain, and token batch. Returns formatted balances or an error per `assetId`. |
| `popularTokens` | `{ blockchain, symbol }` refs for the popular section. |
| `apiHost` | Pay config host. Defaults to `https://api.stableflow.ai`. |
| `onConfig` | Receives the raw config payload after a successful load. |
| `onCopyAddress` | Called when the user copies a connected address. |
| `chainKinds` | Overrides the built-in network code to `ChainKind` map. |

The provider fetches `GET /v1/pay/config` itself and keeps balances in memory.

## Dialog

| Prop | Role |
| --- | --- |
| `open`, `onClose` | Visibility. |
| `onSelect` | Called with `{ token }` when the user picks a row. |
| `role` | `payer` (default) shows balances. `receiver` hides them. |
| `title` | Defaults to `Select Token`. |
| `selectedAssetId` | Highlights the current row. |
| `balanceOwners` | Extra owner addresses merged over the connected wallet. Used when `role` is `payer`. |
| `allowedBlockchains` | Limits the rail. `null` shows every chain from config. |
| `lockChainKind` | Locks the picker to one chain kind. |
| `excludeNative` | Hides native assets. |
| `disabledBlockchains`, `disabledReason` | Disables those chains and shows the reason. |

Desktop default is `md:w-[474px]`, content height `h-[min(520px,62vh)] md:h-[min(555px,70vh)]`, gray search field, and a 72px network rail. Selected chips use `#06f`. Rows hover `#F6F6F6`.

All Networks keeps non-EVM chains as single rows. EVM chains fold into one `EVM-based` card at the first EVM chain's position. The card is not a chain filter. Its second row shows Connect, or the shortened address, a copy button, and disconnect. `IconArrowDown` toggles the chain list and points up while the list is open. Each EVM chain inside the card stays selectable and does not repeat the wallet controls.

A connected address shows `IconCopy` before disconnect. Copying calls `onCopyAddress`.

Class slots, merged after the defaults: `className` (dialog card), `titleClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `railClassName`, `rowClassName`.
