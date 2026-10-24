"use client";

import {
  createElement,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
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

export interface SoneBarChartProps<
  T extends SoneBarChartDatum = SoneBarChartDatum,
> extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The bars, left to right (oldest first for a time series). */
  readonly data?: readonly T[];
  /** The plot height in CSS pixels (ticks sit below it). */
  readonly height?: number;
  /** The top of the value axis; defaults to `niceCeiling(values, 4)`. */
  readonly yMax?: number | null;
  /** The axis label under a bar, or `null` for none; no function, no axis row. */
  readonly tick?: SoneBarChartTick<T> | null;
  /** A bar's tooltip and accessible name; defaults to “label: value”. */
  readonly tooltip?: SoneBarChartTooltip<T> | null;
  /** How a zero value draws: a flat stub (`baseline`) or nothing (`gap`). */
  readonly zero?: SoneBarChartZero;
  /** The bar colour. */
  readonly tone?: SoneChartTone;
  /** Names the chart and captions its data table (“Meetings per day, last 30 days”). */
  readonly ariaLabel?: string;
  /** Formats values in the default tooltip and the data table (default: the `numberLocale` message). */
  readonly valueFormat?: SoneBarChartFormat | null;
  /** The data table's category column header (default: the `barChartCategory` message). */
  readonly categoryHeader?: string;
  /** The data table's value column header (default: the `barChartValue` message). */
  readonly valueHeader?: string;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-bar-chart>` — a column chart for a short series (a day per bar). Bars are HTML
 * boxes, not a stretched SVG: crisp edges and real rounded corners at any width. One Tab
 * stop with a roving focus (Left/Right/Home/End, Escape hides the tooltip); each bar is
 * an image named by its tooltip, and a visually hidden table carries the data.
 */
export function SoneBarChart<T extends SoneBarChartDatum = SoneBarChartDatum>({
  data = [],
  height = 132,
  yMax = null,
  tick = null,
  tooltip = null,
  zero = "baseline",
  tone = "accent",
  ariaLabel = "",
  valueFormat = null,
  categoryHeader,
  valueHeader,
  style,
  ...rest
}: SoneBarChartProps<T>): ReactElement {
  const m = useSoneMessages();
  /** The bar under the pointer. */
  const [hovered, setHovered] = useState<number | null>(null);
  /** The roving-focus bar; `null` = the last one (the newest day). */
  const [active, setActive] = useState<number | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const cols = useRef<(HTMLElement | null)[]>([]);

  const bars = useMemo(() => {
    const format =
      valueFormat ?? ((n: number) => formatChartNumber(n, m.numberLocale));
    return barChartBars(
      data,
      barChartTop(
        data.map((d) => d.value),
        yMax,
      ),
      tick,
      tooltip,
      format,
    );
  }, [data, yMax, tick, tooltip, valueFormat, m.numberLocale]);
  const current = barChartCurrent(data.length, active);
  const shown = barChartShown({
    count: data.length,
    hovered,
    current,
    focusWithin,
    dismissed,
  });
  const tip = barChartTip(bars, shown);

  const onFocusOut = (event: FocusEvent<HTMLElement>): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setFocusWithin(false);
      setDismissed(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const n = data.length;
    if (n === 0) return;
    if (event.key === "Escape") {
      if (shown !== null) {
        setDismissed(true);
        event.preventDefault();
      }
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const to = listNavigationIndex(event.key, current, n, {
      orientation: "horizontal",
      rtl,
      wrap: false,
    });
    if (to === null) return;
    event.preventDefault();
    setDismissed(false);
    setHovered(null);
    setActive(to);
    cols.current[to]?.focus();
  };

  const color = chartColor(tone);
  return createElement(
    "sone-bar-chart",
    {
      "data-slot": "bar-chart",
      "data-zero": zero,
      ...rest,
      style: {
        ...(color ? { "--_color": color } : {}),
        ...style,
      } as CSSProperties,
    },
    <div
      className="bar-chart-plot"
      data-slot="bar-chart-plot"
      style={{ height }}
      onPointerLeave={() => setHovered(null)}
    >
      <div
        className="bar-chart-bars"
        role="group"
        aria-label={ariaLabel || undefined}
        onKeyDown={onKeyDown}
        onBlur={onFocusOut}
      >
        {bars.map((bar, i) => (
          <div
            key={bar.key}
            ref={(el) => {
              cols.current[i] = el;
            }}
            className="bar-chart-col"
            data-slot="bar-chart-bar"
            role="img"
            aria-label={bar.tip}
            tabIndex={i === current ? 0 : -1}
            data-empty={bar.empty ? "" : undefined}
            data-shown={shown === i ? "" : undefined}
            onPointerEnter={() => {
              setDismissed(false);
              setHovered(i);
            }}
            onFocus={(event) => {
              if (event.target !== event.currentTarget) return;
              setActive(i);
              setFocusWithin(true);
            }}
          >
            {!bar.empty ? (
              <span
                className="bar-chart-bar"
                style={{ height: `${bar.pct}%` }}
              />
            ) : zero === "baseline" ? (
              <span className="bar-chart-bar bar-chart-bar--zero" />
            ) : null}
          </div>
        ))}
      </div>
      {tip ? (
        <div
          className="bar-chart-tooltip"
          data-slot="bar-chart-tooltip"
          aria-hidden="true"
          data-align={tip.align}
          style={{ left: `${tip.at}%`, bottom: `${tip.pct}%` }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>,
    tick ? (
      <div
        className="bar-chart-axis"
        data-slot="bar-chart-axis"
        aria-hidden="true"
      >
        {bars.map((bar) => (
          <span key={bar.key} className="bar-chart-tick">
            {bar.tick ? (
              <span className="bar-chart-tick-text">{bar.tick}</span>
            ) : null}
          </span>
        ))}
      </div>
    ) : null,
    <table className="sr-only">
      {ariaLabel ? <caption>{ariaLabel}</caption> : null}
      <thead>
        <tr>
          <th scope="col">{categoryHeader ?? m.barChartCategory}</th>
          <th scope="col">{valueHeader ?? m.barChartValue}</th>
        </tr>
      </thead>
      <tbody>
        {bars.map((bar) => (
          <tr key={bar.key}>
            <th scope="row">{bar.label}</th>
            <td>{bar.value}</td>
          </tr>
        ))}
      </tbody>
    </table>,
  );
}
