"use client";

import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import {
  chartColor,
  chartTone,
  formatChartNumber,
  nonNegative,
} from "@surface-one/core";
import { cx } from "../../utils/part";
import { SoneChartLegend } from "../chart-legend";

export interface SoneStackedBarSegment {
  key: string;
  label: string;
  value: number;
  tone?: string;
}
export type SoneStackedBarSize = "sm" | "md" | "lg";
export type SoneStackedBarValueFn = (value: number) => string;

export interface SoneStackedBarProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  readonly segments?: readonly SoneStackedBarSegment[];
  /** The whole; above the sum, the rest stays the empty track. */
  readonly max?: number | null;
  readonly showLegend?: boolean;
  readonly size?: SoneStackedBarSize;
  readonly locale?: string | null;
  /** Formats a value in the summary and legend; default: a localized number. */
  readonly valueLabel?: SoneStackedBarValueFn | null;
}

/**
 * `<sone-stacked-bar>` — one bar split into the parts of a whole; `max` above the
 * sum leaves the rest as the empty track. The bar is `role="img"` named by a
 * generated summary (prefixed with `aria-label`); `showLegend` adds a `SoneChartLegend`.
 */
export function SoneStackedBar({
  segments = [],
  max = null,
  showLegend = false,
  size = "md",
  locale: localeProp = null,
  valueLabel = null,
  "aria-label": ariaLabel,
  ...rest
}: SoneStackedBarProps): ReactElement {
  const m = useSoneMessages();
  const locale = localeProp || m.numberLocale;
  const format: SoneStackedBarValueFn =
    valueLabel ?? ((v: number) => formatChartNumber(v, locale));
  const parts = segments
    .map((s, i) => ({
      ...s,
      value: nonNegative(s.value),
      tone: s.tone || chartTone(i),
    }))
    .filter((s) => s.value > 0);
  const total = parts.reduce((n, s) => n + s.value, 0);
  const hasMax = max !== null && Number.isFinite(max) && max > 0;
  const scale = hasMax && max > total ? max : total;

  let run = 0;
  const geometry =
    scale <= 0
      ? []
      : parts.map((s, i) => {
          run += s.value;
          return {
            key: s.key,
            end: Math.min(100, (run / scale) * 100),
            color: chartColor(s.tone),
            z: parts.length - i,
            gap: i < parts.length - 1,
          };
        });

  const prefix = (ariaLabel ?? "").trim()
    ? `${(ariaLabel ?? "").trim()}: `
    : "";
  let summary: string;
  if (parts.length === 0 || scale <= 0) summary = prefix + m.stackedBarEmpty;
  else {
    const pct = (v: number) =>
      formatChartNumber(v / scale, locale, {
        style: "percent",
        maximumFractionDigits: 0,
      });
    const list = parts
      .map((s) => m.stackedBarPart(s.label, format(s.value), pct(s.value)))
      .join(", ");
    const sum = format(total);
    const whole = hasMax
      ? m.stackedBarOf(sum, format(max))
      : m.stackedBarTotal(sum);
    summary = `${prefix}${list}; ${whole}`;
  }

  return createElement(
    "sone-stacked-bar",
    { "data-slot": "stacked-bar", "data-size": size, ...rest },
    <div
      className="track"
      data-slot="stacked-bar-track"
      role="img"
      aria-label={summary}
    >
      {geometry.map((g) => (
        <span
          key={g.key}
          className={cx("segment", g.gap && "has-gap")}
          data-slot="stacked-bar-segment"
          data-key={g.key}
          style={
            {
              "--_end": g.end,
              "--_color": g.color ?? undefined,
              zIndex: g.z,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    showLegend ? (
      <SoneChartLegend
        className="legend"
        items={segments.map((s, i) => ({
          key: s.key,
          label: s.label,
          tone: s.tone || chartTone(i),
          value: format(nonNegative(s.value)),
        }))}
        shape="square"
        locale={locale}
      />
    ) : null,
  );
}
