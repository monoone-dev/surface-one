// The features of a page section, with no framework in it: the Angular page section and
// features, the Vue and React twins (through @surface-one/core) read it.
import type { ShellIcon } from "@surface-one/angular/icon";

/** One feature of a page section: an icon, a title, a line of copy, an optional link. */
export interface PageFeatureItem {
  readonly title: string;
  readonly description?: string;
  /** A SurfaceOne glyph in a tile before the copy. */
  readonly icon?: ShellIcon;
  /** Makes the whole feature a link (its title is the link text). */
  readonly href?: string;
}

export type PageSectionOrientation = "vertical" | "horizontal";
export type PageFeatureOrientation = "vertical" | "horizontal";

/** The features' heading level under a section heading of `level`: one deeper, at most 6. */
export const pageFeatureLevel = (level: number): 1 | 2 | 3 | 4 | 5 | 6 =>
  Math.min(6, Math.max(1, Math.floor(level) + 1)) as 1 | 2 | 3 | 4 | 5 | 6;
