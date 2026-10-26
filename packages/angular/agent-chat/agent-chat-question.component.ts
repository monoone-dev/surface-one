import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { soneId } from "@surface-one/angular/core";
import {
  agentClock,
  agentHue,
  agentInitials,
  agentIsoTime,
  agentQuestionKey,
  type AgentTime,
} from "@surface-one/angular/format";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneKbdComponent } from "@surface-one/angular/kbd";

/** One answer of an agent's question: what it says and, under it, what it leads to. */
export interface AgentQuestionOption {
  readonly label: string;
  readonly hint?: string;
}

/**
 * `<sone-agent-chat-question>` — a question an agent asks in the thread and waits on: who asks
 * (`who`, `hue`, `time`) with a “Needs you” badge, the `question` with its one-line `reason`,
 * the `options` as rows that say what each leads to, and a field for your own words. Keys
 * `1`…`9` pick an answer while the field is empty; Enter in the field sends what you wrote.
 * `answer` emits the chosen option's label or your trimmed text.
 */
@Component({
  selector: "sone-agent-chat-question",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneKbdComponent,
  ],
  host: {
    "data-slot": "agent-chat-question",
    role: "group",
    "[attr.aria-labelledby]": "titleId",
    "[style.--agent-hue]": "hueColor()",
    "(keydown)": "onKeydown($event)",
  },
  templateUrl: "./agent-chat-question.component.html",
})
export class SoneAgentChatQuestionComponent {
  /** Who asks: its name, shown with its initials. */
  readonly who = input<string | null>(null);
  /** When it asked. */
  readonly time = input<AgentTime | null>(null);
  /** The question itself. */
  readonly question = input("");
  /** Why it asks, in one line. */
  readonly reason = input<string | null>(null);
  /** The answers to pick from (keys `1`…`9`). */
  readonly options = input<readonly AgentQuestionOption[]>([]);
  /** The own-answer field's placeholder (“Or write your own answer…”). */
  readonly placeholder = input<string | null>(null);
  /** A speaker colour, `1`–`8` (the chart hues), as on `<sone-agent-chat-message>`. */
  readonly hue = input<number | null>(null);
  /** The key hints row under the field. */
  readonly hints = input(true, { transform: booleanAttribute });
  /** The answer: the picked option's label, or the trimmed text written in the field. */
  readonly answer = output<string>();

  protected readonly titleId = `${soneId("sone-agent-chat-question")}-title`;
  protected readonly draft = signal("");
  protected readonly canSend = computed(() => this.draft().trim() !== "");
  protected readonly clock = computed(() => agentClock(this.time()));
  protected readonly iso = computed(() => agentIsoTime(this.time()));
  protected readonly initials = computed(() => agentInitials(this.who()));
  protected readonly hueColor = computed(() => agentHue(this.hue()));
  /** The options a number key reaches (the first nine). */
  protected readonly keyed = computed(() => this.options().slice(0, 9));

  protected readonly needsYou = $localize`:Badge on a question an agent waits on:Needs you`;
  protected readonly answersLabel = $localize`:The group of answers to an agent's question:Answers`;
  protected readonly answerLabel = $localize`:The field for your own answer to an agent's question:Your answer`;
  protected readonly defaultPlaceholder = $localize`:Placeholder of the field for your own answer to an agent's question:Or write your own answer…`;
  protected readonly sendLabel = $localize`:Button that sends your own answer to an agent's question:Send answer`;
  protected readonly toAnswer = $localize`:Key hint after the number keys, e.g. "1 2 to answer":to answer`;
  protected readonly commands = $localize`:Key hint after the slash key, "/ commands":commands`;
  protected readonly anywhere = $localize`:Key hint after the command palette shortcut, "⌘K anywhere":anywhere`;

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected pick(option: AgentQuestionOption): void {
    this.answer.emit(option.label);
  }

  protected send(event?: Event): void {
    event?.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.answer.emit(text);
    this.draft.set("");
  }

  protected onKeydown(event: KeyboardEvent): void {
    const action = agentQuestionKey(event, this.options().length);
    if (action === null) return;
    if (action.kind === "send") {
      this.send(event);
      return;
    }
    const option = this.options()[action.index];
    if (!option) return;
    event.preventDefault();
    this.pick(option);
  }
}
