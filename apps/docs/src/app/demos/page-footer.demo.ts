import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_PAGE_FOOTER_PARTS,
  type PageFooterColumn,
} from "@surface-one/angular/page-footer";

const TEMPLATE = `<sone-page-footer
  ariaLabel="Demo footer"
  copyright="© 2026 Acme Notes"
  [columns]="columns"
>
  <div sonePageFooterBrand>
    <strong style="color: var(--text-primary)">Acme Notes</strong>
    <span>Every meeting, written down.</span>
  </div>
  <a
    sonePageFooterRight
    soneBtn
    variant="ghost"
    size="icon"
    href="#newsletter"
    aria-label="Newsletter"
  >
    <sone-icon icon="mail" />
  </a>
</sone-page-footer>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-footer-demo",
  imports: [...SONE_PAGE_FOOTER_PARTS, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageFooterDemo {
  readonly columns: PageFooterColumn[] = [
    {
      label: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      label: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
      ],
    },
    {
      label: "Legal",
      links: [
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
      ],
    },
  ];
}
