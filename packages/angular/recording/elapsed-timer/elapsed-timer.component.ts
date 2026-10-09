import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { clockTime, isoDuration } from "@surface-one/angular/format";

export type ElapsedTimerSize = "default" | "sm";

/**
 * `<sone-elapsed-timer>` — a running time (`12:04`, `1:02:07`) in tabular mono
 * figures, as a `<time>` with an ISO 8601 `datetime`.
 */
@Component({
  selector: "sone-elapsed-timer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "elapsed-timer",
    "[attr.data-size]": "size()",
    // role="timer" is a live region whose aria-live is OFF: a screen reader reads it
    // on demand instead of announcing every tick.
    "[attr.role]": 'live() ? "timer" : null',
    "[attr.aria-label]": "live() ? ariaLabel() : null",
  },
  templateUrl: "./elapsed-timer.component.html",
  styleUrl: "./elapsed-timer.component.scss",
})
export class SoneElapsedTimerComponent {
  /** Elapsed whole seconds. */
  readonly seconds = input<number | null>(0);
  /** A running clock: `role="timer"` (never announced on every tick). */
  readonly live = input(false, { transform: booleanAttribute });
  readonly size = input<ElapsedTimerSize>("default");
  /** The timer's name when `live` (“Recording time”). */
  readonly ariaLabel = input<string | null>(null);

  protected readonly label = computed(() => clockTime(this.seconds()));
  protected readonly datetime = computed(() => isoDuration(this.seconds()));
}
