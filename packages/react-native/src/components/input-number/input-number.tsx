import { useState, type ReactElement } from "react";
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { useControllable } from "../../utils/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { useSoneFieldControl } from "../input/field";
import { inputFrameLook, inputTextLook } from "../input/input";

export type InputNumberSize = "sm" | "default";

export interface SoneInputNumberProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "style" | "editable" | "onChangeText"
> {
  /** The number (controlled; `null` = empty), with `onValueChange`; or `defaultValue`. */
  readonly value?: number | null;
  readonly defaultValue?: number | null;
  readonly onValueChange?: (value: number | null) => void;
  readonly min?: number | null;
  readonly max?: number | null;
  readonly step?: number;
  readonly size?: InputNumberSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly decrementLabel?: string | null;
  readonly incrementLabel?: string | null;
  /** The frame. */
  readonly style?: StyleProp<ViewStyle>;
  /** The text field. */
  readonly inputStyle?: StyleProp<TextStyle>;
}

/**
 * `<sone-input-number>` — a number field between − and + buttons, a spinbutton (screen
 * readers swipe up / down to step): `value` / `defaultValue` / `onValueChange`
 * (`number | null`), `min` / `max` / `step`. Typed text is parsed on blur or submit.
 */
export function SoneInputNumber({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min = null,
  max = null,
  step = 1,
  size = "default",
  disabled: disabledProp,
  invalid: invalidProp,
  decrementLabel,
  incrementLabel,
  style,
  inputStyle,
  onFocus,
  onBlur,
  onSubmitEditing,
  "aria-label": ariaLabel,
  accessibilityHint,
  ...control
}: SoneInputNumberProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const messages = useSoneMessages();
  const { invalid, disabled, label, hint } = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [value, setValue] = useControllable<number | null>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const text = draft !== null ? draft : value === null ? "" : String(value);
  const atMin = value !== null && min !== null && value <= min;
  const atMax = value !== null && max !== null && value >= max;

  const clamp = (n: number): number => {
    let v = n;
    if (min !== null) v = Math.max(v, min);
    if (max !== null) v = Math.min(v, max);
    const decimals = (String(step).split(".")[1] ?? "").length;
    return Number(v.toFixed(decimals));
  };
  const commit = (v: number | null): void => {
    setDraft(null);
    setValue(v);
  };
  const stepBy = (times: number): void => {
    if (disabled) return;
    commit(clamp((value ?? min ?? 0) + step * times));
  };
  const parseDraft = (): void => {
    if (draft === null) return;
    const trimmed = draft.trim().replace(",", ".");
    const n = Number(trimmed);
    if (trimmed === "") commit(null);
    else if (Number.isFinite(n)) commit(clamp(n));
    setDraft(null);
  };

  const stepButton = (dir: -1 | 1) => (
    <SoneButton
      variant="ghost"
      size={size === "sm" ? "icon-xs" : "icon-sm"}
      focusable={false}
      aria-label={
        dir < 0
          ? (decrementLabel ?? messages.decrease)
          : (incrementLabel ?? messages.increase)
      }
      disabled={disabled || (dir < 0 ? atMin : atMax)}
      onPress={() => stepBy(dir)}
      style={{ flexShrink: 0 }}
    >
      <SoneIcon name={dir < 0 ? "minus" : "plus"} />
    </SoneButton>
  );

  const height = size === "sm" ? t.controlHSm : t.controlHMd;
  return (
    <View
      style={[
        inputFrameLook(theme, size, { focused, invalid, disabled }),
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.space0_5,
          width: height * 3.25,
          maxWidth: "100%",
          paddingHorizontal: t.space0_5,
        },
        style,
      ]}
    >
      {stepButton(-1)}
      <TextInput
        inputMode="decimal"
        autoComplete="off"
        {...control}
        role="spinbutton"
        aria-label={label}
        accessibilityHint={hint}
        aria-valuenow={value ?? undefined}
        aria-valuemin={min ?? undefined}
        aria-valuemax={max ?? undefined}
        aria-disabled={disabled || undefined}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) =>
          stepBy(e.nativeEvent.actionName === "increment" ? 1 : -1)
        }
        value={text}
        editable={!disabled}
        placeholderTextColor={control.placeholderTextColor ?? t.textTertiary}
        onChangeText={setDraft}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          parseDraft();
          onBlur?.(e);
        }}
        onSubmitEditing={(e) => {
          parseDraft();
          onSubmitEditing?.(e);
        }}
        style={[
          inputTextLook(theme, size),
          {
            flex: 1,
            minWidth: 0,
            alignSelf: "stretch",
            padding: 0,
            textAlign: "center",
            fontVariant: ["tabular-nums"],
          },
          inputStyle,
        ]}
      />
      {stepButton(1)}
    </View>
  );
}
