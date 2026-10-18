/**
 * @surface-one/react — the SurfaceOne components for React 19 and Next.js. Every export
 * is tree-shakable: import what you use.
 *
 *   import { SoneButton, SoneCard } from "@surface-one/react";
 *   import "@surface-one/tokens";
 *   import "@surface-one/react/styles.css";
 */
export const VERSION = "0.20.0";

export * from "./components";
export * from "./context/messages";
export { useSoneLogoAssetBase } from "./context/logo-assets";
export * from "./provider";
export { useControllable } from "./utils/controllable";
export * from "./tooltip";
export { cx, definePart, type PolymorphicProps } from "./utils/part";

import "./styles.css";
