import { computed, defineComponent, h, ref, type PropType } from "vue";

import {
  barChartCurrent,
  barChartShown,
  chartColor,
  formatChartNumber,
  lineChartModel,
  lineChartTip,
  listNavigationIndex,
  type SoneChartX,
  type SoneLineChartCurve,
  type SoneLineChartSeriesLike,
  type SoneLineChartXScale,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneChartLegend, SoneSwatch } from "../chart-legend";

export type {
  SoneChartX,
  SoneLineChartCurve,
  SoneLineChartXScale,
} from "@surface-one/core";

/** A series of a line or area chart: the row key of its values, its name and colour. */
export type SoneLineChartSeries = SoneLineChartSeriesLike;
export type SoneLineChartXFormat = (x: SoneChartX, index: number) => string;
export type SoneLineChartFormat = (value: number) => string;

/** The props a line chart and an area chart share. */
export const lineChartProps = {
  /** The rows, left to right: each holds the x value (`xKey`) and one value per series. */
  data: {
    type: Array as PropType<readonly object[]>,
    default: () => [],
  },
  /** The series: `{ key, label, tone }`, `key` naming the row property of its values. */
  series: {
    type: Array as PropType<readonly SoneLineChartSeries[]>,
    default: () => [],
  },
  /** The row property of the x value. */
  xKey: { type: String, default: "x" },
  /** `category` — evenly spaced; `time` — spaced by date (`Date`, epoch ms or ISO string). */
  xScale: {
    type: String as PropType<SoneLineChartXScale>,
    default: "category",
  },
  /** The label of an x value (axis, tooltip, table); default: the text, or a short date. */
  xFormat: {
    type: Function as PropType<SoneLineChartXFormat | null>,
    default: null,
  },
  /** At most this many x-axis labels (stepped back from the last one); 0 hides the axis. */
  xTicks: { type: Number, default: 6 },
  /** About this many value-axis steps. */
  yTicks: { type: Number, default: 4 },
  /** The bottom of the value axis; default: 0, or the lowest value when negative. */
  yMin: { type: Number as PropType<number | null>, default: null },
  /** The top of the value axis; default: a round step above the highest value. */
  yMax: { type: Number as PropType<number | null>, default: null },
  /** The plot height in CSS pixels (the x labels sit below it). */
  height: { type: Number, default: 200 },
  /** `linear` — straight segments; `smooth` — a monotone curve. */
  curve: { type: String as PropType<SoneLineChartCurve>, default: "linear" },
  /** Stacks the series on one another (with `area`, each fills down to the one below). */
  stacked: { type: Boolean, default: false },
  /** Draws a dot on every value (the hovered or focused x value always shows its dots). */
  dots: { type: Boolean, default: true },
  /** Shows the legend under the plot. */
  legend: { type: Boolean, default: true },
  /** Names the chart and captions its data table (“Visitors, January to June”). */
  ariaLabel: { type: String, default: "" },
  /** Formats values (default: a number in the `numberLocale` message's locale). */
  valueFormat: {
    type: Function as PropType<SoneLineChartFormat | null>,
    default: null,
  },
  /** The data table's category column header (default: the `barChartCategory` message). */
  categoryHeader: { type: String, default: undefined },
} as const;

/**
 * `<sone-line-chart>` — one or more series over categories or time (shadcn/ui Line Chart):
 * a value axis with round ticks and grid lines, straight or smoothed lines that break at a
 * missing value, dots, a legend and a tooltip. `area` fills under the lines and `stacked`
 * stacks them (what `SoneAreaChart` draws). One Tab stop with a roving focus over the x
 * values (Left/Right/Home/End, Escape hides the tooltip); a visually hidden table carries
 * the data.
 */
export const SoneLineChart = defineComponent({
  name: "SoneLineChart",
  props: {
    ...lineChartProps,
    /** Fills under each line. */
    area: { type: Boolean, default: false },
  },
  setup(props) {
    const messages = useSoneMessages();
    const hovered = ref<number | null>(null);
    const active = ref<number | null>(null);
    const focusWithin = ref(false);
    const dismissed = ref(false);
    const cols: (HTMLElement | null)[] = [];

    const model = computed(() => {
      const locale = messages.value.numberLocale;
      return lineChartModel({
        data: props.data,
        series: props.series,
        xKey: props.xKey,
        xScale: props.xScale,
        xFormat: props.xFormat,
        xTicks: props.xTicks,
        yTicks: props.yTicks,
        yMin: props.yMin,
        yMax: props.yMax,
        curve: props.curve,
        area: props.area,
        stacked: props.stacked,
        locale,
        valueFormat: props.valueFormat ?? ((n) => formatChartNumber(n, locale)),
      });
    });
    const current = computed(() =>
      barChartCurrent(model.value.columns.length, active.value),
    );
    const shown = computed(() =>
      barChartShown({
        count: model.value.columns.length,
        hovered: hovered.value,
        current: current.value,
        focusWithin: focusWithin.value,
        dismissed: dismissed.value,
      }),
    );

    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget as Node | null;
      const host = event.currentTarget as HTMLElement;
      if (!next || !host.contains(next)) {
        focusWithin.value = false;
        dismissed.value = false;
      }
    };

    const onKeydown = (event: KeyboardEvent): void => {
      const n = model.value.columns.length;
      if (n === 0) return;
      if (event.key === "Escape") {
        if (shown.value !== null) {
          dismissed.value = true;
          event.preventDefault();
        }
        return;
      }
      // The plot runs left to right in every writing direction (a time axis does not flip).
      const to = listNavigationIndex(event.key, current.value, n, {
        orientation: "horizontal",
        rtl: false,
        wrap: false,
      });
      if (to === null) return;
      event.preventDefault();
      dismissed.value = false;
      hovered.value = null;
      active.value = to;
      cols[to]?.focus();
    };

    return () => {
      const m = model.value;
      const s = shown.value;
      const col = s === null ? null : m.columns[s];
      const tip = col ? lineChartTip(col.x) : null;
      const paths = m.paths.map((p) => ({ ...p, color: chartColor(p.tone) }));
      const label = props.ariaLabel;
      cols.length = m.columns.length;
      return h(
        "sone-line-chart",
        { "data-slot": "line-chart", "data-area": props.area ? "" : undefined },
        [
          h(
            "div",
            { class: "line-chart-frame", "data-slot": "line-chart-frame" },
            [
              h(
                "div",
                {
                  class: "line-chart-y-axis",
                  "data-slot": "line-chart-y-axis",
                  "aria-hidden": "true",
                },
                [
                  h("span", { class: "line-chart-y-sizer" }, m.widestY),
                  ...m.yTicks.map((t) =>
                    h(
                      "span",
                      {
                        key: t.pct,
                        class: "line-chart-y-tick",
                        style: { bottom: `${t.pct}%` },
                      },
                      t.label,
                    ),
                  ),
                ],
              ),
              h(
                "div",
                {
                  class: "line-chart-plot",
                  "data-slot": "line-chart-plot",
                  style: { height: `${props.height}px` },
                  onPointerleave: () => (hovered.value = null),
                },
                [
                  h(
                    "div",
                    { class: "line-chart-grid", "aria-hidden": "true" },
                    m.yTicks.map((t) =>
                      h("span", {
                        key: t.pct,
                        class: "line-chart-grid-line",
                        style: { bottom: `${t.pct}%` },
                      }),
                    ),
                  ),
                  h(
                    "svg",
                    {
                      class: "line-chart-svg",
                      viewBox: "0 0 100 100",
                      preserveAspectRatio: "none",
                      "aria-hidden": "true",
                      focusable: "false",
                    },
                    [
                      ...paths
                        .filter((p) => p.area)
                        .map((p) =>
                          h("path", {
                            key: `area-${p.key}`,
                            class: "line-chart-area",
                            d: p.area,
                            style: { "--_color": p.color },
                          }),
                        ),
                      ...paths.map((p) =>
                        h("path", {
                          key: `line-${p.key}`,
                          class: "line-chart-line",
                          d: p.line,
                          style: { "--_color": p.color },
                        }),
                      ),
                    ],
                  ),
                  col
                    ? h("span", {
                        class: "line-chart-cursor",
                        "aria-hidden": "true",
                        style: { left: `${col.x}%` },
                      })
                    : null,
                  h(
                    "div",
                    { class: "line-chart-dots", "aria-hidden": "true" },
                    paths.flatMap((p) =>
                      p.points.flatMap((pt, i) =>
                        pt.value !== null && (props.dots || s === i)
                          ? [
                              h("span", {
                                key: `${p.key}-${i}`,
                                class: "line-chart-dot",
                                "data-shown": s === i ? "" : undefined,
                                style: {
                                  left: `${pt.x}%`,
                                  top: `${pt.y}%`,
                                  "--_color": p.color,
                                },
                              }),
                            ]
                          : [],
                      ),
                    ),
                  ),
                  h(
                    "div",
                    {
                      class: "line-chart-columns",
                      role: "group",
                      "aria-label": label || undefined,
                      onKeydown,
                      onFocusout: onFocusOut,
                    },
                    m.columns.map((c, i) =>
                      h("div", {
                        key: c.key,
                        ref: (el: unknown) => {
                          cols[i] = el instanceof HTMLElement ? el : null;
                        },
                        class: "line-chart-col",
                        "data-slot": "line-chart-point",
                        role: "img",
                        "aria-label": c.summary,
                        tabindex: i === current.value ? 0 : -1,
                        "data-shown": s === i ? "" : undefined,
                        style: { left: `${c.left}%`, width: `${c.width}%` },
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
                  col && tip
                    ? h(
                        "div",
                        {
                          class: "line-chart-tooltip",
                          "data-slot": "line-chart-tooltip",
                          "aria-hidden": "true",
                          "data-align": tip.align,
                          style: { left: `${tip.at}%` },
                        },
                        [
                          h(
                            "div",
                            { class: "line-chart-tooltip-title" },
                            col.label,
                          ),
                          ...col.values.map((v) =>
                            h(
                              "div",
                              { key: v.key, class: "line-chart-tooltip-row" },
                              [
                                h(SoneSwatch, {
                                  tone: v.tone,
                                  shape: "square",
                                }),
                                h(
                                  "span",
                                  { class: "line-chart-tooltip-label" },
                                  v.label,
                                ),
                                h(
                                  "span",
                                  { class: "line-chart-tooltip-value" },
                                  v.value,
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                    : null,
                ],
              ),
              props.xTicks > 0
                ? h(
                    "div",
                    {
                      class: "line-chart-x-axis",
                      "data-slot": "line-chart-x-axis",
                      "aria-hidden": "true",
                    },
                    m.xTicks.map((t) =>
                      h(
                        "span",
                        {
                          key: t.pct,
                          class: "line-chart-x-tick",
                          "data-align": t.align,
                          style: { left: `${t.pct}%` },
                        },
                        t.label,
                      ),
                    ),
                  )
                : null,
            ],
          ),
          props.legend && props.series.length > 0
            ? h(SoneChartLegend, {
                class: "line-chart-legend",
                shape: "square",
                items: m.paths.map((p) => ({
                  key: p.key,
                  label: p.label,
                  tone: p.tone,
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
                  props.categoryHeader ?? messages.value.barChartCategory,
                ),
                ...m.paths.map((p) =>
                  h("th", { key: p.key, scope: "col" }, p.label),
                ),
              ]),
            ),
            h(
              "tbody",
              m.columns.map((c) =>
                h("tr", { key: c.key }, [
                  h("th", { scope: "row" }, c.label),
                  ...c.values.map((v) => h("td", { key: v.key }, v.value)),
                ]),
              ),
            ),
          ]),
        ],
      );
    };
  },
});
