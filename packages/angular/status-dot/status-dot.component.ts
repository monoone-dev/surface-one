import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from "@angular/core";

export type StatusDotTone =
  | "muted"
  | "live"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "current";
export type StatusDotSize = "default" | "sm";

/**
 * `<sone-status-dot>` — a small round status mark. Decorative by default
 * (`aria-hidden`); give it a `label` when the dot is the only thing that says
 * the status, and it becomes `role="img"` with that name.
 */
@Component({
  selector: "sone-status-dot",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "status-dot",
    "[attr.data-tone]": "tone()",
    "[attr.data-size]": "size()",
    "[attr.data-pulse]": 'pulse() ? "" : null',
    "[attr.role]": 'label() ? "img" : null',
    "[attr.aria-label]": "label()",
    "[attr.aria-hidden]": 'label() ? null : "true"',
  },
  template: "",
  styleUrl: "./status-dot.component.scss",
})
export class SoneStatusDotComponent {
  readonly tone = input<StatusDotTone>("muted");
  readonly size = input<StatusDotSize>("default");
  /** Pulses while something is going on; still under `prefers-reduced-motion: reduce`. */
  readonly pulse = input(false, { transform: booleanAttribute });
  /** The accessible name; leave it out when text next to the dot already says the status. */
  readonly label = input<string | null>(null);
}
