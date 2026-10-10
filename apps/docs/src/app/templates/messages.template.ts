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
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SONE_BUBBLE_PARTS } from "@surface-one/angular/bubble";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_CHAT_PARTS,
  SoneChatThreadComponent,
} from "@surface-one/angular/chat";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_MESSAGE_PARTS } from "@surface-one/angular/message";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";

interface Message {
  readonly id: string;
  readonly mine: boolean;
  readonly text: string;
  readonly time: string;
}

interface Conversation {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly online: boolean;
  readonly unread: number;
  readonly messages: readonly Message[];
}

const CONVERSATIONS: readonly Conversation[] = [
  {
    id: "leo",
    name: "Leo Ruiz",
    initials: "LR",
    role: "Platform engineer",
    online: true,
    unread: 2,
    messages: [
      {
        id: "l1",
        mine: false,
        time: "09:12",
        text: "Morning! The migration dry run finished overnight.",
      },
      {
        id: "l2",
        mine: false,
        time: "09:12",
        text: "Two invoices failed validation — both from the legacy EUR plan.",
      },
      {
        id: "l3",
        mine: true,
        time: "09:20",
        text: "Nice catch. Can we patch the mapping before the freeze on the 14th?",
      },
      {
        id: "l4",
        mine: false,
        time: "09:24",
        text: "Yes, I'll open a PR today and tag you for review.",
      },
      {
        id: "l5",
        mine: false,
        time: "09:25",
        text: "Also: are we still on for the support rota sync tomorrow?",
      },
    ],
  },
  {
    id: "mina",
    name: "Mina Sato",
    initials: "MS",
    role: "Product designer",
    online: true,
    unread: 0,
    messages: [
      {
        id: "m1",
        mine: false,
        time: "Yesterday",
        text: "Shared the launch checklist draft in the Harbor space.",
      },
      {
        id: "m2",
        mine: true,
        time: "Yesterday",
        text: "Thanks — I'll go through it before Friday's sync.",
      },
    ],
  },
  {
    id: "theo",
    name: "Theo Grant",
    initials: "TG",
    role: "Support lead",
    online: false,
    unread: 1,
    messages: [
      {
        id: "t1",
        mine: false,
        time: "Mon",
        text: "Could you send me the hand-off notes for launch week?",
      },
    ],
  },
  {
    id: "iris",
    name: "Iris Novak",
    initials: "IN",
    role: "Marketing",
    online: false,
    unread: 0,
    messages: [
      {
        id: "i1",
        mine: true,
        time: "Sep 28",
        text: "The announcement stays in draft until QA signs off.",
      },
      {
        id: "i2",
        mine: false,
        time: "Sep 28",
        text: "Understood, I'll hold the newsletter too.",
      },
    ],
  },
];

const REPLIES = [
  "Sounds good, thanks!",
  "Got it — I'll follow up after lunch.",
  "Perfect, let's do that.",
];

@Component({
  selector: "docs-messages-template",
  imports: [
    ...SONE_AVATAR_PARTS,
    ...SONE_BUBBLE_PARTS,
    ...SONE_CHAT_PARTS,
    ...SONE_MENU_PARTS,
    ...SONE_MESSAGE_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneRowMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inbox">
      <nav class="list" aria-label="Conversations">
        <div class="list-head">
          <h2>Messages</h2>
          <button
            soneBtn
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="New message"
          >
            <sone-icon icon="edit" />
          </button>
        </div>
        <input
          type="search"
          class="search"
          aria-label="Search conversations"
          placeholder="Search…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <ul class="people">
          @for (c of visible(); track c.id) {
            <li>
              <button
                type="button"
                class="person"
                [attr.aria-current]="activeId() === c.id ? 'true' : null"
                (click)="open(c.id)"
              >
                <span class="presence" [class.online]="c.online">
                  <sone-avatar size="sm" aria-hidden="true"
                    ><span soneAvatarFallback>{{
                      c.initials
                    }}</span></sone-avatar
                  >
                </span>
                <span class="person-text">
                  <span class="person-top">
                    <span class="person-name">{{ c.name }}</span>
                    <span class="person-time">{{ last(c).time }}</span>
                  </span>
                  <span class="person-preview"
                    >{{ last(c).mine ? "You: " : "" }}{{ last(c).text }}</span
                  >
                </span>
                @if (unread()[c.id]) {
                  <span soneBadge class="unread">
                    {{ unread()[c.id] }}<span class="sr-only"> unread</span>
                  </span>
                }
              </button>
            </li>
          } @empty {
            <li class="empty">No conversations match “{{ query() }}”.</li>
          }
        </ul>
      </nav>

      <section class="conversation" aria-labelledby="msg-title">
        <header class="conv-head">
          <sone-avatar size="sm" aria-hidden="true"
            ><span soneAvatarFallback>{{
              active().initials
            }}</span></sone-avatar
          >
          <div class="conv-heading">
            <h3 id="msg-title">{{ active().name }}</h3>
            <p>
              {{ active().role }} ·
              {{ active().online ? "Online" : "Away" }}
            </p>
          </div>
          <div class="conv-actions">
            <button
              soneBtn
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Start a call"
            >
              <sone-icon icon="audio-lines" />
            </button>
            <button
              soneBtn
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Favorite conversation"
              [attr.aria-pressed]="starred()"
              (click)="starred.set(!starred())"
            >
              <sone-icon icon="star" />
            </button>
            <sone-row-menu label="Conversation actions">
              <button soneMenuItem type="button" role="menuitem">
                <sone-icon icon="bell-plus" /> Mute for 1 hour
              </button>
              <button soneMenuItem type="button" role="menuitem">
                <sone-icon icon="search" /> Search in conversation
              </button>
              <button
                soneMenuItem
                type="button"
                role="menuitem"
                variant="destructive"
              >
                <sone-icon icon="trash" /> Delete conversation
              </button>
            </sone-row-menu>
          </div>
        </header>

        <sone-chat-thread [label]="'Conversation with ' + active().name">
          <p class="day"><span>Today</span></p>
          <div soneMessageGroup>
            @for (m of thread(); track m.id; let i = $index) {
              @let prev = thread()[i - 1];
              <div soneMessage [align]="m.mine ? 'end' : 'start'">
                @if (!m.mine) {
                  <sone-avatar
                    soneMessageAvatar
                    size="sm"
                    aria-hidden="true"
                    [class.hidden-avatar]="prev && !prev.mine"
                    ><span soneAvatarFallback>{{
                      active().initials
                    }}</span></sone-avatar
                  >
                }
                <div soneMessageContent>
                  @if (!prev || prev.mine !== m.mine) {
                    <div soneMessageHeader>
                      {{ m.mine ? "You" : active().name }} · {{ m.time }}
                    </div>
                  }
                  <div
                    soneBubble
                    [variant]="m.mine ? 'default' : 'muted'"
                    [align]="m.mine ? 'end' : 'start'"
                  >
                    <div soneBubbleContent>{{ m.text }}</div>
                  </div>
                </div>
              </div>
            }
          </div>
          @if (typing()) {
            <div soneMessage>
              <sone-avatar soneMessageAvatar size="sm" aria-hidden="true"
                ><span soneAvatarFallback>{{
                  active().initials
                }}</span></sone-avatar
              >
              <div soneMessageContent>
                <sone-typing-indicator [label]="active().name + ' is typing'" />
              </div>
            </div>
          }
        </sone-chat-thread>

        <div class="composer">
          <sone-chat-composer layout="block" (submitted)="send()">
            <textarea
              soneChatComposerInput
              rows="1"
              [attr.aria-label]="'Message ' + active().name"
              [placeholder]="'Message ' + active().name + '…'"
              [value]="draft()"
              (draftInput)="draft.set($event)"
            ></textarea>
            <div soneChatComposerTools>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Attach a file"
              >
                <sone-icon icon="plus" />
              </button>
              <button
                soneBtn
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Insert a link"
              >
                <sone-icon icon="link" />
              </button>
            </div>
            <sone-chat-composer-submit [disabled]="!draft().trim()" />
          </sone-chat-composer>
          <p class="hint">Enter to send · Shift + Enter for a new line</p>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .inbox {
      display: grid;
      grid-template-columns: 18rem minmax(0, 1fr);
      height: 640px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      min-height: 0;
      padding: var(--space-4) var(--space-3);
      border-right: var(--border-width-thin) solid var(--border-subtle);
      background: var(--sidebar);
    }
    .list-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-1);
    }
    .list-head h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }
    .people {
      display: grid;
      align-content: start;
      gap: var(--space-0_5);
      flex: 1 1 auto;
      min-height: 0;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;
    }
    .person {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-2);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .person:hover {
      background: var(--surface-hover);
    }
    .person[aria-current="true"] {
      background: var(--accent-soft);
    }
    .person:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .presence {
      position: relative;
      flex: none;
    }
    .presence.online::after {
      content: "";
      position: absolute;
      right: -1px;
      bottom: -1px;
      width: 9px;
      height: 9px;
      border: 2px solid var(--sidebar);
      border-radius: var(--radius-pill);
      background: var(--success);
    }
    .person-text {
      display: grid;
      flex: 1 1 auto;
      min-width: 0;
    }
    .person-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .person-name {
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .person-time {
      flex: none;
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .person-preview {
      overflow: hidden;
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .unread {
      flex: none;
    }
    .empty {
      padding: var(--space-3);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }
    .conversation {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
    }
    .conv-head {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom: var(--border-width-thin) solid var(--border-subtle);
    }
    .conv-heading {
      flex: 1 1 auto;
      min-width: 0;
    }
    .conv-heading h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
    }
    .conv-heading p {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .conv-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    sone-chat-thread {
      flex: 1 1 auto;
      min-height: 0;
      padding: var(--space-4);
    }
    .day {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-3);
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .day::before,
    .day::after {
      content: "";
      flex: 1 1 auto;
      border-top: var(--border-width-thin) solid var(--border-subtle);
    }
    .hidden-avatar {
      visibility: hidden;
    }
    .composer {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-3) var(--space-4) var(--space-4);
    }
    .hint {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    @media (max-width: 720px) {
      .inbox {
        grid-template-columns: minmax(0, 1fr);
        height: auto;
      }
      .list {
        border-right: 0;
        border-bottom: var(--border-width-thin) solid var(--border-subtle);
      }
      .people {
        max-height: 12rem;
      }
      .conversation {
        height: 560px;
      }
    }
  `,
})
export default class Template {
  private readonly injector = inject(Injector);
  private readonly threadEl = viewChild(SoneChatThreadComponent);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 0;

  protected readonly conversations =
    signal<readonly Conversation[]>(CONVERSATIONS);
  protected readonly activeId = signal("leo");
  protected readonly query = signal("");
  protected readonly draft = signal("");
  protected readonly typing = signal(false);
  protected readonly starred = signal(false);
  protected readonly unread = signal<Record<string, number>>(
    Object.fromEntries(
      CONVERSATIONS.map((c) => [c.id, c.id === "leo" ? 0 : c.unread]),
    ),
  );

  protected readonly active = computed(() =>
    this.conversations().find((c) => c.id === this.activeId())!,
  );
  protected readonly thread = computed(() => this.active().messages);
  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.conversations().filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.timer !== null) clearTimeout(this.timer);
    });
  }

  protected last(c: Conversation): Message {
    return c.messages[c.messages.length - 1];
  }

  protected open(id: string): void {
    this.activeId.set(id);
    this.unread.update((u) => ({ ...u, [id]: 0 }));
    this.typing.set(false);
    this.scrollToEnd();
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text) return;
    const id = this.activeId();
    this.append(id, { id: `n${++this.nextId}`, mine: true, text, time: now() });
    this.draft.set("");
    // Runs only after a user action (never during SSR): a canned reply stands in for the other person.
    if (this.timer !== null) clearTimeout(this.timer);
    this.typing.set(true);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.typing.set(false);
      this.append(id, {
        id: `n${++this.nextId}`,
        mine: false,
        text: REPLIES[this.nextId % REPLIES.length],
        time: now(),
      });
    }, 1400);
  }

  private append(id: string, message: Message): void {
    this.conversations.update((all) =>
      all.map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
    this.scrollToEnd();
  }

  private scrollToEnd(): void {
    afterNextRender(() => this.threadEl()?.scrollToEnd(), {
      injector: this.injector,
    });
  }
}

function now(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
