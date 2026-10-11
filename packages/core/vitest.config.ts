import { defineConfig } from "vitest/config";

import { coreAlias } from "./config/lib.ts";

export default defineConfig({
  // The parity tests import Vue and React modules, which name core by its package name.
  resolve: { alias: coreAlias },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom",
  },
});
