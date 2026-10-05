/** The languages of the IndexOne landing page, in the same order. English is the
 *  default and lives at the root; every other locale is a path prefix (`/pl/…`). */
export const LOCALES = [
  { code: "en", tag: "en-US", og: "en_US", name: "English" },
  { code: "pl", tag: "pl-PL", og: "pl_PL", name: "Polski" },
  { code: "es", tag: "es-ES", og: "es_ES", name: "Español" },
  { code: "it", tag: "it-IT", og: "it_IT", name: "Italiano" },
  { code: "fr", tag: "fr-FR", og: "fr_FR", name: "Français" },
  { code: "pt", tag: "pt-BR", og: "pt_BR", name: "Português" },
  { code: "de", tag: "de-DE", og: "de_DE", name: "Deutsch" },
  { code: "zh", tag: "zh-CN", og: "zh_CN", name: "简体中文" },
  { code: "ja", tag: "ja-JP", og: "ja_JP", name: "日本語" },
] as const;

export type Locale = (typeof LOCALES)[number];
export type LocaleCode = Locale["code"];
export const DEFAULT_LOCALE: LocaleCode = "en";

export function localeOf(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/** `/components` → `/pl/components` (English stays unprefixed). */
export function localizePath(path: string, code: LocaleCode): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (code === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${code}` : `/${code}${clean}`;
}

/** `/pl/components/button` → `/components/button`. */
export function stripLocale(path: string): string {
  const [pathname] = path.split(/[?#]/);
  const parts = (pathname ?? "/").split("/");
  if (LOCALES.some((l) => l.code !== DEFAULT_LOCALE && l.code === parts[1])) {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }
  return pathname === "" ? "/" : (pathname ?? "/");
}
