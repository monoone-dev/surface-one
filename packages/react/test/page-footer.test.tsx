import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SonePageFooter } from "../src/components/page-footer";

describe("SonePageFooter", () => {
  it("renders the same footer as Angular", () => {
    const out = renderToString(
      <SonePageFooter
        copyright="© 2026 Acme"
        columns={[
          {
            label: "Product",
            links: [
              { label: "Features", href: "/features" },
              { label: "Status", href: "/status", target: "_blank" },
            ],
          },
        ]}
        brand={<p>Acme</p>}
        right={<a href="/gh">GitHub</a>}
      />,
    );
    expect(out).toContain(
      '<sone-page-footer data-slot="page-footer"><footer class="page-footer"><div class="page-footer-top" data-slot="page-footer-top"><div class="page-footer-brand" data-slot="page-footer-brand"><p>Acme</p></div><nav class="page-footer-columns" data-slot="page-footer-columns" aria-label="Footer"><div class="page-footer-column" data-slot="page-footer-column"><h3 class="page-footer-column-label">Product</h3><ul class="page-footer-links"><li><a class="page-footer-link" data-slot="page-footer-link" href="/features">Features</a></li>',
    );
    expect(out).toContain(
      'href="/status" target="_blank" rel="noopener noreferrer">Status</a>',
    );
    expect(out).toContain(
      '<div class="page-footer-bottom" data-slot="page-footer-bottom"><div class="page-footer-left" data-slot="page-footer-left"><p class="page-footer-copyright" data-slot="page-footer-copyright">© 2026 Acme</p></div><div class="page-footer-right" data-slot="page-footer-right"><a href="/gh">GitHub</a></div></div></footer></sone-page-footer>',
    );
  });
});
