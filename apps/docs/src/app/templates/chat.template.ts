import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_CHAT_PARTS,
  SoneChatThreadComponent,
} from "@surface-one/angular/chat";
import { SONE_EMPTY_PARTS } from "@surface-one/angular/empty-state";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SoneMarkdownComponent } from "@surface-one/angular/markdown";

type Turn =
  | { readonly id: string; readonly kind: "user"; readonly text: string }
  | { readonly id: string; readonly kind: "assistant"; readonly text: string }
  | { readonly id: string; readonly kind: "marker"; readonly text: string };

interface Source {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
}

const THREAD: readonly Turn[] = [
  {
    id: "t1",
    kind: "user",
    text: "What did we agree on for the Harbor launch date?",
  },
  { id: "t2", kind: "marker", text: "Searched 4 notes" },
  {
    id: "t3",
    kind: "assistant",
    text:
      "The team agreed to launch **Harbor on October 18**, one week later than first planned.\n\n" +
      "- Ada Park moved the date to leave room for the billing migration.\n" +
      "- Leo Ruiz will freeze the release branch on **October 14**.\n" +
      "- Marketing keeps the announcement draft but holds it until QA signs off.",
  },
  { id: "t4", kind: "user", text: "Who is writing the launch checklist?" },
  { id: "t5", kind: "marker", text: "Searched 2 meetings" },
  {
    id: "t6",
    kind: "assistant",
    text:
      "Mina Sato owns the checklist. She plans to share a first draft in Friday's sync, " +
      "and Theo Grant will review the support hand-off section.",
  },
];

const REPLY =
  "Here is what I found in your notes: the open questions are the **pricing page screenshots** " +
  "and the **support rota for launch week**. Both are tracked as reminders for Leo Ruiz.";

@Component({
  selector: "docs-chat-template",
  imports: [
    ...SONE_CHAT_PARTS,
    ...SONE_ITEM_PARTS,
    ...SONE_EMPTY_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneMarkdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <div soneChatPane class="pane">
        <div soneChatPaneHeader>
          <div soneChatPaneHeading>
            <h2 soneChatPaneTitle>Ask about Harbor launch</h2>
            <span soneChatPaneDescription
              >Answers use the project's notes and meetings</span
            >
          </div>
          <div soneChatPaneActions>
            <button soneBtn variant="ghost" size="sm" type="button">
              <sone-icon icon="history" /><span>History</span>
            </button>
            <button
              soneBtn
              variant="ghost"
              size="sm"
              type="button"
              (click)="reset()"
            >
              <sone-icon icon="plus" /><span>New chat</span>
            </button>
          </div>
        </div>

        <sone-chat-thread label="Conversation with the assistant">
          @if (!turns().length && !pending()) {
            <div soneEmpty>
              <div soneEmptyHeader>
                <div soneEmptyMedia variant="icon">
                  <sone-icon icon="ask" />
                </div>
                <p soneEmptyTitle>Start a new conversation</p>
                <p soneEmptyDescription>
                  Ask about decisions, owners or follow-ups in Harbor launch.
                </p>
              </div>
            </div>
          }
          @for (turn of turns(); track turn.id) {
            @switch (turn.kind) {
              @case ("marker") {
                <div soneMarker class="marker">
                  <span soneMarkerIcon
                    ><sone-icon icon="search" size="sm"
                  /></span>
                  <span soneMarkerContent>{{ turn.text }}</span>
                </div>
              }
              @case ("user") {
                <sone-chat-message from="user">
                  <div soneChatMessageContent>{{ turn.text }}</div>
                </sone-chat-message>
              }
              @default {
                <sone-chat-message from="assistant">
                  <div soneChatMessageContent>
                    <sone-markdown size="sm" [source]="turn.text" />
                  </div>
                </sone-chat-message>
              }
            }
          }
          @if (pending()) {
            <sone-chat-message from="assistant">
              <sone-typing-indicator />
            </sone-chat-message>
          }
        </sone-chat-thread>

        <div class="footer">
          <sone-suggestion-chips
            [suggestions]="suggestions"
            [disabled]="pending()"
            (picked)="send($event)"
          />
          <sone-chat-composer (submitted)="send(draft())">
            <textarea
              soneChatComposerInput
              rows="1"
              aria-label="Ask a question"
              placeholder="Ask about this project…"
              [value]="draft()"
              [disabled]="pending()"
              (draftInput)="draft.set($event)"
            ></textarea>
            <sone-chat-composer-submit
              [pending]="pending()"
              [disabled]="!canSend()"
            />
          </sone-chat-composer>
        </div>
      </div>

      <div class="sources">
        <h2 class="sources-title">
          Sources
          <span soneBadge variant="secondary">{{ sources.length }}</span>
        </h2>
        <p class="sources-copy">
          The assistant only reads what is in this project.
        </p>
        <ul soneItemGroup class="source-list">
          @for (source of sources; track source.id) {
            <li soneItem variant="outline" size="sm">
              <span soneItemMedia variant="icon"
                ><sone-icon icon="notes"
              /></span>
              <div soneItemContent>
                <p soneItemTitle>{{ source.title }}</p>
                <p soneItemDescription>{{ source.meta }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-5);
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 16rem;
      gap: var(--space-5);
      align-items: start;
    }
    .pane {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    sone-chat-thread {
      height: 26rem;
    }
    .marker {
      color: var(--text-muted);
    }
    .footer {
      display: grid;
      gap: var(--space-3);
    }
    .sources {
      display: grid;
      gap: var(--space-3);
    }
    .sources-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }
    .sources-copy {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .source-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    @media (max-width: 720px) {
      :host {
        padding: var(--space-3);
      }
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
      sone-chat-thread {
        height: 22rem;
      }
    }
  `,
})
export default class Template {
  private readonly injector = inject(Injector);
  private readonly thread = viewChild(SoneChatThreadComponent);
  private replyTimer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 0;

  protected readonly suggestions = [
    "What questions are still open?",
    "Summarize the launch risks",
    "List my action items",
  ] as const;
  protected readonly sources: readonly Source[] = [
    {
      id: "s1",
      title: "Harbor launch — weekly sync",
      meta: "Meeting · Oct 2 · 42 min",
    },
    { id: "s2", title: "Release plan", meta: "Note · edited Sep 30" },
    {
      id: "s3",
      title: "Billing migration risks",
      meta: "Note · edited Sep 28",
    },
    { id: "s4", title: "Support rota draft", meta: "Note · edited Sep 26" },
  ];

  protected readonly turns = signal<readonly Turn[]>(THREAD);
  protected readonly draft = signal("");
  protected readonly pending = signal(false);
  protected readonly canSend = computed(
    () => !this.pending() && this.draft().trim().length > 0,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.replyTimer !== null) clearTimeout(this.replyTimer);
    });
  }

  protected send(text: string): void {
    const question = text.trim();
    if (!question || this.pending()) return;
    this.turns.update((t) => [
      ...t,
      { id: `n${++this.nextId}`, kind: "user", text: question },
    ]);
    this.draft.set("");
    this.pending.set(true);
    this.scrollToEnd();
    // Runs only after a user action (never during SSR): a canned reply stands in for the model.
    this.replyTimer = setTimeout(() => {
      this.replyTimer = null;
      this.turns.update((t) => [
        ...t,
        { id: `n${++this.nextId}`, kind: "marker", text: "Searched 4 notes" },
        { id: `n${++this.nextId}`, kind: "assistant", text: REPLY },
      ]);
      this.pending.set(false);
      this.scrollToEnd();
    }, 900);
  }

  protected reset(): void {
    if (this.replyTimer !== null) clearTimeout(this.replyTimer);
    this.replyTimer = null;
    this.pending.set(false);
    this.draft.set("");
    this.turns.set([]);
  }

  private scrollToEnd(): void {
    afterNextRender(() => this.thread()?.scrollToEnd(), {
      injector: this.injector,
    });
  }
}
