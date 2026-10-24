import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

export type StatusDotTone =
  | "muted"
  | "live"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "current";
export type StatusDotSize = "default" | "sm";

export interface SoneStatusDotProps extends HTMLAttributes<HTMLElement> {
  readonly tone?: StatusDotTone;
  readonly size?: StatusDotSize;
  /** Pulses while something is going on; still under `prefers-reduced-motion: reduce`. */
  readonly pulse?: boolean;
  /** The accessible name; leave it out when text next to the dot already says the status. */
  readonly label?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-status-dot>` — a small round status mark; decorative unless it has a `label` (then `role="img"`). */
export function SoneStatusDot({
  tone = "muted",
  size = "default",
  pulse = false,
  label = null,
  ...rest
}: SoneStatusDotProps): ReactElement {
  return createElement("sone-status-dot", {
    "data-slot": "status-dot",
    "data-tone": tone,
    "data-size": size,
    "data-pulse": pulse ? "" : undefined,
    role: label ? "img" : undefined,
    "aria-label": label || undefined,
    "aria-hidden": label ? undefined : "true",
    ...rest,
  });
}
