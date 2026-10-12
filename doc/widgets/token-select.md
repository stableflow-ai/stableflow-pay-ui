# token-select

Business widget for picking a pay token. The host passes a flat token list. The widget does not fetch config.

Import `@stableflow/pay-widgets/token-select`.

```tsx
import {
  PayWidgetsProvider,
  TokenSelectDialog,
  mapPayConfigSource,
  normalizePayConfig,
} from "@stableflow/pay-widgets/token-select";
```

Render `TokenSelectDialog` inside `PayWidgetsProvider`. The dialog throws if that provider is missing.

## Provider

`PayWidgetsProvider` is the data boundary. The widget does not read application stores and does not send HTTP requests.

| Prop | Role |
| --- | --- |
| `tokens` | Flat `PayToken[]`. Each token carries its own `chain`. Chains with no token are hidden. |
| `loading` | Shows the empty-list skeleton while the host is still loading tokens. |
| `wallet` | Accounts plus `connect` and `disconnect`. `accounts` is keyed by any chain-kind string. |
| `readBalances` | Async mode. Called with an owner, chain, and token batch. The widget polls while the dialog is open. |
| `getBalance`, `isBalanceLoading` | Sync mode. The widget reads balances from these callbacks and does not poll. `getBalance` should change when balances change so the dialog re-renders. |
| `popularTokens` | `{ blockchain, symbol }` refs for the popular section. |
| `stableSymbols` | Stablecoin order. Defaults to `USDT`, then `USDC`. |
| `chainKindLabels` | Display names for chain kinds. Built-in labels are used when a kind is missing. |
| `onCopyAddress` | Called when the user copies a connected address. |

Pass one balance mode. If both `readBalances` and `getBalance` are set, async `readBalances` is used. If neither is set, development builds log a warning.

Same `blockchain` should use the same `chain` object on every token. `chainsFromTokens(tokens)` keeps the first object when they differ.

```tsx
const tokens = useMemo(
  () => (data ? normalizePayConfig(mapPayConfigSource(data), { chainKinds }) : []),
  [data, chainKinds],
);

<PayWidgetsProvider tokens={tokens} loading={isPending} wallet={wallet} readBalances={readBalances}>
  <TokenSelectDialog open={open} onClose={onClose} onSelect={onSelect} />
</PayWidgetsProvider>
```

`normalizePayConfig` returns `PayToken[]`. `chainKinds` overrides the built-in network code map for that call only. `tokenAssetId(network, symbol, contractAddress)` builds the id used by normalized tokens.

## Views

`role="payer"` with a connected wallet opens on the wallet view (Recently Used, Your Tokens, Popular). A payer with no wallet opens on All Networks. `role="receiver"` opens on All. `lockChainKind` opens on that kind's chain, using the same recent-chain rule as before.

| View | Left rail | Right pane |
| --- | --- | --- |
| `wallet` | Wallet, funded connected chains, All Networks | Recently Used, Your Tokens, Popular |
| `all` | All, then every chain by name | Popular, then every token |
| `rail-chain` | The chain chip | Chain name and wallet status. No back arrow and no slide. |
| `networks` | All Networks selected | Flat chain list, alphabetical, with a chevron |
| `network-chain` | All Networks stays selected | Back arrow, chain name, wallet status |

Payer rail chains are only chains whose kind is connected. EVM chains appear only when they have a balance. They sort by USD, then name. Receiver chains sort by name and do not include All Networks.

Connecting a wallet leaves the current view in place and adds the wallet chip plus that kind's chains. If the current rail chip disappears, a remaining wallet returns to `wallet`; otherwise the view returns to `networks`.

Search replaces the right pane and matches tokens on every chain, not the selected one. Clearing search restores the view.

Only `networks` and `network-chain` slide. Forward: the chain list moves left and fades, the token list enters from the right. Back is the reverse. Reduced motion swaps the panes immediately. Returning to All Networks restores the list scroll position.

## Sorting

Stablecoins sort before gas tokens, then other symbols. Gas is a native asset (empty address, `native`, or the zero address) or `NEAR` on Near. Within a connected payer chain, tokens with a balance sort by USD, then balances still loading, then the priority above. Receiver lists use that priority without balances. Popular stays on the payer wallet view and on receiver All and receiver chain views.

Search folds every EVM chain into one EVM-based group. Other chains stay in their own groups. Tokens inside a group follow the chain-list order. Payer groups sort by the matched tokens' USD, then group name. Receiver groups sort by group name.

## Dialog

| Prop | Role |
| --- | --- |
| `open`, `onClose` | Visibility. |
| `onSelect` | Called with `{ token }` when the user picks a row. |
| `role` | `payer` (default) shows balances. `receiver` hides them. |
| `title` | Defaults to `Select Token`. |
| `selectedAssetId` | Highlights the current row. |
| `balanceOwners` | Extra owner addresses merged over the connected wallet. Used when `role` is `payer`. |
| `allowedBlockchains` | Limits which tokens are shown. `null` shows every token from `tokens`. |
| `lockChainKind` | Locks the picker to one chain kind. |
| `excludeNative` | Hides native assets. |
| `disabledBlockchains`, `disabledReason` | Disables those chains and shows the reason. |

Desktop card is 474px wide, 12px radius, `#fdfdfd` with a `#e0e0e0` border. The header is 56px with a bottom border. Search stays in the header on every view; below 768px it sits on its own row under the header. The rail is 76px. Rows are 66px and hover `#f6f6f6`.

A connected address shows `IconCopy` before disconnect. Copying calls `onCopyAddress`.

Class slots, merged after the defaults: `className` (dialog card), `titleClassName`, `headerClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `railClassName`, `rowClassName`.
