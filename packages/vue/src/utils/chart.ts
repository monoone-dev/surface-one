// The Vue twins of `chartColor` / `chartTone` / `formatChartNumber` from
// @surface-one/angular/core (that entry point imports Angular, so it is not shared).

/** A number for a chart label or summary, formatted with `Intl.NumberFormat`. */
export function formatChartNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) return "–";
  const opts: Intl.NumberFormatOptions = {
    maximumFractionDigits: 1,
    ...options,
  };
  try {
    return new Intl.NumberFormat(locale || "en", opts).format(value);
  } catch {
    return new Intl.NumberFormat("en", opts).format(value);
  }
}

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

/** `chart-3` → `var(--chart-3)`, `--brand` → `var(--brand)`, any other colour as is. */
export function chartColor(tone: string | null | undefined): string | null {
  const t = (tone ?? "").trim();
  if (!t) return null;
  if (t.startsWith("--")) return `var(${t})`;
  if (/^[a-z][a-z0-9-]*$/i.test(t) && !CSS_NAMED.has(t.toLowerCase())) {
    return `var(--${t})`;
  }
  return t;
}

/** `chart-1` … `chart-8` by position, then around again. */
export function chartTone(index: number): string {
  const i = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
  return `chart-${(i % 8) + 1}`;
}
