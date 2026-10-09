import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const src = (path: string): string =>
  fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// Library build: one ES module per source file (so an app bundles only what it
// imports), `vue` external, and every stylesheet — the shared component CSS from
// packages/angular plus the Vue-only rules — bundled into dist/styles.css.
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    lib: {
      entry: {
        index: src("index.ts"),
        "nuxt/module": src("nuxt/module.ts"),
      },
      formats: ["es"],
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [/^vue($|\/)/, /^node:/],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
