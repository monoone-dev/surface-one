import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
} from "@angular/core";
import { toHeadingLevel, type HeadingLevel } from "@surface-one/angular/core";

import {
  pageFooterLinkRel,
  type PageFooterColumn,
} from "./page-footer-columns";

/**
 * `<sone-page-footer>` — the footer of a site (Nuxt UI Footer and FooterColumns): your
 * brand (`[sonePageFooterBrand]`), titled `columns` of links in a named `nav` (column
 * titles are headings, `level` 3 by default), then a bottom row with the `copyright`
 * line and `[sonePageFooterLeft]` / `[sonePageFooterRight]` content (social links, a
 * theme switch). It renders a `<footer>`, the page's content info when it sits outside
 * `main`. The columns sit beside the brand once the footer is wide enough.
 */
@Component({
  selector: "sone-page-footer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./page-footer.component.html",
  styleUrl: "./page-footer.component.scss",
  host: { "data-slot": "page-footer" },
})
export class SonePageFooterComponent {
  readonly columns = input<readonly PageFooterColumn[]>([]);
  /** The copyright line of the bottom row: `© 2026 MonoOne`. */
  readonly copyright = input<string | null>(null);
  /** Names the columns' navigation landmark. */
  readonly ariaLabel = input($localize`:A site footer's link columns:Footer`);
  /** The column titles' heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(3, {
    transform: (v: unknown) => toHeadingLevel(v, 3),
  });

  protected readonly rel = pageFooterLinkRel;
}

/** `[sonePageFooterBrand]` — the logo and a line about the site, before the columns. */
@Directive({
  selector: "[sonePageFooterBrand]",
  host: { "data-slot": "page-footer-brand-content" },
})
export class SonePageFooterBrandDirective {}

/** `[sonePageFooterLeft]` — the start of the bottom row, after the copyright. */
@Directive({
  selector: "[sonePageFooterLeft]",
  host: { "data-slot": "page-footer-left-content" },
})
export class SonePageFooterLeftDirective {}

/** `[sonePageFooterRight]` — the end of the bottom row: social links, a theme switch. */
@Directive({
  selector: "[sonePageFooterRight]",
  host: { "data-slot": "page-footer-right-content" },
})
export class SonePageFooterRightDirective {}

export const SONE_PAGE_FOOTER_PARTS = [
  SonePageFooterComponent,
  SonePageFooterBrandDirective,
  SonePageFooterLeftDirective,
  SonePageFooterRightDirective,
] as const;
