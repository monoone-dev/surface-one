import { Animated, type ViewProps } from "react-native";

import { useSoneTheme } from "../../theme/context";
import { usePulse } from "../../utils/pulse";

// `--skeleton-animation: sone-pulse 2s …` (a shorthand, so not a generated token).
const PULSE_MS = 2000;

export type SoneSkeletonProps = ViewProps;

/** `[soneSkeleton]` — a pulsing placeholder block (still under reduced motion); size it with `style`. */
export function SoneSkeleton({ style, ...rest }: SoneSkeletonProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const opacity = usePulse(!theme.reduceMotion, PULSE_MS);
  return (
    <Animated.View
      aria-hidden
      {...rest}
      style={[
        { borderRadius: t.radiusMd, backgroundColor: t.surfaceHover, opacity },
        style,
      ]}
    />
  );
}
