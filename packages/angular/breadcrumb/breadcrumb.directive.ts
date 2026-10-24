import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
} from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * `nav[soneBreadcrumb]` — the trail of links to the current page. Named
 * "Breadcrumb" by default; set `aria-label` to name it otherwise.
 */
@Directive({
  selector: "nav[soneBreadcrumb]",
  host: {
    "data-slot": "breadcrumb",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class SoneBreadcrumbDirective {
  readonly ariaLabel = input($localize`:Breadcrumb navigation:Breadcrumb`, {
    alias: "aria-label",
  });
}

/** `ol[soneBreadcrumbList]` — the ordered list of crumbs. */
@Directive({
  selector: "ol[soneBreadcrumbList]",
  host: { class: "breadcrumb-list", "data-slot": "breadcrumb-list" },
})
export class SoneBreadcrumbListDirective {}

/** `li[soneBreadcrumbItem]` — one crumb: a link, the page or an ellipsis. */
@Directive({
  selector: "li[soneBreadcrumbItem]",
  host: { class: "breadcrumb-item", "data-slot": "breadcrumb-item" },
})
export class SoneBreadcrumbItemDirective {}

/** `a[soneBreadcrumbLink]` — a crumb that links to its page; add `routerLink` or `href`. */
@Directive({
  selector: "a[soneBreadcrumbLink]",
  host: { class: "breadcrumb-link", "data-slot": "breadcrumb-link" },
})
export class SoneBreadcrumbLinkDirective {}

/** `span[soneBreadcrumbPage]` — the current page: not a link, `aria-current="page"`. */
@Directive({
  selector: "span[soneBreadcrumbPage]",
  host: {
    class: "breadcrumb-page",
    "data-slot": "breadcrumb-page",
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
  },
})
export class SoneBreadcrumbPageDirective {}

/** `li[soneBreadcrumbSeparator]` — the chevron between crumbs; project your own glyph. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "li[soneBreadcrumbSeparator]",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "breadcrumb-separator",
    "data-slot": "breadcrumb-separator",
    role: "presentation",
    "aria-hidden": "true",
  },
  template: `<ng-content><sone-icon icon="chevron-right" /></ng-content>`,
})
export class SoneBreadcrumbSeparatorComponent {}

/** `<sone-breadcrumb-ellipsis>` — stands in for collapsed crumbs; says "More" to screen readers. */
@Component({
  selector: "sone-breadcrumb-ellipsis",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "breadcrumb-ellipsis", "data-slot": "breadcrumb-ellipsis" },
  template: `<sone-icon icon="ellipsis" /><span class="sr-only">{{
      srOnlyText()
    }}</span>`,
})
export class SoneBreadcrumbEllipsisComponent {
  /** What screen readers hear in place of the collapsed crumbs. */
  readonly srOnlyText = input($localize`:Collapsed breadcrumb items:More`);
}

export const SONE_BREADCRUMB_PARTS = [
  SoneBreadcrumbDirective,
  SoneBreadcrumbListDirective,
  SoneBreadcrumbItemDirective,
  SoneBreadcrumbLinkDirective,
  SoneBreadcrumbPageDirective,
  SoneBreadcrumbSeparatorComponent,
  SoneBreadcrumbEllipsisComponent,
] as const;
