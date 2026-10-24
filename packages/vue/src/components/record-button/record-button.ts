import { type PropType } from "vue";

import { definePart, flag } from "../../utils/part";

export type RecordButtonState = "idle" | "recording" | "paused" | "processing";
export type RecordButtonSize = "default" | "sm";

/**
 * `<button soneRecordButton>` — the round record / stop / resume button (the glyph is
 * drawn by the stylesheet). `withLabel` makes it a pill with the glyph and the button's
 * own text. Give the icon-only one an `aria-label`.
 */
export const SoneRecordButton = definePart({
  name: "SoneRecordButton",
  tag: "button",
  className: "record-btn",
  slot: "record-button",
  props: {
    /** `idle` (start), `recording` (stop), `paused` (resume), `processing` (busy). */
    state: { type: String as PropType<RecordButtonState>, default: "idle" },
    size: { type: String as PropType<RecordButtonSize>, default: "default" },
    /** A pill with the glyph and the button's text; off = the round icon-only button. */
    withLabel: { type: Boolean, default: false },
  },
  attrs: (p) => ({
    "data-state": p.state,
    "data-size": p.size,
    "data-with-label": flag(p.withLabel),
    "aria-busy": p.state === "processing" ? "true" : undefined,
  }),
});
