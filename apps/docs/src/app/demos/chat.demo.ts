import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_CHAT_PARTS,
  SoneChatThreadComponent,
} from "@surface-one/angular/chat";
import { SoneIconComponent } from "@surface-one/angular/icon";

interface Turn {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const TEMPLATE = `<div soneChatPane style="max-width: 560px; width: 100%">
  <div soneChatPaneHeader>
    <div soneChatPaneHeading>
      <h3 soneChatPaneTitle>Ask about this meeting</h3>
      <span soneChatPaneDescription>Answers use the planning meeting transcript</span>
    </div>
    <div soneChatPaneActions>
      <button soneBtn type="button" variant="ghost" size="sm" (click)="reset()">
        <sone-icon icon="plus" /><span>New</span>
      </button>
    </div>
  </div>
  <sone-chat-thread style="max-height: 360px">
    @for (turn of turns(); track turn.id) {
      <sone-chat-message [from]="turn.role">
        <div soneChatMessageContent>{{ turn.content }}</div>
      </sone-chat-message>
    }
    @if (pending()) {
      <sone-chat-message from="assistant"><sone-typing-indicator /></sone-chat-message>
    }
  </sone-chat-thread>
  <sone-suggestion-chips [suggestions]="starters" [disabled]="pending()" (picked)="send($event)" />
  <sone-chat-composer (submitted)="send(draft())">
    <textarea soneChatComposerInput rows="1" aria-label="Your question"
      placeholder="Ask about this meeting…" [value]="draft()"
      (draftInput)="draft.set($event)" [disabled]="pending()"></textarea>
    <sone-chat-composer-submit [pending]="pending()" [disabled]="pending() || !draft().trim()" />
  </sone-chat-composer>
</div>`;

export const code = TEMPLATE;

const OPENING: readonly Turn[] = [
  {
    id: 1,
    role: "user",
    content: "What did Ada and Leo decide about the onboarding checklist?",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "They agreed to cut the checklist from twelve steps to five and to ship the shorter version behind a feature flag first. Leo owns the rollout.",
  },
];

@Component({
  selector: "docs-chat-demo",
  imports: [...SONE_CHAT_PARTS, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ChatDemo {
  private readonly injector = inject(Injector);
  private readonly thread = viewChild.required(SoneChatThreadComponent);
  private nextId = OPENING.length + 1;
  private reply?: ReturnType<typeof setTimeout>;

  readonly starters = [
    "Summarize the key decisions",
    "What are my action items?",
  ];
  readonly turns = signal<readonly Turn[]>(OPENING);
  readonly draft = signal("");
  readonly pending = signal(false);

  send(text: string): void {
    const question = text.trim();
    if (!question || this.pending()) return;
    this.draft.set("");
    this.append("user", question);
    this.pending.set(true);
    // A canned reply stands in for the model; only ever runs after a user action.
    this.reply = setTimeout(() => {
      this.pending.set(false);
      this.append(
        "assistant",
        "This is a demo, so here is a canned answer: the next review is on Friday.",
      );
    }, 1200);
  }

  reset(): void {
    clearTimeout(this.reply);
    this.turns.set(OPENING);
    this.pending.set(false);
  }

  private append(role: Turn["role"], content: string): void {
    this.turns.update((turns) => [
      ...turns,
      { id: this.nextId++, role, content },
    ]);
    afterNextRender(() => this.thread().scrollToEnd(), {
      injector: this.injector,
    });
  }
}
