import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { definePart, flag } from "../../utils/part";

export type SoneStatGroupLayout = "grid" | "inline";
export type SoneStatVariant = "card" | "inset" | "plain";
export type SoneStatSize = "sm" | "md" | "lg";
export type SoneStatLabelPosition = "top" | "bottom";
export type SoneStatTrendTone = "auto" | "positive" | "negative" | "neutral";

const columnsOf = (n: number | null): number | undefined =>
  n !== null && Number.isFinite(n) && n >= 1 ? Math.floor(n) : undefined;

/** `<dl data-slot="stat-group">` — a grid or inline row of key figures. */
export const SoneStatGroup = definePart({
  name: "SoneStatGroup",
  tag: "dl",
  slot: "stat-group",
  props: {
    layout: { type: String as PropType<SoneStatGroupLayout>, default: "grid" },
    columns: { type: Number as PropType<number | null>, default: null },
    separated: { type: Boolean, default: false },
  },
  attrs: (p) => {
    const cols = columnsOf(p.columns);
    return {
      "data-layout": p.layout,
      "data-columns": cols,
      "data-separated": flag(p.separated),
      style: cols === undefined ? undefined : { "--stat-columns": cols },
    };
  },
});

/** One figure: label, value and optional hint / trend. */
export const SoneStat = definePart({
  name: "SoneStat",
  tag: "div",
  slot: "stat",
  props: {
    variant: { type: String as PropType<SoneStatVariant>, default: "card" },
    size: { type: String as PropType<SoneStatSize>, default: "md" },
    labelPosition: {
      type: String as PropType<SoneStatLabelPosition>,
      default: "top",
    },
  },
  attrs: (p) => ({
    "data-variant": p.variant,
    "data-size": p.size,
    "data-label-position": p.labelPosition,
  }),
});

export const SoneStatLabel = definePart({
  name: "SoneStatLabel",
  tag: "dt",
  slot: "stat-label",
});

export const SoneStatValue = definePart({
  name: "SoneStatValue",
  tag: "dd",
  slot: "stat-value",
});

export const SoneStatHint = definePart({
  name: "SoneStatHint",
  tag: "dd",
  slot: "stat-hint",
});

const GLYPH = {
  up: "M6 2.5 10 8H2z",
  down: "M6 9.5 2 4h8z",
  flat: "M2 5.25h8v1.5H2z",
};

/**
 * `<dd data-slot="stat-trend">` — the change since the last period. `delta`'s sign
 * draws the arrow and, with `tone="auto"`, the colour; screen readers hear the
 * direction ("up") before the slotted text.
 */
export const SoneStatTrend = defineComponent({
  name: "SoneStatTrend",
  props: {
    delta: { type: Number as PropType<number | null>, default: null },
    tone: { type: String as PropType<SoneStatTrendTone>, default: "auto" },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const direction = computed<"up" | "down" | "flat" | null>(() => {
      const d = props.delta;
      if (d === null || d === undefined || !Number.isFinite(d)) return null;
      return d > 0 ? "up" : d < 0 ? "down" : "flat";
    });
    const tone = computed(() => {
      if (props.tone !== "auto") return props.tone;
      return direction.value === "up"
        ? "positive"
        : direction.value === "down"
          ? "negative"
          : "neutral";
    });
    return () => {
      const dir = direction.value;
      const m = messages.value;
      return h(
        "dd",
        {
          "data-slot": "stat-trend",
          "data-tone": tone.value,
          "data-direction": dir ?? undefined,
        },
        [
          dir
            ? h(
                "svg",
                {
                  class: "stat-trend-glyph",
                  "data-slot": "stat-trend-glyph",
                  viewBox: "0 0 12 12",
                  "aria-hidden": "true",
                  focusable: "false",
                },
                [h("path", { d: GLYPH[dir] })],
              )
            : null,
          dir
            ? h(
                "span",
                { class: "sr-only" },
                `${dir === "up" ? m.statTrendUp : dir === "down" ? m.statTrendDown : m.statTrendFlat} `,
              )
            : null,
          slots.default?.(),
        ],
      );
    };
  },
});
