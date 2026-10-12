# dialog

Modal dialog. Viewports below 768px render a bottom drawer.

Import `@stableflow/pay-ui/dialog`.

```ts
import { Dialog } from "@stableflow/pay-ui/dialog";
```

`headerClassName` merges onto the header row (`relative flex shrink-0 items-center gap-3`). Use it for height, padding, and the bottom border. Narrow viewports render a bottom `Drawer`, which receives the same prop.
