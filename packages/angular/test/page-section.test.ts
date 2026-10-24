import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_PAGE_SECTION_PARTS,
  type PageFeatureItem,
} from "@surface-one/angular/page-section";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_PAGE_SECTION_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-page-section
      id="data"
      icon="sparkles"
      headline="Features"
      title="Everything"
      description="All of it."
      [level]="level()"
      [features]="features"
      [links]="[{ label: 'More', href: '/more' }]"
    />
    <sone-page-section id="projected" orientation="horizontal" reverse>
      <sone-page-features>
        <sone-page-feature
          title="Spaces"
          href="/spaces"
          orientation="horizontal"
        />
      </sone-page-features>
      <img src="/shot.png" alt="Screenshot" />
    </sone-page-section>
  `,
})
class SectionHost {
  readonly level = signal<unknown>(2);
  readonly features: PageFeatureItem[] = [
    { icon: "search", title: "Search", description: "Find it." },
    { title: "Private" },
  ];
}

describe("sone-page-section", () => {
  it("is a section named by its heading, with a list of features one level deeper", async () => {
    const fixture = await render(SectionHost);
    const host = $("#data");
    const title = $("h2.page-section-title", host);
    expect(title.textContent!.trim()).toBe("Everything");
    expect($("section", host).getAttribute("aria-labelledby")).toBe(title.id);
    expect($(".page-section-icon", host).getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect($(".page-section-headline", host).textContent!.trim()).toBe(
      "Features",
    );
    const list = $("sone-page-features", host);
    expect(list.getAttribute("role")).toBe("list");
    const items = $$("sone-page-feature", list);
    expect(items.map((i) => i.getAttribute("role"))).toEqual([
      "listitem",
      "listitem",
    ]);
    expect(
      $$("h3.page-feature-title", list).map((h) => h.textContent!.trim()),
    ).toEqual(["Search", "Private"]);
    expect($(".page-feature-icon sone-icon", items[0]!)).not.toBeNull();
    expect($(".page-feature-icon", items[1]!)).toBeNull();
    expect(
      $<HTMLAnchorElement>(".page-section-links a", host).getAttribute(
        "data-variant",
      ),
    ).toBe("default");

    fixture.componentInstance.level.set(4);
    await settle(fixture);
    expect($("h4.page-section-title", host)).not.toBeNull();
    expect($$("h5.page-feature-title", host)).toHaveLength(2);
  });

  it("takes projected features, a linked feature and media", async () => {
    await render(SectionHost);
    const host = $("#projected");
    expect(host.getAttribute("data-orientation")).toBe("horizontal");
    expect(host.hasAttribute("data-reverse")).toBe(true);
    expect($("section", host).hasAttribute("aria-labelledby")).toBe(false);
    expect($(".page-section-body sone-page-features", host)).not.toBeNull();
    const link = $<HTMLAnchorElement>(".page-feature-link", host);
    expect(link.getAttribute("href")).toBe("/spaces");
    expect(link.closest("h3")).not.toBeNull();
    expect($(".page-section-media img", host).getAttribute("alt")).toBe(
      "Screenshot",
    );
  });
});
