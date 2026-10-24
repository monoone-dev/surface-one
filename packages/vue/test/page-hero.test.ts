import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SonePageHero } from "../src/index";

describe("SonePageHero", () => {
  it("renders the same section as Angular", async () => {
    const out = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(
              SonePageHero,
              {
                headline: "New",
                title: "Ship faster",
                description: "One design system.",
                orientation: "horizontal",
                level: 2,
                links: [
                  { label: "Start", href: "/start" },
                  { label: "Docs", href: "/docs", target: "_blank" },
                ],
              },
              {
                default: () => h("img", { src: "/hero.png", alt: "Preview" }),
                links: () => h("button", "Watch"),
              },
            ),
        }),
      )
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(out).toMatch(
      /^<sone-page-hero data-slot="page-hero" data-orientation="horizontal"><section class="page-hero" aria-labelledby="(sone-page-hero-[^"]+-title)"><div class="page-hero-container"><div class="page-hero-body" data-slot="page-hero-body"><p class="page-hero-headline" data-slot="page-hero-headline">New<\/p><h2 class="page-hero-title" data-slot="page-hero-title" id="\1">Ship faster<\/h2>/,
    );
    expect(out).toContain(
      '<a class="btn" data-slot="button" data-variant="default" data-size="lg" href="/start">Start</a>',
    );
    expect(out).toContain(
      'data-variant="outline" data-size="lg" href="/docs" target="_blank" rel="noopener noreferrer">Docs</a><button>Watch</button></div>',
    );
    expect(out).toContain(
      '<div class="page-hero-media" data-slot="page-hero-media"><img src="/hero.png" alt="Preview"></div>',
    );
  });
});
