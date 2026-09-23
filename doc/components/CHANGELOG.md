# Changelog

## Unreleased

- Added `IconAlertCircle` (`icons/alert-circle`), `IconMember` (`icons/member`), and `IconDuration2` (second export of `icons/duration`).
- Replaced component CSS and `--sfp-*` tokens with literal Tailwind classes. Hosts scan the package with `@source`. Pass `className` (and existing slot props) to override.
- Removed `@stableflow/pay-ui/theme.css`.
- Dropped duplicate icons `IconCheck2`, `IconMore`, `IconSettings`, and `IconProcessing`.
- Dropped composed status icons `IconBack`, `IconFieldError`, `IconPayoutPending`, `IconPayoutFailed`, `IconPayoutPaid`, and `IconSuccess`.
- Input number defaults to a 36px field with 12px horizontal padding.

## 0.0.0

- Initial extraction of Pay UI components and icons.
- Styles use `--sfp-*` variables. Defaults match the Stableflow Pay v2/v3 look.
- Public imports are subpaths such as `@stableflow/pay-ui/button` and `@stableflow/pay-ui/icons/close`.
