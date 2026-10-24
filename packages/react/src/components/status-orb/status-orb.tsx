import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { SoneSpinner } from "../spinner/spinner";

export type StatusOrbState =
  "ready" | "live" | "processing" | "paused" | "queued" | "error";
export type StatusOrbSize = "default" | "sm";

export interface SoneStatusOrbProps extends HTMLAttributes<HTMLElement> {
  readonly state?: StatusOrbState;
  readonly size?: StatusOrbSize;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-status-orb>` — a decorative dot for a recording's state (ready, live, paused,
 * queued, error); `processing` draws a small spinner instead. Always `aria-hidden`: say
 * the state in text next to it.
 */
export function SoneStatusOrb({
  state = "ready",
  size = "default",
  ...rest
}: SoneStatusOrbProps): ReactElement {
  return createElement(
    "sone-status-orb",
    {
      "data-slot": "status-orb",
      "aria-hidden": "true",
      "data-state": state,
      "data-size": size,
      ...rest,
    },
    state === "processing" ? (
      <SoneSpinner size={size === "sm" ? 12 : 14} label={null} />
    ) : null,
  );
}
