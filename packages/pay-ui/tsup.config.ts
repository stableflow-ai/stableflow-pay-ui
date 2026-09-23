import { readdirSync } from "node:fs";
import { defineConfig } from "tsup";

const componentEntries = readdirSync("src", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !["icons", "lib", "hooks"].includes(entry.name))
  .map((entry) => [`${entry.name}/index`, `src/${entry.name}/index.ts`] as const);

const iconEntries = readdirSync("src/icons")
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => {
    const name = file.replace(/\.tsx$/, "");
    return [`icons/${name}`, `src/icons/${file}`] as const;
  });

export default defineConfig({
  entry: Object.fromEntries([...componentEntries, ...iconEntries]),
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
});
