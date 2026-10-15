import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "token-select/index": "src/token-select/index.ts",
    "wallet-select/index": "src/wallet-select/index.ts",
    "wallet-chains-button/index": "src/wallet-chains-button/index.ts",
    "my-wallets/index": "src/my-wallets/index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: [/^react($|\/)/, /^@stableflow\/pay-ui($|\/)/],
});
