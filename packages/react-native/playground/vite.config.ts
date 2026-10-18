import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { coreAlias } from "../../core/config/lib.ts";

const path = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

// Every component in the browser through react-native-web, compiled from source
// (npm run playground:react-native). A quick look at the skins; the real check is a
// device or simulator (Expo Go loads the same components).
export default defineConfig({
  root: path("."),
  plugins: [react()],
  resolve: {
    alias: [
      ...coreAlias,
      {
        find: "@surface-one/react-native/skins",
        replacement: path("../src/skins.ts"),
      },
      {
        find: "@surface-one/react-native",
        replacement: path("../src/index.ts"),
      },
      { find: /^react-native$/, replacement: "react-native-web" },
      {
        find: /^react-native-svg$/,
        replacement: path(
          "../../../node_modules/react-native-svg/lib/module/index.js",
        ),
      },
      {
        find: "@react-native/assets-registry/registry",
        replacement: path("../test/stubs/assets-registry.ts"),
      },
    ],
    extensions: [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ".tsx",
      ".ts",
      ".mjs",
      ".js",
      ".json",
    ],
  },
  define: { __DEV__: "true" },
  // react-native-svg's native modules import names react-native-web does not have.
  build: { rollupOptions: { shimMissingExports: true } },
  optimizeDeps: {
    rolldownOptions: {
      shimMissingExports: true,
      resolve: { extensions: [".web.js", ".js", ".mjs", ".json"] },
    },
  },
  server: { port: 5177 },
});
