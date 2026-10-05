import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

import { I18n } from "../i18n/i18n.service";
import { LOCALES, localizePath } from "../i18n/locales";
import { SITE } from "../site.config";

export interface PageSeo {
  /** The page's own title; the site name is appended (except on the home page). */
  title: string;
  description: string;
  /** The locale-neutral path: `/components/button`. */
  path: string;
  type?: "website" | "article";
  /** schema.org objects for this page, besides the site-wide WebSite. */
  jsonLd?: Record<string, unknown>[];
  /** Breadcrumb trail (name, locale-neutral path) for BreadcrumbList. */
  breadcrumbs?: { name: string; path: string }[];
  /** Keep the page out of search results (the 404 page). */
  noindex?: boolean;
}

/**
 * Everything a crawler reads from <head>: title, description, canonical URL,
 * hreflang alternates for all nine locales + x-default, Open Graph, Twitter and
 * JSON-LD. Pages call `set()`; prerendering serialises the result into the HTML.
 */
@Injectable({ providedIn: "root" })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18n);

  set(page: PageSeo): void {
    const locale = this.i18n.locale();
    const m = this.i18n.m();
    const fullTitle =
      page.path === "/" ? page.title : `${page.title} · ${SITE.name}`;
    const url = absolute(localizePath(page.path, locale.code));
    const image = absolute("/og-image.png");

    this.title.setTitle(fullTitle);
    this.tag("name", "description", page.description);
    this.tag(
      "name",
      "robots",
      page.noindex ? "noindex, follow" : "index, follow",
    );
    this.tag("property", "og:title", fullTitle);
    this.tag("property", "og:description", page.description);
    this.tag("property", "og:url", url);
    this.tag("property", "og:type", page.type ?? "website");
    this.tag("property", "og:site_name", SITE.name);
    this.tag("property", "og:locale", locale.og);
    this.tag("property", "og:image", image);
    this.tag("property", "og:image:alt", m.meta.tagline);
    this.tag("name", "twitter:card", "summary_large_image");
    this.tag("name", "twitter:title", fullTitle);
    this.tag("name", "twitter:description", page.description);
    this.tag("name", "twitter:image", image);

    this.links(page.path, url);
    this.jsonLd(page, url, fullTitle);
  }

  private tag(attr: "name" | "property", key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private links(path: string, canonical: string): void {
    const head = this.document.head;
    head
      .querySelectorAll(
        'link[rel="canonical"], link[rel="alternate"][hreflang]',
      )
      .forEach((el) => el.remove());
    const add = (attrs: Record<string, string>) => {
      const link = this.document.createElement("link");
      for (const [k, v] of Object.entries(attrs)) link.setAttribute(k, v);
      head.appendChild(link);
    };
    add({ rel: "canonical", href: canonical });
    for (const l of LOCALES) {
      add({
        rel: "alternate",
        hreflang: l.tag,
        href: absolute(localizePath(path, l.code)),
      });
    }
    add({
      rel: "alternate",
      hreflang: "x-default",
      href: absolute(localizePath(path, "en")),
    });
  }

  private jsonLd(page: PageSeo, url: string, fullTitle: string): void {
    const locale = this.i18n.locale();
    const graph: Record<string, unknown>[] = [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        inLanguage: LOCALES.map((l) => l.tag),
      },
      {
        "@type": page.type === "article" ? "TechArticle" : "WebPage",
        "@id": `${url}#page`,
        url,
        name: fullTitle,
        description: page.description,
        inLanguage: locale.tag,
        isPartOf: { "@id": `${SITE.url}/#website` },
      },
      ...(page.jsonLd ?? []),
    ];
    if (page.breadcrumbs?.length) {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: page.breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: absolute(localizePath(b.path, locale.code)),
        })),
      });
    }
    let script = this.document.getElementById("seo-jsonld");
    if (!script) {
      script = this.document.createElement("script");
      script.id = "seo-jsonld";
      script.setAttribute("type", "application/ld+json");
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
    }).replace(/</g, "\\u003c");
  }
}

/** Absolute URL with a trailing slash — the form a static host serves each
 *  prerendered `…/index.html` at, so canonical links never point at a redirect. */
function absolute(path: string): string {
  if (path === "/" || /\.[a-z0-9]+$/i.test(path)) return SITE.url + path;
  return SITE.url + (path.endsWith("/") ? path : `${path}/`);
}
