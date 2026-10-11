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

import {
  type Message,
  type Conversation,
  CONVERSATIONS,
  REPLIES,
  now,
} from "../data/messages";

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

<style scoped src="../styles/messages.css"></style>
<style scoped src="../styles/messages.twins.css"></style>
