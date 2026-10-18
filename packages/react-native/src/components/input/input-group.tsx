import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { SoneButton } from "../button/button";
import { useSoneFieldControl } from "./field";
import { inputFrameLook, inputTextLook, type InputSize } from "./input";

export type InputGroupAddonAlign =
  "inline-start" | "inline-end" | "block-start" | "block-end";

interface GroupContextValue {
  readonly size: InputSize;
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly focused: boolean;
  readonly hasStart: boolean;
  readonly hasEnd: boolean;
  setFocused(focused: boolean): void;
  setControl(input: TextInputInstance | null): void;
  focusControl(): void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export interface SoneInputGroupProps extends ViewProps {
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  /** Take the free space of a row (`flex: 1`). */
  readonly fill?: boolean;
  /** The control height: `sm` is the compact one (the search field's `size`). */
  readonly size?: InputSize;
}

const ORDER: Record<InputGroupAddonAlign, number> = {
  "block-start": -1,
  "inline-start": -1,
  "inline-end": 1,
  "block-end": 1,
};

function addonAlign(child: ReactNode): InputGroupAddonAlign | null {
  return isValidElement<SoneInputGroupAddonProps>(child) &&
    child.type === SoneInputGroupAddon
    ? (child.props.align ?? "inline-start")
    : null;
}

/**
 * `[soneInputGroup]` — a control with addons (icons, text, buttons) inside one frame;
 * the frame takes the control's focus ring. Addons go before or after the control
 * whatever their order in the children, as on the web.
 */
export function SoneInputGroup({
  invalid: invalidProp,
  disabled: disabledProp,
  fill = false,
  size = "default",
  style,
  children,
  ...rest
}: SoneInputGroupProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const { invalid, disabled } = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
  });
  const [focused, setFocused] = useState(false);
  const control = useRef<TextInputInstance | null>(null);
  const setControl = useCallback((input: TextInputInstance | null) => {
    control.current = input;
  }, []);
  const focusControl = useCallback(() => control.current?.focus(), []);

  const items = Children.toArray(children);
  const aligns = items.map(addonAlign);
  const block = aligns.some((a) => a === "block-start" || a === "block-end");
  const multiline = items.some(
    (c) => isValidElement(c) && c.type === SoneInputGroupTextarea,
  );
  const ordered = items
    .map((child, i) => {
      const align = aligns[i];
      return { child, i, order: align ? ORDER[align] : 0 };
    })
    .sort((a, b) => a.order - b.order || a.i - b.i)
    .map((x) => x.child);

  const context = useMemo<GroupContextValue>(
    () => ({
      size,
      invalid,
      disabled,
      focused,
      hasStart: aligns.includes("inline-start"),
      hasEnd: aligns.includes("inline-end"),
      setFocused,
      setControl,
      focusControl,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, invalid, disabled, focused, aligns.join(), setControl, focusControl],
  );
  return (
    <GroupContext.Provider value={context}>
      <View
        role="group"
        {...rest}
        style={[
          inputFrameLook(theme, size, { focused, invalid, disabled }),
          {
            flexDirection: block ? "column" : "row",
            alignItems: block ? "stretch" : "center",
            width: fill ? undefined : "100%",
            flex: fill ? 1 : undefined,
            minWidth: 0,
          },
          (block || multiline) && { height: undefined },
          multiline && { borderRadius: t.textareaRadius },
          block && { borderRadius: t.inputGroupBlockRadius },
          style,
        ]}
      >
        {ordered}
      </View>
    </GroupContext.Provider>
  );
}

export interface SoneInputGroupAddonProps extends ViewProps {
  readonly align?: InputGroupAddonAlign;
}

function hasButton(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (c) => isValidElement(c) && c.type === SoneButton,
  );
}

/**
 * `[soneInputGroupAddon]` — an icon, text or button beside the control; a press on its
 * empty area focuses the control. Icons take the secondary ink (the focus ink while the
 * control has focus).
 */
export function SoneInputGroupAddon({
  align = "inline-start",
  style,
  children,
  ...rest
}: SoneInputGroupAddonProps) {
  const t = useSoneTheme().tokens;
  const group = useContext(GroupContext);
  const inline = align === "inline-start" || align === "inline-end";
  const inset =
    t.inputGroupAddonPx -
    (hasButton(children) ? t.inputGroupAddonButtonPull : 0);
  const box: ViewStyle = inline
    ? {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: t.space2,
        paddingVertical: t.inputGroupAddonPy,
        ...(align === "inline-start"
          ? { paddingLeft: inset }
          : { paddingRight: inset }),
      }
    : {
        flexDirection: "row",
        alignItems: "center",
        gap: t.space2,
        paddingHorizontal: t.controlPxMd,
        ...(align === "block-start"
          ? { paddingTop: t.inputGroupBlockPy }
          : { paddingBottom: t.inputGroupBlockPy }),
      };
  const textStyle: TextStyle = {
    color: t.textSecondary,
    fontSize: t.fontSizeSm,
    fontWeight: weight(t.fontWeightMedium),
  };
  return (
    <Pressable
      accessible={false}
      {...rest}
      onPress={group?.focusControl}
      style={[box, style as StyleProp<ViewStyle>]}
    >
      <SoneForegroundProvider
        value={{
          color: group?.focused ? t.inputGroupAddonFocusFg : t.textSecondary,
          fontSize: t.fontSizeSm,
          fontWeight: weight(t.fontWeightMedium),
          iconSize: t.controlIcon,
        }}
      >
        {Children.map(children, (c) =>
          typeof c === "string" || typeof c === "number" ? (
            <SoneText style={textStyle}>{c}</SoneText>
          ) : (
            c
          ),
        )}
      </SoneForegroundProvider>
    </Pressable>
  );
}

/** `[soneInputGroupText]` — quiet text inside an addon (a unit, a prefix). */
export function SoneInputGroupText({ style, children, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        { flexDirection: "row", alignItems: "center", gap: t.space2 },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{ color: t.textSecondary, fontSize: t.fontSizeSm }}
      >
        {Children.map(children, (c) =>
          typeof c === "string" || typeof c === "number" ? (
            <SoneText>{c}</SoneText>
          ) : (
            c
          ),
        )}
      </SoneForegroundProvider>
    </View>
  );
}

export interface SoneInputGroupInputProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "editable" | "style"
> {
  /** The text (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly style?: StyleProp<TextStyle>;
  readonly ref?: Ref<TextInputInstance>;
}

function useGroupControl(
  {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onChangeText,
    disabled: disabledProp,
    readOnly,
    style,
    ref,
    onFocus,
    onBlur,
    "aria-label": ariaLabel,
    accessibilityHint,
    ...rest
  }: SoneInputGroupInputProps,
  multiline: boolean,
) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const group = useContext(GroupContext);
  const field = useSoneFieldControl({
    disabled: disabledProp ?? group?.disabled,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const size = group?.size ?? "default";
  const text = inputTextLook(theme, size);
  const setControl = group?.setControl;
  const inputRef = useCallback(
    (input: TextInputInstance | null) => {
      setControl?.(input);
      if (typeof ref === "function") ref(input);
      else if (ref)
        (ref as { current: TextInputInstance | null }).current = input;
    },
    [setControl, ref],
  );
  const own: TextStyle = {
    ...text,
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    paddingLeft: group?.hasStart ? t.controlGapMd : t.controlPxMd,
    paddingRight: group?.hasEnd ? t.controlGapMd : t.controlPxMd,
    ...(multiline && {
      minHeight: 64,
      paddingVertical: t.space2,
      paddingHorizontal: t.controlPxMd,
      lineHeight: Math.round((text.fontSize ?? 14) * t.textareaLeading),
      textAlignVertical: "top",
    }),
  };
  return {
    ...rest,
    ref: inputRef,
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
      group?.setFocused(true);
      onFocus?.(e);
    }) as TextInputProps["onFocus"],
    onBlur: ((e) => {
      group?.setFocused(false);
      onBlur?.(e);
    }) as TextInputProps["onBlur"],
    style: [own, style],
  };
}

/** `input[soneInputGroupInput]` — the group's text field: `value` / `defaultValue` / `onValueChange`. */
export function SoneInputGroupInput(props: SoneInputGroupInputProps) {
  return <TextInput {...useGroupControl(props, false)} />;
}

/** `textarea[soneInputGroupTextarea]` — the group's multi-line field. */
export function SoneInputGroupTextarea(props: SoneInputGroupInputProps) {
  return <TextInput {...useGroupControl(props, true)} />;
}
