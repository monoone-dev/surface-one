import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Animated,
  Easing,
  I18nManager,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { NATIVE_DRIVER } from "../../utils/chart";

import {
  defaultProgressLabel,
  type SoneProgressLabelFn,
  type SoneProgressSize,
  type SoneProgressTone,
} from "@surface-one/core/progress";

export type { SoneProgressLabelFn, SoneProgressSize, SoneProgressTone };

export interface SoneProgressProps extends Omit<ViewProps, "style"> {
  /** `null` (the default) is indeterminate. */
  readonly value?: number | null;
  readonly max?: number;
  readonly size?: SoneProgressSize;
  readonly tone?: SoneProgressTone;
  /** The spoken value (`aria-valuetext`); default: a rounded percentage. */
  readonly valueLabel?: SoneProgressLabelFn;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-progress>` — a `progressbar`; `value` `null` (the default) is indeterminate: a
 * 35 % fill sweeps across the track (a still, half-strength full fill under reduced
 * motion). A determinate fill eases to each new value.
 */
export function SoneProgress({
  value = null,
  max = 100,
  size = "sm",
  tone = "default",
  valueLabel = defaultProgressLabel,
  style,
  onLayout,
  ...rest
}: SoneProgressProps): ReactElement {
  const { reduceMotion, tokens: t } = useSoneTheme();
  const indeterminate = value === null || value === undefined;
  const valueNow =
    value === null || !Number.isFinite(value)
      ? 0
      : Math.min(Math.max(value, 0), Math.max(max, 0));
  const pct = !Number.isFinite(max) || max <= 0 ? 0 : (valueNow / max) * 100;
  const valueText =
    indeterminate || !Number.isFinite(max) || max <= 0
      ? undefined
      : valueLabel(valueNow, max);

  const s = useSoneStyles(
    ({ tokens }) => ({
      track: {
        position: "relative",
        width: "100%",
        height: size === "md" ? tokens.progressHMd : tokens.progressH,
        borderRadius: tokens.radiusPill,
        backgroundColor: tokens.trackBg,
        boxShadow: `inset 0px 0px 0px ${tokens.borderWidthThin}px ${tokens.trackBorder}`,
        overflow: "hidden",
      } satisfies ViewStyle,
      fill: {
        position: "absolute",
        top: 0,
        bottom: 0,
        start: 0,
        borderRadius: tokens.progressFillRadius,
        backgroundColor:
          tone === "warning"
            ? tokens.warning
            : tone === "destructive"
              ? tokens.danger
              : tokens.accentIndicator,
      } satisfies ViewStyle,
    }),
    [size, tone],
  );

  // Determinate: the width eases to the new share (layout, so off the native driver).
  const shown = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    if (reduceMotion) {
      shown.setValue(pct);
      return;
    }
    const run = Animated.timing(shown, {
      toValue: pct,
      duration: t.transitionDur,
      easing: Easing.bezier(...t.ease),
      useNativeDriver: false,
    });
    run.start();
    return () => run.stop();
  }, [pct, reduceMotion, shown, t.transitionDur, t.ease]);

  // Indeterminate: a 35 % fill swept from just before the start to past the end.
  const [trackWidth, setTrackWidth] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  const sweeping = indeterminate && !reduceMotion && trackWidth > 0;
  useEffect(() => {
    if (!sweeping) return;
    sweep.setValue(0);
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: t.durationSweep,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: NATIVE_DRIVER,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweeping, sweep, t.durationSweep]);
  const dir = I18nManager.isRTL ? -1 : 1;

  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      // Indeterminate MUST NOT carry a current value — its absence is the signal.
      aria-valuenow={indeterminate ? undefined : valueNow}
      aria-valuetext={valueText}
      {...rest}
      onLayout={(e) => {
        setTrackWidth(e.nativeEvent.layout.width);
        onLayout?.(e);
      }}
      style={[s.track, style]}
    >
      {!indeterminate ? (
        <Animated.View
          style={[
            s.fill,
            {
              width: shown.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      ) : reduceMotion ? (
        <View style={[s.fill, { width: "100%", opacity: 0.5 }]} />
      ) : sweeping ? (
        <Animated.View
          style={[
            s.fill,
            {
              width: "35%",
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-0.35 * trackWidth * dir, trackWidth * dir],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
    </View>
  );
}
