# Widget changelog

Widget notes live here. Presentational components stay in [../components/CHANGELOG.md](../components/CHANGELOG.md).

## Unreleased

- DAI is a stablecoin and sorts last among them, after USDT and USDC.
- Chain menu rows use a `#f6f6f6` hover background. Disabled chains keep a transparent hover.
- **Breaking:** Token select drops the network rail, chain drill-in, popular section, and grouped search. The dialog is a 448px card with a chain selector, Recently Used cards, Your Tokens, Recent Searches, and Trends Token. `popularTokens`, `parsePopularTokens`, `PopularTokenRef`, `PaneView`, and `railClassName` are removed. Search results are a flat list.
- **Breaking:** `PayWidgetsProvider` takes a flat `tokens` list (each token includes `chain`) and `loading`. It no longer fetches config. Removed `apiHost`, `onConfig`, `chainKinds`, `usePayConfig`, `usePayConfigSnapshot`, `refetchPayConfig`, and `DEFAULT_API_HOST`. `normalizePayConfig(source, { chainKinds })` returns `PayToken[]`. Hosts that need chains call `chainsFromTokens`.
- **Breaking:** `ChainKind` is any string. Built-in kinds stay on `KNOWN_CHAIN_KINDS`. Pass `chainKindLabels` for custom names.
- **Breaking:** Balances are either async `readBalances` or sync `getBalance` / `isBalanceLoading`.
- Token icons load when the row enters the viewport. A missing or failed CDN image falls back to `default_icon.png`.
- A balance refresh keeps an existing amount on screen and replaces it when the new value arrives. The spinner shows only while a row has no balance yet.
- `wallet.connect`, `wallet.disconnect`, and `onCopyAddress` stay on the provider and are not rendered in the dialog.
- Documented `@stableflow/pay-widgets/token-select` in `doc/widgets/token-select.md`.
- Added `@stableflow/pay-widgets/token-select`. The package is public and ships with the next `pnpm release`.
