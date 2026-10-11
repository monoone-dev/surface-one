import { effect, inject } from "@angular/core";

import { I18n } from "../i18n/i18n.service";
import type { Messages } from "../i18n/messages/en";
import { Seo, type PageSeo } from "./seo.service";

/**
 * Describes a page to crawlers and keeps it in sync with the locale: `build` runs again
 * whenever the messages or a signal it reads changes, and its result goes to `Seo.set()`.
 * Return `null` while the page has nothing to describe yet (an unknown slug). Call it in a
 * page's constructor or a field initializer (an injection context).
 */
export function pageSeo(build: (m: Messages) => PageSeo | null): void {
  const seo = inject(Seo);
  const i18n = inject(I18n);
  effect(() => {
    const page = build(i18n.m());
    if (page) seo.set(page);
  });
}

/** The breadcrumb trail from the home page: `[Home, …crumbs]`. */
export function trail(
  m: Messages,
  ...crumbs: { name: string; path: string }[]
): { name: string; path: string }[] {
  return [{ name: m.nav.home, path: "/" }, ...crumbs];
}
