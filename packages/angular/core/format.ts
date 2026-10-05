import { Pipe, PipeTransform } from "@angular/core";

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

/** `{{ start | clock }}` → `4:05`; `{{ start | clock: end }}` → `4:05–6:10`. */
@Pipe({ name: "clock" })
export class SoneClockPipe implements PipeTransform {
  transform(seconds: number | null | undefined, until?: number | null): string {
    return until === undefined
      ? clockTime(seconds)
      : `${clockTime(seconds)}–${clockTime(until)}`;
  }
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
