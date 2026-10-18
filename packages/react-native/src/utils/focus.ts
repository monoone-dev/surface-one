import { useCallback, useState } from "react";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";

type FocusHandler = (e: NativeSyntheticEvent<TargetedEvent>) => void;

/**
 * Keyboard focus of a pressable (a hardware keyboard, a TV remote, the web): `focused`
 * draws the skin's focus ring; the owner's own handlers still run.
 */
export function useFocusRing(
  onFocus?: FocusHandler | null,
  onBlur?: FocusHandler | null,
) {
  const [focused, setFocused] = useState(false);
  const handleFocus = useCallback<FocusHandler>(
    (e) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );
  const handleBlur = useCallback<FocusHandler>(
    (e) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );
  return { focused, onFocus: handleFocus, onBlur: handleBlur };
}
