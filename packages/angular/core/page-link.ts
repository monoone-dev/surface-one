// The links of the page blocks (hero, section, pricing plan, footer), with no framework
// in it: Angular, and the Vue and React twins through @surface-one/core, render them the
// same way.
import type { ShellIcon } from "@surface-one/angular/icon";

export type PageLinkVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type PageLinkSize = "sm" | "default" | "lg";

/** A call to action of a page block: a link drawn as a button. */
export interface PageLink {
  readonly label: string;
  readonly href: string;
  /** The button look; the first link of a block is `default`, the others `outline`. */
  readonly variant?: PageLinkVariant;
  readonly size?: PageLinkSize;
  /** A glyph before the label. */
  readonly icon?: ShellIcon;
  /** A glyph after the label (`arrow-right`). */
  readonly trailingIcon?: ShellIcon;
  readonly target?: string;
  readonly rel?: string;
}

/** The link's button variant: its own, else `default` for the first and `outline` after. */
export const pageLinkVariant = (
  link: PageLink,
  index: number,
): PageLinkVariant => link.variant ?? (index === 0 ? "default" : "outline");

/** The link's `rel`: its own, else `noopener noreferrer` for a new tab. */
export const pageLinkRel = (link: PageLink): string | null =>
  link.rel ?? (link.target === "_blank" ? "noopener noreferrer" : null);
