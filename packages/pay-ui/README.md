# @stableflow/pay-ui

Presentational React components and inline SVG icons for Stableflow Pay. The package has no business types, HTTP clients, wallets, or stores.

Import each component by its subpath. There is no root barrel.

Peer dependency: React 19.

## Install

```bash
pnpm add @stableflow/pay-ui
```

## Tailwind

The host must use Tailwind v4 and scan this package. Without the scan, components render with no styles.

```css
@import "tailwindcss";
@source "../node_modules/@stableflow/pay-ui/dist";
```

## Use

```tsx
import { Button } from "@stableflow/pay-ui/button";
import { IconClose } from "@stableflow/pay-ui/icons/close";

export function PayButton() {
  return <Button className="bg-[#4DA0FF]">Pay</Button>;
}
```

Icons are `@stableflow/pay-ui/icons/<name>`. Override a default style by passing `className`, or an existing slot such as `cardClassName` or `inputClassName`.
