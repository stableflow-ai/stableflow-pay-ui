# Widget changelog

Widget notes live here. Presentational components stay in [../components/CHANGELOG.md](../components/CHANGELOG.md).

## Unreleased

- All Networks folds EVM chains into an `EVM-based` card. The card shows Connect or the address, copy, and disconnect, and `IconArrowDown` expands the selectable chains. Collapsed, the card stacks 16px chain icons and clips any that do not fit.
- A connected wallet shows `IconCopy` before disconnect. Copying calls `onCopyAddress`.
- Documented `@stableflow/pay-widgets/token-select` in `doc/widgets/token-select.md`.
- Token select matches the v2 dialog: 474px desktop width, gray search field, blue network chips. It accepts `className`, `titleClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `railClassName`, and `rowClassName`.
- Added `@stableflow/pay-widgets/token-select`. The package is public and ships with the next `pnpm release`.
