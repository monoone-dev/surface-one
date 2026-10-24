/**
 * `@surface-one/react-native/skins` — every skin, one module each, so an app bundles only
 * the ones it imports:
 *
 *   import { surface } from "@surface-one/react-native/skins";
 *   <SurfaceOneProvider skin={surface}>
 *
 * Minimalist (the base layer) is also the default of the main entry. Metro does not
 * tree-shake, so this barrel loads all six skins (~45 KB each); import one skin by its own
 * path to ship only that one:
 *
 *   import { surface } from "@surface-one/react-native/skins/surface";
 */
export { linen } from "./theme/generated/linen";
export { minimalist } from "./theme/generated/minimalist";
export { neumorphism } from "./theme/generated/neumorphism";
export { paper } from "./theme/generated/paper";
export { studio } from "./theme/generated/studio";
export { surface } from "./theme/generated/surface";
export type { SoneSkin, SoneSkinName } from "./theme/skin";
