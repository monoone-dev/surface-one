import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { soneTestConfig } from "../core/config/lib.ts";

const base = soneTestConfig({
  url: import.meta.url,
  plugins: [react()],
  name: "@surface-one/react-native",
  include: ["test/**/*.test.{ts,tsx}"],
  setupFiles: ["./test/setup.ts"],
});

// The components render through react-native-web in jsdom (the same props, the DOM
// with ARIA underneath), so the tests read roles, names and states the way the web
// twins' tests do. react-native-svg ships a web build (`*.web.js`), picked first.
export default defineConfig({
  ...base,
  resolve: {
    alias: [
      {
        find: "@surface-one/react-native/skins",
        replacement: fileURLToPath(new URL("./src/skins.ts", import.meta.url)),
      },
      ...base.resolve.alias,
      { find: /^react-native$/, replacement: "react-native-web" },
      // Its ES build (Node would pick the CommonJS one, which requires the real react-native).
      {
        find: /^react-native-svg$/,
        replacement: fileURLToPath(
          new URL(
            "../../node_modules/react-native-svg/lib/module/index.js",
            import.meta.url,
          ),
        ),
      },
      {
        find: "@react-native/assets-registry/registry",
        replacement: fileURLToPath(
          new URL("./test/stubs/assets-registry.ts", import.meta.url),
        ),
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
  test: {
    ...base.test,
    server: { deps: { inline: [/react-native-svg/, /react-native-web/] } },
  },
});
