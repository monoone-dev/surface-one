import { useEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";

/**
 * `sone-pulse` — an opacity that eases 1 → 0.5 → 1 forever while `on`; it rests at 1
 * when off (reduced motion).
 */
export function usePulse(on: boolean, duration: number): Animated.Value {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    opacity.setValue(1);
    if (!on) return;
    const half = (toValue: number) =>
      Animated.timing(opacity, {
        toValue,
        duration: duration / 2,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: Platform.OS !== "web",
      });
    const loop = Animated.loop(Animated.sequence([half(0.5), half(1)]));
    loop.start();
    return () => loop.stop();
  }, [on, duration, opacity]);
  return opacity;
}
