import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import { SoneElapsedTimerComponent } from "../elapsed-timer/elapsed-timer.component";
import { SoneStatusOrbComponent } from "../status-orb/status-orb.component";

export type RecordingIndicatorState = "live" | "paused";
export type RecordingIndicatorSize = "default" | "sm";

/**
 * `<sone-recording-indicator>` — “a recording is running”: the live (or paused)
 * status orb, the elapsed timer and an optional label, in one row.
 */
@Component({
  selector: "sone-recording-indicator",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneStatusOrbComponent, SoneElapsedTimerComponent],
  host: {
    "data-slot": "recording-indicator",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
  },
  templateUrl: "./recording-indicator.component.html",
  styleUrl: "./recording-indicator.component.scss",
})
export class SoneRecordingIndicatorComponent {
  /** Elapsed whole seconds. */
  readonly seconds = input<number | null>(0);
  /** Visible text after the timer (“Recording”); `null` = none. */
  readonly label = input<string | null>(null);
  readonly state = input<RecordingIndicatorState>("live");
  readonly size = input<RecordingIndicatorSize>("default");
  /** The timer's accessible name. */
  readonly timerLabel = input(
    $localize`:Accessible name of the running recording clock:Recording time`,
  );
}
