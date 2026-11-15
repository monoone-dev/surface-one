import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

type Page =
  | { readonly demo: string }
  | { readonly template: string }
  | { readonly home: true };

/**
 * The component stylesheets a page needs beyond the shell (see scripts/build-docs-css.mjs).
 * The route resolvers call `use()`, so the prerendered HTML already links them in `<head>`
 * and a client-side navigation waits for them — the page never shows unstyled. Each file is
 * linked once and stays: they are the library's own rules, in the library's cascade order.
 */
@Injectable({ providedIn: "root" })
export class LibraryCss {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  async use(page: Page): Promise<void> {
    // Its own lazy chunk: the map stays out of `main`.
    const map = await import("./library-css.generated");
    const entries =
      "demo" in page
        ? map.DEMO_CSS[page.demo]
        : "template" in page
          ? map.TEMPLATE_CSS[page.template]
          : map.HOME_CSS;
    const order = Object.keys(map.LIBRARY_CSS);
    const loading = (entries ?? []).map((entry) =>
      this.link(entry, map.LIBRARY_CSS[entry], order.indexOf(entry)),
    );
    await Promise.all(loading);
  }

  private link(entry: string, href: string | undefined, order: number) {
    const head = this.document.head;
    if (!href || head.querySelector(`link[data-sone-css="${entry}"]`)) return;
    const link = this.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", href);
    link.setAttribute("data-sone-css", entry);
    link.setAttribute("data-order", String(order));
    const next = Array.from(
      head.querySelectorAll<HTMLLinkElement>("link[data-sone-css]"),
    ).find((l) => Number(l.getAttribute("data-order")) > order);
    const loaded = this.browser
      ? new Promise<void>((resolve) => {
          link.onload = link.onerror = () => resolve();
        })
      : undefined;
    head.insertBefore(link, next ?? null);
    return loaded;
  }
}
