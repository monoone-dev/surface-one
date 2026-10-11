import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (path: string): string =>
  fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// Library build: one ES module per source file (so an app bundles only what it
// imports), `react` external, and every stylesheet — the shared component CSS from
// packages/angular plus the React-only rules — bundled into dist/styles.css.
// Every module that uses state, effects or context keeps its `"use client"` line, so the
// components drop straight into Next.js server components.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    lib: {
      entry: { index: src("index.ts") },
      formats: ["es"],
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^node:/],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
