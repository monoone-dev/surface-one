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
                className="level-meter"
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

const css = `
.tpl-media.media-template {
  display: block;
  padding: var(--space-6);
}
.tpl-media .layout {
  display: grid;
  grid-template-columns: 17rem minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
.tpl-media .section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.tpl-media h3,
.tpl-media h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-media .recordings {
  display: grid;
  gap: var(--space-0_5);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-media .recording {
  flex-wrap: nowrap;
}
.tpl-media .recording[aria-current="true"] {
  background: var(--accent-soft);
}
.tpl-media .recording [data-slot="item-title"] {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.tpl-media .main {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}
.tpl-media .recorder-body {
  display: grid;
  gap: var(--space-4);
}
.tpl-media .controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.tpl-media .status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.tpl-media .status-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-media .detail {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}
.tpl-media .detail-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
}
.tpl-media .detail-title {
  min-width: 0;
}
.tpl-media .detail-title p {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-media .speakers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-media .highlights {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.tpl-media .highlights h4 {
  margin-right: var(--space-2);
  font-size: var(--font-size-sm);
}
.tpl-media .hint {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-media .loudness sone-sparkline {
  width: 6rem;
}

/* Status orb and recording indicator (from the <sone-status-orb> / <sone-recording-indicator> styles). */
.tpl-media .orb {
  --orb-size: 14px;
  position: relative;
  display: inline-block;
  flex: none;
  width: var(--orb-size);
  height: var(--orb-size);
  min-width: var(--orb-size);
  border-radius: var(--radius-pill);
}
.tpl-media .orb[data-size="sm"] {
  --orb-size: 12px;
}
.tpl-media .orb[data-state="ready"] {
  background: var(--accent);
}
.tpl-media .orb[data-state="ready"]::after {
  content: "";
  position: absolute;
  inset: -5px;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-pill);
  opacity: 0.5;
  animation: orb-breathe var(--duration-breathe) ease-in-out infinite;
}
.tpl-media .orb[data-state="live"] {
  background: var(--live);
  animation: orb-live var(--duration-sweep) ease-in-out infinite;
}
.tpl-media .orb[data-state="paused"]::before,
.tpl-media .orb[data-state="paused"]::after {
  content: "";
  position: absolute;
  inset-block: 8%;
  width: 32%;
  border-radius: var(--radius-pill);
  background: var(--warning);
}
.tpl-media .orb[data-state="paused"]::before {
  inset-inline-start: 8%;
}
.tpl-media .orb[data-state="paused"]::after {
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
.tpl-media .recording-indicator {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.tpl-media .recording-indicator-label {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Level meter (from the <sone-level-meter> styles). */
.tpl-media .level-meter {
  display: flex;
  align-items: center;
  gap: calc(var(--space-0_5) + var(--space-px));
  min-width: 0;
  height: 24px;
  opacity: 0.35;
  transition: opacity var(--transition);
}
.tpl-media .recorder[data-state="recording"] .level-meter {
  opacity: 1;
}
.tpl-media .bar {
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
.tpl-media .live {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 15rem;
}
.tpl-media .transcript {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--message-gap);
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-3);
  scrollbar-gutter: stable;
}
.tpl-media .transcript:focus-visible {
  outline: none;
  box-shadow: var(--meeting-focus-ring);
}
.tpl-media .line-bubble {
  max-width: var(--live-bubble-max);
}
.tpl-media .line-avatar {
  align-self: flex-start;
}
.tpl-media .speaker {
  color: var(--text-secondary);
}
.tpl-media .bubble {
  margin: 0;
}
.tpl-media .partial {
  padding-inline: var(--bubble-px);
}
.tpl-media .live-empty {
  margin: auto;
  max-width: 22rem;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

/* Audio player (from the <sone-audio-player> styles). */
.tpl-media .audio-player {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.tpl-media .play {
  flex: none;
  border-radius: var(--radius-pill);
}
.tpl-media .time {
  flex: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-media .track {
  flex: 1 1 auto;
  min-width: 0;
}

/* Timeline (from the <sone-timeline> styles). */
.tpl-media .tl {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  overflow: hidden;
}
.tpl-media .tl-axis-wrap {
  position: relative;
  margin-top: var(--space-1);
}
.tpl-media .tl-axis {
  position: relative;
  height: 30px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
}
.tpl-media .tl-axis::after {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--border);
}
.tpl-media .tl-axis:focus-visible {
  box-shadow: var(--focus-ring);
}
.tpl-media .tl-tick {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  transform: translateX(-50%);
  pointer-events: none;
}
.tpl-media .tl-tick:first-child {
  align-items: flex-start;
  transform: translateX(0);
}
.tpl-media .tl-tick:nth-child(5) {
  align-items: flex-end;
  transform: translateX(-100%);
}
.tpl-media .tl-tick-mark {
  width: 1px;
  height: 6px;
  background: var(--border-strong);
}
.tpl-media .tl-tick-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--font-size-2xs);
  font-variant-numeric: tabular-nums;
}
.tpl-media .tl-playhead {
  position: absolute;
  top: -6px;
  bottom: -2px;
  width: 0;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: var(--z-timeline-playhead);
}
.tpl-media .tl-playhead-knob {
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
.tpl-media .tl-pin {
  position: absolute;
  top: -30px;
  translate: -50% 0;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-timeline-pin);
}
.tpl-media .tl-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.tpl-media .tl-group-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-3);
}
.tpl-media .tl-group-label {
  color: var(--text-muted);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.tpl-media .tl-group-hint {
  color: var(--text-muted);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
}
.tpl-media .tl-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}
.tpl-media .legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.tpl-media .legend-dot {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: var(--radius-pill);
  box-shadow: 0 0 0 var(--halo-width) var(--surface-input);
}
.tpl-media .legend-name {
  max-width: 16ch;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-media .legend-time {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-media .tl-track {
  position: relative;
  overflow: hidden;
  border: var(--border-width-thin) solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-input);
  cursor: pointer;
}
.tpl-media .tl-track--lanes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-1) + var(--space-0_5));
  padding: calc(var(--space-1) + var(--space-0_5));
}
.tpl-media .tl-track--ribbon {
  height: 40px;
}
.tpl-media .tl-lane {
  position: relative;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
}
.tpl-media .tl-block,
.tpl-media .tl-topic {
  position: absolute;
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--radius-sm);
  transition:
    opacity var(--transition),
    box-shadow var(--transition);
}
.tpl-media .tl-block {
  top: 2px;
  bottom: 2px;
  min-width: 3px;
}
.tpl-media .tl-topic {
  top: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  min-width: 14px;
  padding: 0 var(--space-2);
  overflow: hidden;
}
.tpl-media .tl-block:hover,
.tpl-media .tl-topic:hover {
  opacity: 0.85;
}
.tpl-media .tl-block.is-active,
.tpl-media .tl-topic.is-active {
  box-shadow:
    0 0 0 var(--border-width-thin) var(--text-primary),
    var(--shadow-md);
  z-index: var(--z-timeline-active);
}
.tpl-media .tl-topic-label {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
.tpl-media .tl-track-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
  background: var(--text-primary);
  pointer-events: none;
  z-index: var(--z-timeline-playhead);
}
.tpl-media .tl-chapters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.tpl-media .tl-chapter-item {
  display: contents;
}
.tpl-media .tl-chapter {
  max-width: 100%;
}
.tpl-media .tl-chapter.is-active {
  background: var(--toggle-on-bg);
}
.tpl-media .tl-chapter-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-pill);
}
.tpl-media .tl-chapter-label {
  min-width: 0;
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-media .tl-chapter-time {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .tpl-media .orb,
  .tpl-media .orb::after,
  .tpl-media .bar {
    animation: none;
  }
  .tpl-media .bar {
    transform: scaleY(calc(0.2 + var(--level, 0) * 0.8));
  }
}
@media (max-width: 860px) {
  .tpl-media .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-media .recordings {
    max-height: 16rem;
    overflow-y: auto;
  }
}
@media (max-width: 520px) {
  .tpl-media.media-template {
    padding: var(--space-4);
  }
  .tpl-media .status {
    flex-basis: 100%;
    margin-left: 0;
  }
  .tpl-media .audio-player {
    flex-wrap: wrap;
  }
  .tpl-media .track {
    order: 1;
    flex-basis: 100%;
  }
}
`;
