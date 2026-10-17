import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

import { soneTestConfig } from "../core/config/lib.ts";

export default defineConfig(
  soneTestConfig({
    url: import.meta.url,
    plugins: [vue()],
    name: "@surface-one/vue",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
  }),
);
