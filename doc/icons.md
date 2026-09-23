# Icons

Import one icon at a time:

```ts
import { IconClose } from "@stableflow/pay-ui/icons/close";
```

Icons are inline SVG elements with `currentColor` and the `sfp-icon` class. Size and color come from `className` and `style`.

The set started as the union of the v2 and v3 icon directories. When the same file differed, the v2 geometry was kept and SVG attributes were written as React camelCase props.

Files whose geometry differed from v3: alert, duration, lock, overview.

Duplicate glyphs were dropped: `IconCheck2`, `IconMore` (keep `IconMenu`), `IconSettings` (keep `IconSetting`), and `IconProcessing` (keep `IconLoading`). Status marks that are a glyph plus a colored shape stay out of the set: `IconBack`, `IconFieldError`, `IconPayoutPending`, `IconPayoutFailed`, `IconPayoutPaid`, and `IconSuccess`.

`duration` exports both `IconDuration` and `IconDuration2`. `alert-circle` exports `IconAlertCircle`. `member` exports `IconMember`.

## Names

- `alert`
- `alert-circle`
- `all-networks`
- `arrow-down`
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
- `database`
- `delete`
- `download`
- `duration`
- `email`
- `expense`
- `expense-user`
- `eye`
- `fee`
- `flask`
- `google`
- `grants`
- `guard`
- `history`
- `import-file`
- `key`
- `kol-mkt`
- `link`
- `loading`
- `lock`
- `logout`
- `member`
- `meno`
- `menu`
- `money`
- `node`
- `office`
- `operations`
- `otc-treasury`
- `outsourcing`
- `overview`
- `pay`
- `payment`
- `payroll`
- `pen`
- `plus`
- `procurement`
- `question`
- `receipt`
- `records`
- `refresh`
- `reimbursement`
- `remove`
- `request`
- `reset-password`
- `search`
- `setting`
- `shield`
- `support`
- `swap`
- `team`
- `to-right`
- `up`
- `wallet`
- `webhooks`
