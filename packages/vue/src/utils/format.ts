// The Vue twins of the pure helpers in @surface-one/angular/core (format.ts, speaker.ts):
// the same output, so a page renders identically in both packages.

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

/** An ISO 8601 duration for `<time datetime>`: `PT0S`, `PT12M5S`, `PT1H2M7S`. */
export function isoDuration(seconds: number | null | undefined): string {
  const total = wholeSeconds(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (total === 0) return "PT0S";
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
}

export type SpeakerTone = "me" | "others";

/** `others-0` → 1, `speaker-3` → 3, any other key → `null`. */
export function speakerNumber(key: string | null | undefined): number | null {
  const others = /^others-(\d+)$/.exec(key ?? "");
  if (others) return Number(others[1]) + 1;
  const speaker = /^speaker-(\d+)$/.exec(key ?? "");
  return speaker ? Number(speaker[1]) : null;
}

/** `me` → `me`; `others`, `others-N`, `speaker-N` → `others`; else `null`. */
export function speakerTone(
  key: string | null | undefined,
): SpeakerTone | null {
  if (key === "me") return "me";
  if (key === "others" || speakerNumber(key) !== null) return "others";
  return null;
}

/** Up to two initials of a name; a number stays whole (`Speaker 12` → `S12`). */
export function speakerInitials(label: string | null | undefined): string {
  return (label ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      /^\d+$/.test(word) ? word : word.charAt(0).toLocaleUpperCase(),
    )
    .join("");
}
