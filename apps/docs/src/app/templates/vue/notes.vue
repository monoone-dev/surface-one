<script setup lang="ts">
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardContent,
  SoneEmpty,
  SoneEmptyDescription,
  SoneIcon,
  SoneMenu,
  SoneMenuGroup,
  SoneMenuItem,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSlider,
} from "@surface-one/vue";

interface Segment {
  readonly id: number;
  readonly speakerKey: string;
  readonly speaker: string;
  readonly tone: "me" | "others";
  readonly startS: number;
  readonly endS: number;
  readonly text: string;
}

/** Consecutive segments of one speaker, shown as one turn. */
interface Turn {
  readonly key: string;
  readonly speakerKey: string;
  readonly speaker: string;
  readonly tone: "me" | "others";
  readonly startS: number;
  endS: number;
  text: string;
  readonly fragments: Segment[];
}

/** A silent, zero-length WAV inlined as a data URI: no network request, nothing to play. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

const SEGMENTS: readonly Segment[] = [
  {
    id: 0,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 0,
    endS: 7,
    text: "Thanks for joining. Let's lock the Harbor launch plan today.",
  },
  {
    id: 1,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 7,
    endS: 14,
    text: "I'd like to move the date to October 18 to give billing a full week.",
  },
  {
    id: 2,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 14,
    endS: 23,
    text: "That works. I can freeze the release branch on the 14th and run the migration dry run on the 15th.",
  },
  {
    id: 3,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 23,
    endS: 31,
    text: "I'll own the launch checklist and share a draft in Friday's sync.",
  },
  {
    id: 4,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 31,
    endS: 37,
    text: "Who is covering support during launch week?",
  },
  {
    id: 5,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 37,
    endS: 45,
    text: "Still open. Leo, can you propose a rota by Wednesday?",
  },
  {
    id: 6,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 45,
    endS: 52,
    text: "Sure, I'll draft it and ask the support leads to review.",
  },
  {
    id: 7,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 52,
    endS: 60,
    text: "Great. Last item: the pricing page screenshots still need updating.",
  },
];

const NOTES = `Harbor launch moves to **October 18**. The extra week gives the billing migration a full dry run before the release freeze.

#### Decisions

- Launch date set to **October 18**.
- Release branch freezes on **October 14**.
- The announcement stays in draft until QA signs off.

#### Action items

- [ ] Leo Ruiz — propose a launch-week support rota by Wednesday
- [ ] Mina Sato — share the launch checklist draft on Friday
- [x] Ada Park — confirm the new date with marketing

#### Open questions

1. Who updates the pricing page screenshots?
2. Do we need a status page entry for the migration window?`;

function foldTurns(segments: readonly Segment[]): Turn[] {
  const out: Turn[] = [];
  for (const s of segments) {
    const cur = out[out.length - 1];
    if (cur && cur.speakerKey === s.speakerKey) {
      cur.fragments.push(s);
      cur.endS = s.endS;
      cur.text += ` ${s.text}`;
    } else {
      out.push({ ...s, key: `t${s.id}`, fragments: [s] });
    }
  }
  return out;
}

const clock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

// Read-only task boxes as spans, the same markup <sone-markdown> renders.
const md = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    checkbox({ checked }) {
      return `<span class="markdown-task-box" role="checkbox" aria-label="Task" aria-checked="${checked}" aria-disabled="true"></span>`;
    },
    listitem(item) {
      if (!item.task) return false;
      const cls = item.checked ? " is-done" : "";
      return `<li class="markdown-task task-list-item${cls}"><span class="markdown-task-text">${this.parser.parse(item.tokens)}</span></li>\n`;
    },
  },
});

const turns = foldTurns(SEGMENTS);

const currentTime = ref(14);
const query = ref("");
const starred = ref(false);
const menuOpen = ref(false);

/**
 * DOMPurify needs a DOM, so it runs in the browser only; on the server (SSR) the
 * output of the trusted NOTES constant above is used as is. Sanitise any markdown
 * that comes from users or a model.
 */
const notesHtml = computed(() => {
  const html = md.parse(NOTES, { async: false });
  return typeof window === "undefined" ? html : DOMPurify.sanitize(html);
});

const visibleTurns = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? turns.filter((t) => t.text.toLowerCase().includes(q)) : turns;
});
const activeTurnKey = computed(
  () =>
    turns.find(
      (t) => currentTime.value >= t.startS && currentTime.value < t.endS,
    )?.key ?? null,
);
const isActive = (f: Segment): boolean =>
  currentTime.value >= f.startS && currentTime.value < f.endS;

// The audio player's own state.
const audio = ref<HTMLAudioElement | null>(null);
const playerTime = ref(0);
const duration = ref(0);
const playing = ref(false);

function togglePlay(): void {
  const el = audio.value;
  if (!el) return;
  if (el.paused) el.play().catch(() => (playing.value = false));
  else el.pause();
}

function onLoaded(): void {
  const el = audio.value;
  if (el && Number.isFinite(el.duration)) duration.value = el.duration;
}

function onTimeUpdate(): void {
  const t = audio.value?.currentTime ?? 0;
  playerTime.value = t;
  currentTime.value = t;
}

function seekAudio(seconds: number): void {
  const el = audio.value;
  if (!el) return;
  el.currentTime = seconds;
  onTimeUpdate();
}

// The page menu closes on a click outside it (listener added in the browser only).
const menuEl = ref<HTMLElement | null>(null);
function onDocumentClick(event: MouseEvent): void {
  if (menuOpen.value && !menuEl.value?.contains(event.target as Node)) {
    menuOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));
</script>

<template>
  <div class="notes-template">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Meeting · Oct 2 · 42 min</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2"
          >Harbor launch — weekly sync</SonePageHeaderTitle
        >
        <SonePageHeaderDescription>
          Ada Park, Leo Ruiz and Mina Sato · Product
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <!-- No Vue page actions yet: the same markup as <sone-page-actions>, with a SoneMenu. -->
        <div
          data-slot="page-actions"
          class="page-actions"
          :data-state="menuOpen ? 'open' : 'closed'"
        >
          <span class="page-actions-status" data-slot="page-actions-status"
            >Edited 2 min ago</span
          >
          <span data-slot="page-actions-lead">
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Favorite"
              :aria-pressed="starred"
              @click="starred = !starred"
            >
              <SoneIcon icon="star" />
            </SoneButton>
          </span>
          <div
            ref="menuEl"
            class="menu-anchor"
            @keydown.escape="menuOpen = false"
          >
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="More actions"
              title="More actions"
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
              aria-label="More actions"
              @click="menuOpen = false"
            >
              <SoneMenuGroup>
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="link" /> Copy link
                </SoneMenuItem>
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="share" /> Share
                </SoneMenuItem>
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="download" /> Export as Markdown
                </SoneMenuItem>
              </SoneMenuGroup>
              <SoneMenuGroup>
                <SoneMenuItem type="button" role="menuitem">
                  <SoneIcon icon="refresh" /> Regenerate notes
                </SoneMenuItem>
                <SoneMenuItem
                  variant="destructive"
                  type="button"
                  role="menuitem"
                >
                  <SoneIcon icon="trash" /> Move to Trash
                </SoneMenuItem>
              </SoneMenuGroup>
            </SoneMenu>
          </div>
        </div>
      </SonePageHeaderActions>
    </SonePageHeader>

    <SoneCard size="sm" class="player">
      <SoneCardContent>
        <!-- No Vue audio player yet: a simplified <sone-audio-player> (play, time, seek). -->
        <div
          data-slot="audio-player"
          class="audio-player"
          :data-state="playing ? 'playing' : 'paused'"
        >
          <audio
            ref="audio"
            :src="SILENT_WAV"
            preload="metadata"
            @loadedmetadata="onLoaded"
            @timeupdate="onTimeUpdate"
            @play="playing = true"
            @pause="playing = false"
            @ended="playing = false"
          ></audio>
          <SoneButton
            size="icon"
            type="button"
            class="play"
            :aria-label="playing ? 'Pause' : 'Play'"
            @click="togglePlay"
          >
            <svg
              v-if="playing"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="14" y="4" width="4" height="16" rx="1" />
              <rect x="6" y="4" width="4" height="16" rx="1" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M6 3.9v16.2a1 1 0 0 0 1.5.86l13.5-8.1a1 1 0 0 0 0-1.72L7.5 3.04A1 1 0 0 0 6 3.9Z"
              />
            </svg>
          </SoneButton>
          <span class="time" data-slot="audio-player-time">{{
            clock(playerTime)
          }}</span>
          <SoneSlider
            class="track"
            aria-label="Seek"
            :model-value="playerTime"
            :max="duration"
            :aria-valuetext="`${clock(playerTime)} of ${clock(duration)}`"
            @update:model-value="seekAudio"
          />
          <span class="time" data-slot="audio-player-duration">{{
            clock(duration)
          }}</span>
        </div>
      </SoneCardContent>
    </SoneCard>

    <div class="columns">
      <div class="column" role="group" aria-labelledby="notes-summary">
        <div class="column-head">
          <h3 id="notes-summary">Summary</h3>
          <SoneBadge variant="secondary"
            ><SoneIcon icon="sparkles" size="xs" /> Generated</SoneBadge
          >
        </div>
        <!-- No Vue markdown yet: the same wrapper as <sone-markdown>. -->
        <div class="markdown" data-slot="markdown" data-size="default">
          <div class="markdown-block" v-html="notesHtml" />
        </div>
      </div>

      <div class="column" role="group" aria-labelledby="notes-transcript">
        <div class="column-head">
          <h3 id="notes-transcript">Transcript</h3>
          <input
            v-model="query"
            type="search"
            class="search"
            aria-label="Filter transcript"
            placeholder="Filter…"
          />
        </div>
        <!-- No Vue transcript yet: the same markup and classes as <sone-transcript>. -->
        <div data-slot="transcript">
          <div v-if="visibleTurns.length" class="transcript-card panel-card">
            <ul data-slot="message-group" class="turns">
              <li
                v-for="t in visibleTurns"
                :key="t.key"
                data-slot="message"
                data-align="start"
                class="turn"
                :class="{ 'is-active': t.key === activeTurnKey }"
                :data-turn="t.key"
              >
                <SoneAvatar
                  data-slot="message-avatar"
                  size="sm"
                  class="turn-avatar"
                  :data-tone="t.tone"
                  aria-hidden="true"
                >
                  <SoneAvatarFallback>{{
                    initials(t.speaker)
                  }}</SoneAvatarFallback>
                </SoneAvatar>
                <div data-slot="message-content">
                  <div data-slot="message-header" class="turn-head">
                    <span class="turn-speaker">{{ t.speaker }}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      class="turn-time"
                      @click="currentTime = t.startS"
                    >
                      {{ clock(t.startS) }}
                    </button>
                  </div>
                  <div
                    data-slot="bubble"
                    :data-variant="t.key === activeTurnKey ? 'tinted' : 'muted'"
                    data-align="start"
                  >
                    <p data-slot="bubble-content" class="turn-text">
                      <button
                        v-for="f in t.fragments"
                        :key="f.id"
                        type="button"
                        class="frag"
                        :class="{ 'is-active': isActive(f) }"
                        @click="currentTime = f.startS"
                      >
                        {{ f.text }}
                      </button>
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <SoneEmpty v-else class="empty-card panel-card">
            <SoneEmptyDescription
              >No turns match “{{ query }}”.</SoneEmptyDescription
            >
          </SoneEmpty>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-template {
  display: block;
  padding: var(--space-6);
}
.player {
  margin-bottom: var(--space-6);
}
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
.column {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}
.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: var(--space-7);
}
.column-head h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.search {
  width: 12rem;
  max-width: 60%;
}

/* Page actions (the <sone-page-actions> host styles). */
.page-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-size: var(--font-size-sm);
}
.page-actions-status {
  overflow: hidden;
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Audio player (from the <sone-audio-player> styles). */
.audio-player {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.play {
  flex: none;
  border-radius: var(--radius-pill);
}
.time {
  flex: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.track {
  flex: 1 1 auto;
  min-width: 0;
}

/* Transcript (from the <sone-transcript> styles). */
.transcript-card {
  padding: var(--space-3);
  max-height: 520px;
  overflow: auto;
}
.turns {
  list-style: none;
  padding: 0;
  margin: 0;
}
.turn {
  scroll-margin: var(--space-4);
}
.turn-avatar {
  align-self: flex-start;
}
.turn-speaker {
  color: var(--text-secondary);
}
.turn-time {
  padding: 0;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: color var(--transition);
}
.turn-time:hover,
.turn.is-active .turn-time {
  color: var(--accent-text);
}
.turn-time:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.turn-text {
  margin: 0;
}
.frag {
  display: inline;
  /* A <button> computes to inline-block; keep every fragment at least 24px tall (WCAG 2.5.8). */
  min-height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  vertical-align: baseline;
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition);
}
.frag:hover {
  color: var(--accent-text);
}
.frag:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.frag.is-active {
  background: var(--surface-base);
  box-shadow: 0 0 0 var(--focus-ring-width) var(--surface-base);
}

@media (max-width: 720px) {
  .notes-template {
    padding: var(--space-4);
  }
  .columns {
    grid-template-columns: minmax(0, 1fr);
  }
  .audio-player {
    flex-wrap: wrap;
  }
  .track {
    order: 1;
    flex-basis: 100%;
  }
}
</style>
