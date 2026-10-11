// The repository's own stylelint config: the shared design-system rules
// (packages/stylelint-config, published as @surface-one/stylelint-config) plus the
// exemptions that only make sense here.
import { tokenFiles } from "@surface-one/stylelint-config/tokens";

/** @type {import("stylelint").Config} */
export default {
  extends: ["@surface-one/stylelint-config"],
  ignoreFiles: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.angular/**",
    "test-results/**",
    "playwright-report/**",
    "packages/tokens/css/**",
    // Generated from packages/angular on every Vue / React build; linting the Angular sources covers it.
    "packages/*/src/styles/hosts.generated.css",
  ],
  overrides: [
    // Token definition files: the skins (generated from packages/tokens/src/definitions) and
    // the shared scale, layout, typography and accent files are where raw values get their names.
    tokenFiles([
      "packages/tokens/src/themes/**",
      "packages/tokens/src/tokens/**",
    ]),
  ],
};
