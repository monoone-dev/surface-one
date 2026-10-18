import { useEffect, useRef } from "react";
import { Animated, Easing, I18nManager, Platform } from "react-native";

import { chartColor } from "@surface-one/core/chart";

import type { SoneTokens } from "../theme/generated/tokens";

/** Transform and opacity animations run on the UI thread (react-native-web has no native driver). */
export const NATIVE_DRIVER = Platform.OS !== "web";

/** Where a bar grows from: the start edge (right in a right-to-left layout). */
export const startOrigin = (): string => (I18nManager.isRTL ? "right" : "left");

/**
 * A chart tone → a colour of the theme: a token suffix (`chart-3`, `success`) or a
 * custom property name (`--brand`) reads the token (`chart3`, `brand`), anything else
 * (`#0a0`) passes through — `chartColor` of the web twins, resolved against the tokens.
 */
export function toneColor(
  tokens: SoneTokens,
  tone: string | null | undefined,
  fallback?: string,
): string | undefined {
  const css = chartColor(tone);
  if (!css) return fallback;
  const ref = /^var\(\s*--([a-z0-9-]+)\s*\)$/i.exec(css);
  if (!ref) return css;
  const key = ref[1].replace(/-([a-z0-9])/gi, (_, c: string) =>
    c.toUpperCase(),
  );
  const value = (tokens as unknown as Record<string, unknown>)[key];
  return typeof value === "string" && value ? value : fallback;
}

/**
 * 0 → 1 once on mount (a chart's enter animation), or 1 straight away under reduced
 * motion. `ease` is a cubic-bezier token.
 */
export function useEnterProgress(
  duration: number,
  ease: readonly [number, number, number, number],
  reduceMotion: boolean,
): Animated.Value {
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const run = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.bezier(...ease),
      useNativeDriver: NATIVE_DRIVER,
    });
    run.start();
    return () => run.stop();
    // Mount only: a chart enters once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return progress;
}
