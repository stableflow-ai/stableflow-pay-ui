# Architecture

```text
stableflow-pay-ui/
  apps/demo/                 private Vite app
  packages/pay-ui/           @stableflow/pay-ui
  packages/pay-widgets/      @stableflow/pay-widgets
  scripts/release.mjs
```

`pay-widgets` is a public package. It is published with `pay-ui` on the next `pnpm release`, which writes both packages to the same version. Token select is `@stableflow/pay-widgets/token-select`.

## Entries

There is no package root export. Each public component, icon, and the internal `overlay` entry is its own `exports` path.

Importing `@stableflow/pay-ui/button` loads Button and the icons Button renders. It does not load Table or Dialog. Dialog may load Drawer because the narrow viewport renders a bottom drawer. That is an implementation dependency. Styles are Tailwind classes in the JavaScript. The host scan is documented in [theming.md](theming.md).

`pay-ui` source imports icons by relative path. tsup code-splits so a component chunk references only the icon modules it imports.

## Demo

`pnpm dev` starts `apps/demo`. Vite aliases package specifiers to TypeScript source, so component edits show up without a package build.

The deployed demo is [https://ui.pay.stableflow.ai/](https://ui.pay.stableflow.ai/). A push to the connected GitHub repository publishes `apps/demo/dist` through the root `wrangler.jsonc`.

## Data boundary

Widgets receive wallet actions, balance readers, and config callbacks through props. They do not read application stores. Token select loads `GET /v1/pay/config` itself and keeps balances in memory.
