# Widget changelog

Widget notes live here. Presentational components stay in [../components/CHANGELOG.md](../components/CHANGELOG.md).

## Unreleased

- **Breaking:** `PayWidgetsProvider` takes a flat `tokens` list (each token includes `chain`) and `loading`. It no longer fetches config. Removed `apiHost`, `onConfig`, `chainKinds`, `usePayConfig`, `usePayConfigSnapshot`, `refetchPayConfig`, and `DEFAULT_API_HOST`. `normalizePayConfig(source, { chainKinds })` returns `PayToken[]`. Hosts that need chains call `chainsFromTokens`.
- **Breaking:** `ChainKind` is any string. Built-in kinds stay on `KNOWN_CHAIN_KINDS`. Pass `chainKindLabels` for custom names.
- **Breaking:** Balances are either async `readBalances` or sync `getBalance` / `isBalanceLoading`.
- Payer and receiver token select follow the new views: wallet, All Networks drill-in with a slide, receiver All, and global search. The rail and All Networks keep one entry per chain. Search folds EVM chains into one EVM-based group.
- Token icons load when the row enters the viewport. A missing or failed CDN image falls back to `default_icon.png`.
- A balance refresh keeps an existing amount on screen and replaces it when the new value arrives. The spinner shows only while a row has no balance yet.
- A connected wallet shows `IconCopy` before disconnect. Copying calls `onCopyAddress`.
- Documented `@stableflow/pay-widgets/token-select` in `doc/widgets/token-select.md`.
- Token select matches the v2 dialog: 474px desktop width, gray search field, blue network chips. It accepts `className`, `titleClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `railClassName`, and `rowClassName`.
- Added `@stableflow/pay-widgets/token-select`. The package is public and ships with the next `pnpm release`.
