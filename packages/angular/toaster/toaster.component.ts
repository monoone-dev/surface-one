import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

export interface SoneToast {
  id: number;
  message: string;
  kind: "info" | "success" | "danger";
  action?: { label: string };
  secondaryAction?: { label: string };
}

@Component({
  selector: "sone-toaster",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  host: { "data-slot": "toaster" },
  templateUrl: "./toaster.component.html",
})
export class SoneToasterComponent {
  readonly toasts = input.required<readonly SoneToast[]>();
  readonly dismiss = output<number>();
  readonly action = output<number>();
  readonly secondaryAction = output<number>();
}
