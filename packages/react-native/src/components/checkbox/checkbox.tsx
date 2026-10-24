import { type ReactElement } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { shadow } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";
import { joinShadows } from "../input/input";
import { useSoneFieldControl } from "../input/field";

export interface SoneCheckboxProps extends Omit<
  PressableProps,
  "style" | "children" | "disabled"
> {
  /** Checked or not (controlled), with `onCheckedChange`; or `defaultChecked`. */
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  /** The mixed state ("some of them"), with `onIndeterminateChange`; a press clears it. */
  readonly indeterminate?: boolean;
  readonly defaultIndeterminate?: boolean;
  readonly onIndeterminateChange?: (indeterminate: boolean) => void;
  readonly disabled?: boolean;
  /** A failed check: the destructive border and ring. */
  readonly invalid?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `input[soneCheckbox]` — a checkbox (`role="checkbox"`, `aria-checked` true / false /
 * `"mixed"`) drawn as the web one: the `--checkbox-*` box, filled with the accent and a
 * check (or a dash when indeterminate). `checked` / `defaultChecked` /
 * `onCheckedChange`, `indeterminate`, `disabled`, `invalid`; inside a `SoneField` it
 * takes the field's label, hint, `invalid` and `disabled`.
 */
export function SoneCheckbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate,
  defaultIndeterminate = false,
  onIndeterminateChange,
  disabled: disabledProp,
  invalid: invalidProp,
  style,
  onPress,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  accessibilityHint,
  hitSlop,
  ...rest
}: SoneCheckboxProps): ReactElement {
  const t = useSoneTheme().tokens;
  const { invalid, disabled, label, hint } = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const [mixed, setMixed] = useControllable(
    indeterminate,
    defaultIndeterminate,
    onIndeterminateChange,
  );
  const focus = useFocusRing(onFocus, onBlur);
  const filled = on || mixed;
  const size = t.controlIcon;
  // The box is small: reach a comfortable touch target around it.
  const slop = hitSlop ?? t.space3;

  return (
    <Pressable
      {...rest}
      role="checkbox"
      aria-checked={mixed ? "mixed" : on}
      aria-label={label}
      accessibilityHint={hint}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      hitSlop={slop}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      onPress={(e) => {
        setOn(!on);
        if (mixed) setMixed(false);
        onPress?.(e);
      }}
      style={[
        {
          width: size,
          height: size,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: t.borderWidthThin,
          borderRadius: t.checkboxRadius,
          borderColor: filled
            ? t.accent
            : invalid
              ? t.invalidBorder
              : focus.focused
                ? t.accentEdge
                : t.checkboxBorder,
          backgroundColor: filled ? t.accent : t.inputBg,
          ...shadow(
            joinShadows(
              t.inputShadow,
              focus.focused
                ? invalid
                  ? `0px 0px 0px ${t.focusRingWidth}px ${t.invalidRingColor}`
                  : t.focusRing
                : invalid &&
                    `0px 0px 0px ${t.invalidRingRest}px ${t.invalidRingColor}`,
            ),
          ),
        },
        disabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {mixed ? (
        <View
          style={{
            width: size / 2,
            height: t.borderWidthThin * 2,
            backgroundColor: t.textOnAccent,
          }}
        />
      ) : on ? (
        <SoneIcon name="check" size={t.controlIconSm} color={t.textOnAccent} />
      ) : null}
    </Pressable>
  );
}
