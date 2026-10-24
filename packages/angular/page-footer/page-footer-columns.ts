// The link columns of a page footer, with no framework in it: the Angular
// `sone-page-footer`, the Vue and React twins (through @surface-one/core) read it.

export interface PageFooterLink {
  readonly label: string;
  readonly href: string;
  readonly target?: string;
  readonly rel?: string;
}

/** A titled column of footer links ("Product", "Company", "Legal"). */
export interface PageFooterColumn {
  readonly label: string;
  readonly links: readonly PageFooterLink[];
}

/** The link's `rel`: its own, else `noopener noreferrer` for a new tab. */
export const pageFooterLinkRel = (link: PageFooterLink): string | null =>
  link.rel ?? (link.target === "_blank" ? "noopener noreferrer" : null);
