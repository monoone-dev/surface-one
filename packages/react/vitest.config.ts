import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { soneTestConfig } from "../core/config/lib.ts";

export default defineConfig(
  soneTestConfig({
    url: import.meta.url,
    plugins: [react()],
    name: "@surface-one/react",
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
  }),
);
