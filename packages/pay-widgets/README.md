# @stableflow/pay-widgets

Business widgets for Stableflow Pay. Wallet actions, balance readers, and config callbacks come in through props. The package does not read application stores.

Peer dependency: React 19. Install `@stableflow/pay-ui` as well.

## Install

```bash
pnpm add @stableflow/pay-widgets @stableflow/pay-ui
```

## Tailwind

The host must use Tailwind v4 and scan both packages. Without the scan, the widget renders with no styles.

```css
@import "tailwindcss";
@source "../node_modules/@stableflow/pay-ui/dist";
@source "../node_modules/@stableflow/pay-widgets/dist";
```

## Token select

Import `@stableflow/pay-widgets/token-select`. Render `TokenSelectDialog` inside `PayWidgetsProvider`.

`PayWidgetsProvider` requires `wallet` and `readBalances`. It loads pay config from `https://api.stableflow.ai` unless `apiHost` is set.

```tsx
import {
  PayWidgetsProvider,
  TokenSelectDialog,
} from "@stableflow/pay-widgets/token-select";

export function Picker() {
  return (
    <PayWidgetsProvider wallet={wallet} readBalances={readBalances}>
      <TokenSelectDialog open={open} onClose={onClose} onSelect={onSelect} />
    </PayWidgetsProvider>
  );
}
```
