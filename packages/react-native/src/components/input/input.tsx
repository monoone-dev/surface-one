import { useState, type Ref } from "react";
import {
  TextInput,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useSoneTheme, type SoneTheme } from "../../theme/context";
import { fontFamily } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useSoneFieldControl } from "./field";

export type InputSize = "sm" | "default";

/** What a field frame is drawn for. */
export interface InputState {
  readonly focused: boolean;
  readonly invalid: boolean;
  readonly disabled: boolean;
}

/** Shadow layers joined into one `boxShadow` (empty ones dropped). */
export function joinShadows(...layers: (string | undefined | false)[]): string {
  return layers.filter(Boolean).join(", ");
}

/**
 * The frame of a text field — border, fill, depth and the focus / invalid rings of the
 * shared `input` rules (forms.css); the input group, number field and OTP slots reuse it.
 */
export function inputFrameLook(
  theme: SoneTheme,
  size: InputSize,
  { focused, invalid, disabled }: InputState,
): ViewStyle {
  const t = theme.tokens;
  const ring = (width: number, color: string) =>
    width > 0 ? `0px 0px 0px ${width}px ${color}` : undefined;
  const boxShadow = invalid
    ? joinShadows(
        t.inputShadow,
        focused
          ? ring(t.focusRingWidth, t.invalidRingColor)
          : ring(t.invalidRingRest, t.invalidRingColor),
      )
    : joinShadows(t.inputShadow, focused && t.focusRing);
  return {
    height: size === "sm" ? t.controlHSm : t.controlHMd,
    borderWidth: t.borderWidthThin,
    borderColor: invalid
      ? t.invalidBorder
      : focused
        ? t.accentEdge
        : t.inputBorder,
    borderRadius: size === "sm" ? t.controlRadiusSm : t.controlRadius,
    backgroundColor: disabled ? t.inputDisabledBg : t.inputBg,
    ...(boxShadow ? { boxShadow } : {}),
    ...(disabled ? { opacity: t.disabledOpacity } : {}),
  };
}

/** The typed text of a field: `--text-primary` at the control font size. */
export function inputTextLook(theme: SoneTheme, size: InputSize): TextStyle {
  const t = theme.tokens;
  return {
    color: t.textPrimary,
    fontSize: size === "sm" ? t.controlFontSizeSm : t.controlFontSize,
    fontFamily: fontFamily(theme),
  };
}

export interface SoneInputProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "onChangeText" | "editable" | "style"
> {
  /** The text (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** Every edit, with the new text. */
  readonly onValueChange?: (value: string) => void;
  readonly onChangeText?: (value: string) => void;
  readonly size?: InputSize;
  /** A failed check: the destructive border and ring (default: the field's). */
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly style?: StyleProp<TextStyle>;
  readonly ref?: Ref<TextInputInstance>;
}

/** The shared parts of `SoneInput` and `SoneTextarea`. */
function useTextControl(props: SoneInputProps, multiline: boolean) {
  const {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onChangeText,
    size = "default",
    invalid: invalidProp,
    disabled: disabledProp,
    readOnly,
    style,
    onFocus,
    onBlur,
    "aria-label": ariaLabel,
    accessibilityHint,
    ...rest
  } = props;
  const theme = useSoneTheme();
  const t = theme.tokens;
  const field = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [focused, setFocused] = useState(false);
  const text = inputTextLook(theme, size);
  const own: TextStyle = {
    ...inputFrameLook(theme, size, { ...field, focused }),
    ...text,
    width: "100%",
    paddingHorizontal: t.controlPxMd,
    ...(multiline && {
      height: undefined,
      // forms.css: `textarea { min-height: 64px }` — no token.
      minHeight: 64,
      paddingVertical: t.textareaPy,
      borderRadius: t.textareaRadius,
      lineHeight: Math.round((text.fontSize ?? 14) * t.textareaLeading),
      textAlignVertical: "top",
    }),
  };
  return {
    ...rest,
    value,
    multiline,
    readOnly,
    editable: !field.disabled && !readOnly,
    placeholderTextColor: rest.placeholderTextColor ?? t.textTertiary,
    "aria-label": field.label,
    accessibilityHint: field.hint,
    "aria-disabled": field.disabled || undefined,
    onChangeText: (v: string) => {
      onChangeText?.(v);
      setValue(v);
    },
    onFocus: ((e) => {
      setFocused(true);
      onFocus?.(e);
    }) as TextInputProps["onFocus"],
    onBlur: ((e) => {
      setFocused(false);
      onBlur?.(e);
    }) as TextInputProps["onBlur"],
    style: [own, style],
  };
}

/**
 * `input` (forms.css) — a themed `TextInput`: `value` / `defaultValue` / `onValueChange`,
 * `size`, `invalid`, `disabled`, and the focus ring of the skin. Inside a `SoneField` it
 * takes the field's label, description, `invalid` and `disabled`.
 */
export function SoneInput(props: SoneInputProps) {
  return <TextInput {...useTextControl(props, false)} />;
}

/** `textarea` (forms.css) — a multi-line `SoneInput`. */
export function SoneTextarea(props: SoneInputProps) {
  return <TextInput {...useTextControl(props, true)} />;
}
