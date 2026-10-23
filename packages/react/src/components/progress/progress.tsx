import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

export type SoneProgressSize = "sm" | "md";
export type SoneProgressTone = "default" | "warning" | "destructive";
export type SoneProgressLabelFn = (value: number, max: number) => string;

const defaultValueLabel: SoneProgressLabelFn = (value, max) =>
  `${Math.round((value / max) * 100)}%`;

export interface SoneProgressProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  /** `null` (the default) is indeterminate. */
  readonly value?: number | null;
  readonly max?: number;
  readonly size?: SoneProgressSize;
  readonly tone?: SoneProgressTone;
  /** The spoken value (`aria-valuetext`); default: a rounded percentage. */
  readonly valueLabel?: SoneProgressLabelFn;
}

/** `<sone-progress>` — a `progressbar`; `value` `null` (the default) is indeterminate. */
export function SoneProgress({
  value = null,
  max = 100,
  size = "sm",
  tone = "default",
  valueLabel = defaultValueLabel,
  ...rest
}: SoneProgressProps): ReactElement {
  const indeterminate = value === null || value === undefined;
  const valueNow =
    value === null || !Number.isFinite(value)
      ? 0
      : Math.min(Math.max(value, 0), Math.max(max, 0));
  const fillPct =
    !Number.isFinite(max) || max <= 0 ? 0 : (valueNow / max) * 100;
  const state = indeterminate
    ? "indeterminate"
    : fillPct >= 100
      ? "complete"
      : "loading";
  const valueText =
    indeterminate || !Number.isFinite(max) || max <= 0
      ? undefined
      : valueLabel(valueNow, max);
  return createElement(
    "sone-progress",
    {
      role: "progressbar",
      "data-slot": "progress",
      "data-state": state,
      "data-size": size,
      "data-tone": tone,
      "data-value": indeterminate ? undefined : valueNow,
      "data-max": max,
      "aria-valuemin": 0,
      "aria-valuemax": max,
      // Indeterminate MUST NOT carry aria-valuenow — its absence is the signal.
      "aria-valuenow": indeterminate ? undefined : valueNow,
      "aria-valuetext": valueText,
      ...rest,
    },
    indeterminate ? (
      <div className="fill fill--indeterminate" />
    ) : (
      <div
        className="fill"
        style={{ "--_progress-pct": fillPct } as CSSProperties}
      />
    ),
  );
}
