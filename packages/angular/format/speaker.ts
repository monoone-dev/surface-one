/** The colour family of a speaker: the recording user, or anyone else. */
export type SpeakerTone = "me" | "others";

/** Overrides for the built-in (`$localize`d) speaker names. */
export interface SpeakerLabelOptions {
  /** The recording user (`me`). Default “Me”. */
  readonly me?: string;
  /** The other side as one stream (`others`). Default “Others”. */
  readonly others?: string;
  /** A numbered speaker, `n` counted from 1. Default “Speaker n”. */
  readonly speaker?: (n: number) => string;
}

const OTHERS_N = /^others-(\d+)$/;
const SPEAKER_N = /^speaker-(\d+)$/;

function canLocalize(): boolean {
  return typeof $localize === "function";
}

/**
 * The 1-based number of a diarised speaker key: `others-0` → 1 (the diariser
 * counts the other participants from 0), `speaker-3` → 3; `null` for any other key.
 */
export function speakerNumber(key: string | null | undefined): number | null {
  const others = OTHERS_N.exec(key ?? "");
  if (others) return Number(others[1]) + 1;
  const speaker = SPEAKER_N.exec(key ?? "");
  return speaker ? Number(speaker[1]) : null;
}

/**
 * The display name of a transcript speaker key — one naming for every surface:
 * `me` → “Me”, `others` → “Others”, `others-N` → “Speaker N+1”, `speaker-N` →
 * “Speaker N”. Any other key (or none) is `null`: the caller decides whether to
 * show the raw key or nothing. Localised with `$localize` (English when it is not loaded).
 */
export function speakerLabel(
  key: string | null | undefined,
  opts: SpeakerLabelOptions = {},
): string | null {
  if (key === "me") {
    if (opts.me !== undefined) return opts.me;
    return canLocalize()
      ? $localize`:Transcript speaker label for the user:Me`
      : "Me";
  }
  if (key === "others") {
    if (opts.others !== undefined) return opts.others;
    return canLocalize()
      ? $localize`:Transcript speaker label for the other participants:Others`
      : "Others";
  }
  const n = speakerNumber(key);
  if (n === null) return null;
  if (opts.speaker) return opts.speaker(n);
  return canLocalize()
    ? $localize`:A numbered transcript speaker:Speaker ${n}:number:`
    : `Speaker ${n}`;
}

/** The tone of a speaker key: `me` → `me`; `others`, `others-N`, `speaker-N` → `others`; else `null`. */
export function speakerTone(
  key: string | null | undefined,
): SpeakerTone | null {
  if (key === "me") return "me";
  if (key === "others" || speakerNumber(key) !== null) return "others";
  return null;
}

/** Up to two initials of a name (`Anna Kowalska` → `AK`); a number stays whole (`Speaker 12` → `S12`). */
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
