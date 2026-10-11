import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { sonePlaygroundConfig } from "../../core/config/lib.ts";

// The playground compiles the package from source (npm run playground -w @surface-one/react).
export default defineConfig(
  sonePlaygroundConfig({
    url: import.meta.url,
    plugins: [react()],
    name: "@surface-one/react",
    port: 5176,
  }),
);
