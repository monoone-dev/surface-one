"use client";

import {
  createElement,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  clockTime,
  timelineActiveBlocks,
  timelineActiveChapters,
  timelineChapterItems,
  timelineChapters,
  timelineClamp as clamp,
  timelineClock,
  timelineLanes,
  timelineSeekKey,
  timelineSpan,
  timelineTicks,
  type SoneMessages,
  type TimelineChapterItem,
  type TimelineData,
  type TimelineLabels,
  type TimelineLaneRename,
  type TimelineLaneSuggestion,
  type TimelineLegendLane,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import {
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
} from "../card/card";
import { SoneSwatch } from "../chart-legend/chart-legend";
import { SoneSkeleton } from "../skeleton/skeleton";

export {
  TIMELINE_PALETTE,
  timelineHue,
  type TimelineBlock,
  type TimelineChapter,
  type TimelineChapterItem,
  type TimelineData,
  type TimelineLabels,
  type TimelineLaneRename,
  type TimelineLaneSuggestion,
  type TimelineLegendLane,
} from "@surface-one/core";

/** The built-in strings, in the app's language. */
export function timelineDefaultLabels(m: SoneMessages): TimelineLabels {
  return {
    title: m.timelineTitle,
    description: m.timelineDescription,
    lanes: m.timelineLanes,
    chapters: m.timelineChapters,
    chaptersHint: m.timelineChaptersHint,
    seekAxis: m.timelineSeekAxis,
    seekLanes: m.timelineSeekLanes,
    seekChapters: m.timelineSeekChapters,
    loading: m.timelineLoading,
    needsGeneration: m.timelineNeedsGeneration,
    generate: m.timelineGenerate,
    unavailable: m.timelineUnavailable,
    retry: m.timelineRetry,
    pin: m.timelinePin,
    laneName: m.timelineLaneName,
  };
}

const pct = (v: number): string => `${v}%`;
/** A style with custom properties (`--i`). */
const css = (style: Record<string, string | number>): CSSProperties =>
  style as CSSProperties;

const SKELETON_BARS = [
  { left: 1, width: 18 },
  { left: 22, width: 30 },
  { left: 55, width: 14 },
  { left: 72, width: 26 },
];
const SKELETON_RIBBON = [
  { left: 1, width: 34 },
  { left: 38, width: 24 },
  { left: 64, width: 35 },
];

const NO_LANES: readonly TimelineLegendLane[] = [];
const NO_SUGGESTIONS: readonly TimelineLaneSuggestion[] = [];

export interface SoneTimelineLegendProps extends HTMLAttributes<HTMLElement> {
  readonly lanes?: readonly TimelineLegendLane[];
  readonly suggestions?: readonly TimelineLaneSuggestion[];
  /** The rename field's name (default: the "Speaker name" message). */
  readonly nameLabel?: string | null;
  readonly onRename?: (rename: TimelineLaneRename) => void;
}

/**
 * `<sone-timeline-legend>` — the speaker lanes' swatches, names and talk time. A name
 * is a button that turns into a field to rename the lane (Enter or blur saves, Escape
 * cancels); a suggested name is one click away. Calls `onRename`.
 */
export function SoneTimelineLegend({
  lanes = NO_LANES,
  suggestions = NO_SUGGESTIONS,
  nameLabel = null,
  onRename,
  ...rest
}: SoneTimelineLegendProps): ReactElement {
  const m = useSoneMessages();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLInputElement | null>(null);
  // `commit` runs twice for one save (Enter, then the blur of the removed field).
  const editingNow = useRef<string | null>(null);
  editingNow.current = editing;

  const suggestionByLane = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of suggestions) {
      const label = s.label?.trim();
      if (label) map.set(s.lane, label);
    }
    return map;
  }, [suggestions]);

  useLayoutEffect(() => {
    if (editing === null) return;
    field.current?.focus();
    field.current?.select();
  }, [editing]);

  const startRename = (event: MouseEvent, lane: string): void => {
    event.stopPropagation();
    setDraft(lane);
    setEditing(lane);
  };
  const commit = (oldLabel: string): void => {
    if (editingNow.current !== oldLabel) return;
    editingNow.current = null;
    const newLabel = draft.trim();
    setEditing(null);
    if (newLabel && newLabel !== oldLabel) onRename?.({ oldLabel, newLabel });
  };
  const accept = (oldLabel: string): void => {
    const newLabel = suggestionByLane.get(oldLabel)?.trim();
    if (newLabel && newLabel !== oldLabel) onRename?.({ oldLabel, newLabel });
  };

  return createElement(
    "sone-timeline-legend",
    { ...rest, "data-slot": "timeline-legend" },
    lanes.map((lane) => {
      const name = suggestionByLane.get(lane.lane);
      return (
        <span key={lane.lane} className="legend-item">
          <SoneSwatch className="legend-dot" tone={lane.dot} />
          {editing === lane.lane ? (
            <input
              ref={field}
              type="text"
              className="legend-edit"
              aria-label={nameLabel ?? m.timelineLaneName}
              autoCapitalize="words"
              autoComplete="off"
              spellCheck="false"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit(lane.lane);
                else if (e.key === "Escape") {
                  e.stopPropagation();
                  editingNow.current = null;
                  setEditing(null);
                }
              }}
              onBlur={() => commit(lane.lane)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <SoneButton
                variant="ghost"
                size="xs"
                type="button"
                className="legend-rename"
                aria-label={m.timelineRenameLane(lane.lane)}
                onClick={(e: MouseEvent) => startRename(e, lane.lane)}
              >
                <span className="legend-name">{lane.lane}</span>
                <span className="legend-pencil" aria-hidden="true">
                  ✎
                </span>
              </SoneButton>
              {name ? (
                <SoneBadge
                  as="button"
                  variant="accent"
                  type="button"
                  className="legend-suggest"
                  aria-label={m.timelineRenameLaneTo(lane.lane, name)}
                  onClick={() => accept(lane.lane)}
                >
                  {m.timelineSuggestBefore}
                  <span className="legend-suggest-name">{name}</span>
                  {m.timelineSuggestAfter}
                </SoneBadge>
              ) : null}
            </>
          )}
          <span className="legend-time">{clockTime(lane.totalS)}</span>
        </span>
      );
    }),
  );
}

const NO_CHAPTERS: readonly TimelineChapterItem[] = [];
const NO_ORDERS: ReadonlySet<number> = new Set();

export interface SoneTimelineChaptersProps extends HTMLAttributes<HTMLElement> {
  readonly chapters?: readonly TimelineChapterItem[];
  /** The list's name (default: the "Chapters" message). */
  readonly label?: string | null;
  readonly activeOrders?: ReadonlySet<number>;
  readonly onSeek?: (seconds: number) => void;
}

/** `<sone-timeline-chapters>` — the chapters as a list of buttons that seek to their start. */
export function SoneTimelineChapters({
  chapters = NO_CHAPTERS,
  label = null,
  activeOrders = NO_ORDERS,
  onSeek,
  ...rest
}: SoneTimelineChaptersProps): ReactElement {
  const m = useSoneMessages();
  return createElement(
    "sone-timeline-chapters",
    {
      ...rest,
      "data-slot": "timeline-chapters",
      role: "list",
      "aria-label": label ?? m.timelineChapterList,
    },
    chapters.map((ch) => (
      <span key={ch.order} role="listitem" className="tl-chapter-item">
        <SoneButton
          variant="outline"
          size="xs"
          type="button"
          className={
            activeOrders.has(ch.order) ? "tl-chapter is-active" : "tl-chapter"
          }
          style={css({ "--i": ch.order })}
          aria-label={m.timelineChapter(ch.label, clockTime(ch.startS))}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            onSeek?.(ch.startS);
          }}
        >
          <span
            className="tl-chapter-dot"
            style={{ background: ch.dot }}
            aria-hidden="true"
          />
          <span className="tl-chapter-label">{ch.label}</span>
          <span className="tl-chapter-time">{clockTime(ch.startS)}</span>
        </SoneButton>
      </span>
    )),
  );
}

const NO_LABELS: Partial<TimelineLabels> = {};

export interface SoneTimelineProps extends HTMLAttributes<HTMLElement> {
  readonly data?: TimelineData | null;
  readonly total?: number;
  readonly currentTime?: number;
  readonly loading?: boolean;
  readonly error?: boolean;
  readonly needsGeneration?: boolean;
  readonly suggestions?: readonly TimelineLaneSuggestion[];
  /** Overrides any of the built-in strings. */
  readonly labels?: Partial<TimelineLabels>;
  readonly onSeek?: (seconds: number) => void;
  readonly onRetry?: () => void;
  readonly onGenerate?: () => void;
  readonly onPin?: (seconds: number) => void;
  readonly onRenameLane?: (rename: TimelineLaneRename) => void;
}

/**
 * `<sone-timeline>` — who spoke when and what was discussed: speaker lanes and a topic
 * ribbon over a time axis, each a seek slider (← / → by 5 s, Home / End), with the
 * playhead, a scrub preview, a pin button and the loading, needs-generation and
 * unavailable states.
 */
export function SoneTimeline({
  data = null,
  total = 0,
  currentTime = 0,
  loading = false,
  error = false,
  needsGeneration = false,
  suggestions = NO_SUGGESTIONS,
  labels = NO_LABELS,
  onSeek,
  onRetry,
  onGenerate,
  onPin,
  onRenameLane,
  ...rest
}: SoneTimelineProps): ReactElement {
  const m = useSoneMessages();
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const t: TimelineLabels = { ...timelineDefaultLabels(m), ...labels };

  const span = timelineSpan(data, total);
  const lanes = useMemo(
    () => timelineLanes(data?.blocks ?? [], span),
    [data, span],
  );
  const chapters = useMemo(
    () => timelineChapters(data?.chapters ?? [], span),
    [data, span],
  );
  const chapterItems = useMemo(
    () => timelineChapterItems(chapters),
    [chapters],
  );
  const activeBlocks = timelineActiveBlocks(lanes, currentTime);
  const activeChapters = timelineActiveChapters(chapters, currentTime);
  const ready = !loading && (lanes.length > 0 || chapters.length > 0);
  const unavailable =
    !loading &&
    !needsGeneration &&
    (error || (lanes.length === 0 && chapters.length === 0));
  const state = loading
    ? "loading"
    : needsGeneration
      ? "needs-generation"
      : unavailable
        ? "unavailable"
        : "ready";
  const playheadPct = span <= 0 ? 0 : clamp((currentTime / span) * 100, 0, 100);
  const showPlayhead = ready && currentTime > 0;

  const seekFromTrack = (event: MouseEvent<HTMLElement>): void => {
    if (span <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    onSeek?.(clamp((event.clientX - rect.left) / rect.width, 0, 1) * span);
  };
  const onScrubMove = (event: MouseEvent<HTMLElement>): void => {
    if (span <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    setHoverPct(
      clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    );
  };
  const onAxisKey = (event: KeyboardEvent<HTMLElement>): void => {
    const next = timelineSeekKey(event.key, currentTime, span);
    if (next === null) return;
    event.preventDefault();
    onSeek?.(next);
  };
  const onBlock = (event: MouseEvent, startS: number): void => {
    event.stopPropagation();
    onSeek?.(startS);
  };

  /** A seek slider: the axis, the lanes or the ribbon. */
  const slider = (cls: string, label: string, children: ReactNode) => (
    <div
      className={cls}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(span)}
      aria-valuenow={Math.round(clamp(currentTime, 0, span))}
      onClick={seekFromTrack}
      onMouseMove={onScrubMove}
      onMouseLeave={() => setHoverPct(null)}
      onKeyDown={onAxisKey}
    >
      {children}
    </div>
  );
  const trackScrub = hoverPct ? (
    <span
      className="tl-track-scrub"
      style={{ left: pct(hoverPct) }}
      aria-hidden="true"
    />
  ) : null;
  const trackPlayhead = showPlayhead ? (
    <span
      className="tl-track-playhead"
      style={{ left: pct(playheadPct) }}
      aria-hidden="true"
    />
  ) : null;
  const tip = (name: string, startS: number, endS: number) => (
    <span className="tl-tip" aria-hidden="true">
      <span className="tl-tip-name">{name}</span>
      <span className="tl-tip-time">{timelineClock(startS, endS)}</span>
    </span>
  );
  const unavailableRow = (
    message: string,
    button: string,
    variant: "default" | "ghost",
    onClick?: () => void,
  ) => (
    <div className="tl-unavailable">
      <span className="tl-unavailable-dot" aria-hidden="true" />
      <span className="tl-unavailable-text">{message}</span>
      <SoneButton
        variant={variant}
        size="sm"
        type="button"
        className="tl-retry"
        onClick={() => onClick?.()}
      >
        {button}
      </SoneButton>
    </div>
  );

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="tl-skeleton" aria-busy="true" aria-live="polite">
        <span className="sk-label">{t.loading}</span>
        <div className="sk-track">
          {SKELETON_BARS.map((b, i) => (
            <SoneSkeleton
              key={i}
              as="span"
              className="sk-bar"
              style={css({ left: pct(b.left), width: pct(b.width), "--i": i })}
            />
          ))}
        </div>
        <div className="sk-track sk-track--thin">
          {SKELETON_RIBBON.map((b, i) => (
            <SoneSkeleton
              key={i}
              as="span"
              className="sk-bar"
              style={css({
                left: pct(b.left),
                width: pct(b.width),
                "--i": i + 4,
              })}
            />
          ))}
        </div>
      </div>
    );
  } else if (needsGeneration) {
    // Deriving is heavy (an on-device model): never auto-run; the user asks for it here.
    body = unavailableRow(t.needsGeneration, t.generate, "default", onGenerate);
  } else if (unavailable) {
    body = unavailableRow(t.unavailable, t.retry, "ghost", onRetry);
  } else {
    body = (
      <>
        {/* The pin button sits beside the slider, not inside it: a role="slider"
            cannot contain another interactive control. */}
        <div className="tl-axis-wrap">
          {slider(
            "tl-axis",
            t.seekAxis,
            <>
              {timelineTicks(span).map((tick) => (
                <span
                  key={tick.pct}
                  className="tl-tick"
                  style={{ left: pct(tick.pct) }}
                >
                  <span className="tl-tick-mark" aria-hidden="true" />
                  <span className="tl-tick-label">{tick.label}</span>
                </span>
              ))}
              {hoverPct ? (
                <span
                  className="tl-scrub"
                  style={{ left: pct(hoverPct) }}
                  aria-hidden="true"
                >
                  <span className="tl-scrub-bubble">
                    {clockTime((hoverPct / 100) * span)}
                  </span>
                </span>
              ) : null}
              {showPlayhead ? (
                <span
                  className="tl-playhead"
                  style={{ left: pct(playheadPct) }}
                  aria-hidden="true"
                >
                  <span className="tl-playhead-knob" />
                </span>
              ) : null}
            </>,
          )}
          {showPlayhead ? (
            <SoneButton
              variant="outline"
              size="icon-xs"
              type="button"
              className="tl-pin"
              style={{ left: pct(playheadPct) }}
              aria-label={m.timelinePinAt(clockTime(currentTime))}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                onPin?.(Math.max(0, currentTime));
              }}
            >
              <span className="tl-pin-glyph" aria-hidden="true">
                📌
              </span>
              <span className="tl-pin-tip" aria-hidden="true">
                {t.pin}
              </span>
            </SoneButton>
          ) : null}
        </div>

        {lanes.length ? (
          <div className="tl-group">
            <div className="tl-group-head">
              <span className="tl-group-label">{t.lanes}</span>
              <SoneTimelineLegend
                lanes={lanes}
                suggestions={suggestions}
                nameLabel={t.laneName}
                onRename={onRenameLane}
              />
            </div>
            {slider(
              "tl-track tl-track--lanes",
              t.seekLanes,
              <>
                {trackScrub}
                {lanes.map((lane) => (
                  <div key={lane.lane} className="tl-lane">
                    {lane.blocks.map((blk) => (
                      <span
                        key={blk.order}
                        aria-hidden="true"
                        className={
                          activeBlocks.has(blk.order)
                            ? "tl-block is-active"
                            : "tl-block"
                        }
                        style={css({
                          left: pct(blk.left),
                          width: pct(blk.width),
                          "--i": blk.order,
                          background: blk.fill,
                          borderColor: blk.edge,
                        })}
                        onClick={(e) => onBlock(e, blk.startS)}
                      >
                        {tip(lane.lane, blk.startS, blk.endS)}
                      </span>
                    ))}
                  </div>
                ))}
                {trackPlayhead}
              </>,
            )}
          </div>
        ) : null}

        {chapters.length ? (
          <div className="tl-group">
            <div className="tl-group-head">
              <span className="tl-group-label">{t.chapters}</span>
              <span className="tl-group-hint">{t.chaptersHint}</span>
            </div>
            <SoneTimelineChapters
              chapters={chapterItems}
              activeOrders={activeChapters}
              onSeek={onSeek}
            />
            {slider(
              "tl-track tl-track--ribbon",
              t.seekChapters,
              <>
                {trackScrub}
                {chapters.map((top) => (
                  <span
                    key={top.order}
                    aria-hidden="true"
                    className={
                      activeChapters.has(top.order)
                        ? "tl-topic is-active"
                        : "tl-topic"
                    }
                    style={css({
                      left: pct(top.left),
                      width: pct(top.width),
                      "--i": top.order,
                      background: top.fill,
                      borderColor: top.edge,
                    })}
                    onClick={(e) => onBlock(e, top.startS)}
                  >
                    {top.narrow ? null : (
                      <span className="tl-topic-label">{top.label}</span>
                    )}
                    {tip(top.label, top.startS, top.endS)}
                  </span>
                ))}
                {trackPlayhead}
              </>,
            )}
          </div>
        ) : null}
      </>
    );
  }

  return createElement(
    "sone-timeline",
    { ...rest, "data-slot": "timeline", "data-state": state },
    <div className={loading ? "tl card is-busy" : "tl card"}>
      <SoneCardHeader className="tl-head">
        <SoneCardTitle className="tl-title">{t.title}</SoneCardTitle>
        {ready ? (
          <SoneCardDescription as="span" className="tl-sub">
            {t.description}
          </SoneCardDescription>
        ) : null}
      </SoneCardHeader>
      {body}
    </div>,
  );
}
