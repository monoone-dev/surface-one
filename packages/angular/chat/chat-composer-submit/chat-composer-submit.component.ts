import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

@Component({
  selector: "sone-chat-composer-submit",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneSpinnerComponent],
  host: { "data-slot": "chat-composer-submit" },
  templateUrl: "./chat-composer-submit.component.html",
})
export class SoneChatComposerSubmitComponent {
  readonly pending = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly submitLabel = computed(() =>
    this.pending()
      ? $localize`:Chat send button while a message is being sent:Sending`
      : $localize`:verb|Chat send button:Send`,
  );
}
