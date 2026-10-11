// @surface-one/stylelint-config/tokens — the exemption for token DEFINITION files.
//
// Token files (the skins and the scale that set --space-*, --radius-*, --accent, … to raw
// values) are the one place raw values belong, so every raw-value rule of the main config is
// off there. Spread it into `overrides` with the globs of your own token files:
//
//   // stylelint.config.mjs
//   import { tokenFiles } from "@surface-one/stylelint-config/tokens";
//   export default {
//     extends: ["@surface-one/stylelint-config"],
//     overrides: [tokenFiles(["src/styles/tokens/**"])],
//   };

/** The rules of the main config that reject raw values, switched off. */
export const tokenFileRules = {
  "color-no-hex": null,
  "color-named": null,
  "function-disallowed-list": null,
  "declaration-property-unit-disallowed-list": null,
  "declaration-property-value-allowed-list": null,
  "declaration-property-value-disallowed-list": null,
};

/** A stylelint `overrides` entry that exempts `files` (globs) as token definition files. */
export function tokenFiles(files) {
  return { files: [files].flat(), rules: { ...tokenFileRules } };
}

export default tokenFiles;
