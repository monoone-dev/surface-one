import { computed, defineComponent, h, ref, type PropType } from "vue";

import {
  barChartCurrent,
  barChartShown,
  chartColor,
  donutChartModel,
  formatChartNumber,
  listNavigationIndex,
  type SoneDonutChartSegmentLike,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneChartLegend } from "../chart-legend";

/** A segment of a donut chart: `{ key, label, value, tone }`. */
export type SoneDonutChartSegment = SoneDonutChartSegmentLike;
export type SoneDonutChartFormat = (value: number) => string;

/**
 * `<sone-donut-chart>` — the parts of a whole as a ring (shadcn/ui Pie Chart, donut with
 * text): one segment per part, clockwise from 12 o'clock, the total (or the hovered or
 * focused segment) in the centre and a legend. One Tab stop with a roving focus over the
 * segments (arrow keys, Home/End, Escape returns the centre to the total); each segment is
 * an image named “Chrome: 275 (39%)”, and a visually hidden table carries the data.
 */
export const SoneDonutChart = defineComponent({
  name: "SoneDonutChart",
  props: {
    /** The parts, clockwise from 12 o'clock; zero and negative values draw nothing. */
    segments: {
      type: Array as PropType<readonly SoneDonutChartSegment[]>,
      default: () => [],
    },
    /** The ring's diameter in CSS pixels (it shrinks to fit a narrower container). */
    size: { type: Number, default: 200 },
    /** The ring's width as a part of its radius: 0.3 by default, 1 draws a pie. */
    thickness: { type: Number, default: 0.3 },
    /** The gap between neighbouring segments, in degrees. */
    padAngle: { type: Number, default: 1 },
    /** The caption under the centre value (default: the `donutChartTotal` message). */
    label: { type: String, default: undefined },
    /** The centre value at rest; default: the formatted total. */
    centerValue: { type: String as PropType<string | null>, default: null },
    /** Shows the legend under the ring. */
    legend: { type: Boolean, default: true },
    /** Names the chart and captions its data table (“Visitors by browser”). */
    ariaLabel: { type: String, default: "" },
    /** Formats values (default: a number in the `numberLocale` message's locale). */
    valueFormat: {
      type: Function as PropType<SoneDonutChartFormat | null>,
      default: null,
    },
    /** The data table's column headers (default: the `barChartCategory`, `barChartValue` and `donutChartShare` messages). */
    categoryHeader: { type: String, default: undefined },
    valueHeader: { type: String, default: undefined },
    shareHeader: { type: String, default: undefined },
  },
  setup(props) {
    const messages = useSoneMessages();
    const hovered = ref<number | null>(null);
    const active = ref<number | null>(null);
    const focusWithin = ref(false);
    const dismissed = ref(false);
    const segs: (SVGElement | null)[] = [];

    const model = computed(() => {
      const locale = messages.value.numberLocale;
      return donutChartModel({
        segments: props.segments,
        thickness: props.thickness,
        padAngle: props.padAngle,
        locale,
        valueFormat: props.valueFormat ?? ((n) => formatChartNumber(n, locale)),
      });
    });
    const current = computed(() =>
      active.value === null
        ? Math.min(0, model.value.drawn.length - 1)
        : barChartCurrent(model.value.drawn.length, active.value),
    );
    const shown = computed(() =>
      barChartShown({
        count: model.value.drawn.length,
        hovered: hovered.value,
        current: current.value,
        focusWithin: focusWithin.value,
        dismissed: dismissed.value,
      }),
    );

    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget as Node | null;
      const host = event.currentTarget as Element;
      if (!next || !host.contains(next)) {
        focusWithin.value = false;
        dismissed.value = false;
      }
    };

    const onKeydown = (event: KeyboardEvent): void => {
      const n = model.value.drawn.length;
      if (n === 0) return;
      if (event.key === "Escape") {
        if (shown.value !== null) {
          dismissed.value = true;
          event.preventDefault();
        }
        return;
      }
      // Around the ring: Right/Down go clockwise, Left/Up back.
      const key =
        event.key === "ArrowDown"
          ? "ArrowRight"
          : event.key === "ArrowUp"
            ? "ArrowLeft"
            : event.key;
      const to = listNavigationIndex(key, current.value, n, {
        orientation: "horizontal",
        rtl: false,
        wrap: true,
      });
      if (to === null) return;
      event.preventDefault();
      dismissed.value = false;
      hovered.value = null;
      active.value = to;
      segs[to]?.focus();
    };

    return () => {
      const m = model.value;
      const msg = messages.value;
      const s = shown.value;
      const slice = s === null ? null : m.drawn[s];
      const center = slice
        ? { value: slice.valueText, label: slice.label }
        : {
            value: props.centerValue ?? m.totalText,
            label: props.label ?? msg.donutChartTotal,
          };
      const label = props.ariaLabel;
      segs.length = m.drawn.length;
      return h("sone-donut-chart", { "data-slot": "donut-chart" }, [
        h(
          "div",
          {
            class: "donut-chart-figure",
            "data-slot": "donut-chart-figure",
            style: { width: `${props.size}px` },
            onPointerleave: () => (hovered.value = null),
          },
          [
            h(
              "svg",
              {
                class: "donut-chart-svg",
                viewBox: "0 0 100 100",
                role: "group",
                "aria-label": label || undefined,
                onKeydown,
                onFocusout: onFocusOut,
              },
              m.drawn.map((d, i) =>
                h("path", {
                  key: d.key,
                  ref: (el: unknown) => {
                    segs[i] = el instanceof SVGElement ? el : null;
                  },
                  class: "donut-chart-segment",
                  "data-slot": "donut-chart-segment",
                  role: "img",
                  "aria-label": d.summary,
                  tabindex: i === current.value ? 0 : -1,
                  d: d.path,
                  "data-shown": s === i ? "" : undefined,
                  "data-dimmed": s !== null && s !== i ? "" : undefined,
                  style: { "--_color": chartColor(d.tone) },
                  onPointerenter: () => {
                    dismissed.value = false;
                    hovered.value = i;
                  },
                  onFocus: () => {
                    active.value = i;
                    focusWithin.value = true;
                  },
                }),
              ),
            ),
            props.thickness < 0.75
              ? h(
                  "div",
                  {
                    class: "donut-chart-center",
                    "data-slot": "donut-chart-center",
                    "aria-hidden": "true",
                  },
                  [
                    h("span", { class: "donut-chart-value" }, center.value),
                    h("span", { class: "donut-chart-label" }, center.label),
                  ],
                )
              : null,
          ],
        ),
        props.legend && props.segments.length > 0
          ? h(SoneChartLegend, {
              class: "donut-chart-legend",
              shape: "square",
              items: m.slices.map((x) => ({
                key: x.key,
                label: x.label,
                tone: x.tone,
                value: x.valueText,
              })),
            })
          : null,
        h("table", { class: "sr-only" }, [
          label ? h("caption", label) : null,
          h(
            "thead",
            h("tr", [
              h(
                "th",
                { scope: "col" },
                props.categoryHeader ?? msg.barChartCategory,
              ),
              h("th", { scope: "col" }, props.valueHeader ?? msg.barChartValue),
              h(
                "th",
                { scope: "col" },
                props.shareHeader ?? msg.donutChartShare,
              ),
            ]),
          ),
          h(
            "tbody",
            m.slices.map((x) =>
              h("tr", { key: x.key }, [
                h("th", { scope: "row" }, x.label),
                h("td", x.valueText),
                h("td", x.percent),
              ]),
            ),
          ),
        ]),
      ]);
    };
  },
});
