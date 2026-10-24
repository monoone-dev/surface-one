import { useEffect, useRef, type ReactElement } from "react";
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { shadow } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";
import { joinShadows } from "../input/input";
import { useSoneFieldControl } from "../input/field";

export type SwitchSize = "default" | "sm";

export interface SoneSwitchProps extends Omit<
  PressableProps,
  "style" | "children" | "disabled"
> {
  /** On / off (controlled), with `onCheckedChange`; or `defaultChecked`. */
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly size?: SwitchSize;
  readonly disabled?: boolean;
  /** A failed check: the destructive border. */
  readonly invalid?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-switch>` — an on / off switch (`role="switch"`, `aria-checked`) drawn from the
 * switch tokens, its thumb sliding over the skin's transition: `checked` /
 * `defaultChecked` / `onCheckedChange`, `size`, `disabled`, `invalid`.
 */
export function SoneSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "default",
  disabled: disabledProp,
  invalid: invalidProp,
  style,
  onPress,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  accessibilityHint,
  ...rest
}: SoneSwitchProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const { invalid, disabled, label, hint } = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const focus = useFocusRing(onFocus, onBlur);

  const sm = size === "sm";
  const w = sm ? t.switchWSm : t.switchW;
  const h = sm ? t.switchHSm : t.switchH;
  const thumb = sm ? t.switchThumbSm : t.switchThumb;
  const travel = w - thumb - 2 * t.borderWidthThin;

  const progress = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: on ? 1 : 0,
      duration: theme.reduceMotion ? 0 : t.transitionDur,
      useNativeDriver: Platform.OS !== "web",
    });
    anim.start();
    return () => anim.stop();
  }, [on, progress, theme.reduceMotion, t.transitionDur]);

  const depth = t.switchShadow;
  return (
    <Pressable
      {...rest}
      role="switch"
      aria-checked={on}
      aria-label={label}
      accessibilityHint={hint}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      onPress={(e) => {
        setOn(!on);
        onPress?.(e);
      }}
      style={[
        {
          width: w,
          height: h,
          flexShrink: 0,
          justifyContent: "center",
          borderWidth: t.borderWidthThin,
          borderColor: invalid
            ? t.invalidBorder
            : focus.focused
              ? t.accentEdge
              : "transparent",
          borderRadius: t.radiusPill,
          backgroundColor: on ? t.accent : t.switchTrackOff,
          ...shadow(joinShadows(focus.focused && t.focusRing, depth)),
        },
        disabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: thumb,
          height: thumb,
          borderRadius: t.radiusPill,
          backgroundColor: on ? t.switchThumbCheckedBg : t.switchThumbBg,
          ...shadow(t.switchThumbShadow),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, travel],
              }),
            },
          ],
        }}
      />
    </Pressable>
  );
}
