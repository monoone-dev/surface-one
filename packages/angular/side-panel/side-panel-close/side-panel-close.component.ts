import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

@Component({
  selector: "sone-side-panel-close",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "side-panel-close" },
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  templateUrl: "./side-panel-close.component.html",
})
export class SoneSidePanelCloseComponent {
  readonly label = input.required<string>();
  readonly closed = output<void>();
}
