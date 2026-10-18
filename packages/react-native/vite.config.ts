import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { soneLibConfig } from "../core/config/lib.ts";

// The shared library build (packages/core/config/lib.ts) with React, React Native and
// react-native-svg external. There is no stylesheet: every style is computed from the
// theme (src/theme) at run time. Metro reads the ES modules of dist/ as they are.
export default defineConfig(
  soneLibConfig({
    url: import.meta.url,
    plugins: [react()],
    entries: { index: "index.ts", skins: "skins.ts" },
    external: [
      /^react($|\/)/,
      /^react-native($|\/)/,
      /^react-native-svg($|\/)/,
    ],
  }),
);
