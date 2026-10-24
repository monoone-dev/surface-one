import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactElement,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { shadow } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";
import { joinShadows } from "../input/input";
import { useSoneFieldControl } from "../input/field";

export type RadioGroupOrientation = "vertical" | "horizontal";

type RadioNode = ComponentRef<typeof Pressable>;

interface RadioEntry {
  readonly node: { current: RadioNode | null };
  disabled: boolean;
}

interface RadioGroupContext {
  readonly value: string | null;
  readonly disabled: boolean;
  /** The radio that takes the group's one Tab stop: the checked one, else the first. */
  readonly tabStop: string | null;
  select(value: string): void;
  register(value: string, entry: RadioEntry): () => void;
  /** A radio was enabled or disabled: the first enabled one may have changed. */
  refresh(): void;
}

const RADIO_GROUP = createContext<RadioGroupContext | null>(null);

const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight"]);
const PREVIOUS_KEYS = new Set(["ArrowUp", "ArrowLeft"]);

export interface SoneRadioGroupProps extends Omit<ViewProps, "children"> {
  /** The checked radio's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string) => void;
  /** Disables every radio of the group. */
  readonly disabled?: boolean;
  /** Lays the radios out in a column or a row. */
  readonly orientation?: RadioGroupOrientation;
  readonly children?: ViewProps["children"];
}

/**
 * `[soneRadioGroup]` — a set of radios with one value (`role="radiogroup"`): `value` /
 * `defaultValue` / `onValueChange`, `disabled`, `orientation`. Name it with
 * `aria-label`. With a keyboard the group is one Tab stop (the checked radio, else the
 * first) and the arrow keys check the next or previous radio, as on the web.
 */
export function SoneRadioGroup({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  disabled = false,
  orientation = "vertical",
  style,
  children,
  ...rest
}: SoneRadioGroupProps): ReactElement {
  const t = useSoneTheme().tokens;
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange as ((value: string | null) => void) | undefined,
  );
  // The radios in the order they mounted (tree order), for the arrow keys.
  const radios = useRef(new Map<string, RadioEntry>());
  const [first, setFirst] = useState<string | null>(null);
  const findFirst = useCallback((): void => {
    let found: string | null = null;
    for (const [v, entry] of radios.current)
      if (!entry.disabled) {
        found = v;
        break;
      }
    setFirst(found);
  }, []);

  const register = useCallback(
    (v: string, entry: RadioEntry) => {
      radios.current.set(v, entry);
      findFirst();
      return () => {
        if (radios.current.get(v) === entry) radios.current.delete(v);
        findFirst();
      };
    },
    [findFirst],
  );

  const enabled = (): string[] =>
    disabled
      ? []
      : [...radios.current].filter(([, e]) => !e.disabled).map(([v]) => v);

  const onKeyDown = (event: { key: string; preventDefault(): void }): void => {
    const step = NEXT_KEYS.has(event.key)
      ? 1
      : PREVIOUS_KEYS.has(event.key)
        ? -1
        : 0;
    if (!step) return;
    const list = enabled();
    if (!list.length) return;
    event.preventDefault();
    const at = value === null ? -1 : list.indexOf(value);
    const next =
      list[(at + step + list.length) % list.length] ?? (list[0] as string);
    setValue(next);
    radios.current.get(next)?.node.current?.focus?.();
  };

  const checkedEnabled =
    value !== null && radios.current.has(value) ? value : null;
  const context = useMemo<RadioGroupContext>(
    () => ({
      value,
      disabled,
      tabStop: checkedEnabled ?? first,
      select: (v) => setValue(v),
      register,
      refresh: findFirst,
    }),
    [value, disabled, checkedEnabled, first, setValue, register, findFirst],
  );

  // react-native-web forwards key events from a View; React Native's types leave them out.
  const keys = { onKeyDown } as unknown as Partial<ViewProps>;
  return (
    <RADIO_GROUP.Provider value={context}>
      <View
        role="radiogroup"
        aria-disabled={disabled || undefined}
        {...keys}
        {...rest}
        style={[
          {
            flexDirection: orientation === "horizontal" ? "row" : "column",
            flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
            gap: orientation === "horizontal" ? t.space6 : t.space3,
          },
          style,
        ]}
      >
        {children}
      </View>
    </RADIO_GROUP.Provider>
  );
}

export interface SoneRadioProps extends Omit<
  PressableProps,
  "style" | "children" | "disabled"
> {
  /** What the group's value becomes when this radio is checked. */
  readonly value: string;
  /** Disables this radio alone. */
  readonly disabled?: boolean;
  /** A failed check: the destructive border and ring. */
  readonly invalid?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `input[soneRadio]` — one radio of a `SoneRadioGroup` (`role="radio"`, `aria-checked`),
 * drawn as the web one: the `--checkbox-*` circle, filled with the accent around a dot
 * when checked. Inside a `SoneField` it takes the field's label and hint.
 */
export function SoneRadio({
  value,
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
}: SoneRadioProps): ReactElement {
  const t = useSoneTheme().tokens;
  const group = useContext(RADIO_GROUP);
  const field = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const disabled = field.disabled || !!group?.disabled;
  const invalid = field.invalid;
  const checked = group?.value === value;
  const focus = useFocusRing(onFocus, onBlur);
  const node = useRef<RadioNode | null>(null);

  const register = group?.register;
  const refresh = group?.refresh;
  const entry = useRef<RadioEntry>({ node, disabled });
  entry.current.disabled = disabled;
  useLayoutEffect(() => register?.(value, entry.current), [register, value]);
  useLayoutEffect(() => refresh?.(), [refresh, disabled]);

  const size = t.controlIcon;
  // A roving Tab stop: only one radio of the group is in the Tab order.
  const tabStop = group && !disabled ? group.tabStop === value : undefined;
  return (
    <Pressable
      {...rest}
      ref={node}
      role="radio"
      aria-checked={checked}
      aria-label={field.label}
      accessibilityHint={field.hint}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      focusable={tabStop}
      tabIndex={tabStop === undefined ? undefined : tabStop ? 0 : -1}
      hitSlop={hitSlop ?? t.space3}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      onPress={(e) => {
        group?.select(value);
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
          borderRadius: t.radiusPill,
          borderColor: checked
            ? t.accent
            : invalid
              ? t.invalidBorder
              : focus.focused
                ? t.accentEdge
                : t.checkboxBorder,
          backgroundColor: checked ? t.accent : t.inputBg,
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
      {checked ? (
        <View
          style={{
            width: t.space2,
            height: t.space2,
            borderRadius: t.radiusPill,
            backgroundColor: t.textOnAccent,
          }}
        />
      ) : null}
    </Pressable>
  );
}
