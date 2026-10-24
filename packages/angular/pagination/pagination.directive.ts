import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  input,
} from "@angular/core";
import type { ButtonSize } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * `nav[sonePaginationNav]` — the shadcn/ui Pagination root, for pages you lay out
 * yourself (`<sone-pagination>` draws them from a page count). Named "Pagination" by
 * default; set `aria-label` to name it otherwise.
 */
@Directive({
  selector: "nav[sonePaginationNav]",
  host: {
    class: "pagination",
    "data-slot": "pagination",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class SonePaginationNavDirective {
  readonly ariaLabel = input($localize`:Pagination navigation:Pagination`, {
    alias: "aria-label",
  });
}

/** `ul[sonePaginationContent]` — the row of page links. */
@Directive({
  selector: "ul[sonePaginationContent]",
  host: { class: "pagination-content", "data-slot": "pagination-content" },
})
export class SonePaginationContentDirective {}

/** `li[sonePaginationItem]` — one link, previous / next or an ellipsis. */
@Directive({
  selector: "li[sonePaginationItem]",
  host: { class: "pagination-item", "data-slot": "pagination-item" },
})
export class SonePaginationItemDirective {}

/**
 * `a[sonePaginationLink]` / `button[sonePaginationLink]` — a page: a ghost icon button,
 * outlined with `aria-current="page"` when `isActive`. Add `routerLink` or `href`.
 */
@Directive({
  selector: "a[sonePaginationLink], button[sonePaginationLink]",
  host: {
    class: "btn pagination-link",
    "data-slot": "pagination-link",
    "[attr.data-variant]": "isActive() ? 'outline' : 'ghost'",
    "[attr.data-size]": "size()",
    "[attr.data-active]": "isActive() ? '' : null",
    "[attr.aria-current]": "isActive() ? 'page' : null",
  },
})
export class SonePaginationLinkDirective {
  /** The current page: outlined, `aria-current="page"`. */
  readonly isActive = input(false, { transform: booleanAttribute });
  readonly size = input<ButtonSize>("icon");
}

/** `a[sonePaginationPrevious]` / `button[…]` — goes back a page: a chevron and “Previous”. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "a[sonePaginationPrevious], button[sonePaginationPrevious]",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "btn pagination-link pagination-previous",
    "data-slot": "pagination-previous",
    "data-variant": "ghost",
    "data-size": "default",
    "[attr.aria-label]": "ariaLabel()",
  },
  template: `<sone-icon icon="chevron-left" /><span class="pagination-label"
      ><ng-content>{{ label() }}</ng-content></span
    >`,
})
export class SonePaginationPreviousComponent {
  /** The visible text (projected content replaces it). */
  readonly label = input($localize`:Previous page button:Previous`);
  readonly ariaLabel = input($localize`Go to previous page`, {
    alias: "aria-label",
  });
}

/** `a[sonePaginationNext]` / `button[…]` — goes on a page: “Next” and a chevron. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "a[sonePaginationNext], button[sonePaginationNext]",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "btn pagination-link pagination-next",
    "data-slot": "pagination-next",
    "data-variant": "ghost",
    "data-size": "default",
    "[attr.aria-label]": "ariaLabel()",
  },
  template: `<span class="pagination-label"
      ><ng-content>{{ label() }}</ng-content></span
    ><sone-icon icon="chevron-right" />`,
})
export class SonePaginationNextComponent {
  /** The visible text (projected content replaces it). */
  readonly label = input($localize`:Next page button:Next`);
  readonly ariaLabel = input($localize`Go to next page`, {
    alias: "aria-label",
  });
}

/** `<sone-pagination-ellipsis>` — stands in for hidden pages; says “More pages” to screen readers. */
@Component({
  selector: "sone-pagination-ellipsis",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "pagination-ellipsis", "data-slot": "pagination-ellipsis" },
  template: `<sone-icon icon="ellipsis" /><span class="sr-only">{{
      srOnlyText()
    }}</span>`,
})
export class SonePaginationEllipsisComponent {
  /** What screen readers hear in place of the hidden pages. */
  readonly srOnlyText = input($localize`More pages`);
}

export const SONE_PAGINATION_PARTS = [
  SonePaginationNavDirective,
  SonePaginationContentDirective,
  SonePaginationItemDirective,
  SonePaginationLinkDirective,
  SonePaginationPreviousComponent,
  SonePaginationNextComponent,
  SonePaginationEllipsisComponent,
] as const;
