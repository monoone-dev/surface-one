import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { useForeground } from "../../theme/foreground";

export interface SoneSpinnerProps {
  /** dp (default 16). */
  readonly size?: number;
  /** default: the inherited ink. */
  readonly color?: string;
  /** The accessible name (default: the "Loading" message); `null` for a decorative spinner. */
  readonly label?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-spinner>` — a rotating arc in the inherited ink: a busy `progressbar` named
 * by `label` (default: the "Loading" message); `label={null}` for a decorative one.
 */
export function SoneSpinner({
  size = 16,
  color,
  label: labelProp,
  style,
  testID,
}: SoneSpinnerProps) {
  const t = useSoneTheme().tokens;
  const messages = useSoneMessages();
  const fg = useForeground();
  const label = labelProp === undefined ? messages.loading : labelProp;
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: t.spinnerDuration,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [turn, t.spinnerDuration]);
  const rotate = turn.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.View
      testID={testID}
      role={label ? "progressbar" : undefined}
      aria-label={label || undefined}
      aria-busy={label ? true : undefined}
      aria-hidden={label ? undefined : true}
      style={[{ width: size, height: size, transform: [{ rotate }] }, style]}
    >
      <Svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        color={color ?? fg.color}
      >
        <Path
          d="M21 12a9 9 0 1 1-6.219-8.56"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
