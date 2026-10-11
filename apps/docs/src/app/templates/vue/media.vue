<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
  SoneElapsedTimer,
  SoneIcon,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemMedia,
  SoneItemTitle,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSlider,
  SoneSparkline,
  SoneSpeakerChip,
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatValue,
} from "@surface-one/vue";

import {
  type Speaker,
  type RecorderState,
  SILENT_WAV,
  TURNS,
  ADA,
  LEO,
  MINA,
  THEO,
  SCRIPT,
  silentWav,
} from "../data/media";

interface Block {
  readonly lane: string;
  readonly startS: number;
  readonly endS: number;
}

interface Chapter {
  readonly label: string;
  readonly startS: number;
  readonly endS: number;
}

interface Recording {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly durationS: number;
  readonly speakers: readonly Speaker[];
  readonly blocks: readonly Block[];
  readonly chapters: readonly Chapter[];
  readonly highlights: readonly number[];
  /** Loudness over the recording (0..1), for the sparkline. */
  readonly levels: readonly number[];
  readonly fresh?: boolean;
}

interface LiveLine {
  readonly id: string;
  readonly speaker: string;
  readonly tone: "me" | "others";
  readonly timeLabel: string;
  readonly final: boolean;
  readonly text: string;
  readonly flag?: string | null;
}

/** Who spoke when, chapters at even steps and a loudness curve — demo data. */
function recording(
  id: string,
  title: string,
  date: string,
  durationS: number,
  speakers: readonly Speaker[],
  chapters: readonly string[],
  highlights: readonly number[] = [],
  levels?: readonly number[],
): Recording {
  const at = (f: number) => Math.round(durationS * f);
  return {
    id,
    title,
    date,
    durationS,
    speakers,
    highlights,
    blocks: TURNS.slice(0, -1).map((f, i) => ({
      lane: speakers[i % speakers.length].name,
      startS: at(f),
      endS: at(TURNS[i + 1]),
    })),
    chapters: chapters.map((label, i) => ({
      label,
      startS: at(i / chapters.length),
      endS: at((i + 1) / chapters.length),
    })),
    levels:
      levels ??
      Array.from(
        { length: 24 },
        (_, i) =>
          0.25 +
          0.6 * Math.abs(Math.sin(i * 0.55 + durationS) * Math.cos(i / 4)),
      ),
  };
}

const RECORDINGS: readonly Recording[] = [
  recording(
    "harbor",
    "Harbor launch — weekly sync",
    "Today, 09:30",
    252,
    [ADA, LEO, MINA],
    ["Intro", "Launch date", "Support rota", "Pricing page"],
    [64, 171],
  ),
  recording(
    "northwind",
    "Customer interview — Northwind",
    "Yesterday",
    318,
    [ADA, THEO],
    ["Context", "Pain points", "Pricing", "Next steps"],
    [122],
  ),
  recording(
    "onboarding",
    "Design critique: onboarding",
    "Oct 6",
    196,
    [MINA, ADA, LEO],
    ["Walkthrough", "Feedback", "Decisions"],
  ),
  recording(
    "podcast",
    "Podcast draft — episode 12",
    "Oct 3",
    384,
    [ADA, LEO],
    ["Cold open", "Interview", "Outro"],
    [12, 240, 351],
  ),
];

const clock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

/** The timeline colours, one per categorical chart token (as in <sone-timeline>). */
const hue = (i: number) => {
  const c = `var(--chart-${(i % 8) + 1})`;
  return {
    dot: c,
    fill: `color-mix(in oklch, ${c} 85%, transparent)`,
    topic: `color-mix(in oklch, ${c} 42%, transparent)`,
    edge: `color-mix(in oklch, ${c} 70%, transparent)`,
  };
};

const recordings = ref<Recording[]>([...RECORDINGS]);
const selectedId = ref(RECORDINGS[0].id);
const currentTime = ref(0);
const audioSrc = ref(SILENT_WAV);
const announcement = ref("");

const state = ref<RecorderState>("idle");
const elapsed = ref(0);
const level = ref(0);
const lines = ref<LiveLine[]>([]);

const selected = computed(
  () =>
    recordings.value.find((r) => r.id === selectedId.value) ??
    recordings.value[0],
);
const peak = computed(() =>
  Math.round(Math.max(0, ...selected.value.levels) * 100),
);

// The timeline geometry (from <sone-timeline>): percentages of the recording.
const pct = (s: number): number =>
  selected.value.durationS > 0
    ? Math.min(100, Math.max(0, (s / selected.value.durationS) * 100))
    : 0;
const lanes = computed(() => {
  const byLane = new Map<
    string,
    { lane: string; hue: number; totalS: number; blocks: Block[] }
  >();
  for (const b of selected.value.blocks) {
    let lane = byLane.get(b.lane);
    if (!lane) {
      lane = { lane: b.lane, hue: byLane.size, totalS: 0, blocks: [] };
      byLane.set(b.lane, lane);
    }
    lane.totalS += b.endS - b.startS;
    lane.blocks.push(b);
  }
  return [...byLane.values()];
});
const ticks = computed(() =>
  [0, 1, 2, 3, 4].map((i) => ({
    pct: i * 25,
    label: clock((selected.value.durationS * i) / 4),
  })),
);
const isNow = (b: { startS: number; endS: number }): boolean =>
  currentTime.value >= b.startS && currentTime.value < b.endS;

// The audio player's own state.
const audio = ref<HTMLAudioElement | null>(null);
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
  currentTime.value = audio.value?.currentTime ?? 0;
}

function seek(seconds: number): void {
  const t = Math.max(0, Math.min(selected.value.durationS, seconds));
  currentTime.value = t;
  if (audio.value) audio.value.currentTime = t;
}

function seekFromTrack(event: MouseEvent): void {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (rect.width <= 0) return;
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientX - rect.left) / rect.width),
  );
  seek(ratio * selected.value.durationS);
}

function onAxisKey(event: KeyboardEvent): void {
  const total = selected.value.durationS;
  const steps: Record<string, number> = {
    ArrowLeft: currentTime.value - 5,
    ArrowRight: currentTime.value + 5,
    Home: 0,
    End: total,
  };
  if (!(event.key in steps)) return;
  event.preventDefault();
  seek(steps[event.key]);
}

// A silent file as long as the selected recording (browser only; revoked on change).
let objectUrl: string | null = null;
function loadAudio(): void {
  if (typeof URL.createObjectURL !== "function") return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(silentWav(selected.value.durationS));
  audioSrc.value = objectUrl;
}

function select(id: string): void {
  if (id === selectedId.value) return;
  audio.value?.pause();
  selectedId.value = id;
  currentTime.value = 0;
  duration.value = 0;
  loadAudio();
}

function updateSelected(change: (r: Recording) => Recording): void {
  recordings.value = recordings.value.map((r) =>
    r.id === selectedId.value ? change(r) : r,
  );
}

function pin(): void {
  const t = Math.round(currentTime.value);
  updateSelected((r) =>
    r.highlights.includes(t)
      ? r
      : { ...r, highlights: [...r.highlights, t].sort((a, b) => a - b) },
  );
  announcement.value = `Highlight pinned at ${clock(t)}`;
}

// The recorder. Timers start only from these handlers (never during SSR).
let ticker: ReturnType<typeof setInterval> | null = null;
let levels: number[] = [];
let spoken = 0;
let count = 0;
const transcriptEl = ref<HTMLElement | null>(null);

function scrollToEnd(): void {
  void nextTick(() => {
    const el = transcriptEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function tick(): void {
  const t = ++elapsed.value;
  level.value = 0.3 + 0.55 * Math.abs(Math.sin(t * 1.3) * Math.cos(t / 3));
  levels.push(level.value);
  const line = SCRIPT[spoken % SCRIPT.length];
  const id = `live-${spoken}`;
  if (t % 3 === 1) {
    // A partial result first: the first words, still listening…
    const words = line.text.split(" ");
    lines.value = [
      ...lines.value.slice(-30),
      {
        id,
        speaker: line.speaker.name,
        tone: line.speaker.key === "me" ? "me" : "others",
        timeLabel: clock(t),
        final: false,
        text: words.slice(0, Math.ceil(words.length / 2)).join(" "),
      },
    ];
  } else if (t % 3 === 0) {
    lines.value = lines.value.map((l) =>
      l.id === id
        ? {
            ...l,
            final: true,
            text: line.text,
            flag: line.text.endsWith("?") ? "Possible question" : null,
          }
        : l,
    );
    spoken++;
  }
  scrollToEnd();
}

function startTicker(): void {
  stopTicker();
  ticker = setInterval(tick, 1000);
}

function stopTicker(): void {
  if (ticker !== null) clearInterval(ticker);
  ticker = null;
}

function start(): void {
  audio.value?.pause();
  state.value = "recording";
  elapsed.value = 0;
  levels = [];
  lines.value = [];
  announcement.value = "Recording started";
  startTicker();
}

function togglePause(): void {
  if (state.value === "recording") {
    state.value = "paused";
    stopTicker();
    announcement.value = "Recording paused";
  } else if (state.value === "paused") {
    state.value = "recording";
    startTicker();
    announcement.value = "Recording resumed";
  }
}

function stop(): void {
  stopTicker();
  const seconds = Math.max(1, elapsed.value);
  const n = ++count;
  const saved: Recording = {
    ...recording(
      `new-${n}`,
      `New recording ${n}`,
      "Just now",
      seconds,
      [ADA, LEO, MINA],
      ["Opening", "Discussion", "Wrap-up"],
      [],
      (levels.length >= 2 ? levels : [0.2, 0.4]).slice(-24),
    ),
    fresh: true,
  };
  // Partial results become final when the recording stops.
  lines.value = lines.value.map((l) => ({ ...l, final: true }));
  recordings.value = [saved, ...recordings.value];
  state.value = "idle";
  elapsed.value = 0;
  level.value = 0;
  select(saved.id);
  announcement.value = `Saved “${saved.title}”, ${clock(seconds)}`;
}

onMounted(loadAudio);
onBeforeUnmount(() => {
  stopTicker();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>

<template>
  <div class="media-template">
    <SonePageHeader as="div">
      <SonePageHeaderContent>
        <SonePageHeaderEyebrow>Studio</SonePageHeaderEyebrow>
        <SonePageHeaderTitle as="h2">Recordings</SonePageHeaderTitle>
        <SonePageHeaderDescription>
          Record a session, then replay it by speaker, chapter and highlight.
        </SonePageHeaderDescription>
      </SonePageHeaderContent>
      <SonePageHeaderActions>
        <SoneButton variant="outline" size="sm" type="button">
          <SoneIcon icon="share" /> Share
        </SoneButton>
      </SonePageHeaderActions>
    </SonePageHeader>

    <p class="sr-only" role="status">{{ announcement }}</p>

    <div class="layout">
      <section class="library" aria-labelledby="media-library">
        <div class="section-head">
          <h3 id="media-library">Library</h3>
          <SoneBadge variant="secondary">{{ recordings.length }}</SoneBadge>
        </div>
        <ul class="recordings">
          <li v-if="state !== 'idle'">
            <SoneItem size="sm" variant="muted">
              <SoneItemMedia>
                <!-- No Vue status orb yet: the same markup as <sone-status-orb>. -->
                <span
                  class="orb"
                  data-slot="status-orb"
                  data-size="sm"
                  :data-state="state === 'paused' ? 'paused' : 'live'"
                  aria-hidden="true"
                ></span>
              </SoneItemMedia>
              <SoneItemContent>
                <SoneItemTitle>New recording</SoneItemTitle>
                <SoneItemDescription>
                  <SoneBadge v-if="state === 'paused'" variant="warning"
                    >Paused</SoneBadge
                  >
                  <SoneBadge v-else variant="live" dot>Live</SoneBadge>
                </SoneItemDescription>
              </SoneItemContent>
              <SoneItemActions>
                <SoneElapsedTimer size="sm" :seconds="elapsed" />
              </SoneItemActions>
            </SoneItem>
          </li>
          <li v-for="r in recordings" :key="r.id">
            <SoneItem
              as="button"
              size="sm"
              type="button"
              class="recording"
              :aria-current="r.id === selectedId ? 'true' : undefined"
              @click="select(r.id)"
            >
              <SoneItemMedia as="span" variant="icon">
                <SoneIcon icon="audio-lines" size="sm" />
              </SoneItemMedia>
              <SoneItemContent as="span">
                <SoneItemTitle as="span">{{ r.title }}</SoneItemTitle>
                <SoneItemDescription as="span">{{
                  r.date
                }}</SoneItemDescription>
              </SoneItemContent>
              <SoneItemActions as="span">
                <SoneBadge v-if="r.fresh" variant="accent">New</SoneBadge>
                <SoneElapsedTimer size="sm" :seconds="r.durationS" />
              </SoneItemActions>
            </SoneItem>
          </li>
        </ul>
      </section>

      <div class="main">
        <SoneCard
          as="section"
          class="recorder"
          :data-state="state"
          aria-labelledby="media-recorder"
        >
          <SoneCardHeader>
            <SoneCardTitle id="media-recorder">Recorder</SoneCardTitle>
            <SoneCardDescription
              >Microphone · Studio mic (simulated)</SoneCardDescription
            >
          </SoneCardHeader>
          <SoneCardContent class="recorder-body">
            <div class="controls">
              <!-- No Vue record button yet: the same markup as button[soneRecordButton] (global CSS). -->
              <button
                type="button"
                class="record-btn"
                data-slot="record-button"
                data-size="default"
                :data-state="state === 'idle' ? 'idle' : 'recording'"
                :aria-label="
                  state === 'idle' ? 'Start recording' : 'Stop and save'
                "
                @click="state === 'idle' ? start() : stop()"
              ></button>
              <button
                type="button"
                class="record-btn"
                data-slot="record-button"
                data-size="sm"
                data-with-label=""
                :data-state="state === 'paused' ? 'paused' : 'recording'"
                :disabled="state === 'idle'"
                @click="togglePause"
              >
                {{ state === "paused" ? "Resume" : "Pause" }}
              </button>
              <div class="status">
                <template v-if="state === 'idle'">
                  <span
                    class="orb"
                    data-slot="status-orb"
                    data-state="ready"
                    data-size="default"
                    aria-hidden="true"
                  ></span>
                  <span class="status-text">Ready to record</span>
                </template>
                <!-- No Vue recording indicator yet: the same markup as <sone-recording-indicator>. -->
                <div
                  v-else
                  class="recording-indicator"
                  data-slot="recording-indicator"
                  :data-state="state === 'paused' ? 'paused' : 'live'"
                >
                  <span
                    class="orb"
                    data-slot="status-orb"
                    :data-state="state === 'paused' ? 'paused' : 'live'"
                    data-size="default"
                    aria-hidden="true"
                  ></span>
                  <SoneElapsedTimer
                    live
                    :seconds="elapsed"
                    aria-label="Recording time"
                  />
                  <span
                    class="recording-indicator-label"
                    data-slot="recording-indicator-label"
                    >{{ state === "paused" ? "Paused" : "Recording" }}</span
                  >
                </div>
              </div>
            </div>
            <!-- No Vue level meter yet: the same markup as <sone-level-meter>. -->
            <div
              class="level-meter meter"
              data-slot="level-meter"
              data-mode="sway"
              aria-hidden="true"
              :style="{ '--level': state === 'recording' ? level : 0 }"
            >
              <span
                v-for="i in 40"
                :key="i"
                class="bar"
                :style="{ '--i': i - 1 }"
              ></span>
            </div>
            <!-- No Vue live transcript yet: the same markup as <sone-live-transcript>. -->
            <div class="live panel-card" data-slot="live-transcript">
              <div
                ref="transcriptEl"
                class="transcript"
                role="log"
                aria-live="off"
                tabindex="0"
                aria-label="Live transcript history"
              >
                <article
                  v-for="line in lines"
                  :key="line.id"
                  data-slot="message"
                  :data-align="line.tone === 'me' ? 'end' : 'start'"
                >
                  <SoneAvatar
                    data-slot="message-avatar"
                    size="sm"
                    class="line-avatar"
                    :data-tone="line.tone"
                    aria-hidden="true"
                  >
                    <SoneAvatarFallback>{{
                      initials(line.speaker)
                    }}</SoneAvatarFallback>
                  </SoneAvatar>
                  <div data-slot="message-content">
                    <div data-slot="message-header">
                      <span class="speaker">{{ line.speaker }}</span>
                      <span aria-hidden="true">·</span>
                      <time>{{ line.timeLabel }}</time>
                      <template v-if="!line.final">
                        <span aria-hidden="true">·</span>
                        <span>Listening…</span>
                      </template>
                    </div>
                    <div
                      v-if="line.final"
                      data-slot="bubble"
                      :data-variant="line.tone === 'me' ? 'tinted' : 'muted'"
                      :data-align="line.tone === 'me' ? 'end' : 'start'"
                      class="line-bubble"
                    >
                      <p data-slot="bubble-content" class="bubble">
                        {{ line.text }}
                      </p>
                    </div>
                    <div
                      v-else
                      data-slot="marker"
                      data-variant="default"
                      class="bubble partial"
                    >
                      <span data-slot="marker-content" class="shimmer">{{
                        line.text
                      }}</span>
                    </div>
                    <div v-if="line.flag" data-slot="message-footer">
                      <SoneBadge variant="warning">{{ line.flag }}</SoneBadge>
                    </div>
                  </div>
                </article>
                <p v-if="!lines.length" class="live-empty">
                  Press record — the transcript appears here as people speak.
                </p>
              </div>
            </div>
          </SoneCardContent>
        </SoneCard>

        <section class="detail" aria-labelledby="media-detail">
          <div class="detail-head">
            <div class="detail-title">
              <h3 id="media-detail">{{ selected.title }}</h3>
              <p>{{ selected.date }} · {{ clock(selected.durationS) }}</p>
            </div>
            <ul class="speakers" aria-label="Speakers">
              <li v-for="s in selected.speakers" :key="s.key">
                <SoneSpeakerChip size="sm" :speaker="s.key" :label="s.name" />
              </li>
            </ul>
          </div>

          <SoneCard size="sm">
            <SoneCardContent>
              <!-- No Vue audio player yet: a simplified <sone-audio-player> (play, time, seek). -->
              <div
                data-slot="audio-player"
                class="audio-player"
                :data-state="playing ? 'playing' : 'paused'"
              >
                <audio
                  ref="audio"
                  :src="audioSrc"
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
                  clock(currentTime)
                }}</span>
                <SoneSlider
                  class="track"
                  aria-label="Seek"
                  :model-value="currentTime"
                  :max="duration"
                  :aria-valuetext="`${clock(currentTime)} of ${clock(duration)}`"
                  @update:model-value="seek"
                />
                <span class="time" data-slot="audio-player-duration">{{
                  clock(duration)
                }}</span>
              </div>
            </SoneCardContent>
          </SoneCard>

          <!-- No Vue timeline yet: a simplified <sone-timeline> (axis, speaker lanes, chapters). -->
          <div data-slot="timeline" data-state="ready">
            <SoneCard class="tl">
              <SoneCardHeader>
                <SoneCardTitle>Timeline</SoneCardTitle>
                <SoneCardDescription
                  >Speakers and chapters — click to seek</SoneCardDescription
                >
              </SoneCardHeader>

              <div class="tl-axis-wrap">
                <div
                  class="tl-axis"
                  role="slider"
                  tabindex="0"
                  aria-label="Seek timeline"
                  aria-valuemin="0"
                  :aria-valuemax="selected.durationS"
                  :aria-valuenow="Math.round(currentTime)"
                  @click="seekFromTrack"
                  @keydown="onAxisKey"
                >
                  <span
                    v-for="t in ticks"
                    :key="t.pct"
                    class="tl-tick"
                    :style="{ left: `${t.pct}%` }"
                  >
                    <span class="tl-tick-mark" aria-hidden="true"></span>
                    <span class="tl-tick-label">{{ t.label }}</span>
                  </span>
                  <span
                    v-if="currentTime > 0"
                    class="tl-playhead"
                    :style="{ left: `${pct(currentTime)}%` }"
                    aria-hidden="true"
                    ><span class="tl-playhead-knob"></span
                  ></span>
                </div>
                <SoneButton
                  v-if="currentTime > 0"
                  variant="outline"
                  size="icon-xs"
                  type="button"
                  class="tl-pin"
                  :style="{ left: `${pct(currentTime)}%` }"
                  :aria-label="`Pin this moment at ${clock(currentTime)}`"
                  @click="pin"
                >
                  <SoneIcon icon="star" size="xs" />
                </SoneButton>
              </div>

              <div class="tl-group">
                <div class="tl-group-head">
                  <span class="tl-group-label">Speakers</span>
                  <span class="tl-legend">
                    <span
                      v-for="lane in lanes"
                      :key="lane.lane"
                      class="legend-item"
                    >
                      <span
                        class="legend-dot"
                        :style="{ background: hue(lane.hue).dot }"
                        aria-hidden="true"
                      ></span>
                      <span class="legend-name">{{ lane.lane }}</span>
                      <span class="legend-time">{{ clock(lane.totalS) }}</span>
                    </span>
                  </span>
                </div>
                <div
                  class="tl-track tl-track--lanes"
                  aria-hidden="true"
                  @click="seekFromTrack"
                >
                  <div v-for="lane in lanes" :key="lane.lane" class="tl-lane">
                    <span
                      v-for="b in lane.blocks"
                      :key="b.startS"
                      class="tl-block"
                      :class="{ 'is-active': isNow(b) }"
                      :style="{
                        left: `${pct(b.startS)}%`,
                        width: `${Math.max(0.4, pct(b.endS) - pct(b.startS))}%`,
                        background: hue(lane.hue).fill,
                        borderColor: hue(lane.hue).edge,
                      }"
                    ></span>
                  </div>
                  <span
                    v-if="currentTime > 0"
                    class="tl-track-playhead"
                    :style="{ left: `${pct(currentTime)}%` }"
                  ></span>
                </div>
              </div>

              <div class="tl-group">
                <div class="tl-group-head">
                  <span class="tl-group-label">Topics</span>
                  <span class="tl-group-hint">Jump to a chapter</span>
                </div>
                <div class="tl-chapters" role="list" aria-label="Chapters">
                  <span
                    v-for="(c, i) in selected.chapters"
                    :key="c.label"
                    role="listitem"
                    class="tl-chapter-item"
                  >
                    <SoneButton
                      variant="outline"
                      size="xs"
                      type="button"
                      class="tl-chapter"
                      :class="{ 'is-active': isNow(c) }"
                      :aria-label="`Chapter ${c.label}, starts ${clock(c.startS)}`"
                      @click="seek(c.startS)"
                    >
                      <span
                        class="tl-chapter-dot"
                        :style="{ background: hue(i).dot }"
                        aria-hidden="true"
                      ></span>
                      <span class="tl-chapter-label">{{ c.label }}</span>
                      <span class="tl-chapter-time">{{ clock(c.startS) }}</span>
                    </SoneButton>
                  </span>
                </div>
                <div
                  class="tl-track tl-track--ribbon"
                  aria-hidden="true"
                  @click="seekFromTrack"
                >
                  <span
                    v-for="(c, i) in selected.chapters"
                    :key="c.label"
                    class="tl-topic"
                    :class="{ 'is-active': isNow(c) }"
                    :style="{
                      left: `${pct(c.startS)}%`,
                      width: `${Math.max(1, pct(c.endS) - pct(c.startS))}%`,
                      background: hue(i).topic,
                      borderColor: hue(i).edge,
                    }"
                    ><span class="tl-topic-label">{{ c.label }}</span></span
                  >
                  <span
                    v-if="currentTime > 0"
                    class="tl-track-playhead"
                    :style="{ left: `${pct(currentTime)}%` }"
                  ></span>
                </div>
              </div>
            </SoneCard>
          </div>

          <div class="highlights" role="group" aria-labelledby="media-hl">
            <h4 id="media-hl">Highlights</h4>
            <SoneButton
              v-for="t in selected.highlights"
              :key="t"
              variant="outline"
              size="xs"
              type="button"
              :aria-label="`Play highlight at ${clock(t)}`"
              @click="seek(t)"
            >
              <SoneIcon icon="star" size="xs" /> {{ clock(t) }}
            </SoneButton>
            <p v-if="!selected.highlights.length" class="hint">
              Pin a moment on the timeline to keep it here.
            </p>
          </div>

          <SoneStatGroup layout="inline" separated aria-label="Recording stats">
            <SoneStat variant="plain" size="sm">
              <SoneStatLabel>Duration</SoneStatLabel>
              <SoneStatValue>{{ clock(selected.durationS) }}</SoneStatValue>
            </SoneStat>
            <SoneStat variant="plain" size="sm">
              <SoneStatLabel>Speakers</SoneStatLabel>
              <SoneStatValue>{{ selected.speakers.length }}</SoneStatValue>
            </SoneStat>
            <SoneStat variant="plain" size="sm">
              <SoneStatLabel>Chapters</SoneStatLabel>
              <SoneStatValue>{{ selected.chapters.length }}</SoneStatValue>
            </SoneStat>
            <SoneStat variant="plain" size="sm" class="loudness">
              <SoneStatLabel>Loudness</SoneStatLabel>
              <SoneStatValue>{{ peak }}%</SoneStatValue>
              <SoneStatHint>
                <SoneSparkline
                  type="area"
                  tone="chart-2"
                  :values="selected.levels"
                  :max="1"
                />
              </SoneStatHint>
            </SoneStat>
          </SoneStatGroup>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped src="../styles/media.css"></style>
<style scoped src="../styles/media.twins.css"></style>
