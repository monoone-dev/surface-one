/**
 * `@surface-one/react-native/skins` — every skin, one module each, so an app bundles only
 * the ones it imports:
 *
 *   import { studio } from "@surface-one/react-native/skins";
 *   <SurfaceOneProvider skin={studio}>
 *
 * Minimalist (the base layer) is also the default of the main entry.
 */
export { material } from "./theme/generated/material";
export { minimalist } from "./theme/generated/minimalist";
export { neumorphism } from "./theme/generated/neumorphism";
export { paper } from "./theme/generated/paper";
export { studio } from "./theme/generated/studio";
export { surface } from "./theme/generated/surface";
export type { SoneSkin, SoneSkinName } from "./theme/skin";
