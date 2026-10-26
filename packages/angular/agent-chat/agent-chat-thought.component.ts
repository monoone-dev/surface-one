import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from "@angular/core";
import { soneId } from "@surface-one/angular/core";
import { plural } from "@surface-one/angular/format";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * `<sone-agent-chat-thought>` — an agent's reasoning, folded into a quiet row (“Thought for 12
 * seconds ›”) that opens a panel with a rule along its edge. Put it first in an agent's
 * `<sone-agent-chat-message>`; the projected content is the reasoning. `open` is two-way.
 */
@Component({
  selector: "sone-agent-chat-thought",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: {
    "data-slot": "agent-chat-thought",
    "[attr.data-open]": 'open() ? "" : null',
  },
  templateUrl: "./agent-chat-thought.component.html",
})
export class SoneAgentChatThoughtComponent {
  /** How long the agent thought, in whole seconds. */
  readonly seconds = input(0, { transform: numberAttribute });
  /** The reasoning panel shows (two-way: `[(open)]`). */
  readonly open = model(false);

  protected readonly panelId = `${soneId("sone-agent-chat-thought")}-panel`;
  protected readonly label = computed(() =>
    plural(
      Math.max(0, Math.round(this.seconds())),
      $localize`:How long an agent reasoned before it answered:{count, plural, =1 {Thought for 1 second} other {Thought for # seconds}}`,
    ),
  );

  protected toggle(): void {
    this.open.update((open) => !open);
  }
}
