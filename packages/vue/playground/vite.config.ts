import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { sonePlaygroundConfig } from "../../core/config/lib.ts";

// The playground compiles the package from source (npm run playground -w @surface-one/vue).
export default defineConfig(
  sonePlaygroundConfig({
    url: import.meta.url,
    plugins: [vue()],
    name: "@surface-one/vue",
    port: 5175,
  }),
);
