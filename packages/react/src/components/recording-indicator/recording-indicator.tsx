"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneElapsedTimer } from "../elapsed-timer/elapsed-timer";
import { SoneStatusOrb } from "../status-orb/status-orb";

export type RecordingIndicatorState = "live" | "paused";
export type RecordingIndicatorSize = "default" | "sm";

export interface SoneRecordingIndicatorProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Elapsed whole seconds. */
  readonly seconds?: number | null;
  /** Visible text after the timer ("Recording"); `null` = none. */
  readonly label?: string | null;
  readonly state?: RecordingIndicatorState;
  readonly size?: RecordingIndicatorSize;
  /** The timer's accessible name (default: the "Recording time" message). */
  readonly timerLabel?: string;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-recording-indicator>` — "a recording is running": the live (or paused) status
 * orb, the elapsed timer and an optional label, in one row.
 */
export function SoneRecordingIndicator({
  seconds = 0,
  label = null,
  state = "live",
  size = "default",
  timerLabel,
  ...rest
}: SoneRecordingIndicatorProps): ReactElement {
  const m = useSoneMessages();
  return createElement(
    "sone-recording-indicator",
    {
      "data-slot": "recording-indicator",
      "data-state": state,
      "data-size": size,
      ...rest,
    },
    <SoneStatusOrb state={state} size={size} />,
    <SoneElapsedTimer
      live
      seconds={seconds}
      size={size}
      ariaLabel={timerLabel ?? m.recordingTime}
    />,
    label ? (
      <span
        className="recording-indicator-label"
        data-slot="recording-indicator-label"
      >
        {label}
      </span>
    ) : null,
  );
}
