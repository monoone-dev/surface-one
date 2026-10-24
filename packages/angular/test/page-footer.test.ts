import { ChangeDetectionStrategy, Component } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_PAGE_FOOTER_PARTS,
  type PageFooterColumn,
} from "@surface-one/angular/page-footer";

import { $, $$, render } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_PAGE_FOOTER_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-page-footer
      id="full"
      [columns]="columns"
      copyright="© 2026 Acme"
      [level]="2"
    >
      <p sonePageFooterBrand>Acme</p>
      <span sonePageFooterLeft>Made in Kraków</span>
      <a sonePageFooterRight href="/gh">GitHub</a>
    </sone-page-footer>
    <sone-page-footer id="bare" />
  `,
})
class FooterHost {
  readonly columns: PageFooterColumn[] = [
    {
      label: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Status", href: "https://status.example", target: "_blank" },
      ],
    },
    { label: "Legal", links: [{ label: "Privacy", href: "/privacy" }] },
  ];
}

describe("sone-page-footer", () => {
  it("is a footer with a named nav of titled link columns and a bottom row", async () => {
    await render(FooterHost);
    const host = $("#full");
    expect($("sone-page-footer > footer.page-footer", document)).not.toBeNull();
    const nav = $("nav.page-footer-columns", host);
    expect(nav.getAttribute("aria-label")).toBe("Footer");
    expect(
      $$("h2.page-footer-column-label", nav).map((h) => h.textContent!.trim()),
    ).toEqual(["Product", "Legal"]);
    const links = $$<HTMLAnchorElement>(".page-footer-link", nav);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/features",
      "https://status.example",
      "/privacy",
    ]);
    expect(links[1]!.getAttribute("rel")).toBe("noopener noreferrer");
    expect($(".page-footer-brand p", host).textContent).toBe("Acme");
    expect($(".page-footer-copyright", host).textContent!.trim()).toBe(
      "© 2026 Acme",
    );
    expect($(".page-footer-left span", host).textContent).toBe(
      "Made in Kraków",
    );
    expect($(".page-footer-right a", host).textContent).toBe("GitHub");
  });

  it("leaves out the nav without columns", async () => {
    await render(FooterHost);
    const bare = $("#bare");
    expect($("nav", bare)).toBeNull();
    expect($(".page-footer-copyright", bare)).toBeNull();
    expect($(".page-footer-bottom", bare)).not.toBeNull();
  });
});
