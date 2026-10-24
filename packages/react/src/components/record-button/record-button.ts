import { definePart, flag } from "../../utils/part";

export type RecordButtonState = "idle" | "recording" | "paused" | "processing";
export type RecordButtonSize = "default" | "sm";

export interface SoneRecordButtonOwnProps {
  /** `idle` (start), `recording` (stop), `paused` (resume), `processing` (busy). */
  readonly state?: RecordButtonState;
  readonly size?: RecordButtonSize;
  /** A pill with the glyph and the button's text; off = the round icon-only button. */
  readonly withLabel?: boolean;
}

/**
 * `<button soneRecordButton>` — the round record / stop / resume button (the glyph is
 * drawn by the stylesheet). `withLabel` makes it a pill with the glyph and the button's
 * own text. Give the icon-only one an `aria-label`.
 */
export const SoneRecordButton = definePart<"button", SoneRecordButtonOwnProps>({
  name: "SoneRecordButton",
  tag: "button",
  className: "record-btn",
  slot: "record-button",
  props: ["state", "size", "withLabel"],
  attrs: ({ state = "idle", size = "default", withLabel = false }) => ({
    "data-state": state,
    "data-size": size,
    "data-with-label": flag(withLabel),
    "aria-busy": state === "processing" ? "true" : undefined,
  }),
});
