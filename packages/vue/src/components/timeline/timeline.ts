import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType,
} from "vue";

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

import { useSoneMessages } from "../../composables/messages";
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

/**
 * `<sone-timeline-legend>` — the speaker lanes' swatches, names and talk time. A name
 * is a button that turns into a field to rename the lane (Enter or blur saves, Escape
 * cancels); a suggested name is one click away. Emits `rename`.
 */
export const SoneTimelineLegend = defineComponent({
  name: "SoneTimelineLegend",
  props: {
    lanes: {
      type: Array as PropType<readonly TimelineLegendLane[]>,
      default: () => [],
    },
    suggestions: {
      type: Array as PropType<readonly TimelineLaneSuggestion[]>,
      default: () => [],
    },
    /** The rename field's name (default: the "Speaker name" message). */
    nameLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { rename: (_rename: TimelineLaneRename) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const editing = ref<string | null>(null);
    const draft = ref("");
    const field = ref<HTMLInputElement | null>(null);

    const suggestionByLane = computed(() => {
      const map = new Map<string, string>();
      for (const s of props.suggestions) {
        const label = s.label?.trim();
        if (label) map.set(s.lane, label);
      }
      return map;
    });

    const startRename = (event: Event, lane: string): void => {
      event.stopPropagation();
      draft.value = lane;
      editing.value = lane;
      void nextTick(() => {
        field.value?.focus();
        field.value?.select();
      });
    };
    const commit = (oldLabel: string): void => {
      if (editing.value !== oldLabel) return;
      const newLabel = draft.value.trim();
      editing.value = null;
      if (newLabel && newLabel !== oldLabel)
        emit("rename", { oldLabel, newLabel });
    };
    const accept = (oldLabel: string): void => {
      const newLabel = suggestionByLane.value.get(oldLabel)?.trim();
      if (newLabel && newLabel !== oldLabel)
        emit("rename", { oldLabel, newLabel });
    };

    return () => {
      const m = messages.value;
      return h(
        "sone-timeline-legend",
        { "data-slot": "timeline-legend" },
        props.lanes.map((lane) => {
          const name = suggestionByLane.value.get(lane.lane);
          return h("span", { key: lane.lane, class: "legend-item" }, [
            h(SoneSwatch, { class: "legend-dot", tone: lane.dot }),
            ...(editing.value === lane.lane
              ? [
                  h("input", {
                    ref: field,
                    type: "text",
                    class: "legend-edit",
                    "aria-label": props.nameLabel ?? m.timelineLaneName,
                    autocapitalize: "words",
                    autocomplete: "off",
                    spellcheck: "false",
                    value: draft.value,
                    onInput: (e: Event) =>
                      (draft.value = (e.target as HTMLInputElement).value),
                    onKeydown: (e: KeyboardEvent) => {
                      if (e.key === "Enter") commit(lane.lane);
                      else if (e.key === "Escape") {
                        e.stopPropagation();
                        editing.value = null;
                      }
                    },
                    onBlur: () => commit(lane.lane),
                    onClick: (e: MouseEvent) => e.stopPropagation(),
                  }),
                ]
              : [
                  h(
                    SoneButton,
                    {
                      variant: "ghost",
                      size: "xs",
                      type: "button",
                      class: "legend-rename",
                      "aria-label": m.timelineRenameLane(lane.lane),
                      onClick: (e: MouseEvent) => startRename(e, lane.lane),
                    },
                    () => [
                      h("span", { class: "legend-name" }, lane.lane),
                      h(
                        "span",
                        { class: "legend-pencil", "aria-hidden": "true" },
                        "✎",
                      ),
                    ],
                  ),
                  name
                    ? h(
                        SoneBadge,
                        {
                          as: "button",
                          variant: "accent",
                          type: "button",
                          class: "legend-suggest",
                          "aria-label": m.timelineRenameLaneTo(lane.lane, name),
                          onClick: () => accept(lane.lane),
                        },
                        () => [
                          m.timelineSuggestBefore,
                          h("span", { class: "legend-suggest-name" }, name),
                          m.timelineSuggestAfter,
                        ],
                      )
                    : null,
                ]),
            h("span", { class: "legend-time" }, clockTime(lane.totalS)),
          ]);
        }),
      );
    };
  },
});

/** `<sone-timeline-chapters>` — the chapters as a list of buttons that seek to their start. */
export const SoneTimelineChapters = defineComponent({
  name: "SoneTimelineChapters",
  props: {
    chapters: {
      type: Array as PropType<readonly TimelineChapterItem[]>,
      default: () => [],
    },
    /** The list's name (default: the "Chapters" message). */
    label: { type: String as PropType<string | null>, default: null },
    activeOrders: {
      type: Object as PropType<ReadonlySet<number>>,
      default: () => new Set<number>(),
    },
  },
  emits: { seek: (_seconds: number) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    return () => {
      const m = messages.value;
      return h(
        "sone-timeline-chapters",
        {
          "data-slot": "timeline-chapters",
          role: "list",
          "aria-label": props.label ?? m.timelineChapterList,
        },
        props.chapters.map((ch) =>
          h(
            "span",
            { key: ch.order, role: "listitem", class: "tl-chapter-item" },
            [
              h(
                SoneButton,
                {
                  variant: "outline",
                  size: "xs",
                  type: "button",
                  class: [
                    "tl-chapter",
                    { "is-active": props.activeOrders.has(ch.order) },
                  ],
                  style: { "--i": ch.order },
                  "aria-label": m.timelineChapter(
                    ch.label,
                    clockTime(ch.startS),
                  ),
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation();
                    emit("seek", ch.startS);
                  },
                },
                () => [
                  h("span", {
                    class: "tl-chapter-dot",
                    style: { background: ch.dot },
                    "aria-hidden": "true",
                  }),
                  h("span", { class: "tl-chapter-label" }, ch.label),
                  h("span", { class: "tl-chapter-time" }, clockTime(ch.startS)),
                ],
              ),
            ],
          ),
        ),
      );
    };
  },
});

/**
 * `<sone-timeline>` — who spoke when and what was discussed: speaker lanes and a topic
 * ribbon over a time axis, each a seek slider (← / → by 5 s, Home / End), with the
 * playhead, a scrub preview, a pin button and the loading, needs-generation and
 * unavailable states. Emits `seek`, `retry`, `generate`, `pin` and `renameLane`.
 */
export const SoneTimeline = defineComponent({
  name: "SoneTimeline",
  props: {
    data: { type: Object as PropType<TimelineData | null>, default: null },
    total: { type: Number, default: 0 },
    currentTime: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    needsGeneration: { type: Boolean, default: false },
    suggestions: {
      type: Array as PropType<readonly TimelineLaneSuggestion[]>,
      default: () => [],
    },
    labels: {
      type: Object as PropType<Partial<TimelineLabels>>,
      default: () => ({}),
    },
  },
  emits: {
    seek: (_seconds: number) => true,
    retry: () => true,
    generate: () => true,
    pin: (_seconds: number) => true,
    renameLane: (_rename: TimelineLaneRename) => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const hoverPct = ref<number | null>(null);

    const text = computed<TimelineLabels>(() => ({
      ...timelineDefaultLabels(messages.value),
      ...props.labels,
    }));
    const span = computed(() => timelineSpan(props.data, props.total));
    const lanes = computed(() =>
      timelineLanes(props.data?.blocks ?? [], span.value),
    );
    const chapters = computed(() =>
      timelineChapters(props.data?.chapters ?? [], span.value),
    );
    const chapterItems = computed(() => timelineChapterItems(chapters.value));
    const activeBlocks = computed(() =>
      timelineActiveBlocks(lanes.value, props.currentTime),
    );
    const activeChapters = computed(() =>
      timelineActiveChapters(chapters.value, props.currentTime),
    );
    const ready = computed(
      () =>
        !props.loading && (lanes.value.length > 0 || chapters.value.length > 0),
    );
    const unavailable = computed(
      () =>
        !props.loading &&
        !props.needsGeneration &&
        (props.error ||
          (lanes.value.length === 0 && chapters.value.length === 0)),
    );
    const state = computed(() => {
      if (props.loading) return "loading";
      if (props.needsGeneration) return "needs-generation";
      if (unavailable.value) return "unavailable";
      return "ready";
    });
    const playheadPct = computed(() =>
      span.value <= 0
        ? 0
        : clamp((props.currentTime / span.value) * 100, 0, 100),
    );
    const showPlayhead = computed(() => ready.value && props.currentTime > 0);

    const seekFromTrack = (event: MouseEvent): void => {
      if (span.value <= 0) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      if (rect.width <= 0) return;
      emit(
        "seek",
        clamp((event.clientX - rect.left) / rect.width, 0, 1) * span.value,
      );
    };
    const onScrubMove = (event: MouseEvent): void => {
      if (span.value <= 0) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      if (rect.width <= 0) return;
      hoverPct.value = clamp(
        ((event.clientX - rect.left) / rect.width) * 100,
        0,
        100,
      );
    };
    const onAxisKey = (event: KeyboardEvent): void => {
      const next = timelineSeekKey(event.key, props.currentTime, span.value);
      if (next === null) return;
      event.preventDefault();
      emit("seek", next);
    };
    const onBlock = (event: MouseEvent, startS: number): void => {
      event.stopPropagation();
      emit("seek", startS);
    };

    /** A seek slider: the axis, the lanes or the ribbon. */
    const slider = (cls: string, label: string, children: unknown[]) =>
      h(
        "div",
        {
          class: cls,
          role: "slider",
          tabindex: "0",
          "aria-label": label,
          "aria-valuemin": 0,
          "aria-valuemax": Math.round(span.value),
          "aria-valuenow": Math.round(clamp(props.currentTime, 0, span.value)),
          onClick: seekFromTrack,
          onMousemove: onScrubMove,
          onMouseleave: () => (hoverPct.value = null),
          onKeydown: onAxisKey,
        },
        children as never,
      );
    const trackScrub = () =>
      hoverPct.value
        ? h("span", {
            class: "tl-track-scrub",
            style: { left: pct(hoverPct.value) },
            "aria-hidden": "true",
          })
        : null;
    const trackPlayhead = () =>
      showPlayhead.value
        ? h("span", {
            class: "tl-track-playhead",
            style: { left: pct(playheadPct.value) },
            "aria-hidden": "true",
          })
        : null;
    const tip = (name: string, startS: number, endS: number) =>
      h("span", { class: "tl-tip", "aria-hidden": "true" }, [
        h("span", { class: "tl-tip-name" }, name),
        h("span", { class: "tl-tip-time" }, timelineClock(startS, endS)),
      ]);
    const unavailableRow = (
      message: string,
      button: string,
      variant: "default" | "ghost",
      onClick: () => void,
    ) =>
      h("div", { class: "tl-unavailable" }, [
        h("span", { class: "tl-unavailable-dot", "aria-hidden": "true" }),
        h("span", { class: "tl-unavailable-text" }, message),
        h(
          SoneButton,
          { variant, size: "sm", type: "button", class: "tl-retry", onClick },
          () => button,
        ),
      ]);

    const body = (t: TimelineLabels) => {
      if (props.loading) {
        return h(
          "div",
          { class: "tl-skeleton", "aria-busy": "true", "aria-live": "polite" },
          [
            h("span", { class: "sk-label" }, t.loading),
            h(
              "div",
              { class: "sk-track" },
              SKELETON_BARS.map((b, i) =>
                h(SoneSkeleton, {
                  key: i,
                  as: "span",
                  class: "sk-bar",
                  style: { left: pct(b.left), width: pct(b.width), "--i": i },
                }),
              ),
            ),
            h(
              "div",
              { class: "sk-track sk-track--thin" },
              SKELETON_RIBBON.map((b, i) =>
                h(SoneSkeleton, {
                  key: i,
                  as: "span",
                  class: "sk-bar",
                  style: {
                    left: pct(b.left),
                    width: pct(b.width),
                    "--i": i + 4,
                  },
                }),
              ),
            ),
          ],
        );
      }
      // Deriving is heavy (an on-device model): never auto-run; the user asks for it here.
      if (props.needsGeneration) {
        return unavailableRow(t.needsGeneration, t.generate, "default", () =>
          emit("generate"),
        );
      }
      if (unavailable.value) {
        return unavailableRow(t.unavailable, t.retry, "ghost", () =>
          emit("retry"),
        );
      }
      return [
        // The pin button sits beside the slider, not inside it: a role="slider"
        // cannot contain another interactive control.
        h("div", { class: "tl-axis-wrap" }, [
          slider("tl-axis", t.seekAxis, [
            ...timelineTicks(span.value).map((tick) =>
              h(
                "span",
                {
                  key: tick.pct,
                  class: "tl-tick",
                  style: { left: pct(tick.pct) },
                },
                [
                  h("span", { class: "tl-tick-mark", "aria-hidden": "true" }),
                  h("span", { class: "tl-tick-label" }, tick.label),
                ],
              ),
            ),
            hoverPct.value
              ? h(
                  "span",
                  {
                    class: "tl-scrub",
                    style: { left: pct(hoverPct.value) },
                    "aria-hidden": "true",
                  },
                  h(
                    "span",
                    { class: "tl-scrub-bubble" },
                    clockTime((hoverPct.value / 100) * span.value),
                  ),
                )
              : null,
            showPlayhead.value
              ? h(
                  "span",
                  {
                    class: "tl-playhead",
                    style: { left: pct(playheadPct.value) },
                    "aria-hidden": "true",
                  },
                  h("span", { class: "tl-playhead-knob" }),
                )
              : null,
          ]),
          showPlayhead.value
            ? h(
                SoneButton,
                {
                  variant: "outline",
                  size: "icon-xs",
                  type: "button",
                  class: "tl-pin",
                  style: { left: pct(playheadPct.value) },
                  "aria-label": messages.value.timelinePinAt(
                    clockTime(props.currentTime),
                  ),
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation();
                    emit("pin", Math.max(0, props.currentTime));
                  },
                },
                () => [
                  h(
                    "span",
                    { class: "tl-pin-glyph", "aria-hidden": "true" },
                    "📌",
                  ),
                  h(
                    "span",
                    { class: "tl-pin-tip", "aria-hidden": "true" },
                    t.pin,
                  ),
                ],
              )
            : null,
        ]),
        lanes.value.length
          ? h("div", { class: "tl-group" }, [
              h("div", { class: "tl-group-head" }, [
                h("span", { class: "tl-group-label" }, t.lanes),
                h(SoneTimelineLegend, {
                  lanes: lanes.value,
                  suggestions: props.suggestions,
                  nameLabel: t.laneName,
                  onRename: (r: TimelineLaneRename) => emit("renameLane", r),
                }),
              ]),
              slider("tl-track tl-track--lanes", t.seekLanes, [
                trackScrub(),
                ...lanes.value.map((lane) =>
                  h(
                    "div",
                    { key: lane.lane, class: "tl-lane" },
                    lane.blocks.map((blk) =>
                      h(
                        "span",
                        {
                          key: blk.order,
                          "aria-hidden": "true",
                          class: [
                            "tl-block",
                            { "is-active": activeBlocks.value.has(blk.order) },
                          ],
                          style: {
                            left: pct(blk.left),
                            width: pct(blk.width),
                            "--i": blk.order,
                            background: blk.fill,
                            "border-color": blk.edge,
                          },
                          onClick: (e: MouseEvent) => onBlock(e, blk.startS),
                        },
                        tip(lane.lane, blk.startS, blk.endS),
                      ),
                    ),
                  ),
                ),
                trackPlayhead(),
              ]),
            ])
          : null,
        chapters.value.length
          ? h("div", { class: "tl-group" }, [
              h("div", { class: "tl-group-head" }, [
                h("span", { class: "tl-group-label" }, t.chapters),
                h("span", { class: "tl-group-hint" }, t.chaptersHint),
              ]),
              h(SoneTimelineChapters, {
                chapters: chapterItems.value,
                activeOrders: activeChapters.value,
                onSeek: (s: number) => emit("seek", s),
              }),
              slider("tl-track tl-track--ribbon", t.seekChapters, [
                trackScrub(),
                ...chapters.value.map((top) =>
                  h(
                    "span",
                    {
                      key: top.order,
                      "aria-hidden": "true",
                      class: [
                        "tl-topic",
                        { "is-active": activeChapters.value.has(top.order) },
                      ],
                      style: {
                        left: pct(top.left),
                        width: pct(top.width),
                        "--i": top.order,
                        background: top.fill,
                        "border-color": top.edge,
                      },
                      onClick: (e: MouseEvent) => onBlock(e, top.startS),
                    },
                    [
                      top.narrow
                        ? null
                        : h("span", { class: "tl-topic-label" }, top.label),
                      tip(top.label, top.startS, top.endS),
                    ],
                  ),
                ),
                trackPlayhead(),
              ]),
            ])
          : null,
      ];
    };

    return () => {
      const t = text.value;
      return h(
        "sone-timeline",
        { "data-slot": "timeline", "data-state": state.value },
        h("div", { class: ["tl card", { "is-busy": props.loading }] }, [
          h(SoneCardHeader, { class: "tl-head" }, () => [
            h(SoneCardTitle, { class: "tl-title" }, () => t.title),
            ready.value
              ? h(
                  SoneCardDescription,
                  { as: "span", class: "tl-sub" },
                  () => t.description,
                )
              : null,
          ]),
          body(t),
        ]),
      );
    };
  },
});
