import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";

@Component({
  selector: "sone-suggestion-chips",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective],
  host: {
    "data-slot": "suggestions",
    role: "group",
    "[attr.aria-label]": "label()",
  },
  templateUrl: "./suggestion-chips.component.html",
})
export class SoneSuggestionChipsComponent {
  readonly suggestions = input<readonly string[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input($localize`Suggested questions`);
  readonly picked = output<string>();
}
