# Changelog

## Unreleased

- Replaced component CSS and `--sfp-*` tokens with literal Tailwind classes. Hosts scan the package with `@source`. Pass `className` (and existing slot props) to override.
- Token select matches the v2 dialog: 474px desktop width, gray search field, blue network chips. It accepts `className`, `titleClassName`, `closeClassName`, `contentClassName`, `searchClassName`, `railClassName`, and `rowClassName`.
- Removed `@stableflow/pay-ui/theme.css`.
- Added `@stableflow/pay-widgets/token-select`. The package is public and ships with the next `pnpm release`.
- Dropped duplicate icons `IconCheck2`, `IconMore`, `IconSettings`, and `IconProcessing`.
- Dropped composed status icons `IconAlertCircle`, `IconBack`, `IconFieldError`, `IconPayoutPending`, `IconPayoutFailed`, `IconPayoutPaid`, and `IconSuccess`.
- Input number defaults to a 36px field with 12px horizontal padding.

## 0.0.0

- Initial extraction of Pay UI components, icons, and the token-select widget.
- Styles use `--sfp-*` variables. Defaults match the Stableflow Pay v2/v3 look.
- Public imports are subpaths such as `@stableflow/pay-ui/button` and `@stableflow/pay-ui/icons/close`.
