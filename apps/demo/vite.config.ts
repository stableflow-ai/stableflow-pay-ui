import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@stableflow\/pay-widgets\/(.*)$/,
        replacement: `${root}/packages/pay-widgets/src/$1/index.ts`,
      },
      {
        find: /^@stableflow\/pay-ui\/icons\/(.*)$/,
        replacement: `${root}/packages/pay-ui/src/icons/$1.tsx`,
      },
      {
        find: /^@stableflow\/pay-ui\/(.*)$/,
        replacement: `${root}/packages/pay-ui/src/$1/index.ts`,
      },
    ],
  },
});
