/**
 * @surface-one/vue — the SurfaceOne components for Vue 3 and Nuxt. Every export is
 * tree-shakable: import what you use, or `app.use(SurfaceOne)` / the Nuxt module
 * (`@surface-one/vue/nuxt`) to register them all.
 *
 *   import { SoneButton, SoneCard } from "@surface-one/vue";
 *   import "@surface-one/tokens";
 *   import "@surface-one/vue/styles.css";
 */
export const VERSION = "0.9.0";

export * from "./components";
export * from "./component-names";
export * from "./composables/messages";
export { useOverlay, type OverlayOptions } from "./composables/overlay";
export * from "./directives/tooltip";
export * from "./plugin";
export { asProp, definePart, type AsTag } from "./utils/part";

import "./styles.css";
