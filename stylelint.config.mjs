// The repository's own stylelint config: the shared design-system rules
// (packages/stylelint-config, published as @surface-one/stylelint-config) plus the
// exemptions that only make sense here.
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
    // Generated from packages/angular on every Vue build; linting the Angular sources covers it.
    "packages/vue/src/styles/hosts.generated.css",
  ],
  overrides: [
    {
      // Token definition files: the skins (light/dark × every skin) and the shared scale,
      // layout, typography and accent files are where the raw values are given their names.
      files: ["packages/tokens/src/themes/**", "packages/tokens/src/tokens/**"],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "function-disallowed-list": null,
        "declaration-property-unit-disallowed-list": null,
        "declaration-property-value-allowed-list": null,
        "declaration-property-value-disallowed-list": null,
      },
    },
  ],
};
