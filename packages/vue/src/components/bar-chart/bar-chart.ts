import { computed, defineComponent, h, ref, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import {
  barChartBars,
  barChartCurrent,
  barChartShown,
  barChartTip,
  barChartTop,
  chartColor,
  formatChartNumber,
  listNavigationIndex,
  type SoneChartTone,
} from "@surface-one/core";

// The day-series helper of the docs demo (sparse rows → one per day), from chart-utils.
export {
  fillDaySeries,
  localIsoDate,
  type FillDaySeriesOptions,
  type SoneChartTone,
} from "@surface-one/core";

export interface SoneBarChartDatum {
  /** Stable identity (e.g. the ISO date). */
  readonly key: string;
  readonly value: number;
  /** The category as people read it (“Mar 3”); defaults to `key`. */
  readonly label?: string;
}

/** `baseline` — a zero draws a flat stub on the baseline; `gap` — it draws nothing. */
export type SoneBarChartZero = "baseline" | "gap";

export type SoneBarChartTick<T = SoneBarChartDatum> = (
  datum: T,
  index: number,
) => string | null;
export type SoneBarChartTooltip<T = SoneBarChartDatum> = (datum: T) => string;
export type SoneBarChartFormat = (value: number) => string;

/**
 * `<sone-bar-chart>` — a column chart for a short series (a day per bar). Bars are HTML
 * boxes, not a stretched SVG: crisp edges and real rounded corners at any width. One Tab
 * stop with a roving focus (Left/Right/Home/End, Escape hides the tooltip); each bar is
 * an image named by its tooltip, and a visually hidden table carries the data.
 */
export const SoneBarChart = defineComponent({
  name: "SoneBarChart",
  props: {
    /** The bars, left to right (oldest first for a time series). */
    data: {
      type: Array as PropType<readonly SoneBarChartDatum[]>,
      default: () => [],
    },
    /** The plot height in CSS pixels (ticks sit below it). */
    height: { type: Number, default: 132 },
    /** The top of the value axis; defaults to `niceCeiling(values, 4)`. */
    yMax: { type: Number as PropType<number | null>, default: null },
    /** The axis label under a bar, or `null` for none; no function, no axis row. */
    tick: {
      type: Function as PropType<SoneBarChartTick | null>,
      default: null,
    },
    /** A bar's tooltip and accessible name; defaults to “label: value”. */
    tooltip: {
      type: Function as PropType<SoneBarChartTooltip | null>,
      default: null,
    },
    /** How a zero value draws: a flat stub (`baseline`) or nothing (`gap`). */
    zero: { type: String as PropType<SoneBarChartZero>, default: "baseline" },
    /** The bar colour. */
    tone: { type: String as PropType<SoneChartTone>, default: "accent" },
    /** Names the chart and captions its data table (“Meetings per day, last 30 days”). */
    ariaLabel: { type: String, default: "" },
    /** Formats values in the default tooltip and the data table (default: the `numberLocale` message). */
    valueFormat: {
      type: Function as PropType<SoneBarChartFormat | null>,
      default: null,
    },
    /** The data table's category column header (default: the `barChartCategory` message). */
    categoryHeader: { type: String, default: undefined },
    /** The data table's value column header (default: the `barChartValue` message). */
    valueHeader: { type: String, default: undefined },
  },
  setup(props) {
    const messages = useSoneMessages();
    /** The bar under the pointer. */
    const hovered = ref<number | null>(null);
    /** The roving-focus bar; `null` = the last one (the newest day). */
    const active = ref<number | null>(null);
    const focusWithin = ref(false);
    const dismissed = ref(false);
    const cols: (HTMLElement | null)[] = [];

    const format = computed<SoneBarChartFormat>(
      () =>
        props.valueFormat ??
        ((n) => formatChartNumber(n, messages.value.numberLocale)),
    );
    const bars = computed(() =>
      barChartBars(
        props.data,
        barChartTop(
          props.data.map((d) => d.value),
          props.yMax,
        ),
        props.tick,
        props.tooltip,
        format.value,
      ),
    );
    const current = computed(() =>
      barChartCurrent(props.data.length, active.value),
    );
    const shown = computed(() =>
      barChartShown({
        count: props.data.length,
        hovered: hovered.value,
        current: current.value,
        focusWithin: focusWithin.value,
        dismissed: dismissed.value,
      }),
    );
    const tip = computed(() => barChartTip(bars.value, shown.value));

    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget as Node | null;
      const host = event.currentTarget as HTMLElement;
      if (!next || !host.contains(next)) {
        focusWithin.value = false;
        dismissed.value = false;
      }
    };

    const onKeydown = (event: KeyboardEvent): void => {
      const n = props.data.length;
      if (n === 0) return;
      if (event.key === "Escape") {
        if (shown.value !== null) {
          dismissed.value = true;
          event.preventDefault();
        }
        return;
      }
      const host = event.currentTarget as HTMLElement;
      const rtl = getComputedStyle(host).direction === "rtl";
      const to = listNavigationIndex(event.key, current.value, n, {
        orientation: "horizontal",
        rtl,
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
      const list = bars.value;
      const t = tip.value;
      const label = props.ariaLabel;
      cols.length = list.length;
      return h(
        "sone-bar-chart",
        {
          "data-slot": "bar-chart",
          "data-zero": props.zero,
          style: { "--_color": chartColor(props.tone) },
        },
        [
          h(
            "div",
            {
              class: "bar-chart-plot",
              "data-slot": "bar-chart-plot",
              style: { height: `${props.height}px` },
              onPointerleave: () => (hovered.value = null),
            },
            [
              h(
                "div",
                {
                  class: "bar-chart-bars",
                  role: "group",
                  "aria-label": label || undefined,
                  onKeydown,
                  onFocusout: onFocusOut,
                },
                list.map((bar, i) =>
                  h(
                    "div",
                    {
                      key: bar.key,
                      ref: (el: unknown) => {
                        cols[i] = el instanceof HTMLElement ? el : null;
                      },
                      class: "bar-chart-col",
                      "data-slot": "bar-chart-bar",
                      role: "img",
                      "aria-label": bar.tip,
                      tabindex: i === current.value ? 0 : -1,
                      "data-empty": bar.empty ? "" : undefined,
                      "data-shown": shown.value === i ? "" : undefined,
                      onPointerenter: () => {
                        dismissed.value = false;
                        hovered.value = i;
                      },
                      onFocus: () => {
                        active.value = i;
                        focusWithin.value = true;
                      },
                    },
                    !bar.empty
                      ? h("span", {
                          class: "bar-chart-bar",
                          style: { height: `${bar.pct}%` },
                        })
                      : props.zero === "baseline"
                        ? h("span", {
                            class: "bar-chart-bar bar-chart-bar--zero",
                          })
                        : undefined,
                  ),
                ),
              ),
              t
                ? h(
                    "div",
                    {
                      class: "bar-chart-tooltip",
                      "data-slot": "bar-chart-tooltip",
                      "aria-hidden": "true",
                      "data-align": t.align,
                      style: { left: `${t.at}%`, bottom: `${t.pct}%` },
                    },
                    t.text,
                  )
                : null,
            ],
          ),
          props.tick
            ? h(
                "div",
                {
                  class: "bar-chart-axis",
                  "data-slot": "bar-chart-axis",
                  "aria-hidden": "true",
                },
                list.map((bar) =>
                  h(
                    "span",
                    { key: bar.key, class: "bar-chart-tick" },
                    bar.tick
                      ? h("span", { class: "bar-chart-tick-text" }, bar.tick)
                      : undefined,
                  ),
                ),
              )
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
                h(
                  "th",
                  { scope: "col" },
                  props.valueHeader ?? messages.value.barChartValue,
                ),
              ]),
            ),
            h(
              "tbody",
              list.map((bar) =>
                h("tr", { key: bar.key }, [
                  h("th", { scope: "row" }, bar.label),
                  h("td", bar.value),
                ]),
              ),
            ),
          ]),
        ],
      );
    };
  },
});
