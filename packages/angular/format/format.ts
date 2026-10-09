function wholeSeconds(seconds: number | null | undefined): number {
  return Math.max(
    0,
    Math.floor(Number.isFinite(seconds) ? (seconds as number) : 0),
  );
}

/** A playback position: `4:05`, `1:02:07`. */
export function clockTime(seconds: number | null | undefined): string {
  const total = wholeSeconds(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** Whether `$localize` is loaded; plain Node (a script, a test) may import the helpers without it. */
function canLocalize(): boolean {
  return typeof $localize === "function";
}

/**
 * A length for people: `45s`, `12m 5s`, `12m`, `1h 2m`, `1h` (seconds are dropped
 * from an hour or more). Rounds to whole seconds; negative or non-finite input is `0s`.
 * Localised with `$localize` (English when it is not loaded).
 */
export function durationLabel(seconds: number | null | undefined): string {
  const total = Math.round(
    Math.max(0, Number.isFinite(seconds) ? (seconds as number) : 0),
  );
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (!canLocalize()) {
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
    if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `${s}s`;
  }
  if (h > 0) {
    return m > 0
      ? $localize`:A short length (hours and minutes):${h}:hours:h ${m}:minutes:m`
      : $localize`:A short length (hours):${h}:hours:h`;
  }
  if (m > 0) {
    return s > 0
      ? $localize`:A short length (minutes and seconds):${m}:minutes:m ${s}:seconds:s`
      : $localize`:A short length (minutes):${m}:minutes:m`;
  }
  return $localize`:A short length (seconds):${s}:seconds:s`;
}

/** An ISO 8601 duration for `<time datetime>`: `PT0S`, `PT12M5S`, `PT1H2M7S`. */
export function isoDuration(seconds: number | null | undefined): string {
  const total = wholeSeconds(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (total === 0) return "PT0S";
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
}

/** The one HTML escaper for text / attribute values built into rendered markup. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}

/** A 0–1 fraction as a whole percentage: `0.426` → `43%`. */
export function pct(frac: number): string {
  return Math.round(frac * 100) + "%";
}
