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

interface Speaker {
  /** A speaker key for the chip's tone: `me`, `others-0`, `others-1` … */
  readonly key: string;
  readonly name: string;
}

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

type RecorderState = "idle" | "recording" | "paused";

/** A silent, zero-length WAV inlined as a data URI: what the server renders. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

/** Where the speaker turns change, as fractions of the recording. */
const TURNS = [0, 0.09, 0.21, 0.3, 0.43, 0.5, 0.62, 0.71, 0.83, 0.9, 1];

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

const ADA: Speaker = { key: "me", name: "Ada Park" };
const LEO: Speaker = { key: "others-0", name: "Leo Ruiz" };
const MINA: Speaker = { key: "others-1", name: "Mina Sato" };
const THEO: Speaker = { key: "others-2", name: "Theo Grant" };

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

/** What the live transcript "hears" while recording — canned lines, in turn. */
const SCRIPT: readonly { speaker: Speaker; text: string }[] = [
  {
    speaker: ADA,
    text: "Okay, we're recording. Quick check-in on the Harbor launch.",
  },
  {
    speaker: LEO,
    text: "The migration dry run passed; two invoices still need a fix.",
  },
  { speaker: ADA, text: "Can we patch them before the freeze on the 14th?" },
  { speaker: LEO, text: "Yes, the pull request goes up today." },
  {
    speaker: MINA,
    text: "I'll update the launch checklist right after this call.",
  },
  {
    speaker: ADA,
    text: "Great. The pricing screenshots are the last open item.",
  },
];

/** A silent 8 kHz, 8-bit mono WAV of `seconds`, so the player has a real length. */
function silentWav(seconds: number): Blob {
  const rate = 8000;
  const samples = Math.max(1, Math.round(seconds * rate));
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++)
      view.setUint8(offset + i, s.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  text(36, "data");
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit silence
  return new Blob([buffer], { type: "audio/wav" });
}

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
              class="level-meter"
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

<style scoped>
.media-template {
  display: block;
  padding: var(--space-6);
}
.layout {
  display: grid;
  grid-template-columns: 17rem minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
h3,
h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.recordings {
  display: grid;
  gap: var(--space-0_5);
  margin: 0;
  padding: 0;
  list-style: none;
}
.recording {
  flex-wrap: nowrap;
}
.recording[aria-current="true"] {
  background: var(--accent-soft);
}
.recording [data-slot="item-title"] {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.main {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}
.recorder-body {
  display: grid;
  gap: var(--space-4);
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.status-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.detail {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}
.detail-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
}
.detail-title {
  min-width: 0;
}
.detail-title p {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.speakers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.highlights {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.highlights h4 {
  margin-right: var(--space-2);
  font-size: var(--font-size-sm);
}
.hint {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.loudness :deep(sone-sparkline) {
  width: 6rem;
}

/* Status orb and recording indicator (from the <sone-status-orb> / <sone-recording-indicator> styles). */
.orb {
  --orb-size: 14px;
  position: relative;
  display: inline-block;
  flex: none;
  width: var(--orb-size);
  height: var(--orb-size);
  min-width: var(--orb-size);
  border-radius: var(--radius-pill);
}
.orb[data-size="sm"] {
  --orb-size: 12px;
}
.orb[data-state="ready"] {
  background: var(--accent);
}
.orb[data-state="ready"]::after {
  content: "";
  position: absolute;
  inset: -5px;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-pill);
  opacity: 0.5;
  animation: orb-breathe var(--duration-breathe) ease-in-out infinite;
}
.orb[data-state="live"] {
  background: var(--live);
  animation: orb-live var(--duration-sweep) ease-in-out infinite;
}
.orb[data-state="paused"]::before,
.orb[data-state="paused"]::after {
  content: "";
  position: absolute;
  inset-block: 8%;
  width: 32%;
  border-radius: var(--radius-pill);
  background: var(--warning);
}
.orb[data-state="paused"]::before {
  inset-inline-start: 8%;
}
.orb[data-state="paused"]::after {
  inset-inline-end: 8%;
}
@keyframes orb-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}
@keyframes orb-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.82);
  }
}
.recording-indicator {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.recording-indicator-label {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Level meter (from the <sone-level-meter> styles). */
.level-meter {
  display: flex;
  align-items: center;
  gap: calc(var(--space-0_5) + var(--space-px));
  min-width: 0;
  height: 24px;
  opacity: 0.35;
  transition: opacity var(--transition);
}
.recorder[data-state="recording"] .level-meter {
  opacity: 1;
}
.bar {
  flex: 1;
  min-width: 2px;
  max-width: 4px;
  height: 100%;
  border-radius: var(--radius-pill);
  background: var(--live);
  transform: scaleY(0.16);
  animation: level-sway var(--duration-sway) ease-in-out infinite;
  animation-delay: calc(var(--i) * -70ms);
}
@keyframes level-sway {
  0%,
  100% {
    transform: scaleY(calc(0.14 + var(--level, 0) * 0.55));
  }
  50% {
    transform: scaleY(calc(0.32 + var(--level, 0) * 1.15));
  }
}

/* Live transcript (from the <sone-live-transcript> styles). */
.live {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 15rem;
}
.transcript {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--message-gap);
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-3);
  scrollbar-gutter: stable;
}
.transcript:focus-visible {
  outline: none;
  box-shadow: var(--meeting-focus-ring);
}
.line-bubble {
  max-width: var(--live-bubble-max);
}
.line-avatar {
  align-self: flex-start;
}
.speaker {
  color: var(--text-secondary);
}
.bubble {
  margin: 0;
}
.partial {
  padding-inline: var(--bubble-px);
}
.live-empty {
  margin: auto;
  max-width: 22rem;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
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

/* Timeline (from the <sone-timeline> styles). */
.tl {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  overflow: hidden;
}
.tl-axis-wrap {
  position: relative;
  margin-top: var(--space-1);
}
.tl-axis {
  position: relative;
  height: 30px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
}
.tl-axis::after {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--border);
}
.tl-axis:focus-visible {
  box-shadow: var(--focus-ring);
}
.tl-tick {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  transform: translateX(-50%);
  pointer-events: none;
}
.tl-tick:first-child {
  align-items: flex-start;
  transform: translateX(0);
}
.tl-tick:nth-child(5) {
  align-items: flex-end;
  transform: translateX(-100%);
}
.tl-tick-mark {
  width: 1px;
  height: 6px;
  background: var(--border-strong);
}
.tl-tick-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--font-size-2xs);
  font-variant-numeric: tabular-nums;
}
.tl-playhead {
  position: absolute;
  top: -6px;
  bottom: -2px;
  width: 0;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: var(--z-timeline-playhead);
}
.tl-playhead-knob {
  position: absolute;
  top: -3px;
  left: 0;
  width: 9px;
  height: 9px;
  transform: translateX(-50%);
  border-radius: var(--radius-pill);
  background: var(--text-primary);
  box-shadow: 0 0 0 var(--halo-width) var(--surface-base);
}
.tl-pin {
  position: absolute;
  top: -30px;
  translate: -50% 0;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-timeline-pin);
}
.tl-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.tl-group-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-3);
}
.tl-group-label {
  color: var(--text-muted);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.tl-group-hint {
  color: var(--text-muted);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
}
.tl-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.legend-dot {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: var(--radius-pill);
  box-shadow: 0 0 0 var(--halo-width) var(--surface-input);
}
.legend-name {
  max-width: 16ch;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.legend-time {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tl-track {
  position: relative;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-input);
  cursor: pointer;
}
.tl-track--lanes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-1) + var(--space-0_5));
  padding: calc(var(--space-1) + var(--space-0_5));
}
.tl-track--ribbon {
  height: 40px;
}
.tl-lane {
  position: relative;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
}
.tl-block,
.tl-topic {
  position: absolute;
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-sm);
  transition:
    opacity var(--transition),
    box-shadow var(--transition);
}
.tl-block {
  top: 2px;
  bottom: 2px;
  min-width: 3px;
}
.tl-topic {
  top: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  min-width: 14px;
  padding: 0 var(--space-2);
  overflow: hidden;
}
.tl-block:hover,
.tl-topic:hover {
  opacity: 0.85;
}
.tl-block.is-active,
.tl-topic.is-active {
  box-shadow:
    0 0 0 var(--border-width-thin) var(--text-primary),
    var(--shadow-md);
  z-index: var(--z-timeline-active);
}
.tl-topic-label {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
.tl-track-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  background: var(--text-primary);
  pointer-events: none;
  z-index: var(--z-timeline-playhead);
}
.tl-chapters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.tl-chapter-item {
  display: contents;
}
.tl-chapter {
  max-width: 100%;
}
.tl-chapter.is-active {
  background: var(--toggle-on-bg);
}
.tl-chapter-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-pill);
}
.tl-chapter-label {
  min-width: 0;
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tl-chapter-time {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .orb,
  .orb::after,
  .bar {
    animation: none;
  }
  .bar {
    transform: scaleY(calc(0.2 + var(--level, 0) * 0.8));
  }
}
@media (max-width: 860px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .recordings {
    max-height: 16rem;
    overflow-y: auto;
  }
}
@media (max-width: 520px) {
  .media-template {
    padding: var(--space-4);
  }
  .status {
    flex-basis: 100%;
    margin-left: 0;
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
