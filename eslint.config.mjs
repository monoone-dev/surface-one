// ESLint for the TypeScript of the repo (stylelint covers the CSS, prettier the formatting):
// the Angular rules of AGENTS.md (sone- prefix, OnPush, signal inputs), the rules of hooks for
// the React and React Native twins, and typescript-eslint's recommended set everywhere.
import angular from "angular-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.generated.*",
      "**/generated/**",
      "packages/angular-mcp/data/**",
      "packages/tokens/css/**",
      "storybook-static/**",
      ".angular/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["packages/angular/**/*.ts"],
    ignores: [
      "**/*.stories.ts",
      "**/*.spec.ts",
      "packages/angular/.storybook/**",
    ],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "sone", style: "kebab-case" },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "sone", style: "camelCase" },
      ],
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-rename": "error",
      // The public outputs follow spartan/ui's names (select, toggle, cancel, submit, load);
      // renaming them would break every app for a rule about DOM-event look-alikes.
      "@angular-eslint/no-output-native": "off",
    },
  },
  {
    files: [
      "packages/react/**/*.{ts,tsx}",
      "packages/react-native/**/*.{ts,tsx}",
      "apps/docs/src/app/demos/react/**/*.tsx",
      "apps/docs/src/app/templates/react/**/*.tsx",
    ],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
