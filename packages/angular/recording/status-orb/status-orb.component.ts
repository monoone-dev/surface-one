import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

export type StatusOrbState =
  "ready" | "live" | "processing" | "paused" | "queued" | "error";
export type StatusOrbSize = "default" | "sm";

@Component({
  selector: "sone-status-orb",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneSpinnerComponent],
  host: {
    "data-slot": "status-orb",
    "aria-hidden": "true",
    "[attr.data-state]": "state()",
    "[attr.data-size]": "size()",
  },
  templateUrl: "./status-orb.component.html",
  styleUrl: "./status-orb.component.scss",
})
export class SoneStatusOrbComponent {
  readonly state = input<StatusOrbState>("ready");
  readonly size = input<StatusOrbSize>("default");

  protected readonly spinnerSize = computed(() =>
    this.size() === "sm" ? 12 : 14,
  );
}
