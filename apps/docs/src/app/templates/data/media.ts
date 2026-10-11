// The mock data of the media template, shared by its Angular (media.template.ts), Vue
// (vue/media.vue) and React (react/media.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export interface Speaker {
  /** A speaker key for the chip's tone: `me`, `others-0`, `others-1` … */
  readonly key: string;
  readonly name: string;
}

export type RecorderState = "idle" | "recording" | "paused";

/** A silent, zero-length WAV inlined as a data URI: what the server renders. */
export const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

/** Where the speaker turns change, as fractions of the recording. */
export const TURNS = [0, 0.09, 0.21, 0.3, 0.43, 0.5, 0.62, 0.71, 0.83, 0.9, 1];

export const ADA: Speaker = { key: "me", name: "Ada Park" };
export const LEO: Speaker = { key: "others-0", name: "Leo Ruiz" };
export const MINA: Speaker = { key: "others-1", name: "Mina Sato" };
export const THEO: Speaker = { key: "others-2", name: "Theo Grant" };

/** What the live transcript "hears" while recording — canned lines, in turn. */
export const SCRIPT: readonly { speaker: Speaker; text: string }[] = [
  {
    speaker: ADA,
    text: "Okay, we're recording. Quick check-in on the Harbor launch.",
  },
  {
    speaker: LEO,
    text: "The migration dry run passed; two invoices still need a fix.",
  },
  { speaker: ADA, text: "Can we patch them before the freeze on the 14th?" },
  { speaker: LEO, text: "Yes, the pull request goes up today." },
  {
    speaker: MINA,
    text: "I'll update the launch checklist right after this call.",
  },
  {
    speaker: ADA,
    text: "Great. The pricing screenshots are the last open item.",
  },
];

/** A silent 8 kHz, 8-bit mono WAV of `seconds`, so the player has a real length. */
export function silentWav(seconds: number): Blob {
  const rate = 8000;
  const samples = Math.max(1, Math.round(seconds * rate));
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++)
      view.setUint8(offset + i, s.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  text(36, "data");
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit silence
  return new Blob([buffer], { type: "audio/wav" });
}
