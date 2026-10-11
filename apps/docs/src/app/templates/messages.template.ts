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

import {
  type Message,
  type Conversation,
  CONVERSATIONS,
  REPLIES,
  now,
} from "./data/messages";

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

        <sone-chat-thread
          class="thread"
          [label]="'Conversation with ' + active().name"
        >
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
  `,
  styleUrl: "./styles/messages.css",
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
