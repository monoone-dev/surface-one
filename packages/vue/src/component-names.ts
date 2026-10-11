// Every component the package exports, by name (the list is shared with the React
// package): the Nuxt module registers these for auto-import without loading the
// components at build time. test/exports.test.ts keeps it in step with
// src/components/index.ts.
export {
  SONE_COMPONENT_NAMES,
  type SoneComponentName,
} from "@surface-one/core";
