import { useState, type Ref, type ReactElement } from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useSoneTheme, type SoneTheme } from "../../theme/context";
import { fontFamily } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import {
  textareaCount,
  textareaRowsHeight,
  type TextareaRows,
} from "@surface-one/core/textarea";
import { useSoneMessages } from "../../context/messages";
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
function useTextControl(
  props: SoneInputProps,
  multiline: boolean,
  rows: (TextareaRows & { readonly autosize?: boolean }) | null = null,
) {
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
  const lineHeight = Math.round((text.fontSize ?? 14) * t.textareaLeading);
  // An autosizing textarea grows with its content between minRows and maxRows.
  const chrome = 2 * t.textareaPy + 2 * t.borderWidthThin;
  const autosize = rows?.autosize
    ? {
        ...(rows.minRows
          ? { minHeight: textareaRowsHeight(rows.minRows, lineHeight, chrome) }
          : {}),
        ...(rows.maxRows
          ? { maxHeight: textareaRowsHeight(rows.maxRows, lineHeight, chrome) }
          : {}),
      }
    : null;
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
      lineHeight,
      textAlignVertical: "top",
      ...autosize,
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
export function SoneInput(props: SoneInputProps): ReactElement {
  return <TextInput {...useTextControl(props, false)} />;
}

export interface SoneTextareaProps extends SoneInputProps {
  /** Grow and shrink with the content between `minRows` and `maxRows`. */
  readonly autosize?: boolean;
  /** The fewest rows an autosizing textarea shows. */
  readonly minRows?: number | null;
  /** The most rows it grows to; it scrolls past them. */
  readonly maxRows?: number | null;
  /** Show the character counter under the textarea (against `maxLength`). */
  readonly showCount?: boolean;
}

/**
 * `textarea[soneTextarea]` — a multi-line `SoneInput`: `autosize` between `minRows` and
 * `maxRows`, `maxLength`, and with `showCount` the counter under it (`12/200`, tinted as
 * the limit nears; screen readers hear the characters left once few are).
 */
export function SoneTextarea({
  autosize = false,
  minRows = null,
  maxRows = null,
  showCount = false,
  ...props
}: SoneTextareaProps): ReactElement {
  const control = useTextControl(props, true, { autosize, minRows, maxRows });
  const t = useSoneTheme().tokens;
  const messages = useSoneMessages();
  const input = <TextInput {...control} />;
  if (!showCount) return input;
  const c = textareaCount(control.value, props.maxLength);
  const announcement =
    c.announce && c.remaining !== null
      ? messages.textareaRemaining(c.remaining)
      : undefined;
  return (
    <View style={{ width: "100%", gap: t.space1 }}>
      {input}
      <Text
        aria-label={announcement ?? c.text}
        aria-live={announcement ? "polite" : undefined}
        accessibilityLiveRegion={announcement ? "polite" : "none"}
        style={{
          alignSelf: "flex-end",
          color:
            c.state === "limit"
              ? t.dangerText
              : c.state === "near"
                ? t.warningText
                : t.textMuted,
          fontSize: t.fontSizeXs,
          fontVariant: ["tabular-nums"],
        }}
      >
        {c.text}
      </Text>
    </View>
  );
}
