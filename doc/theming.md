# Theming

Components ship Tailwind class strings, not a CSS file. The host Tailwind v4 build must scan the package or the classes are missing.

```css
@import "tailwindcss";
@source "../node_modules/@stableflow/pay-ui/dist";
@source "../node_modules/@stableflow/pay-widgets/dist";
```

The demo scans package source instead of `dist`, because Vite aliases those imports to TypeScript.

Defaults are literal utilities (`bg-[#FDFDFD]`, `text-[#606060]`, `rounded-[12px]`). They do not read `--sfp-*` variables, and `@stableflow/pay-ui/theme.css` is not published.

Override a surface by passing `className`. `tailwind-merge` keeps the later utility when two classes set the same property. Slot props (`cardClassName`, `inputClassName`, `titleClassName`, `searchClassName`, `railClassName`, `rowClassName`, and the other existing slots) work the same way.

```tsx
<Button className="bg-[#4DA0FF]">Pay</Button>
<Dialog cardClassName="md:w-[420px]" open={open} onClose={onClose} title="Pay">
  ...
</Dialog>
```

Load Montserrat in the host if that face should win. Components also set a Montserrat, PingFang SC, system-ui stack on text, so they stay readable when the host does not.
