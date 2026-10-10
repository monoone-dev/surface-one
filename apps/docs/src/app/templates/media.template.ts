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
import { SoneAudioPlayerComponent } from "@surface-one/angular/audio-player";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { clockTime } from "@surface-one/angular/format";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import {
  type LiveTranscriptLine,
  SoneLiveTranscriptComponent,
} from "@surface-one/angular/live-transcript";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import {
  SoneElapsedTimerComponent,
  SoneLevelMeterComponent,
  SoneRecordButtonDirective,
  SoneRecordingIndicatorComponent,
  SoneStatusOrbComponent,
} from "@surface-one/angular/recording";
import { SoneSparklineComponent } from "@surface-one/angular/sparkline";
import { SoneSpeakerChipComponent } from "@surface-one/angular/speaker-chip";
import { SONE_STAT_PARTS } from "@surface-one/angular/stat";
import {
  SoneTimelineComponent,
  type TimelineData,
  type TimelineLaneRename,
} from "@surface-one/angular/timeline";

interface Speaker {
  /** A speaker key for the chip's tone: `me`, `others-0`, `others-1` … */
  readonly key: string;
  readonly name: string;
}

interface Recording {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly durationS: number;
  readonly speakers: readonly Speaker[];
  readonly timeline: TimelineData;
  readonly highlights: readonly number[];
  /** Loudness over the recording (0..1), for the sparkline. */
  readonly levels: readonly number[];
  readonly fresh?: boolean;
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
    timeline: {
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
    },
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

@Component({
  selector: "docs-media-template",
  imports: [
    ...SONE_CARD_PARTS,
    ...SONE_ITEM_PARTS,
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_STAT_PARTS,
    SoneAudioPlayerComponent,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneElapsedTimerComponent,
    SoneIconComponent,
    SoneLevelMeterComponent,
    SoneLiveTranscriptComponent,
    SoneRecordButtonDirective,
    SoneRecordingIndicatorComponent,
    SoneSparklineComponent,
    SoneSpeakerChipComponent,
    SoneStatusOrbComponent,
    SoneTimelineComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Studio</p>
        <h2 sonePageHeaderTitle>Recordings</h2>
        <p sonePageHeaderDescription>
          Record a session, then replay it by speaker, chapter and highlight.
        </p>
      </div>
      <div sonePageHeaderActions>
        <button soneBtn variant="outline" size="sm" type="button">
          <sone-icon icon="share" /> Share
        </button>
      </div>
    </div>

    <p class="sr-only" role="status">{{ announcement() }}</p>

    <div class="layout">
      <section class="library" aria-labelledby="media-library">
        <div class="section-head">
          <h3 id="media-library">Library</h3>
          <span soneBadge variant="secondary">{{ recordings().length }}</span>
        </div>
        <ul class="recordings">
          @if (state() !== "idle") {
            <li>
              <div soneItem size="sm" variant="muted">
                <div soneItemMedia>
                  <sone-status-orb
                    size="sm"
                    [state]="state() === 'paused' ? 'paused' : 'live'"
                  />
                </div>
                <div soneItemContent>
                  <p soneItemTitle>New recording</p>
                  <p soneItemDescription>
                    @if (state() === "paused") {
                      <span soneBadge variant="warning">Paused</span>
                    } @else {
                      <span soneBadge variant="live" dot>Live</span>
                    }
                  </p>
                </div>
                <div soneItemActions>
                  <sone-elapsed-timer size="sm" [seconds]="elapsed()" />
                </div>
              </div>
            </li>
          }
          @for (r of recordings(); track r.id) {
            <li>
              <button
                soneItem
                size="sm"
                type="button"
                class="recording"
                [attr.aria-current]="r.id === selectedId() ? 'true' : null"
                (click)="select(r.id)"
              >
                <span soneItemMedia variant="icon">
                  <sone-icon icon="audio-lines" size="sm" />
                </span>
                <span soneItemContent>
                  <span soneItemTitle>{{ r.title }}</span>
                  <span soneItemDescription>{{ r.date }}</span>
                </span>
                <span soneItemActions>
                  @if (r.fresh) {
                    <span soneBadge variant="accent">New</span>
                  }
                  <sone-elapsed-timer size="sm" [seconds]="r.durationS" />
                </span>
              </button>
            </li>
          }
        </ul>
      </section>

      <div class="main">
        <section
          soneCard
          class="recorder"
          [attr.data-state]="state()"
          aria-labelledby="media-recorder"
        >
          <div soneCardHeader>
            <h3 soneCardTitle id="media-recorder">Recorder</h3>
            <p soneCardDescription>Microphone · Studio mic (simulated)</p>
          </div>
          <div soneCardContent class="recorder-body">
            <div class="controls">
              <button
                soneRecordButton
                type="button"
                [state]="state() === 'idle' ? 'idle' : 'recording'"
                [attr.aria-label]="
                  state() === 'idle' ? 'Start recording' : 'Stop and save'
                "
                (click)="state() === 'idle' ? start() : stop()"
              ></button>
              <button
                soneRecordButton
                withLabel
                size="sm"
                type="button"
                [state]="state() === 'paused' ? 'paused' : 'recording'"
                [disabled]="state() === 'idle'"
                (click)="togglePause()"
              >
                {{ state() === "paused" ? "Resume" : "Pause" }}
              </button>
              <div class="status">
                @if (state() === "idle") {
                  <sone-status-orb state="ready" />
                  <span class="status-text">Ready to record</span>
                } @else {
                  <sone-recording-indicator
                    [seconds]="elapsed()"
                    [state]="state() === 'paused' ? 'paused' : 'live'"
                    [label]="state() === 'paused' ? 'Paused' : 'Recording'"
                  />
                }
              </div>
            </div>
            <sone-level-meter
              class="meter"
              [bars]="40"
              [level]="state() === 'recording' ? level() : 0"
            />
            <sone-live-transcript
              class="live panel-card"
              [lines]="lines()"
              [following]="following()"
              (atBottomChange)="following.set($event)"
              (jumpToLatest)="scrollToLatest()"
            >
              <p class="live-empty">
                Press record — the transcript appears here as people speak.
              </p>
            </sone-live-transcript>
          </div>
        </section>

        <section class="detail" aria-labelledby="media-detail">
          <div class="detail-head">
            <div class="detail-title">
              <h3 id="media-detail">{{ selected().title }}</h3>
              <p>{{ selected().date }} · {{ clock(selected().durationS) }}</p>
            </div>
            <ul class="speakers" aria-label="Speakers">
              @for (s of selected().speakers; track s.key) {
                <li>
                  <sone-speaker-chip
                    size="sm"
                    [speaker]="s.key"
                    [label]="s.name"
                  />
                </li>
              }
            </ul>
          </div>

          <div soneCard size="sm">
            <div soneCardContent>
              <sone-audio-player
                [src]="audioSrc()"
                (timeUpdate)="currentTime.set($event)"
              />
            </div>
          </div>

          <sone-timeline
            [data]="selected().timeline"
            [total]="selected().durationS"
            [currentTime]="currentTime()"
            [labels]="{ description: 'Speakers and chapters — click to seek' }"
            (seek)="seek($event)"
            (pin)="pin($event)"
            (renameLane)="rename($event)"
          />

          <div class="highlights" role="group" aria-labelledby="media-hl">
            <h4 id="media-hl">Highlights</h4>
            @for (t of selected().highlights; track t) {
              <button
                soneBtn
                variant="outline"
                size="xs"
                type="button"
                [attr.aria-label]="'Play highlight at ' + clock(t)"
                (click)="seek(t)"
              >
                <sone-icon icon="star" size="xs" /> {{ clock(t) }}
              </button>
            } @empty {
              <p class="hint">Pin a moment on the timeline to keep it here.</p>
            }
          </div>

          <dl
            soneStatGroup
            layout="inline"
            separated
            aria-label="Recording stats"
          >
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Duration</dt>
              <dd soneStatValue>{{ clock(selected().durationS) }}</dd>
            </div>
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Speakers</dt>
              <dd soneStatValue>{{ selected().speakers.length }}</dd>
            </div>
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Chapters</dt>
              <dd soneStatValue>{{ selected().timeline.chapters.length }}</dd>
            </div>
            <div soneStat variant="plain" size="sm" class="loudness">
              <dt soneStatLabel>Loudness</dt>
              <dd soneStatValue>{{ peak() }}%</dd>
              <dd soneStatHint>
                <sone-sparkline
                  type="area"
                  tone="chart-2"
                  [values]="selected().levels"
                  [max]="1"
                />
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  `,
  styles: `
    :host {
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
    .meter {
      opacity: 0.35;
      transition: opacity var(--transition);
    }
    .recorder[data-state="recording"] .meter {
      opacity: 1;
    }
    .live {
      height: 15rem;
    }
    .live-empty {
      margin: auto;
      max-width: 22rem;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      text-align: center;
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
    .loudness sone-sparkline {
      width: 6rem;
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
      :host {
        padding: var(--space-4);
      }
      .status {
        margin-left: 0;
        flex-basis: 100%;
      }
    }
  `,
})
export default class Template {
  private readonly injector = inject(Injector);
  private readonly player = viewChild(SoneAudioPlayerComponent);
  private readonly transcript = viewChild(SoneLiveTranscriptComponent);
  private ticker: ReturnType<typeof setInterval> | null = null;
  private objectUrl: string | null = null;
  private levels: number[] = [];
  private spoken = 0;
  private count = 0;

  protected readonly clock = clockTime;
  protected readonly recordings = signal<readonly Recording[]>(RECORDINGS);
  protected readonly selectedId = signal(RECORDINGS[0].id);
  protected readonly currentTime = signal(0);
  protected readonly audioSrc = signal(SILENT_WAV);

  protected readonly state = signal<RecorderState>("idle");
  protected readonly elapsed = signal(0);
  protected readonly level = signal(0);
  protected readonly lines = signal<LiveTranscriptLine[]>([]);
  protected readonly following = signal(true);
  protected readonly announcement = signal("");

  protected readonly selected = computed(
    () =>
      this.recordings().find((r) => r.id === this.selectedId()) ??
      this.recordings()[0],
  );
  protected readonly peak = computed(() =>
    Math.round(Math.max(0, ...this.selected().levels) * 100),
  );

  constructor() {
    // Browser only: give the player a silent file as long as the selected recording.
    afterNextRender(() => this.loadAudio());
    inject(DestroyRef).onDestroy(() => {
      this.stopTicker();
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    });
  }

  protected select(id: string): void {
    if (id === this.selectedId()) return;
    this.player()?.pause();
    this.selectedId.set(id);
    this.currentTime.set(0);
    this.loadAudio();
  }

  protected seek(seconds: number): void {
    const t = Math.max(0, Math.min(this.selected().durationS, seconds));
    this.currentTime.set(t);
    this.player()?.seekTo(t, { play: false });
  }

  protected pin(seconds: number): void {
    const t = Math.round(seconds);
    this.updateSelected((r) =>
      r.highlights.includes(t)
        ? r
        : { ...r, highlights: [...r.highlights, t].sort((a, b) => a - b) },
    );
    this.announcement.set(`Highlight pinned at ${clockTime(t)}`);
  }

  protected rename({ oldLabel, newLabel }: TimelineLaneRename): void {
    const name = newLabel.trim();
    if (!name) return;
    this.updateSelected((r) => ({
      ...r,
      speakers: r.speakers.map((s) =>
        s.name === oldLabel ? { ...s, name } : s,
      ),
      timeline: {
        ...r.timeline,
        blocks: r.timeline.blocks.map((b) =>
          b.lane === oldLabel ? { ...b, lane: name } : b,
        ),
      },
    }));
  }

  // Timers start only from these handlers (never during SSR) and stop on destroy.
  protected start(): void {
    this.player()?.pause();
    this.state.set("recording");
    this.elapsed.set(0);
    this.levels = [];
    this.lines.set([]);
    this.following.set(true);
    this.announcement.set("Recording started");
    this.startTicker();
  }

  protected togglePause(): void {
    if (this.state() === "recording") {
      this.state.set("paused");
      this.stopTicker();
      this.announcement.set("Recording paused");
    } else if (this.state() === "paused") {
      this.state.set("recording");
      this.startTicker();
      this.announcement.set("Recording resumed");
    }
  }

  protected stop(): void {
    this.stopTicker();
    const seconds = Math.max(1, this.elapsed());
    const n = ++this.count;
    const levels = this.levels.length >= 2 ? this.levels : [0.2, 0.4];
    const saved = {
      ...recording(
        `new-${n}`,
        `New recording ${n}`,
        "Just now",
        seconds,
        [ADA, LEO, MINA],
        ["Opening", "Discussion", "Wrap-up"],
        [],
        levels.slice(-24),
      ),
      fresh: true,
    };
    // Partial results become final when the recording stops.
    this.lines.update((all) => all.map((l) => ({ ...l, final: true })));
    this.recordings.update((all) => [saved, ...all]);
    this.state.set("idle");
    this.elapsed.set(0);
    this.level.set(0);
    this.select(saved.id);
    this.announcement.set(`Saved “${saved.title}”, ${clockTime(seconds)}`);
  }

  protected scrollToLatest(): void {
    this.following.set(true);
    this.transcript()?.scrollToEnd();
  }

  private tick(): void {
    const t = this.elapsed() + 1;
    this.elapsed.set(t);
    const level = 0.3 + 0.55 * Math.abs(Math.sin(t * 1.3) * Math.cos(t / 3));
    this.level.set(level);
    this.levels.push(level);
    const line = SCRIPT[this.spoken % SCRIPT.length];
    const id = `live-${this.spoken}`;
    if (t % 3 === 1) {
      // A partial result first: the first words, still listening…
      const words = line.text.split(" ");
      this.lines.update((all) => [
        ...all.slice(-30),
        {
          id,
          speaker: line.speaker.name,
          tone: line.speaker.key === "me" ? "me" : "others",
          timeLabel: clockTime(t),
          final: false,
          text: words.slice(0, Math.ceil(words.length / 2)).join(" "),
        },
      ]);
    } else if (t % 3 === 0) {
      this.lines.update((all) =>
        all.map((l) =>
          l.id === id
            ? {
                ...l,
                final: true,
                text: line.text,
                flag: line.text.endsWith("?") ? "Possible question" : null,
              }
            : l,
        ),
      );
      this.spoken++;
    }
    if (this.following()) {
      afterNextRender(() => this.transcript()?.scrollToEnd(), {
        injector: this.injector,
      });
    }
  }

  private startTicker(): void {
    this.stopTicker();
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  private stopTicker(): void {
    if (this.ticker !== null) clearInterval(this.ticker);
    this.ticker = null;
  }

  private updateSelected(change: (r: Recording) => Recording): void {
    const id = this.selectedId();
    this.recordings.update((all) =>
      all.map((r) => (r.id === id ? change(r) : r)),
    );
  }

  private loadAudio(): void {
    if (typeof URL.createObjectURL !== "function") return;
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(silentWav(this.selected().durationS));
    this.audioSrc.set(this.objectUrl);
  }
}
