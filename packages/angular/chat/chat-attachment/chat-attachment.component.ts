import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * `<sone-chat-attachment>` — a linked or uploaded item in the composer: a grey card with a
 * mark (the projected content: a favicon, a file icon, a `<sone-mark>`), the `title` and its
 * `url` (or a size), and — when `removable` — a small round remove button (“Remove {title}”)
 * that emits `remove`. Put it inside `<sone-chat-composer>`, which lines attachments up above
 * the field.
 */
@Component({
  selector: "sone-chat-attachment",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: { "data-slot": "chat-attachment" },
  templateUrl: "./chat-attachment.component.html",
})
export class SoneChatAttachmentComponent {
  /** What it is: a page title, a file name. */
  readonly title = input("");
  /** Where it is (or its size), under the title. */
  readonly url = input<string | null>(null);
  /** Shows the remove button. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** The remove button was pressed. */
  readonly remove = output<void>();

  protected readonly removeLabel = computed(
    () =>
      $localize`:Removes an attachment from a chat message, e.g. "Remove brief.pdf":Remove ${this.title()}:title:`,
  );
}
