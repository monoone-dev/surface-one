"use client";

import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { chartColor, formatChartNumber } from "@surface-one/core";
import {
  niceCeiling,
  sparklineGeometry,
  type SoneChartTone,
  type SoneSparklineType,
} from "@surface-one/core";

export interface SoneSparklineProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  readonly values?: readonly number[];
  readonly type?: SoneSparklineType;
  readonly min?: number;
  /** The top of the scale; default: a nice ceiling of the values. */
  readonly max?: number | null;
  readonly tone?: SoneChartTone;
  readonly decorative?: boolean;
  /** The accessible name when not decorative; default: the `sparklineSummary` message. */
  readonly summary?: string | null;
}

const NO_VALUES: readonly number[] = [];

/**
 * `<sone-sparkline>` — a word-sized line, area, bar or heat chart in one stretched
 * `<svg>`. Decorative (`aria-hidden`) by default; `decorative={false}` makes it
 * `role="img"` named by `summary` or the `sparklineSummary` message.
 */
export function SoneSparkline({
  values = NO_VALUES,
  type = "line",
  min = 0,
  max = null,
  tone = "accent",
  decorative = true,
  summary = null,
  style,
  ...rest
}: SoneSparklineProps): ReactElement {
  const messages = useSoneMessages();
  const top =
    max !== null && Number.isFinite(max) ? max : niceCeiling(values, 4);
  const g = sparklineGeometry(values, type, min, top);
  let label: string | undefined;
  if (!decorative) {
    if (summary) label = summary;
    else {
      const finite = values.filter((v) => Number.isFinite(v));
      const peak = finite.reduce((a, b) => Math.max(a, b), -Infinity);
      const total = finite.reduce((a, b) => a + b, 0);
      label = messages.sparklineSummary(
        finite.length,
        formatChartNumber(finite.length ? peak : 0, messages.numberLocale),
        formatChartNumber(total, messages.numberLocale),
      );
    }
  }
  let marks: ReactNode;
  if (type === "heat") {
    marks = g.cells.map((cell, i) => (
      <rect
        key={i}
        className="sparkline-cell"
        x={cell.x}
        y={0}
        width={cell.width}
        height={100}
        data-level={cell.level}
      />
    ));
  } else if (type === "bar") {
    marks = g.bars ? <path className="sparkline-bars" d={g.bars} /> : null;
  } else {
    marks = (
      <>
        {g.area ? <path className="sparkline-area" d={g.area} /> : null}
        {g.line ? (
          <path
            className="sparkline-line"
            d={g.line}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </>
    );
  }
  return createElement(
    "sone-sparkline",
    {
      "data-slot": "sparkline",
      "data-type": type,
      role: decorative ? undefined : "img",
      "aria-label": label,
      "aria-hidden": decorative ? "true" : undefined,
      ...rest,
      style: { "--_color": chartColor(tone), ...style } as CSSProperties,
    },
    <svg
      className="sparkline-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {marks}
    </svg>,
  );
}
