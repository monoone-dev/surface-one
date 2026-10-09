import { RenderMode, type ServerRoute } from "@angular/ssr";

import { CATALOG } from "./catalog/catalog";
import { en } from "./i18n/messages/en";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/locales";

const GUIDE = Object.keys(en.guide.pages);
const TEMPLATES = Object.keys(en.templates.items);

/** Every page of every locale is prerendered to static HTML (SEO, no server). */
const perLocale = (prefix: string): ServerRoute[] => [
  {
    path: `${prefix}components/:slug`,
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => CATALOG.map((e) => ({ slug: e.slug })),
  },
  {
    path: `${prefix}guide/:slug`,
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => GUIDE.map((slug) => ({ slug })),
  },
  {
    path: `${prefix}templates/:slug`,
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => TEMPLATES.map((slug) => ({ slug })),
  },
];

export const serverRoutes: ServerRoute[] = [
  {
    path: "templates/:slug/embed",
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => TEMPLATES.map((slug) => ({ slug })),
  },
  ...LOCALES.flatMap((l) =>
    perLocale(l.code === DEFAULT_LOCALE ? "" : `${l.code}/`),
  ),
  { path: "**", renderMode: RenderMode.Prerender },
];
