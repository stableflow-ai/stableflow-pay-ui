# Conventions

## Language

Code, comments, identifiers, user-facing copy, and documentation are English only.

## Packages

- `@stableflow/pay-ui` holds presentational components and icons.
- `@stableflow/pay-widgets` holds business widgets. Import `@stableflow/pay-widgets/<name>`. It does not read application stores.

## Components

- One directory per public component: `packages/pay-ui/src/<name>/`.
- Constants (enums, breakpoints, default copy) go in a sibling `config.ts` using `UPPER_SNAKE_CASE`.
- Class names stay in the component as complete Tailwind string literals. Do not put class strings in `config.ts`, and do not build them by concatenation.
- A public component exports a subpath `@stableflow/pay-ui/<name>`.
- Inside `pay-ui`, import icons and sibling components by relative path.
- `pay-widgets` and the demo import `@stableflow/pay-ui/<name>` or `@stableflow/pay-ui/icons/<name>`.
- `overlay` is internal. Feature code and widgets should not add new imports from `@stableflow/pay-ui/overlay`.

When a public component is added or changed:

1. Update `doc/components/<name>.md`.
2. Append an entry to `doc/components/CHANGELOG.md`.
3. Add or update a demo page.

## Icons

- Icons live only in `packages/pay-ui/src/icons/`.
- Each icon is `@stableflow/pay-ui/icons/<file-name>` and exports `IconXxx`.
- Do not add an export that re-exports every icon.
- New icons are inline SVG, `currentColor`, root class `sfp-icon`.
- Record the icon in `doc/icons.md` and on the demo icons page.

## Styling

- Published components use literal Tailwind classes. Merge overrides with `cn` so `className` wins conflicts.
- Do not add component CSS files or `--sfp-*` variables.
- Hosts must `@source` the package. See [theming.md](theming.md).

## Tests

- Vitest covers pure helpers and overlay behavior.
- `pnpm check` must stay green.
