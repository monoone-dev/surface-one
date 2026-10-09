/**
 * The active locale: the one `@angular/localize` loaded, else the document's, else
 * `en`. Internal to `core` (not re-exported); SSR-safe.
 */
export function activeLocale(): string {
  const loaded = (globalThis as { $localize?: { locale?: string } }).$localize
    ?.locale;
  if (loaded) return loaded;
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  return "en";
}
