import { createElement, type HTMLAttributes, type Ref } from "react";

import { clockTime, isoDuration } from "@surface-one/core";

export type ElapsedTimerSize = "default" | "sm";

export interface SoneElapsedTimerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "aria-label"
> {
  readonly seconds?: number | null;
  /** `role="timer"` (aria-live off): a screen reader reads it on demand, not on every tick. */
  readonly live?: boolean;
  readonly size?: ElapsedTimerSize;
  /** The timer's accessible name — set only while `live`. */
  readonly ariaLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-elapsed-timer>` — a running time (`12:04`) in tabular mono figures, as a
 * `<time>` with an ISO 8601 `datetime`. `live` = `role="timer"` (aria-live off, so a
 * screen reader reads it on demand instead of on every tick).
 */
export function SoneElapsedTimer({
  seconds = 0,
  live = false,
  size = "default",
  ariaLabel = null,
  ...rest
}: SoneElapsedTimerProps) {
  return createElement(
    "sone-elapsed-timer",
    {
      "data-slot": "elapsed-timer",
      "data-size": size,
      role: live ? "timer" : undefined,
      "aria-label": live ? (ariaLabel ?? undefined) : undefined,
      ...rest,
    },
    <time dateTime={isoDuration(seconds)}>{clockTime(seconds)}</time>,
  );
}
