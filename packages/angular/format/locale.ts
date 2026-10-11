/**
 * The active locale: the one `@angular/localize` loaded, else `<html lang>`, else
 * `en`. Reads the document only when there is one, so it is safe on the server and
 * in plain Node.
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
