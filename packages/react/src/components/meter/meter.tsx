"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";

export interface SoneMeterProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  readonly label?: string;
  readonly value?: number;
  /** The number of pips (at most 10). */
  readonly max?: number;
  readonly detail?: string | null;
}

/**
 * `<sone-meter>` — a relative rating in pips (at most 10). Not a progress bar: it
 * announces a sentence ("Accuracy: 3 of 4") instead of a percentage.
 */
export function SoneMeter({
  label = "",
  value = 0,
  max = 4,
  detail = null,
  ...rest
}: SoneMeterProps): ReactElement {
  const messages = useSoneMessages();
  const n = Number.isFinite(max) ? Math.round(max) : 0;
  const pips = Math.min(Math.max(n, 0), 10);
  const filled = Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 0), pips)
    : 0;
  const count = messages.meterCount(filled, pips);
  const trimmed = label.trim();
  const base = trimmed ? `${trimmed}: ${count}` : count;
  const ariaText = detail ? `${base}. ${detail}` : base;
  return createElement(
    "sone-meter",
    { role: "img", "data-slot": "meter", "aria-label": ariaText, ...rest },
    label ? (
      <span className="meter-label" data-slot="meter-label">
        {label}
      </span>
    ) : null,
    <span className="meter-pips" data-slot="meter-track" aria-hidden="true">
      {Array.from({ length: pips }, (_, i) => (
        <span
          key={i}
          className={cx("meter-pip", i < filled && "is-on")}
          data-slot="meter-indicator"
          data-state={i < filled ? "on" : "off"}
        />
      ))}
    </span>,
    detail ? (
      <span className="meter-detail" data-slot="meter-value">
        {detail}
      </span>
    ) : null,
  );
}
