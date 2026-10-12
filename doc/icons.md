# Icons

Import one icon at a time:

```ts
import { IconClose } from "@stableflow/pay-ui/icons/outline/close";
import { IconLock } from "@stableflow/pay-ui/icons/solid/lock";
```

`icons/types` stays at `@stableflow/pay-ui/icons/types`.

Icons are inline SVG elements with `currentColor` and the `sfp-icon` class. Size and color come from `className` and `style`.

Outline and solid are visual styles. The choice does not follow whether the SVG uses `fill` or `stroke`. When the same glyph exists in both styles, the outline export adds an `Outline` suffix (`IconDatabaseOutline`, `IconDurationOutline`).

## Outline

- `alert`
- `all-networks`
- `arrow-down`
- `back`
- `bonus`
- `book`
- `calendar`
- `cash`
- `check`
- `chevron`
- `close`
- `cloud`
- `code`
- `copy`
- `database` (`IconDatabaseOutline`)
- `delete`
- `down`
- `download`
- `duration` (`IconDurationOutline`)
- `email`
- `expense`
- `expense-user`
- `eye-hidden` (`IconEyeHidden`)
- `flask`
- `grants`
- `guard`
- `history`
- `import-file`
- `key`
- `kol-mkt`
- `link` (`IconLink`, `IconOutLink`, `IconExportLink`)
- `loading`
- `logout`
- `member`
- `meno`
- `menu`
- `more`
- `office`
- `operations`
- `otc-treasury`
- `outsourcing`
- `overview`
- `pay`
- `payroll`
- `plus`
- `private`
- `processing`
- `procurement`
- `question`
- `receipt`
- `records` (`IconRecords`, `IconRecords2`)
- `refresh`
- `reimbursement`
- `remove`
- `request`
- `reset-password`
- `search`
- `setting`
- `settings`
- `shield`
- `support`
- `swap`
- `team`
- `to-right` (`Icon2Right`)
- `trends` (`IconTrends`)
- `up` (`IconUp`, `IconBatchUp`)
- `wallet`
- `webhooks`

## Solid

- `alert-circle`
- `database` (`IconDatabase`)
- `duration` (`IconDuration`, `IconDuration2`)
- `eye` (`IconEye`)
- `fee`
- `field-error`
- `google`
- `lock`
- `money`
- `node`
- `payout-status` (`IconPayoutPending`, `IconPayoutFailed`, `IconPayoutPaid`)
- `pen`
- `success`
