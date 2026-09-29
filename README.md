# StableFlow Pay UI

Presentational components and business widgets for StableFlow Pay. `@stableflow/pay-ui` has no business types, HTTP clients, wallets, or stores. `@stableflow/pay-widgets` receives data through props, callbacks, or render props.

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
```

## Release

Run from a clean worktree. The script tests, builds, and publishes every public package under `packages/`. It commits and tags locally. It does not push. Do not hand-edit versions. Publishing needs an npm login that can publish `@stableflow`. Add `--dry-run` to print the version, dist-tag, and git tag without publishing. Rules are in [doc/versioning.md](doc/versioning.md).

```bash
pnpm release latest patch          # stable fix, dist-tag latest
pnpm release latest minor          # new or breaking public API before 1.0.0
pnpm release rc                    # x.y.z-rc-<hash>-<date>, dist-tag rc
pnpm release beta                  # x.y.z-beta-<hash>-<date>, dist-tag beta
pnpm release experimental          # 0.0.0-experimental-<hash>-<date>
pnpm release rc --base 0.2.0       # rc or beta from a chosen stable core
```

The deployed demo is [https://ui.pay.stableflow.ai/](https://ui.pay.stableflow.ai/). A push to the connected GitHub repository publishes `apps/demo/dist` through the root [wrangler.jsonc](wrangler.jsonc).

## Docs

- [doc/conventions.md](doc/conventions.md) — coding rules
- [doc/architecture.md](doc/architecture.md) — packages and entries
- [doc/theming.md](doc/theming.md) — Tailwind scan and overrides
- [doc/components/](doc/components/) — one file per UI component
- [doc/components/CHANGELOG.md](doc/components/CHANGELOG.md) — UI component changes
- [doc/widgets/](doc/widgets/) — one file per widget, including its data boundary
- [doc/widgets/CHANGELOG.md](doc/widgets/CHANGELOG.md) — widget changes

When a public component or widget is added, changed, or removed, update its own doc and changelog, and update the demo page in that same change. Widget pages do not go under `doc/components/`.
