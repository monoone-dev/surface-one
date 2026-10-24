import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SonePageFeature,
  SonePageFeatures,
  SonePageSection,
} from "../src/components/page-section";

describe("SonePageSection", () => {
  it("renders the same section and features as Angular", () => {
    const out = renderToString(
      <SonePageSection
        headline="Features"
        title="Everything"
        features={[
          { icon: "search", title: "Search", description: "Find it." },
          { title: "Private", href: "/private" },
        ]}
        links={[{ label: "More", href: "/more" }]}
      />,
    );
    expect(out).toMatch(
      /<sone-page-section data-slot="page-section" data-orientation="vertical"><section class="page-section" aria-labelledby="(sone-page-section-[^"]+-title)">.*<h2 class="page-section-title" data-slot="page-section-title" id="\1">Everything<\/h2>/,
    );
    expect(out).toContain(
      '<sone-page-features data-slot="page-features" role="list"><sone-page-feature data-slot="page-feature" role="listitem" data-orientation="vertical"><span class="page-feature-icon" data-slot="page-feature-icon" aria-hidden="true">',
    );
    expect(out).toContain(
      '<h3 class="page-feature-title" data-slot="page-feature-title">Search</h3><p class="page-feature-description" data-slot="page-feature-description">Find it.</p>',
    );
    expect(out).toContain(
      '<h3 class="page-feature-title" data-slot="page-feature-title"><a class="page-feature-link" href="/private">Private</a></h3>',
    );
  });

  it("puts SonePageFeatures children under the copy and the rest in the media", () => {
    const out = renderToString(
      <SonePageSection orientation="horizontal" level={3}>
        <SonePageFeatures>
          <SonePageFeature title="Spaces" level={4} />
        </SonePageFeatures>
        <img src="/shot.png" alt="Screenshot" />
      </SonePageSection>,
    );
    expect(out).toContain('<section class="page-section">');
    expect(out).toMatch(
      /data-slot="page-section-header">.*<\/div><sone-page-features.*<h4 class="page-feature-title"/,
    );
    expect(out).toContain(
      '<div class="page-section-media" data-slot="page-section-media"><img src="/shot.png" alt="Screenshot"/></div>',
    );
  });
});
