# Stableflow Pay UI

Presentational components and business widgets for Stableflow Pay. `@stableflow/pay-ui` has no business types, HTTP clients, wallets, or stores. `@stableflow/pay-widgets` receives data through props, callbacks, or render props.

## Packages

| Package | Import |
| --- | --- |
| `@stableflow/pay-ui` | `@stableflow/pay-ui/<name>`, `@stableflow/pay-ui/icons/<name>` |
| `@stableflow/pay-widgets` | `@stableflow/pay-widgets/<name>` |

There is no root barrel. Import the component you render.

```tsx
import { Button } from "@stableflow/pay-ui/button";
import { TokenSelectDialog } from "@stableflow/pay-widgets/token-select";
```

## Host setup

The host must use Tailwind v4 and scan both packages. Without `@source`, components render with no styles.

```css
@import "tailwindcss";
@source "../node_modules/@stableflow/pay-ui/dist";
@source "../node_modules/@stableflow/pay-widgets/dist";
```

Defaults are literal classes such as `bg-[#FDFDFD]`. Override them with `className` or an existing slot prop (`cardClassName`, `inputClassName`, and the others documented per component). Details are in [doc/theming.md](doc/theming.md).

## Scripts

```bash
pnpm dev      # demo at apps/demo
pnpm check    # tsc
pnpm test
pnpm release  # publish; do not hand-edit versions
```

## Docs

- [doc/conventions.md](doc/conventions.md) — coding rules
- [doc/architecture.md](doc/architecture.md) — packages and entries
- [doc/theming.md](doc/theming.md) — Tailwind scan and overrides
- [doc/components/](doc/components/) — one file per UI component
- [doc/components/CHANGELOG.md](doc/components/CHANGELOG.md) — UI component changes
- [doc/widgets/](doc/widgets/) — one file per widget, including its data boundary
- [doc/widgets/CHANGELOG.md](doc/widgets/CHANGELOG.md) — widget changes

When a public component or widget is added, changed, or removed, update its own doc and changelog, and update the demo page in that same change. Widget pages do not go under `doc/components/`.
