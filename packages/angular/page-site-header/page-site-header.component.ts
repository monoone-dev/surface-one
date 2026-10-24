import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  contentChild,
  input,
  model,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneSheetComponent } from "@surface-one/angular/sheet";

import { pageSiteHeaderClosesMenu } from "./page-site-header-menu";

/** `[sonePageSiteHeaderLogo]` — the logo at the start of the header. */
@Directive({
  selector: "[sonePageSiteHeaderLogo]",
  host: { "data-slot": "page-site-header-logo-content" },
})
export class SonePageSiteHeaderLogoDirective {}

/** `[sonePageSiteHeaderNav]` — the site navigation, shown once the header is wide enough. */
@Directive({
  selector: "[sonePageSiteHeaderNav]",
  host: { "data-slot": "page-site-header-nav-content" },
})
export class SonePageSiteHeaderNavDirective {}

/** `[sonePageSiteHeaderActions]` — controls at the end: a theme switch, a sign-in button. */
@Directive({
  selector: "[sonePageSiteHeaderActions]",
  host: { "data-slot": "page-site-header-actions-content" },
})
export class SonePageSiteHeaderActionsDirective {}

/** `[sonePageSiteHeaderMenu]` — the narrow-screen menu, shown in a sheet by the menu button. */
@Directive({
  selector: "[sonePageSiteHeaderMenu]",
  host: { "data-slot": "page-site-header-menu-content" },
})
export class SonePageSiteHeaderMenuDirective {}

/**
 * `<sone-page-site-header>` — the header of a site (Nuxt UI Header): the logo or a
 * `title` link, the `[sonePageSiteHeaderNav]` navigation (a `sone-navigation-menu`, a
 * list of links) and `[sonePageSiteHeaderActions]`. Below a medium width (a container
 * query) the navigation gives way to a menu button that opens `[sonePageSiteHeaderMenu]`
 * in a sheet — focus trapped, Escape and the scrim close it, a link in it closes it too;
 * `[(open)]` is that sheet. It renders a `<header>`, the page's banner outside `main`;
 * `sticky` pins it to the top.
 */
@Component({
  selector: "sone-page-site-header",
  imports: [SoneButtonDirective, SoneIconComponent, SoneSheetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./page-site-header.component.html",
  styleUrl: "./page-site-header.component.scss",
  host: {
    "data-slot": "page-site-header",
    "[attr.data-sticky]": "sticky() ? '' : null",
    "[attr.title]": "null",
  },
})
export class SonePageSiteHeaderComponent {
  /** A text logo, a link to `href` (use `[sonePageSiteHeaderLogo]` for your own). */
  readonly title = input<string | null>(null);
  readonly href = input("/");
  /** The narrow-screen menu sheet — `[(open)]`. */
  readonly open = model(false);
  /** Pins the header to the top of the scrolling page. */
  readonly sticky = input(false, { transform: booleanAttribute });
  /** Names the menu button and the sheet it opens. */
  readonly menuLabel = input($localize`:Opens a site's navigation menu:Menu`);

  protected readonly menu = contentChild(SonePageSiteHeaderMenuDirective);

  protected closeOnLink(event: Event): void {
    if (pageSiteHeaderClosesMenu(event.target)) this.open.set(false);
  }
}

export const SONE_PAGE_SITE_HEADER_PARTS = [
  SonePageSiteHeaderComponent,
  SonePageSiteHeaderLogoDirective,
  SonePageSiteHeaderNavDirective,
  SonePageSiteHeaderActionsDirective,
  SonePageSiteHeaderMenuDirective,
] as const;
