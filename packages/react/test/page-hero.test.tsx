import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SonePageHero } from "../src/components/page-hero";

describe("SonePageHero", () => {
  it("renders the same section as Angular", () => {
    const out = renderToString(
      <SonePageHero
        headline="New"
        title="Ship faster"
        description="One design system."
        orientation="horizontal"
        level={2}
        links={[
          { label: "Start", href: "/start" },
          { label: "Docs", href: "/docs", target: "_blank" },
        ]}
        actions={<button>Watch</button>}
      >
        <img src="/hero.png" alt="Preview" />
      </SonePageHero>,
    );
    expect(out).toMatch(
      /<sone-page-hero data-slot="page-hero" data-orientation="horizontal"><section class="page-hero" aria-labelledby="(sone-page-hero-[^"]+-title)"><div class="page-hero-container"><div class="page-hero-body" data-slot="page-hero-body"><p class="page-hero-headline" data-slot="page-hero-headline">New<\/p><h2 class="page-hero-title" data-slot="page-hero-title" id="\1">Ship faster<\/h2>/,
    );
    expect(out).toContain(
      '<a data-slot="button" data-variant="default" data-size="lg" href="/start" class="btn">Start</a>',
    );
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain("<button>Watch</button></div>");
    expect(out).toContain(
      '<div class="page-hero-media" data-slot="page-hero-media"><img src="/hero.png" alt="Preview"/></div>',
    );
  });
});
