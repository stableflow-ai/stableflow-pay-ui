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

Every add, change, or removal of a public component or widget ships documentation in the same change. Do not leave the docs for a follow-up. A prop, slot, default class, or behavior change counts. A comment-only edit does not.

UI components and widgets use different docs. Do not put a widget page under `doc/components/`.

`pay-ui`:

1. Create or update `doc/components/<name>.md`: import path, props, className slots, and default look when that look changes.
2. Append an entry under `Unreleased` in `doc/components/CHANGELOG.md`.
3. Add or update the matching demo page under the UI menu.

`pay-widgets`:

1. Create or update `doc/widgets/<name>.md`. Cover the data boundary (provider props, callbacks, config the widget loads) as well as the dialog props and className slots.
2. Append an entry under `Unreleased` in `doc/widgets/CHANGELOG.md`.
3. Add or update the matching demo page under the Widgets menu.

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
