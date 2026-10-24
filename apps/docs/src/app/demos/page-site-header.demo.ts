import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_PAGE_SITE_HEADER_PARTS } from "@surface-one/angular/page-site-header";

const TEMPLATE = `<sone-page-site-header title="Acme Notes" href="#" [(open)]="menuOpen">
  <nav sonePageSiteHeaderNav aria-label="Demo site" class="cluster" data-gap="4">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
    <a href="#blog">Blog</a>
  </nav>
  <a sonePageSiteHeaderActions soneBtn size="sm" href="#start">Get started</a>
  <nav sonePageSiteHeaderMenu aria-label="Demo site menu" class="stack">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
    <a href="#blog">Blog</a>
  </nav>
</sone-page-site-header>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-site-header-demo",
  imports: [...SONE_PAGE_SITE_HEADER_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageSiteHeaderDemo {
  readonly menuOpen = signal(false);
}
