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

import { useSoneMessages } from "../../context/messages";
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
export interface SoneSeriesChartProps<T extends object = object> extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** The rows, left to right: each holds the x value (`xKey`) and one value per series. */
  readonly data?: readonly T[];
  /** The series: `{ key, label, tone }`, `key` naming the row property of its values. */
  readonly series?: readonly SoneLineChartSeries[];
  /** The row property of the x value. */
  readonly xKey?: string;
  /** `category` — evenly spaced; `time` — spaced by date (`Date`, epoch ms or ISO string). */
  readonly xScale?: SoneLineChartXScale;
  /** The label of an x value (axis, tooltip, table); default: the text, or a short date. */
  readonly xFormat?: SoneLineChartXFormat | null;
  /** At most this many x-axis labels (stepped back from the last one); 0 hides the axis. */
  readonly xTicks?: number;
  /** About this many value-axis steps. */
  readonly yTicks?: number;
  /** The bottom of the value axis; default: 0, or the lowest value when negative. */
  readonly yMin?: number | null;
  /** The top of the value axis; default: a round step above the highest value. */
  readonly yMax?: number | null;
  /** The plot height in CSS pixels (the x labels sit below it). */
  readonly height?: number;
  /** `linear` — straight segments; `smooth` — a monotone curve. */
  readonly curve?: SoneLineChartCurve;
  /** Stacks the series on one another (with `area`, each fills down to the one below). */
  readonly stacked?: boolean;
  /** Draws a dot on every value (the hovered or focused x value always shows its dots). */
  readonly dots?: boolean;
  /** Shows the legend under the plot. */
  readonly legend?: boolean;
  /** Names the chart and captions its data table (“Visitors, January to June”). */
  readonly ariaLabel?: string;
  /** Formats values (default: a number in the `numberLocale` message's locale). */
  readonly valueFormat?: SoneLineChartFormat | null;
  /** The data table's category column header (default: the `barChartCategory` message). */
  readonly categoryHeader?: string;
  readonly ref?: Ref<HTMLElement>;
}

export interface SoneLineChartProps<
  T extends object = object,
> extends SoneSeriesChartProps<T> {
  /** Fills under each line. */
  readonly area?: boolean;
}

const NONE: readonly never[] = [];

/**
 * `<sone-line-chart>` — one or more series over categories or time (shadcn/ui Line Chart):
 * a value axis with round ticks and grid lines, straight or smoothed lines that break at a
 * missing value, dots, a legend and a tooltip. `area` fills under the lines and `stacked`
 * stacks them (what `SoneAreaChart` draws). One Tab stop with a roving focus over the x
 * values (Left/Right/Home/End, Escape hides the tooltip); a visually hidden table carries
 * the data.
 */
export function SoneLineChart<T extends object = object>({
  data = NONE,
  series = NONE,
  xKey = "x",
  xScale = "category",
  xFormat = null,
  xTicks = 6,
  yTicks = 4,
  yMin = null,
  yMax = null,
  height = 200,
  curve = "linear",
  area = false,
  stacked = false,
  dots = true,
  legend = true,
  ariaLabel = "",
  valueFormat = null,
  categoryHeader,
  ...rest
}: SoneLineChartProps<T>): ReactElement {
  const messages = useSoneMessages();
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const cols = useRef<(HTMLElement | null)[]>([]);
  const locale = messages.numberLocale;

  const model = useMemo(
    () =>
      lineChartModel({
        data,
        series,
        xKey,
        xScale,
        xFormat,
        xTicks,
        yTicks,
        yMin,
        yMax,
        curve,
        area,
        stacked,
        locale,
        valueFormat: valueFormat ?? ((n) => formatChartNumber(n, locale)),
      }),
    [
      data,
      series,
      xKey,
      xScale,
      xFormat,
      xTicks,
      yTicks,
      yMin,
      yMax,
      curve,
      area,
      stacked,
      locale,
      valueFormat,
    ],
  );
  const n = model.columns.length;
  const current = barChartCurrent(n, active);
  const shown = barChartShown({
    count: n,
    hovered,
    current,
    focusWithin,
    dismissed,
  });
  const col = shown === null ? null : model.columns[shown];
  const tip = col ? lineChartTip(col.x) : null;
  const paths = model.paths.map((p) => ({ ...p, color: chartColor(p.tone) }));
  const color = (c: string | null): CSSProperties =>
    (c ? { "--_color": c } : {}) as CSSProperties;

  const onFocusOut = (event: FocusEvent<HTMLElement>): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setFocusWithin(false);
      setDismissed(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (n === 0) return;
    if (event.key === "Escape") {
      if (shown !== null) {
        setDismissed(true);
        event.preventDefault();
      }
      return;
    }
    // The plot runs left to right in every writing direction (a time axis does not flip).
    const to = listNavigationIndex(event.key, current, n, {
      orientation: "horizontal",
      rtl: false,
      wrap: false,
    });
    if (to === null) return;
    event.preventDefault();
    setDismissed(false);
    setHovered(null);
    setActive(to);
    cols.current[to]?.focus();
  };

  return createElement(
    "sone-line-chart",
    { "data-slot": "line-chart", "data-area": area ? "" : undefined, ...rest },
    <div className="line-chart-frame" data-slot="line-chart-frame">
      <div
        className="line-chart-y-axis"
        data-slot="line-chart-y-axis"
        aria-hidden="true"
      >
        <span className="line-chart-y-sizer">{model.widestY}</span>
        {model.yTicks.map((t) => (
          <span
            key={t.pct}
            className="line-chart-y-tick"
            style={{ bottom: `${t.pct}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>
      <div
        className="line-chart-plot"
        data-slot="line-chart-plot"
        style={{ height }}
        onPointerLeave={() => setHovered(null)}
      >
        <div className="line-chart-grid" aria-hidden="true">
          {model.yTicks.map((t) => (
            <span
              key={t.pct}
              className="line-chart-grid-line"
              style={{ bottom: `${t.pct}%` }}
            />
          ))}
        </div>
        <svg
          className="line-chart-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {paths
            .filter((p) => p.area)
            .map((p) => (
              <path
                key={`area-${p.key}`}
                className="line-chart-area"
                d={p.area}
                style={color(p.color)}
              />
            ))}
          {paths.map((p) => (
            <path
              key={`line-${p.key}`}
              className="line-chart-line"
              d={p.line}
              style={color(p.color)}
            />
          ))}
        </svg>
        {col ? (
          <span
            className="line-chart-cursor"
            aria-hidden="true"
            style={{ left: `${col.x}%` }}
          />
        ) : null}
        <div className="line-chart-dots" aria-hidden="true">
          {paths.flatMap((p) =>
            p.points.flatMap((pt, i) =>
              pt.value !== null && (dots || shown === i)
                ? [
                    <span
                      key={`${p.key}-${i}`}
                      className="line-chart-dot"
                      data-shown={shown === i ? "" : undefined}
                      style={{
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        ...color(p.color),
                      }}
                    />,
                  ]
                : [],
            ),
          )}
        </div>
        <div
          className="line-chart-columns"
          role="group"
          aria-label={ariaLabel || undefined}
          onKeyDown={onKeyDown}
          onBlur={onFocusOut}
        >
          {model.columns.map((c, i) => (
            <div
              key={c.key}
              ref={(el) => {
                cols.current[i] = el;
              }}
              className="line-chart-col"
              data-slot="line-chart-point"
              role="img"
              aria-label={c.summary}
              tabIndex={i === current ? 0 : -1}
              data-shown={shown === i ? "" : undefined}
              style={{ left: `${c.left}%`, width: `${c.width}%` }}
              onPointerEnter={() => {
                setDismissed(false);
                setHovered(i);
              }}
              onFocus={(event) => {
                if (event.target !== event.currentTarget) return;
                setActive(i);
                setFocusWithin(true);
              }}
            />
          ))}
        </div>
        {col && tip ? (
          <div
            className="line-chart-tooltip"
            data-slot="line-chart-tooltip"
            aria-hidden="true"
            data-align={tip.align}
            style={{ left: `${tip.at}%` }}
          >
            <div className="line-chart-tooltip-title">{col.label}</div>
            {col.values.map((v) => (
              <div key={v.key} className="line-chart-tooltip-row">
                <SoneSwatch tone={v.tone} shape="square" />
                <span className="line-chart-tooltip-label">{v.label}</span>
                <span className="line-chart-tooltip-value">{v.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {xTicks > 0 ? (
        <div
          className="line-chart-x-axis"
          data-slot="line-chart-x-axis"
          aria-hidden="true"
        >
          {model.xTicks.map((t) => (
            <span
              key={t.pct}
              className="line-chart-x-tick"
              data-align={t.align}
              style={{ left: `${t.pct}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>,
    legend && series.length > 0 ? (
      <SoneChartLegend
        className="line-chart-legend"
        shape="square"
        items={model.paths.map((p) => ({
          key: p.key,
          label: p.label,
          tone: p.tone,
        }))}
      />
    ) : null,
    <table className="sr-only">
      {ariaLabel ? <caption>{ariaLabel}</caption> : null}
      <thead>
        <tr>
          <th scope="col">{categoryHeader ?? messages.barChartCategory}</th>
          {model.paths.map((p) => (
            <th key={p.key} scope="col">
              {p.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {model.columns.map((c) => (
          <tr key={c.key}>
            <th scope="row">{c.label}</th>
            {c.values.map((v) => (
              <td key={v.key}>{v.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>,
  );
}
