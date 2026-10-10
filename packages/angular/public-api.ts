/**
 * @surface-one/angular — every component lives in its own secondary entry point,
 * so an app only bundles (and only needs the peer dependencies of) what it imports:
 *
 *   import { SoneButtonDirective } from "@surface-one/angular/button";
 *
 * The primary entry point carries only the package version.
 */
export const VERSION = "0.9.0";
