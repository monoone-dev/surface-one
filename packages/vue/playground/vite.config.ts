import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const path = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// The playground compiles the package from source (npm run playground -w @surface-one/vue).
export default defineConfig({
  root: path("."),
  publicDir: path("../../tokens"),
  plugins: [vue()],
  resolve: {
    alias: {
      "@surface-one/vue/styles.css": path("../src/styles.css"),
      "@surface-one/vue": path("../src/index.ts"),
      "@surface-one/tokens": path("../../tokens/css/index.css"),
    },
  },
  server: { port: 5175 },
});
