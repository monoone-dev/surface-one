import { Directive, input } from "@angular/core";

export type RecordButtonState = "idle" | "recording" | "processing";
export type RecordButtonSize = "default" | "sm";

@Directive({
  selector: "button[soneRecordButton]",
  host: {
    class: "record-btn",
    "data-slot": "record-button",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
    "[attr.aria-busy]": 'state() === "processing" ? "true" : null',
  },
})
export class SoneRecordButtonDirective {
  readonly state = input<RecordButtonState>("idle");
  readonly size = input<RecordButtonSize>("default");
}
