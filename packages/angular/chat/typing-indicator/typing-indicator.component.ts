import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  SoneMarkerContentDirective,
  SoneMarkerDirective,
  SoneMarkerIconDirective,
} from "@surface-one/angular/marker";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

@Component({
  selector: "sone-typing-indicator",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneMarkerIconDirective,
    SoneMarkerContentDirective,
    SoneSpinnerComponent,
  ],
  hostDirectives: [SoneMarkerDirective],
  host: { "[attr.aria-label]": "label()" },
  templateUrl: "./typing-indicator.component.html",
})
export class SoneTypingIndicatorComponent {
  readonly label = input($localize`Thinking`);
}
