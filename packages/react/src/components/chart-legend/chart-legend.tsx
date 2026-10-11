"use client";

import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { chartColor, chartTone, formatChartNumber } from "../../utils/chart";
import { useControllable } from "../../utils/controllable";

export type SoneSwatchShape = "dot" | "square" | "line";
export type SoneChartLegendOrientation = "row" | "column";

export interface SoneChartLegendItem {
  key: string;
  label: string;
  tone?: string;
  value?: string | number | null;
}

export interface SoneSwatchProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement>;
  /** A token suffix (`chart-3`), a custom property (`--brand`) or a colour. */
  readonly tone?: string | null;
  readonly shape?: SoneSwatchShape;
}

/**
 * `<span data-slot="chart-swatch">` — the colour key of a series. Decorative;
 * `tone` is a token suffix (`chart-3`), a custom property (`--brand`) or a colour.
 */
export function SoneSwatch({
  tone = "",
  shape = "dot",
  style,
  ...rest
}: SoneSwatchProps) {
  const color = chartColor(tone);
  return (
    <span
      data-slot="chart-swatch"
      aria-hidden="true"
      data-shape={shape}
      {...rest}
      style={
        color || style
          ? ({
              ...(color ? { "--swatch-color": color } : null),
              ...style,
            } as CSSProperties)
          : undefined
      }
    />
  );
}

const NO_KEYS: readonly string[] = [];

export interface SoneChartLegendProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onToggle" | "hidden"
> {
  readonly ref?: Ref<HTMLElement>;
  readonly items?: readonly SoneChartLegendItem[];
  readonly orientation?: SoneChartLegendOrientation;
  /** Makes each item an `aria-pressed` toggle that shows / hides its series. */
  readonly toggleable?: boolean;
  /** The keys of the hidden series (controlled). */
  readonly hidden?: readonly string[];
  /** The keys hidden at first (uncontrolled). */
  readonly defaultHidden?: readonly string[];
  readonly onHiddenChange?: (hidden: readonly string[]) => void;
  /** Called with the key of the toggled series. */
  readonly onToggle?: (key: string) => void;
  readonly shape?: SoneSwatchShape;
  /** The locale numeric values are formatted in; default: the `numberLocale` message. */
  readonly locale?: string | null;
}

/**
 * `<sone-chart-legend>` — swatch, label and value per series (the list is named by
 * `aria-label`). `toggleable` makes each item an `aria-pressed` toggle that updates
 * `hidden` (`onHiddenChange`) and calls `onToggle` with the key.
 */
export function SoneChartLegend({
  items = [],
  orientation = "row",
  toggleable = false,
  hidden: hiddenProp,
  defaultHidden = NO_KEYS,
  onHiddenChange,
  onToggle,
  shape = "dot",
  locale = null,
  "aria-label": ariaLabel,
  ...rest
}: SoneChartLegendProps) {
  const messages = useSoneMessages();
  const [hidden, setHidden] = useControllable(
    hiddenProp,
    defaultHidden,
    onHiddenChange,
  );
  const off = new Set(hidden);
  const numberLocale = locale || messages.numberLocale;
  const rows = items.map((item, i) => ({
    key: item.key,
    label: item.label,
    tone: item.tone || chartTone(i),
    value:
      item.value === null || item.value === undefined || item.value === ""
        ? null
        : typeof item.value === "number"
          ? formatChartNumber(item.value, numberLocale)
          : item.value,
    hidden: off.has(item.key),
  }));
  const toggle = (key: string) => {
    setHidden(
      hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key],
    );
    onToggle?.(key);
  };
  return createElement(
    "sone-chart-legend",
    {
      "data-slot": "chart-legend",
      "data-orientation": orientation,
      "data-toggleable": toggleable ? "" : undefined,
      ...rest,
    },
    <ul className="legend-list" role="list" aria-label={ariaLabel}>
      {rows.map((row) => {
        const content = (
          <>
            <SoneSwatch tone={row.tone} shape={shape} />
            <span className="legend-label">{row.label}</span>
            {row.value !== null ? (
              <span className="legend-value">{row.value}</span>
            ) : null}
          </>
        );
        return (
          <li
            key={row.key}
            className="legend-item"
            data-slot="chart-legend-item"
            data-hidden={row.hidden ? "" : undefined}
          >
            {toggleable ? (
              <button
                type="button"
                className="legend-entry legend-toggle"
                aria-pressed={row.hidden ? "false" : "true"}
                onClick={() => toggle(row.key)}
              >
                {content}
              </button>
            ) : (
              <span className="legend-entry">{content}</span>
            )}
          </li>
        );
      })}
    </ul>,
  );
}
