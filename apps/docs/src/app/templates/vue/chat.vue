<script setup lang="ts">
import DOMPurify from "dompurify";
import { marked } from "marked";
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import {
  SoneBadge,
  SoneButton,
  SoneEmpty,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupTextarea,
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemTitle,
  SoneSpinner,
} from "@surface-one/vue";

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

const suggestions = [
  "What questions are still open?",
  "Summarize the launch risks",
  "List my action items",
] as const;
const sources: readonly Source[] = [
  {
    id: "s1",
    title: "Harbor launch — weekly sync",
    meta: "Meeting · Oct 2 · 42 min",
  },
  { id: "s2", title: "Release plan", meta: "Note · edited Sep 30" },
  { id: "s3", title: "Billing migration risks", meta: "Note · edited Sep 28" },
  { id: "s4", title: "Support rota draft", meta: "Note · edited Sep 26" },
];

const turns = ref<readonly Turn[]>(THREAD);
const draft = ref("");
const pending = ref(false);
const canSend = computed(() => !pending.value && draft.value.trim().length > 0);

const thread = ref<HTMLElement | null>(null);
let replyTimer: ReturnType<typeof setTimeout> | null = null;
let nextId = 0;

/**
 * Markdown to HTML for `v-html`. Model output is untrusted, so the HTML goes through
 * DOMPurify — which needs a DOM: on the server (SSR) it is skipped, which is safe here
 * only because the server ever renders just the trusted constant THREAD above.
 */
function markdown(source: string): string {
  const html = marked.parse(source, { async: false, gfm: true, breaks: true });
  return typeof window === "undefined" ? html : DOMPurify.sanitize(html);
}

// Rendered once per turn, not on every re-render (each keystroke in the composer re-renders).
const answers = computed(
  () =>
    new Map(
      turns.value
        .filter((t) => t.kind === "assistant")
        .map((t) => [t.id, markdown(t.text)]),
    ),
);

function scrollToEnd(): void {
  void nextTick(() => {
    const el = thread.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function send(text: string): void {
  const question = text.trim();
  if (!question || pending.value) return;
  turns.value = [
    ...turns.value,
    { id: `n${++nextId}`, kind: "user", text: question },
  ];
  draft.value = "";
  pending.value = true;
  scrollToEnd();
  // Runs only after a user action (never during SSR): a canned reply stands in for the model.
  replyTimer = setTimeout(() => {
    replyTimer = null;
    turns.value = [
      ...turns.value,
      { id: `n${++nextId}`, kind: "marker", text: "Searched 4 notes" },
      { id: `n${++nextId}`, kind: "assistant", text: REPLY },
    ];
    pending.value = false;
    scrollToEnd();
  }, 900);
}

// Enter sends, Shift + Enter adds a new line.
function onComposerKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send(draft.value);
  }
}

function reset(): void {
  if (replyTimer !== null) clearTimeout(replyTimer);
  replyTimer = null;
  pending.value = false;
  draft.value = "";
  turns.value = [];
}

onBeforeUnmount(() => {
  if (replyTimer !== null) clearTimeout(replyTimer);
});
</script>

<template>
  <div class="chat-template">
    <div class="layout">
      <!-- No Vue chat pane yet: the same markup and classes as [soneChatPane] and its parts. -->
      <div data-slot="chat-pane" class="card pane">
        <div data-slot="chat-pane-header">
          <div data-slot="chat-pane-heading">
            <h2 data-slot="chat-pane-title">Ask about Harbor launch</h2>
            <span data-slot="chat-pane-description"
              >Answers use the project's notes and meetings</span
            >
          </div>
          <div data-slot="chat-pane-actions">
            <SoneButton variant="ghost" size="sm" type="button">
              <SoneIcon icon="history" /><span>History</span>
            </SoneButton>
            <SoneButton variant="ghost" size="sm" type="button" @click="reset">
              <SoneIcon icon="plus" /><span>New chat</span>
            </SoneButton>
          </div>
        </div>

        <!-- No Vue chat thread yet: the same markup and classes as <sone-chat-thread>. -->
        <div
          ref="thread"
          data-slot="chat-thread"
          class="thread"
          role="log"
          aria-live="polite"
          aria-label="Conversation with the assistant"
        >
          <SoneEmpty v-if="!turns.length && !pending">
            <SoneEmptyHeader>
              <SoneEmptyMedia variant="icon">
                <SoneIcon icon="ask" />
              </SoneEmptyMedia>
              <SoneEmptyTitle as="p">Start a new conversation</SoneEmptyTitle>
              <SoneEmptyDescription>
                Ask about decisions, owners or follow-ups in Harbor launch.
              </SoneEmptyDescription>
            </SoneEmptyHeader>
          </SoneEmpty>
          <template v-for="turn in turns" :key="turn.id">
            <!-- No Vue marker yet: the same markup and classes as [soneMarker]. -->
            <div
              v-if="turn.kind === 'marker'"
              data-slot="marker"
              data-variant="default"
              class="marker"
            >
              <span data-slot="marker-icon" aria-hidden="true"
                ><SoneIcon icon="search" size="sm"
              /></span>
              <span data-slot="marker-content">{{ turn.text }}</span>
            </div>
            <!-- No Vue chat message yet: the same markup and classes as <sone-chat-message>. -->
            <div
              v-else-if="turn.kind === 'user'"
              data-slot="message"
              data-align="end"
              data-from="user"
              class="is-user"
            >
              <div data-slot="message-content">
                <div data-slot="bubble" data-variant="default" data-align="end">
                  <div data-slot="bubble-content" aria-label="You said">
                    {{ turn.text }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              data-slot="message"
              data-align="start"
              data-from="assistant"
              class="is-assistant"
            >
              <div data-slot="message-content">
                <div data-slot="bubble" data-variant="ghost" data-align="start">
                  <div data-slot="bubble-content" aria-label="Assistant said">
                    <!-- No Vue markdown yet: the same wrapper as <sone-markdown size="sm">. -->
                    <div class="markdown" data-slot="markdown" data-size="sm">
                      <div
                        class="markdown-block"
                        v-html="answers.get(turn.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div
            v-if="pending"
            data-slot="message"
            data-align="start"
            data-from="assistant"
            class="is-assistant"
          >
            <div data-slot="message-content">
              <!-- No Vue typing indicator yet: the same markup as <sone-typing-indicator>. -->
              <div
                data-slot="marker"
                data-variant="default"
                aria-label="Thinking"
              >
                <span data-slot="marker-icon" aria-hidden="true"
                  ><SoneSpinner :size="16" :label="null"
                /></span>
                <span data-slot="marker-content" class="shimmer"
                  >Thinking…</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <!-- No Vue suggestion chips yet: the same markup as <sone-suggestion-chips>. -->
          <div
            data-slot="suggestions"
            role="group"
            aria-label="Suggested questions"
          >
            <SoneButton
              v-for="(s, i) in suggestions"
              :key="s"
              variant="outline"
              size="sm"
              type="button"
              :style="{ '--i': i }"
              :disabled="pending"
              @click="send(s)"
            >
              {{ s }}
            </SoneButton>
          </div>
          <!-- No Vue chat composer yet: the same markup and classes as <sone-chat-composer>. -->
          <div data-slot="chat-composer" data-layout="inline">
            <SoneInputGroup as="form" @submit.prevent="send(draft)">
              <SoneInputGroupTextarea
                v-model="draft"
                rows="1"
                aria-label="Ask a question"
                placeholder="Ask about this project…"
                :disabled="pending"
                @keydown="onComposerKeydown"
              />
              <SoneInputGroupAddon as="span" align="inline-end">
                <span data-slot="chat-composer-submit">
                  <SoneButton
                    size="icon-sm"
                    type="submit"
                    :disabled="!canSend"
                    :aria-label="pending ? 'Sending' : 'Send'"
                  >
                    <SoneSpinner v-if="pending" :size="16" :label="null" />
                    <svg
                      v-else
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
        </div>
      </div>

      <div class="sources">
        <h2 class="sources-title">
          Sources
          <SoneBadge variant="secondary">{{ sources.length }}</SoneBadge>
        </h2>
        <p class="sources-copy">
          The assistant only reads what is in this project.
        </p>
        <SoneItemGroup as="ul" class="source-list">
          <SoneItem
            v-for="source in sources"
            :key="source.id"
            as="li"
            variant="outline"
            size="sm"
          >
            <SoneItemMedia as="span" variant="icon"
              ><SoneIcon icon="notes"
            /></SoneItemMedia>
            <SoneItemContent>
              <SoneItemTitle>{{ source.title }}</SoneItemTitle>
              <SoneItemDescription>{{ source.meta }}</SoneItemDescription>
            </SoneItemContent>
          </SoneItem>
        </SoneItemGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-template {
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
.thread {
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
  .chat-template {
    padding: var(--space-3);
  }
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .thread {
    height: 22rem;
  }
}
</style>
