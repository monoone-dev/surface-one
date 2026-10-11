import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const path = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// The playground compiles the package from source (npm run playground -w @surface-one/react).
export default defineConfig({
  root: path("."),
  publicDir: path("../../tokens"),
  plugins: [react()],
  resolve: {
    alias: {
      "@surface-one/react/styles.css": path("../src/styles.css"),
      "@surface-one/react": path("../src/index.ts"),
      "@surface-one/tokens": path("../../tokens/css/index.css"),
    },
  },
  server: { port: 5176 },
});
