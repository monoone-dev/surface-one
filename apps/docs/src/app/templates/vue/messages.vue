<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupTextarea,
  SoneMenu,
  SoneMenuItem,
  SoneSpinner,
} from "@surface-one/vue";

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

const conversations = ref<readonly Conversation[]>(CONVERSATIONS);
const activeId = ref("leo");
const query = ref("");
const draft = ref("");
const typing = ref(false);
const starred = ref(false);
const menuOpen = ref(false);
const unread = ref<Record<string, number>>(
  Object.fromEntries(
    CONVERSATIONS.map((c) => [c.id, c.id === "leo" ? 0 : c.unread]),
  ),
);

const active = computed(() =>
  conversations.value.find((c) => c.id === activeId.value)!,
);
const thread = computed(() => active.value.messages);
const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  return conversations.value.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.messages.some((m) => m.text.toLowerCase().includes(q)),
  );
});

const threadEl = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;
let nextId = 0;

function last(c: Conversation): Message {
  return c.messages[c.messages.length - 1]!;
}

function now(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollToEnd(): void {
  void nextTick(() => {
    const el = threadEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function open(id: string): void {
  activeId.value = id;
  unread.value = { ...unread.value, [id]: 0 };
  typing.value = false;
  scrollToEnd();
}

function append(id: string, message: Message): void {
  conversations.value = conversations.value.map((c) =>
    c.id === id ? { ...c, messages: [...c.messages, message] } : c,
  );
  scrollToEnd();
}

function send(): void {
  const text = draft.value.trim();
  if (!text) return;
  const id = activeId.value;
  append(id, { id: `n${++nextId}`, mine: true, text, time: now() });
  draft.value = "";
  // Runs only after a user action (never during SSR): a canned reply stands in for the other person.
  if (timer !== null) clearTimeout(timer);
  typing.value = true;
  timer = setTimeout(() => {
    timer = null;
    typing.value = false;
    append(id, {
      id: `n${++nextId}`,
      mine: false,
      text: REPLIES[nextId % REPLIES.length]!,
      time: now(),
    });
  }, 1400);
}

// Enter sends, Shift + Enter adds a new line.
function onComposerKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
}

// The conversation menu closes on a click outside it (listener added in the browser only).
function onDocumentClick(event: MouseEvent): void {
  if (menuOpen.value && !menuEl.value?.contains(event.target as Node)) {
    menuOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  if (timer !== null) clearTimeout(timer);
});
</script>

<template>
  <div class="messages-template">
    <div class="inbox">
      <nav class="list" aria-label="Conversations">
        <div class="list-head">
          <h2>Messages</h2>
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="New message"
          >
            <SoneIcon icon="edit" />
          </SoneButton>
        </div>
        <input
          v-model="query"
          type="search"
          class="search"
          aria-label="Search conversations"
          placeholder="Search…"
        />
        <ul class="people">
          <li v-for="c in visible" :key="c.id">
            <button
              type="button"
              class="person"
              :aria-current="activeId === c.id ? 'true' : undefined"
              @click="open(c.id)"
            >
              <span class="presence" :class="{ online: c.online }">
                <SoneAvatar size="sm" aria-hidden="true">
                  <SoneAvatarFallback>{{ c.initials }}</SoneAvatarFallback>
                </SoneAvatar>
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
              <SoneBadge v-if="unread[c.id]" class="unread">
                {{ unread[c.id] }}<span class="sr-only"> unread</span>
              </SoneBadge>
            </button>
          </li>
          <li v-if="!visible.length" class="empty">
            No conversations match “{{ query }}”.
          </li>
        </ul>
      </nav>

      <section class="conversation" aria-labelledby="msg-title">
        <header class="conv-head">
          <SoneAvatar size="sm" aria-hidden="true">
            <SoneAvatarFallback>{{ active.initials }}</SoneAvatarFallback>
          </SoneAvatar>
          <div class="conv-heading">
            <h3 id="msg-title">{{ active.name }}</h3>
            <p>
              {{ active.role }} ·
              {{ active.online ? "Online" : "Away" }}
            </p>
          </div>
          <div class="conv-actions">
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Start a call"
            >
              <SoneIcon icon="audio-lines" />
            </SoneButton>
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Favorite conversation"
              :aria-pressed="starred"
              @click="starred = !starred"
            >
              <SoneIcon icon="star" />
            </SoneButton>
            <!-- No Vue row menu yet: a ghost icon button that opens a SoneMenu below it. -->
            <div
              ref="menuEl"
              class="menu-anchor"
              @keydown.escape="menuOpen = false"
            >
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Conversation actions"
                aria-haspopup="menu"
                :aria-expanded="menuOpen"
                @click="menuOpen = !menuOpen"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </SoneButton>
              <SoneMenu
                v-if="menuOpen"
                class="menu-panel"
                aria-label="Conversation actions"
                @click="menuOpen = false"
              >
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="bell-plus" /> Mute for 1 hour
                </SoneMenuItem>
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="search" /> Search in conversation
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  role="menuitem"
                  variant="destructive"
                >
                  <SoneIcon icon="trash" /> Delete conversation
                </SoneMenuItem>
              </SoneMenu>
            </div>
          </div>
        </header>

        <!-- No Vue chat thread yet: the same markup and classes as <sone-chat-thread>. -->
        <div
          ref="threadEl"
          data-slot="chat-thread"
          class="thread"
          role="log"
          aria-live="polite"
          :aria-label="'Conversation with ' + active.name"
        >
          <p class="day"><span>Today</span></p>
          <!-- No Vue message / bubble yet: the same markup as [soneMessage] and [soneBubble]. -->
          <div data-slot="message-group">
            <div
              v-for="(m, i) in thread"
              :key="m.id"
              data-slot="message"
              :data-align="m.mine ? 'end' : 'start'"
            >
              <SoneAvatar
                v-if="!m.mine"
                data-slot="message-avatar"
                size="sm"
                aria-hidden="true"
                :class="{ 'hidden-avatar': i > 0 && !thread[i - 1]!.mine }"
              >
                <SoneAvatarFallback>{{ active.initials }}</SoneAvatarFallback>
              </SoneAvatar>
              <div data-slot="message-content">
                <div
                  v-if="i === 0 || thread[i - 1]!.mine !== m.mine"
                  data-slot="message-header"
                >
                  {{ m.mine ? "You" : active.name }} · {{ m.time }}
                </div>
                <div
                  data-slot="bubble"
                  :data-variant="m.mine ? 'default' : 'muted'"
                  :data-align="m.mine ? 'end' : 'start'"
                >
                  <div data-slot="bubble-content">{{ m.text }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="typing" data-slot="message" data-align="start">
            <SoneAvatar data-slot="message-avatar" size="sm" aria-hidden="true">
              <SoneAvatarFallback>{{ active.initials }}</SoneAvatarFallback>
            </SoneAvatar>
            <div data-slot="message-content">
              <!-- No Vue typing indicator yet: the same markup as <sone-typing-indicator>. -->
              <div
                data-slot="marker"
                data-variant="default"
                :aria-label="active.name + ' is typing'"
              >
                <span data-slot="marker-icon" aria-hidden="true"
                  ><SoneSpinner :size="16" :label="null"
                /></span>
                <span data-slot="marker-content" class="shimmer"
                  >{{ active.name }} is typing…</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="composer">
          <!-- No Vue chat composer yet: the same markup and classes as <sone-chat-composer layout="block">. -->
          <div data-slot="chat-composer" data-layout="block">
            <SoneInputGroup as="form" @submit.prevent="send">
              <SoneInputGroupTextarea
                v-model="draft"
                rows="1"
                :aria-label="'Message ' + active.name"
                :placeholder="'Message ' + active.name + '…'"
                @keydown="onComposerKeydown"
              />
              <SoneInputGroupAddon align="block-end" data-chat-composer-footer>
                <div data-slot="chat-composer-tools">
                  <div data-slot="chat-composer-tool">
                    <SoneButton
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label="Attach a file"
                    >
                      <SoneIcon icon="plus" />
                    </SoneButton>
                    <SoneButton
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label="Insert a link"
                    >
                      <SoneIcon icon="link" />
                    </SoneButton>
                  </div>
                </div>
                <span data-slot="chat-composer-submit">
                  <SoneButton
                    size="icon-sm"
                    type="submit"
                    :disabled="!draft.trim()"
                    aria-label="Send"
                  >
                    <svg
                      data-slot="chat-send-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M4 12L20 4l-4 16-4-7-8-1z" fill="currentColor" />
                    </svg>
                  </SoneButton>
                </span>
              </SoneInputGroupAddon>
            </SoneInputGroup>
          </div>
          <p class="hint">Enter to send · Shift + Enter for a new line</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.messages-template {
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
.menu-anchor {
  position: relative;
  display: inline-flex;
}
.menu-panel {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  width: 15rem;
  z-index: var(--z-dropdown);
}
.thread {
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
</style>
