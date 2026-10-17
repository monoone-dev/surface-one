import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { soneLibConfig } from "../core/config/lib.ts";

// The shared library build (packages/core/config/lib.ts) with `react` external; every
// stylesheet — the shared component CSS from packages/angular plus the React-only rules
// — lands in dist/styles.css. Every module that uses state, effects or context keeps
// its `"use client"` line, so the components drop straight into Next.js server
// components.
export default defineConfig(
  soneLibConfig({
    url: import.meta.url,
    plugins: [react()],
    entries: { index: "index.ts" },
    external: [/^react($|\/)/, /^react-dom($|\/)/, /^marked$/, /^dompurify$/],
  }),
);
