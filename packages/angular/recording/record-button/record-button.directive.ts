import { Directive, booleanAttribute, input } from "@angular/core";

export type RecordButtonState = "idle" | "recording" | "paused" | "processing";
export type RecordButtonSize = "default" | "sm";

@Directive({
  selector: "button[soneRecordButton]",
  host: {
    class: "record-btn",
    "data-slot": "record-button",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
    "[attr.data-with-label]": 'withLabel() ? "" : null',
    "[attr.aria-busy]": 'state() === "processing" ? "true" : null',
  },
})
export class SoneRecordButtonDirective {
  /** `idle` (start), `recording` (stop), `paused` (resume), `processing` (busy). */
  readonly state = input<RecordButtonState>("idle");
  readonly size = input<RecordButtonSize>("default");
  /** A pill with the glyph and the button's own text (`<button soneRecordButton withLabel>Record</button>`). Off = the round icon-only button. */
  readonly withLabel = input(false, { transform: booleanAttribute });
}
