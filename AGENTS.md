# Agent Guide

Read these documents before changing this repository:

- [doc/conventions.md](doc/conventions.md)
- [doc/architecture.md](doc/architecture.md)
- [doc/versioning.md](doc/versioning.md)
- [doc/theming.md](doc/theming.md)
- [doc/icons.md](doc/icons.md)

## Hard rules

- English only in source, comments, and docs.
- Public components and icons are subpath exports. Do not add a root barrel that loads every component or every icon.
- Components use literal Tailwind classes. Override them with `className`. Do not add component CSS or `--sfp-*` variables.
- Hosts must `@source` this package. See [doc/theming.md](doc/theming.md).
- `pay-ui` has no business types, HTTP clients, wallets, or stores. `pay-widgets` receives data through props, callbacks, or render props.
- Publish only through `pnpm release`. Do not hand-edit versions and run `npm publish`.
