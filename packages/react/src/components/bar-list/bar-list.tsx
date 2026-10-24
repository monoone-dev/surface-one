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
import { scaleToPercent, type SoneChartTone } from "@surface-one/core";

export interface SoneBarListItem {
  /** Stable identity (the `key` of each row). */
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** The shown value; defaults to `valueFormat(value)`. */
  readonly valueLabel?: string;
  /** The bar colour; defaults to `accent`. */
  readonly tone?: SoneChartTone;
  /** A native tooltip on the label. */
  readonly title?: string;
}

export type SoneBarListScale = "max" | "total";
export type SoneBarListFormat = (value: number) => string;

export interface SoneBarListProps<
  Item extends SoneBarListItem = SoneBarListItem,
> extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  readonly items?: readonly Item[];
  readonly scale?: SoneBarListScale;
  readonly max?: number | null;
  /** Formats `value` when an item has no `valueLabel`; default: a localized number. */
  readonly valueFormat?: SoneBarListFormat | null;
  /** Renders a row's label in place of its text (Angular's `<ng-template soneBarListLabel>`). */
  readonly renderLabel?: (item: Item) => ReactNode;
}

/**
 * `<sone-bar-list>` — labelled horizontal bars with the value written next to each. A
 * real `<ul>` (named by `aria-label`); the bar is decoration. `renderLabel={(item) => …}`
 * replaces a row's label text, like Angular's `<ng-template soneBarListLabel>`.
 */
export function SoneBarList<Item extends SoneBarListItem = SoneBarListItem>({
  items = [],
  scale = "max",
  max = null,
  valueFormat = null,
  renderLabel,
  "aria-label": ariaLabel,
  ...rest
}: SoneBarListProps<Item>): ReactElement {
  const messages = useSoneMessages();
  const format: SoneBarListFormat =
    valueFormat ?? ((n) => formatChartNumber(n, messages.numberLocale));
  let full: number;
  if (max !== null && Number.isFinite(max)) full = max;
  else {
    const values = items
      .map((i) => i.value)
      .filter((v) => Number.isFinite(v) && v > 0);
    full =
      scale === "total"
        ? values.reduce((a, b) => a + b, 0)
        : values.reduce((a, b) => Math.max(a, b), 0);
  }
  return createElement(
    "sone-bar-list",
    { "data-slot": "bar-list", "data-scale": scale, ...rest },
    <ul className="bar-list" aria-label={ariaLabel || undefined}>
      {items.map((item) => {
        const pct = scaleToPercent(item.value, full);
        return (
          <li
            key={item.key}
            className="bar-list-row"
            data-slot="bar-list-item"
            style={
              { "--_color": chartColor(item.tone ?? "accent") } as CSSProperties
            }
          >
            <span
              className="bar-list-label"
              data-slot="bar-list-label"
              title={item.title}
            >
              {renderLabel ? renderLabel(item) : item.label}
            </span>
            <span
              className="bar-list-track"
              data-slot="bar-list-track"
              aria-hidden="true"
            >
              {pct > 0 ? (
                <span
                  className="bar-list-fill"
                  data-slot="bar-list-indicator"
                  style={{ width: `${pct}%` }}
                />
              ) : null}
            </span>
            <span className="bar-list-value" data-slot="bar-list-value">
              {item.valueLabel ?? format(item.value)}
            </span>
          </li>
        );
      })}
    </ul>,
  );
}
