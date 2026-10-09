import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

export type FloatingBarState = "idle" | "live" | "processing";

@Component({
  selector: "sone-floating-bar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  host: {
    "data-slot": "floating-bar",
    "[attr.data-state]": "state()",
  },
  templateUrl: "./floating-bar.component.html",
  styleUrl: "./floating-bar.component.scss",
})
export class SoneFloatingBarComponent {
  readonly state = input<FloatingBarState>("idle");
  readonly closeLabel = input(
    $localize`:Button that hides the floating recording bar:Hide`,
  );
  readonly closed = output<void>();
}
