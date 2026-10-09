/**
 * `@surface-one/angular/chart-utils` — pure chart helpers with no Angular import,
 * safe to use in plain Node (tests, scripts, SSR utilities).
 */

/** The active locale: the one `@angular/localize` loaded, else `<html lang>`, else `en`. */
function activeLocale(): string {
  const loaded = (globalThis as { $localize?: { locale?: string } }).$localize
    ?.locale;
  if (loaded) return loaded;
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  return "en";
}

/**
 * A number for a chart label, legend or summary, formatted for `locale` (default:
 * the active `$localize` locale, else `<html lang>`, else `en`) with
 * `Intl.NumberFormat`. Non-finite input renders as an en dash; an unknown locale
 * falls back to `en`. Pure and SSR-safe.
 *
 *   formatChartNumber(1234.5)                       // "1,234.5"
 *   formatChartNumber(0.42, "de", { style: "percent" }) // "42 %"
 */
export function formatChartNumber(
  value: number,
  locale?: string | null,
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) return "–";
  const opts: Intl.NumberFormatOptions = {
    maximumFractionDigits: 1,
    ...options,
  };
  try {
    return new Intl.NumberFormat(locale || activeLocale(), opts).format(value);
  } catch {
    return new Intl.NumberFormat("en", opts).format(value);
  }
}

/**
 * The CSS colour for a chart tone: a token suffix (`"chart-3"`, `"graph-note"`,
 * `"success"`) becomes `var(--chart-3)`, a custom property name (`"--brand"`)
 * becomes `var(--brand)`, and anything else (`"var(--x)"`, `"#0a0"`,
 * `"color-mix(…)"`) passes through unchanged. Empty input gives `null`.
 */
export function chartColor(tone: string | null | undefined): string | null {
  const t = (tone ?? "").trim();
  if (!t) return null;
  if (t.startsWith("--")) return `var(${t})`;
  if (/^[a-z][a-z0-9-]*$/i.test(t) && !CSS_NAMED.has(t.toLowerCase())) {
    return `var(--${t})`;
  }
  return t;
}

/** The categorical tone for the `index`-th series: `chart-1` … `chart-8`, then around again. */
export function chartTone(index: number): string {
  const i = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
  return `chart-${(i % 8) + 1}`;
}

// CSS colour keywords that must not be read as a token suffix.
const CSS_NAMED = new Set([
  "currentcolor",
  "transparent",
  "inherit",
  "initial",
  "unset",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "gray",
  "grey",
]);
