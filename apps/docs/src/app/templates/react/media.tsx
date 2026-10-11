"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
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
} from "@surface-one/react";

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

// The shared stylesheet (../styles/media.css + media.twins.css), prefixed with .tpl-media.
import { css } from "../styles/scoped/media.generated";

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

/** The 40 bars of the level meter. */
const BARS = Array.from({ length: 40 }, (_, i) => i);

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

export default function MediaTemplate() {
  const [recordings, setRecordings] =
    useState<readonly Recording[]>(RECORDINGS);
  const [selectedId, setSelectedId] = useState(RECORDINGS[0].id);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSrc, setAudioSrc] = useState(SILENT_WAV);
  const [announcement, setAnnouncement] = useState("");

  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState<readonly LiveLine[]>([]);

  // The audio player's own state.
  const audio = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  // The recorder's mutable bookkeeping: read by the interval, never rendered.
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const seconds = useRef(0);
  const levels = useRef<number[]>([]);
  const spoken = useRef(0);
  const count = useRef(0);
  const objectUrl = useRef<string | null>(null);
  const transcriptEl = useRef<HTMLDivElement>(null);

  const selected = recordings.find((r) => r.id === selectedId) ?? recordings[0];
  const peak = Math.round(Math.max(0, ...selected.levels) * 100);

  // The timeline geometry (from <sone-timeline>): percentages of the recording.
  const pct = (s: number): number =>
    selected.durationS > 0
      ? Math.min(100, Math.max(0, (s / selected.durationS) * 100))
      : 0;
  const lanes = useMemo(() => {
    const byLane = new Map<
      string,
      { lane: string; hue: number; totalS: number; blocks: Block[] }
    >();
    for (const b of selected.blocks) {
      let lane = byLane.get(b.lane);
      if (!lane) {
        lane = { lane: b.lane, hue: byLane.size, totalS: 0, blocks: [] };
        byLane.set(b.lane, lane);
      }
      lane.totalS += b.endS - b.startS;
      lane.blocks.push(b);
    }
    return [...byLane.values()];
  }, [selected]);
  const ticks = [0, 1, 2, 3, 4].map((i) => ({
    pct: i * 25,
    label: clock((selected.durationS * i) / 4),
  }));
  const isNow = (b: { startS: number; endS: number }): boolean =>
    currentTime >= b.startS && currentTime < b.endS;

  function togglePlay(): void {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }

  function onLoaded(): void {
    const el = audio.current;
    if (el && Number.isFinite(el.duration)) setDuration(el.duration);
  }

  function onTimeUpdate(): void {
    setCurrentTime(audio.current?.currentTime ?? 0);
  }

  function seek(to: number): void {
    const t = Math.max(0, Math.min(selected.durationS, to));
    setCurrentTime(t);
    if (audio.current) audio.current.currentTime = t;
  }

  function seekFromTrack(event: MouseEvent<HTMLElement>): void {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    seek(ratio * selected.durationS);
  }

  function onAxisKey(event: KeyboardEvent<HTMLElement>): void {
    const steps: Record<string, number> = {
      ArrowLeft: currentTime - 5,
      ArrowRight: currentTime + 5,
      Home: 0,
      End: selected.durationS,
    };
    if (!(event.key in steps)) return;
    event.preventDefault();
    seek(steps[event.key]);
  }

  // A silent file as long as the recording (browser only; revoked on change).
  function loadAudio(durationS: number): void {
    if (typeof URL.createObjectURL !== "function") return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(silentWav(durationS));
    setAudioSrc(objectUrl.current);
  }

  function select(r: Recording): void {
    if (r.id === selectedId) return;
    audio.current?.pause();
    setSelectedId(r.id);
    setCurrentTime(0);
    setDuration(0);
    loadAudio(r.durationS);
  }

  function pin(): void {
    const t = Math.round(currentTime);
    setRecordings((all) =>
      all.map((r) =>
        r.id !== selectedId || r.highlights.includes(t)
          ? r
          : { ...r, highlights: [...r.highlights, t].sort((a, b) => a - b) },
      ),
    );
    setAnnouncement(`Highlight pinned at ${clock(t)}`);
  }

  // The recorder. The interval starts only from these handlers (never during SSR) and
  // reads refs and state setters only, so it never sees a stale render.
  function tick(): void {
    const t = ++seconds.current;
    const now = 0.3 + 0.55 * Math.abs(Math.sin(t * 1.3) * Math.cos(t / 3));
    setElapsed(t);
    setLevel(now);
    levels.current.push(now);
    const line = SCRIPT[spoken.current % SCRIPT.length];
    const id = `live-${spoken.current}`;
    if (t % 3 === 1) {
      // A partial result first: the first words, still listening…
      const words = line.text.split(" ");
      setLines((all) => [
        ...all.slice(-30),
        {
          id,
          speaker: line.speaker.name,
          tone: line.speaker.key === "me" ? "me" : "others",
          timeLabel: clock(t),
          final: false,
          text: words.slice(0, Math.ceil(words.length / 2)).join(" "),
        },
      ]);
    } else if (t % 3 === 0) {
      setLines((all) =>
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
      spoken.current++;
    }
  }

  function stopTicker(): void {
    if (ticker.current !== null) clearInterval(ticker.current);
    ticker.current = null;
  }

  function startTicker(): void {
    stopTicker();
    ticker.current = setInterval(tick, 1000);
  }

  function start(): void {
    audio.current?.pause();
    setState("recording");
    seconds.current = 0;
    setElapsed(0);
    levels.current = [];
    setLines([]);
    setAnnouncement("Recording started");
    startTicker();
  }

  function togglePause(): void {
    if (state === "recording") {
      setState("paused");
      stopTicker();
      setAnnouncement("Recording paused");
    } else if (state === "paused") {
      setState("recording");
      startTicker();
      setAnnouncement("Recording resumed");
    }
  }

  function stop(): void {
    stopTicker();
    const length = Math.max(1, seconds.current);
    const n = ++count.current;
    const recorded = levels.current;
    const saved: Recording = {
      ...recording(
        `new-${n}`,
        `New recording ${n}`,
        "Just now",
        length,
        [ADA, LEO, MINA],
        ["Opening", "Discussion", "Wrap-up"],
        [],
        (recorded.length >= 2 ? recorded : [0.2, 0.4]).slice(-24),
      ),
      fresh: true,
    };
    // Partial results become final when the recording stops.
    setLines((all) => all.map((l) => ({ ...l, final: true })));
    setRecordings((all) => [saved, ...all]);
    setState("idle");
    seconds.current = 0;
    setElapsed(0);
    setLevel(0);
    select(saved);
    setAnnouncement(`Saved “${saved.title}”, ${clock(length)}`);
  }

  // Keep the newest transcript line in view.
  useEffect(() => {
    const el = transcriptEl.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // In the browser: a silent file as long as the first recording; clean up on unmount.
  useEffect(() => {
    loadAudio(RECORDINGS[0].durationS);
    return () => {
      stopTicker();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / unmount only
  }, []);

  return (
    <div className="media-template tpl-media">
      <style>{css}</style>
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

      <p className="sr-only" role="status">
        {announcement}
      </p>

      <div className="layout">
        <section className="library" aria-labelledby="media-library">
          <div className="section-head">
            <h3 id="media-library">Library</h3>
            <SoneBadge variant="secondary">{recordings.length}</SoneBadge>
          </div>
          <ul className="recordings">
            {state !== "idle" ? (
              <li>
                <SoneItem size="sm" variant="muted">
                  <SoneItemMedia>
                    {/* No React status orb yet: the same markup as <sone-status-orb>. */}
                    <span
                      className="orb"
                      data-slot="status-orb"
                      data-size="sm"
                      data-state={state === "paused" ? "paused" : "live"}
                      aria-hidden="true"
                    />
                  </SoneItemMedia>
                  <SoneItemContent>
                    <SoneItemTitle>New recording</SoneItemTitle>
                    <SoneItemDescription>
                      {state === "paused" ? (
                        <SoneBadge variant="warning">Paused</SoneBadge>
                      ) : (
                        <SoneBadge variant="live" dot>
                          Live
                        </SoneBadge>
                      )}
                    </SoneItemDescription>
                  </SoneItemContent>
                  <SoneItemActions>
                    <SoneElapsedTimer size="sm" seconds={elapsed} />
                  </SoneItemActions>
                </SoneItem>
              </li>
            ) : null}
            {recordings.map((r) => (
              <li key={r.id}>
                <SoneItem
                  as="button"
                  size="sm"
                  type="button"
                  className="recording"
                  aria-current={r.id === selectedId ? "true" : undefined}
                  onClick={() => select(r)}
                >
                  <SoneItemMedia as="span" variant="icon">
                    <SoneIcon icon="audio-lines" size="sm" />
                  </SoneItemMedia>
                  <SoneItemContent as="span">
                    <SoneItemTitle as="span">{r.title}</SoneItemTitle>
                    <SoneItemDescription as="span">
                      {r.date}
                    </SoneItemDescription>
                  </SoneItemContent>
                  <SoneItemActions as="span">
                    {r.fresh ? (
                      <SoneBadge variant="accent">New</SoneBadge>
                    ) : null}
                    <SoneElapsedTimer size="sm" seconds={r.durationS} />
                  </SoneItemActions>
                </SoneItem>
              </li>
            ))}
          </ul>
        </section>

        <div className="main">
          <SoneCard
            as="section"
            className="recorder"
            data-state={state}
            aria-labelledby="media-recorder"
          >
            <SoneCardHeader>
              <SoneCardTitle id="media-recorder">Recorder</SoneCardTitle>
              <SoneCardDescription>
                Microphone · Studio mic (simulated)
              </SoneCardDescription>
            </SoneCardHeader>
            <SoneCardContent className="recorder-body">
              <div className="controls">
                {/* No React record button yet: the same markup as button[soneRecordButton] (global CSS). */}
                <button
                  type="button"
                  className="record-btn"
                  data-slot="record-button"
                  data-size="default"
                  data-state={state === "idle" ? "idle" : "recording"}
                  aria-label={
                    state === "idle" ? "Start recording" : "Stop and save"
                  }
                  onClick={state === "idle" ? start : stop}
                />
                <button
                  type="button"
                  className="record-btn"
                  data-slot="record-button"
                  data-size="sm"
                  data-with-label=""
                  data-state={state === "paused" ? "paused" : "recording"}
                  disabled={state === "idle"}
                  onClick={togglePause}
                >
                  {state === "paused" ? "Resume" : "Pause"}
                </button>
                <div className="status">
                  {state === "idle" ? (
                    <>
                      <span
                        className="orb"
                        data-slot="status-orb"
                        data-state="ready"
                        data-size="default"
                        aria-hidden="true"
                      />
                      <span className="status-text">Ready to record</span>
                    </>
                  ) : (
                    // No React recording indicator yet: the same markup as <sone-recording-indicator>.
                    <div
                      className="recording-indicator"
                      data-slot="recording-indicator"
                      data-state={state === "paused" ? "paused" : "live"}
                    >
                      <span
                        className="orb"
                        data-slot="status-orb"
                        data-state={state === "paused" ? "paused" : "live"}
                        data-size="default"
                        aria-hidden="true"
                      />
                      <SoneElapsedTimer
                        live
                        seconds={elapsed}
                        ariaLabel="Recording time"
                      />
                      <span
                        className="recording-indicator-label"
                        data-slot="recording-indicator-label"
                      >
                        {state === "paused" ? "Paused" : "Recording"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* No React level meter yet: the same markup as <sone-level-meter>. */}
              <div
                className="level-meter meter"
                data-slot="level-meter"
                data-mode="sway"
                aria-hidden="true"
                style={
                  {
                    "--level": state === "recording" ? level : 0,
                  } as CSSProperties
                }
              >
                {BARS.map((i) => (
                  <span
                    key={i}
                    className="bar"
                    style={{ "--i": i } as CSSProperties}
                  />
                ))}
              </div>
              {/* No React live transcript yet: the same markup as <sone-live-transcript>. */}
              <div className="live panel-card" data-slot="live-transcript">
                <div
                  ref={transcriptEl}
                  className="transcript"
                  role="log"
                  aria-live="off"
                  tabIndex={0}
                  aria-label="Live transcript history"
                >
                  {lines.map((line) => (
                    <article
                      key={line.id}
                      data-slot="message"
                      data-align={line.tone === "me" ? "end" : "start"}
                    >
                      <SoneAvatar
                        data-slot="message-avatar"
                        size="sm"
                        className="line-avatar"
                        data-tone={line.tone}
                        aria-hidden="true"
                      >
                        <SoneAvatarFallback>
                          {initials(line.speaker)}
                        </SoneAvatarFallback>
                      </SoneAvatar>
                      <div data-slot="message-content">
                        <div data-slot="message-header">
                          <span className="speaker">{line.speaker}</span>
                          <span aria-hidden="true">·</span>
                          <time>{line.timeLabel}</time>
                          {!line.final ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Listening…</span>
                            </>
                          ) : null}
                        </div>
                        {line.final ? (
                          <div
                            data-slot="bubble"
                            data-variant={
                              line.tone === "me" ? "tinted" : "muted"
                            }
                            data-align={line.tone === "me" ? "end" : "start"}
                            className="line-bubble"
                          >
                            <p data-slot="bubble-content" className="bubble">
                              {line.text}
                            </p>
                          </div>
                        ) : (
                          <div
                            data-slot="marker"
                            data-variant="default"
                            className="bubble partial"
                          >
                            <span
                              data-slot="marker-content"
                              className="shimmer"
                            >
                              {line.text}
                            </span>
                          </div>
                        )}
                        {line.flag ? (
                          <div data-slot="message-footer">
                            <SoneBadge variant="warning">{line.flag}</SoneBadge>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                  {!lines.length ? (
                    <p className="live-empty">
                      Press record — the transcript appears here as people
                      speak.
                    </p>
                  ) : null}
                </div>
              </div>
            </SoneCardContent>
          </SoneCard>

          <section className="detail" aria-labelledby="media-detail">
            <div className="detail-head">
              <div className="detail-title">
                <h3 id="media-detail">{selected.title}</h3>
                <p>
                  {selected.date} · {clock(selected.durationS)}
                </p>
              </div>
              <ul className="speakers" aria-label="Speakers">
                {selected.speakers.map((s) => (
                  <li key={s.key}>
                    <SoneSpeakerChip size="sm" speaker={s.key} label={s.name} />
                  </li>
                ))}
              </ul>
            </div>

            <SoneCard size="sm">
              <SoneCardContent>
                {/* No React audio player yet: a simplified <sone-audio-player> (play, time, seek). */}
                <div
                  data-slot="audio-player"
                  className="audio-player"
                  data-state={playing ? "playing" : "paused"}
                >
                  <audio
                    ref={audio}
                    src={audioSrc}
                    preload="metadata"
                    onLoadedMetadata={onLoaded}
                    onTimeUpdate={onTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                  />
                  <SoneButton
                    size="icon"
                    type="button"
                    className="play"
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={togglePlay}
                  >
                    {playing ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M6 3.9v16.2a1 1 0 0 0 1.5.86l13.5-8.1a1 1 0 0 0 0-1.72L7.5 3.04A1 1 0 0 0 6 3.9Z" />
                      </svg>
                    )}
                  </SoneButton>
                  <span className="time" data-slot="audio-player-time">
                    {clock(currentTime)}
                  </span>
                  <SoneSlider
                    className="track"
                    ariaLabel="Seek"
                    value={currentTime}
                    max={duration}
                    aria-valuetext={`${clock(currentTime)} of ${clock(duration)}`}
                    onValueChange={seek}
                  />
                  <span className="time" data-slot="audio-player-duration">
                    {clock(duration)}
                  </span>
                </div>
              </SoneCardContent>
            </SoneCard>

            {/* No React timeline yet: a simplified <sone-timeline> (axis, speaker lanes, chapters). */}
            <div data-slot="timeline" data-state="ready">
              <SoneCard className="tl">
                <SoneCardHeader>
                  <SoneCardTitle>Timeline</SoneCardTitle>
                  <SoneCardDescription>
                    Speakers and chapters — click to seek
                  </SoneCardDescription>
                </SoneCardHeader>

                <div className="tl-axis-wrap">
                  <div
                    className="tl-axis"
                    role="slider"
                    tabIndex={0}
                    aria-label="Seek timeline"
                    aria-valuemin={0}
                    aria-valuemax={selected.durationS}
                    aria-valuenow={Math.round(currentTime)}
                    onClick={seekFromTrack}
                    onKeyDown={onAxisKey}
                  >
                    {ticks.map((t) => (
                      <span
                        key={t.pct}
                        className="tl-tick"
                        style={{ left: `${t.pct}%` }}
                      >
                        <span className="tl-tick-mark" aria-hidden="true" />
                        <span className="tl-tick-label">{t.label}</span>
                      </span>
                    ))}
                    {currentTime > 0 ? (
                      <span
                        className="tl-playhead"
                        style={{ left: `${pct(currentTime)}%` }}
                        aria-hidden="true"
                      >
                        <span className="tl-playhead-knob" />
                      </span>
                    ) : null}
                  </div>
                  {currentTime > 0 ? (
                    <SoneButton
                      variant="outline"
                      size="icon-xs"
                      type="button"
                      className="tl-pin"
                      style={{ left: `${pct(currentTime)}%` }}
                      aria-label={`Pin this moment at ${clock(currentTime)}`}
                      onClick={pin}
                    >
                      <SoneIcon icon="star" size="xs" />
                    </SoneButton>
                  ) : null}
                </div>

                <div className="tl-group">
                  <div className="tl-group-head">
                    <span className="tl-group-label">Speakers</span>
                    <span className="tl-legend">
                      {lanes.map((lane) => (
                        <span key={lane.lane} className="legend-item">
                          <span
                            className="legend-dot"
                            style={{ background: hue(lane.hue).dot }}
                            aria-hidden="true"
                          />
                          <span className="legend-name">{lane.lane}</span>
                          <span className="legend-time">
                            {clock(lane.totalS)}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <div
                    className="tl-track tl-track--lanes"
                    aria-hidden="true"
                    onClick={seekFromTrack}
                  >
                    {lanes.map((lane) => (
                      <div key={lane.lane} className="tl-lane">
                        {lane.blocks.map((b) => (
                          <span
                            key={b.startS}
                            className={`tl-block${isNow(b) ? " is-active" : ""}`}
                            style={{
                              left: `${pct(b.startS)}%`,
                              width: `${Math.max(0.4, pct(b.endS) - pct(b.startS))}%`,
                              background: hue(lane.hue).fill,
                              borderColor: hue(lane.hue).edge,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                    {currentTime > 0 ? (
                      <span
                        className="tl-track-playhead"
                        style={{ left: `${pct(currentTime)}%` }}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="tl-group">
                  <div className="tl-group-head">
                    <span className="tl-group-label">Topics</span>
                    <span className="tl-group-hint">Jump to a chapter</span>
                  </div>
                  <div
                    className="tl-chapters"
                    role="list"
                    aria-label="Chapters"
                  >
                    {selected.chapters.map((c, i) => (
                      <span
                        key={c.label}
                        role="listitem"
                        className="tl-chapter-item"
                      >
                        <SoneButton
                          variant="outline"
                          size="xs"
                          type="button"
                          className={`tl-chapter${isNow(c) ? " is-active" : ""}`}
                          aria-label={`Chapter ${c.label}, starts ${clock(c.startS)}`}
                          onClick={() => seek(c.startS)}
                        >
                          <span
                            className="tl-chapter-dot"
                            style={{ background: hue(i).dot }}
                            aria-hidden="true"
                          />
                          <span className="tl-chapter-label">{c.label}</span>
                          <span className="tl-chapter-time">
                            {clock(c.startS)}
                          </span>
                        </SoneButton>
                      </span>
                    ))}
                  </div>
                  <div
                    className="tl-track tl-track--ribbon"
                    aria-hidden="true"
                    onClick={seekFromTrack}
                  >
                    {selected.chapters.map((c, i) => (
                      <span
                        key={c.label}
                        className={`tl-topic${isNow(c) ? " is-active" : ""}`}
                        style={{
                          left: `${pct(c.startS)}%`,
                          width: `${Math.max(1, pct(c.endS) - pct(c.startS))}%`,
                          background: hue(i).topic,
                          borderColor: hue(i).edge,
                        }}
                      >
                        <span className="tl-topic-label">{c.label}</span>
                      </span>
                    ))}
                    {currentTime > 0 ? (
                      <span
                        className="tl-track-playhead"
                        style={{ left: `${pct(currentTime)}%` }}
                      />
                    ) : null}
                  </div>
                </div>
              </SoneCard>
            </div>

            <div className="highlights" role="group" aria-labelledby="media-hl">
              <h4 id="media-hl">Highlights</h4>
              {selected.highlights.map((t) => (
                <SoneButton
                  key={t}
                  variant="outline"
                  size="xs"
                  type="button"
                  aria-label={`Play highlight at ${clock(t)}`}
                  onClick={() => seek(t)}
                >
                  <SoneIcon icon="star" size="xs" /> {clock(t)}
                </SoneButton>
              ))}
              {!selected.highlights.length ? (
                <p className="hint">
                  Pin a moment on the timeline to keep it here.
                </p>
              ) : null}
            </div>

            <SoneStatGroup
              layout="inline"
              separated
              aria-label="Recording stats"
            >
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>Duration</SoneStatLabel>
                <SoneStatValue>{clock(selected.durationS)}</SoneStatValue>
              </SoneStat>
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>Speakers</SoneStatLabel>
                <SoneStatValue>{selected.speakers.length}</SoneStatValue>
              </SoneStat>
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>Chapters</SoneStatLabel>
                <SoneStatValue>{selected.chapters.length}</SoneStatValue>
              </SoneStat>
              <SoneStat variant="plain" size="sm" className="loudness">
                <SoneStatLabel>Loudness</SoneStatLabel>
                <SoneStatValue>{peak}%</SoneStatValue>
                <SoneStatHint>
                  <SoneSparkline
                    type="area"
                    tone="chart-2"
                    values={selected.levels}
                    max={1}
                  />
                </SoneStatHint>
              </SoneStat>
            </SoneStatGroup>
          </section>
        </div>
      </div>
    </div>
  );
}
