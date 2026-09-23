import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "token-select/index": "src/token-select/index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: [/^react($|\/)/, /^@stableflow\/pay-ui($|\/)/],
});
