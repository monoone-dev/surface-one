import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import type { PageLink } from "@surface-one/angular/core";
import { SONE_PAGE_HERO_PARTS } from "@surface-one/angular/page-hero";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_PAGE_HERO_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-page-hero
      headline="New"
      title="Ship faster"
      description="One design system."
      [orientation]="orientation()"
      [level]="level()"
      [links]="links"
      reverse
    >
      <img src="/hero.png" alt="Preview" />
      <button sonePageHeroLinks type="button">Watch the video</button>
    </sone-page-hero>
  `,
})
class HeroHost {
  readonly orientation = signal<"vertical" | "horizontal">("horizontal");
  readonly level = signal<unknown>(1);
  readonly links: PageLink[] = [
    { label: "Start", href: "/start", trailingIcon: "arrow-right" },
    { label: "Docs", href: "https://example.com", target: "_blank" },
  ];
}

describe("sone-page-hero", () => {
  it("is a section named by its heading, with links and media", async () => {
    const fixture = await render(HeroHost);
    const host = $("sone-page-hero");
    expect(host.getAttribute("data-orientation")).toBe("horizontal");
    expect(host.hasAttribute("data-reverse")).toBe(true);
    expect(host.hasAttribute("title")).toBe(false);
    const section = $("section.page-hero");
    const title = $("h1.page-hero-title");
    expect(title.textContent!.trim()).toBe("Ship faster");
    expect(section.getAttribute("aria-labelledby")).toBe(title.id);
    expect($(".page-hero-headline").textContent!.trim()).toBe("New");
    expect($(".page-hero-description").textContent!.trim()).toBe(
      "One design system.",
    );
    const links = $$<HTMLAnchorElement>(".page-hero-links a");
    expect(links.map((a) => a.getAttribute("data-variant"))).toEqual([
      "default",
      "outline",
    ]);
    expect(links.map((a) => a.getAttribute("data-size"))).toEqual(["lg", "lg"]);
    expect(links[0]!.querySelector("sone-icon")).not.toBeNull();
    expect(links[1]!.getAttribute("rel")).toBe("noopener noreferrer");
    expect($(".page-hero-links button").textContent).toBe("Watch the video");
    expect($(".page-hero-media img").getAttribute("alt")).toBe("Preview");

    fixture.componentInstance.level.set(2);
    await settle(fixture);
    expect($("h2.page-hero-title")).not.toBeNull();
  });
});
