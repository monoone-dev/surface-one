// The mark's tones and sizes, with no framework in it: the Angular `sone-mark`, the Vue,
// React and React Native `SoneMark` (through @surface-one/core) read it.

/** The gradients a mark can wear (`--mark-<tone>-from` / `--mark-<tone>-to`). */
export const MARK_TONES = [
  "brand",
  "lagoon",
  "iris",
  "indigo",
  "violet",
  "orchid",
  "rose",
  "coral",
  "amber",
  "mint",
  "graphite",
  "neutral",
] as const;

export type MarkTone = (typeof MARK_TONES)[number];

/** A preset (`sm` 20, `md` 28, `lg` 40 — the `--mark-size*` tokens) or a size in px. */
export type MarkSize = "sm" | "md" | "lg" | number;

/** The `data-size` preset of a mark, or null when it has a size in px. */
export const markSizePreset = (size: MarkSize): "sm" | "md" | "lg" | null =>
  typeof size === "number" ? null : size;

/** The inline `--mark-size` of a mark sized in px (null for a preset). */
export const markSizeStyle = (size: MarkSize): string | null =>
  typeof size === "number" ? `${size}px` : null;
