import type { ReactElement } from "react";
import { Animated, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import { useForeground } from "../../theme/foreground";
import { usePulse } from "../../utils/pulse";

export type StatusDotTone =
  | "muted"
  | "live"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "current";
export type StatusDotSize = "default" | "sm";

export interface SoneStatusDotProps extends ViewProps {
  readonly tone?: StatusDotTone;
  readonly size?: StatusDotSize;
  /** Pulses while something is going on; still under reduced motion. */
  readonly pulse?: boolean;
  /** The accessible name; leave it out when text next to the dot already says the status. */
  readonly label?: string | null;
}

/** `<sone-status-dot>` — a small round status mark; decorative unless it has a `label` (then `role="img"`). */
export function SoneStatusDot({
  tone = "muted",
  size = "default",
  pulse = false,
  label = null,
  style,
  ...rest
}: SoneStatusDotProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const ink = useForeground().color;
  const opacity = usePulse(
    pulse && !theme.reduceMotion,
    t.statusDotPulseDuration,
  );
  const px = size === "sm" ? t.statusDotSizeSm : t.statusDotSize;
  const color = {
    muted: t.textMuted,
    live: t.live,
    success: t.success,
    warning: t.warning,
    destructive: t.danger,
    accent: t.accent,
    current: ink,
  }[tone];
  return (
    <Animated.View
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
      style={[
        {
          width: px,
          height: px,
          flexShrink: 0,
          borderRadius: t.radiusPill,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}
