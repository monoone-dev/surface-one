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
  donutChartModel,
  formatChartNumber,
  listNavigationIndex,
  type SoneDonutChartSegmentLike,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneChartLegend } from "../chart-legend";

/** A segment of a donut chart: `{ key, label, value, tone }`. */
export type SoneDonutChartSegment = SoneDonutChartSegmentLike;
export type SoneDonutChartFormat = (value: number) => string;

export interface SoneDonutChartProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** The parts, clockwise from 12 o'clock; zero and negative values draw nothing. */
  readonly segments?: readonly SoneDonutChartSegment[];
  /** The ring's diameter in CSS pixels (it shrinks to fit a narrower container). */
  readonly size?: number;
  /** The ring's width as a part of its radius: 0.3 by default, 1 draws a pie. */
  readonly thickness?: number;
  /** The gap between neighbouring segments, in degrees. */
  readonly padAngle?: number;
  /** The caption under the centre value (default: the `donutChartTotal` message). */
  readonly label?: string;
  /** The centre value at rest; default: the formatted total. */
  readonly centerValue?: string | null;
  /** Shows the legend under the ring. */
  readonly legend?: boolean;
  /** Names the chart and captions its data table (“Visitors by browser”). */
  readonly ariaLabel?: string;
  /** Formats values (default: a number in the `numberLocale` message's locale). */
  readonly valueFormat?: SoneDonutChartFormat | null;
  /** The data table's column headers (default: the `barChartCategory`, `barChartValue` and `donutChartShare` messages). */
  readonly categoryHeader?: string;
  readonly valueHeader?: string;
  readonly shareHeader?: string;
  readonly ref?: Ref<HTMLElement>;
}

const NONE: readonly never[] = [];

/**
 * `<sone-donut-chart>` — the parts of a whole as a ring (shadcn/ui Pie Chart, donut with
 * text): one segment per part, clockwise from 12 o'clock, the total (or the hovered or
 * focused segment) in the centre and a legend. One Tab stop with a roving focus over the
 * segments (arrow keys, Home/End, Escape returns the centre to the total); each segment is
 * an image named “Chrome: 275 (39%)”, and a visually hidden table carries the data.
 */
export function SoneDonutChart({
  segments = NONE,
  size = 200,
  thickness = 0.3,
  padAngle = 1,
  label,
  centerValue = null,
  legend = true,
  ariaLabel = "",
  valueFormat = null,
  categoryHeader,
  valueHeader,
  shareHeader,
  ...rest
}: SoneDonutChartProps): ReactElement {
  const m = useSoneMessages();
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const segs = useRef<(SVGPathElement | null)[]>([]);
  const locale = m.numberLocale;

  const model = useMemo(
    () =>
      donutChartModel({
        segments,
        thickness,
        padAngle,
        locale,
        valueFormat: valueFormat ?? ((n) => formatChartNumber(n, locale)),
      }),
    [segments, thickness, padAngle, locale, valueFormat],
  );
  const n = model.drawn.length;
  const current =
    active === null ? Math.min(0, n - 1) : barChartCurrent(n, active);
  const shown = barChartShown({
    count: n,
    hovered,
    current,
    focusWithin,
    dismissed,
  });
  const slice = shown === null ? null : model.drawn[shown];
  const center = slice
    ? { value: slice.valueText, label: slice.label }
    : {
        value: centerValue ?? model.totalText,
        label: label ?? m.donutChartTotal,
      };

  const onFocusOut = (event: FocusEvent<SVGSVGElement>): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setFocusWithin(false);
      setDismissed(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>): void => {
    if (n === 0) return;
    if (event.key === "Escape") {
      if (shown !== null) {
        setDismissed(true);
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
    const to = listNavigationIndex(key, current, n, {
      orientation: "horizontal",
      rtl: false,
      wrap: true,
    });
    if (to === null) return;
    event.preventDefault();
    setDismissed(false);
    setHovered(null);
    setActive(to);
    segs.current[to]?.focus();
  };

  return createElement(
    "sone-donut-chart",
    { "data-slot": "donut-chart", ...rest },
    <div
      className="donut-chart-figure"
      data-slot="donut-chart-figure"
      style={{ width: size }}
      onPointerLeave={() => setHovered(null)}
    >
      <svg
        className="donut-chart-svg"
        viewBox="0 0 100 100"
        role="group"
        aria-label={ariaLabel || undefined}
        onKeyDown={onKeyDown}
        onBlur={onFocusOut}
      >
        {model.drawn.map((d, i) => (
          <path
            key={d.key}
            ref={(el) => {
              segs.current[i] = el;
            }}
            className="donut-chart-segment"
            data-slot="donut-chart-segment"
            role="img"
            aria-label={d.summary}
            tabIndex={i === current ? 0 : -1}
            d={d.path}
            data-shown={shown === i ? "" : undefined}
            data-dimmed={shown !== null && shown !== i ? "" : undefined}
            style={{ "--_color": chartColor(d.tone) } as CSSProperties}
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
      </svg>
      {thickness < 0.75 ? (
        <div
          className="donut-chart-center"
          data-slot="donut-chart-center"
          aria-hidden="true"
        >
          <span className="donut-chart-value">{center.value}</span>
          <span className="donut-chart-label">{center.label}</span>
        </div>
      ) : null}
    </div>,
    legend && segments.length > 0 ? (
      <SoneChartLegend
        className="donut-chart-legend"
        shape="square"
        items={model.slices.map((x) => ({
          key: x.key,
          label: x.label,
          tone: x.tone,
          value: x.valueText,
        }))}
      />
    ) : null,
    <table className="sr-only">
      {ariaLabel ? <caption>{ariaLabel}</caption> : null}
      <thead>
        <tr>
          <th scope="col">{categoryHeader ?? m.barChartCategory}</th>
          <th scope="col">{valueHeader ?? m.barChartValue}</th>
          <th scope="col">{shareHeader ?? m.donutChartShare}</th>
        </tr>
      </thead>
      <tbody>
        {model.slices.map((x) => (
          <tr key={x.key}>
            <th scope="row">{x.label}</th>
            <td>{x.valueText}</td>
            <td>{x.percent}</td>
          </tr>
        ))}
      </tbody>
    </table>,
  );
}
