import { useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";

import { clockTime } from "@surface-one/core/format";
import { useSoneTheme } from "../../theme/context";
import { fontFamily, weight } from "../../theme/style";

export type ElapsedTimerSize = "default" | "sm";

export interface SoneElapsedTimerProps extends Omit<TextProps, "aria-label"> {
  /** Elapsed whole seconds (where a `running` timer starts counting from). */
  readonly seconds?: number | null;
  /** Count up by itself, once a second, from `seconds`. */
  readonly running?: boolean;
  /** `role="timer"` (aria-live off): a screen reader reads it on demand, not on every tick. */
  readonly live?: boolean;
  readonly size?: ElapsedTimerSize;
  /** The timer's accessible name — set only while `live`. */
  readonly ariaLabel?: string | null;
}

/** `seconds`, plus the time since `running` turned on (measured from the clock, not the ticks). */
function useElapsed(seconds: number, running: boolean): number {
  const [elapsed, setElapsed] = useState(seconds);
  useEffect(() => {
    setElapsed(seconds);
    if (!running) return;
    const start = Date.now() - seconds * 1000;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [seconds, running]);
  return elapsed;
}

/**
 * `<sone-elapsed-timer>` — a running time (`12:04`, `1:02:07`) in tabular mono figures.
 * Pass `seconds` as it changes, or set `running` and it ticks on its own. `live` =
 * `role="timer"` (aria-live off, so a screen reader reads it on demand).
 */
export function SoneElapsedTimer({
  seconds = 0,
  running = false,
  live = false,
  size = "default",
  ariaLabel = null,
  style,
  ...rest
}: SoneElapsedTimerProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const elapsed = useElapsed(Math.max(0, Math.floor(seconds ?? 0)), running);
  const fontSize = size === "sm" ? t.fontSizeSm : t.fontSizeMd;
  return (
    <Text
      role={live ? "timer" : undefined}
      aria-live={live ? "off" : undefined}
      aria-label={live ? (ariaLabel ?? undefined) : undefined}
      {...rest}
      style={[
        {
          // The CSS min-widths: room for `0:00` without the row jumping.
          minWidth: size === "sm" ? 40 : 48,
          color: t.textPrimary,
          fontFamily: fontFamily(theme, "mono"),
          fontSize,
          fontWeight: weight(t.fontWeightMedium),
          fontVariant: ["tabular-nums"],
          lineHeight: Math.round(fontSize * t.leadingTight),
        },
        style,
      ]}
    >
      {clockTime(elapsed)}
    </Text>
  );
}
