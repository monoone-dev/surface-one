import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { soneLibConfig } from "../core/config/lib.ts";

// The shared library build (packages/core/config/lib.ts) with `vue` external; every
// stylesheet — the shared component CSS from packages/angular plus the Vue-only rules —
// lands in dist/styles.css.
export default defineConfig(
  soneLibConfig({
    url: import.meta.url,
    plugins: [vue()],
    entries: { index: "index.ts", "nuxt/module": "nuxt/module.ts" },
    external: [
      /^vue($|\/)/,
      // The optional peers of the markdown viewer and the (live) editor.
      /^marked$/,
      /^dompurify$/,
      /^@codemirror\//,
      /^@lezer\//,
    ],
  }),
);
