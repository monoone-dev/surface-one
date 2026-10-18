import { useCallback, useImperativeHandle, useRef, type Ref } from "react";
import type {
  StyleProp,
  TextInputInstance,
  TextStyle,
  ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { useControllable } from "../../utils/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import {
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  type SoneInputGroupInputProps,
} from "../input/input-group";

export type SearchFieldSize = "sm" | "default";

/** What `handleRef` exposes. */
export interface SoneSearchFieldHandle {
  /** Focuses the field. */
  focus(): void;
  /** Empties the field (calling `onValueChange("")`) and focuses it. */
  clear(): void;
}

export interface SoneSearchFieldProps extends Omit<
  SoneInputGroupInputProps,
  "style" | "placeholder" | "onSubmitEditing"
> {
  /** The keyboard's search key was pressed; carries the current text. */
  readonly onSubmit?: (value: string) => void;
  readonly size?: SearchFieldSize;
  /** Default: the "Search" message. */
  readonly placeholder?: string | null;
  /** Shows a clear button while the field has text. */
  readonly clearable?: boolean;
  /** The clear button's accessible name (default: the "Clear search" message). */
  readonly clearLabel?: string | null;
  /** `focus()` and `clear()`; `ref` itself is the `TextInput`. */
  readonly handleRef?: Ref<SoneSearchFieldHandle>;
  /** The frame. */
  readonly style?: StyleProp<ViewStyle>;
  /** The text field. */
  readonly inputStyle?: StyleProp<TextStyle>;
}

/**
 * `<sone-search-field>` — a search box on the Input Group: a leading search glyph, the
 * field (`role="searchbox"`, the keyboard's search key calls `onSubmit`) and, when
 * `clearable` and not empty, a clear button. `value` / `defaultValue` / `onValueChange`.
 */
export function SoneSearchField({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  size = "default",
  placeholder,
  clearable = false,
  clearLabel,
  disabled = false,
  handleRef,
  style,
  inputStyle,
  ref,
  "aria-label": ariaLabel,
  ...control
}: SoneSearchFieldProps) {
  const messages = useSoneMessages();
  const t = useSoneTheme().tokens;
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const field = useRef<TextInputInstance | null>(null);
  const setRef = useCallback(
    (input: TextInputInstance | null) => {
      field.current = input;
      if (typeof ref === "function") ref(input);
      else if (ref)
        (ref as { current: TextInputInstance | null }).current = input;
    },
    [ref],
  );
  const focus = (): void => field.current?.focus();
  const clear = (): void => {
    setValue("");
    focus();
  };
  useImperativeHandle(handleRef, () => ({ focus, clear }));

  const clearName = clearLabel ?? messages.clearSearch;
  return (
    <SoneInputGroup size={size} disabled={disabled} style={style}>
      <SoneInputGroupAddon>
        <SoneIcon name="search" />
      </SoneInputGroupAddon>
      <SoneInputGroupInput
        role="searchbox"
        enterKeyHint="search"
        returnKeyType="search"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        {...control}
        ref={setRef}
        value={value}
        onValueChange={setValue}
        placeholder={placeholder ?? messages.search}
        aria-label={ariaLabel ?? messages.search}
        onSubmitEditing={() => onSubmit?.(value)}
        style={inputStyle}
      />
      {clearable && value !== "" && !disabled ? (
        <SoneInputGroupAddon align="inline-end">
          <SoneButton
            variant="ghost"
            size="icon-xs"
            aria-label={clearName}
            onPress={clear}
            style={{ borderRadius: t.inputGroupButtonRadius }}
          >
            <SoneIcon name="close" />
          </SoneButton>
        </SoneInputGroupAddon>
      ) : null}
    </SoneInputGroup>
  );
}
