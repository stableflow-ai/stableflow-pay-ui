# Changelog

## Unreleased

- `DateRangePicker` sizes its trigger to the label. While a new start day is selected, the calendar highlights only that day. Closing without an end day restores the previous range.
- **Breaking:** Icon imports are `@stableflow/pay-ui/icons/outline/<name>` or `@stableflow/pay-ui/icons/solid/<name>`. `icons/types` is unchanged. `IconDatabase` moved to `icons/solid/database`; the previous glyph is `IconDatabaseOutline` (`icons/outline/database`). `IconDuration` moved to `icons/solid/duration`; the previous glyph is `IconDurationOutline` (`icons/outline/duration`). `IconDuration2` stays on `icons/solid/duration`. `IconEye` is `icons/solid/eye`. `IconEyeHidden` is `icons/outline/eye-hidden`. Added `IconTrends` (`icons/outline/trends`).
- `SearchInput` accepts `iconClassName` for the leading search icon.
- `Dialog`, `Drawer`, and `OverlayPanel` accept `headerClassName` on the header row.
- Dropped duplicate icon `IconPayment` (keep `IconUp`). Added `IconDown` (`icons/down`) and `IconPrivate` (`icons/private`).
- Added `IconAlertCircle` (`icons/alert-circle`), `IconMember` (`icons/member`), and `IconDuration2` (second export of `icons/duration`).
- Replaced component CSS and `--sfp-*` tokens with literal Tailwind classes. Hosts scan the package with `@source`. Pass `className` (and existing slot props) to override.
- Removed `@stableflow/pay-ui/theme.css`.
- Dropped duplicate icons `IconCheck2`, `IconMore`, `IconSettings`, and `IconProcessing`.
- Dropped composed status icons `IconBack`, `IconFieldError`, `IconPayoutPending`, `IconPayoutFailed`, `IconPayoutPaid`, and `IconSuccess`.
- Input number defaults to a 36px field with 12px horizontal padding.

## 0.0.0

- Initial extraction of Pay UI components and icons.
- Styles use `--sfp-*` variables. Defaults match the StableFlow Pay v2/v3 look.
- Public imports are subpaths such as `@stableflow/pay-ui/button` and `@stableflow/pay-ui/icons/close`.
