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
| `loading` | While true, payer sections show skeleton rows instead of tokens. |
| `wallet` | Accounts plus `connect` and `disconnect`. `accounts` is keyed by any chain-kind string. |
| `readBalances` | Async mode. Called with an owner, chain, and token batch. The widget polls while the dialog is open. |
| `getBalance`, `isBalanceLoading` | Sync mode. The widget reads balances from these callbacks and does not poll. `getBalance` should change when balances change so the dialog re-renders. |
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

The chain selector defaults to All. `lockChainKind` opens on that kind's chain, using the same recent-chain rule as before. Reopening the dialog resets the chain to All (or the locked chain) and clears both search fields.

Search covers every chain while All is selected, and only the selected chain otherwise. A payer keeps the Recently Used cards while searching. Those cards are not filtered by the query. Search results replace the sections under the cards. A receiver has no cards and no section titles.

| Payer section | When it shows |
| --- | --- |
| Recently Used | Up to 5 cards for the current scope. Hidden for a receiver and when the scope has no history. Stays visible during search. Picking a card records Recently Used only. |
| Your Tokens | The scope's wallet kind is connected and at least one token has a positive balance. Hidden while those balances are still loading for the first time. |
| Recent Searches | Up to 5 tokens picked from search results while the query was not empty. Hidden when empty. Clear removes every stored search on All, or only the selected chain's searches. |
| Trends Token | `TRENDS_TOKENS` that match the scope (`blockchain` + `symbol`, case-insensitive), then the other tokens in that scope. |

A receiver shows one flat list of every token in the scope. It does not record token history. It still calls `setLastBlockchain`.

Wallet connect, copy, and disconnect stay on `PayWidgetsProvider` and are not rendered.

While `loading` is true the payer shows skeleton cards when the scope already has Recently Used records, then section titles with skeleton rows: Your Tokens (2, when a wallet is connected), Recent Searches (2, when that history exists), and Trends Token (6). A row that already has a balance keeps that amount on refresh. The spinner shows only while that row has no balance yet.

## Sorting

Stablecoins sort before gas tokens, then other symbols. Gas is a native asset (empty address, `native`, or the zero address) or `NEAR` on Near. That order is `compareTokensByPriority`. A receiver's flat list uses it. The tokens appended under Trends Token use it on All. On a selected chain they use `sortTokensForChain` (balance order when that chain kind has an address).

Search results are a flat list. A payer sorts them with `sortTokensByBalance`: positive USD high to low, then balances still loading, then zero or unknown. Ties sort by symbol, then chain name. A receiver sorts by symbol, then chain name. An empty result says "No tokens found".

The chain menu puts All first, then chains with a blue dot, then the rest by name. Dotted chains sort by USD, then name. A blue dot is payer-only and matches the old rail: an EVM chain needs a connected wallet and a positive balance; any other chain needs only a connected wallet. A chain search with no matches says "No networks found".

Disabled chains (`lockChainKind` or `disabledBlockchains`) use `opacity-40` and `cursor-not-allowed`. All stays selectable. Desktop shows the reason in a tooltip. Below 768px the reason is 12px text under the chain name. Tokens on a locked kind stay in the list and stay disabled.

The All button's 2x2 preview takes `eth` (or the first EVM chain when `eth` is absent), then `near`, `sol`, and `tron`. Fewer than four are filled from the remaining EVM chains by name. Four or fewer chains are all shown.

Token logos in rows, Recently Used cards, and search results use `LazyImage`. A missing or failed image falls back to `default_icon.png`. The image request starts when the logo enters the viewport.

## Dialog

| Prop | Role |
| --- | --- |
| `open`, `onClose` | Visibility. |
| `onSelect` | Called with `{ token }` when the user picks a card or a row. |
| `role` | `payer` (default) shows balances and the payer sections. `receiver` hides balances and section titles. |
| `title` | Defaults to `Select Token`. |
| `selectedAssetId` | Highlights the current row. |
| `balanceOwners` | Extra owner addresses merged over the connected wallet. Used when `role` is `payer`. |
| `allowedBlockchains` | Limits which tokens are shown. `null` shows every token from `tokens`. |
| `lockChainKind` | Locks selectable chains to one chain kind. All stays selectable. |
| `excludeNative` | Hides native assets. |
| `disabledBlockchains`, `disabledReason` | Disables those chains and shows the reason. |

The desktop card is 448px wide, 12px radius, `#fdfdfd`, with a `#e0e0e0` border. The title is 18px semibold black. The title row has no bottom border, and the title and close button sit 24px from the edges. The token search field is in the content, 50px tall, next to a 70px chain button. Below 768px the dialog is a bottom drawer, the chain list opens in a nested bottom drawer titled "Select Network", and the cards use a 5-column grid with an 8px gap and a fixed 72px height.

`wallet.connect`, `wallet.disconnect`, and `onCopyAddress` remain on the provider for a later wallet row. They are not shown in the dialog.

Class slots, merged after the defaults: `className` (dialog card), `titleClassName`, `headerClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `rowClassName`.
