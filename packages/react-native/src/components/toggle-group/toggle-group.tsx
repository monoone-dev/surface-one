import {
  Children,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
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

import { useSoneTheme, type SoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  textChildren,
  type SoneForeground,
} from "../../theme/foreground";
import { fontFamily, shadow, weight } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";
import { pressedProps } from "../../utils/a11y";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
export type ToggleGroupType = "single" | "multiple";

interface ToggleLook {
  readonly rest: ViewStyle;
  readonly pressed: ViewStyle;
  readonly focused: ViewStyle;
  readonly fg: SoneForeground;
  readonly pressedFg: Partial<SoneForeground>;
}

/** The look of one toggle — the `.toggle` rules of the shared stylesheet. */
export function toggleLook(
  theme: SoneTheme,
  variant: ToggleVariant,
  size: ToggleSize,
  on: boolean,
): ToggleLook {
  const t = theme.tokens;
  const sm = size === "sm";
  const height =
    size === "sm" ? t.controlHSm : size === "lg" ? t.controlHLg : t.controlHMd;
  const fontSize = sm ? t.controlFontSizeSm : t.controlFontSize;
  const rest: ViewStyle = {
    flexDirection: "row",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: t.space1,
    height,
    minWidth: height,
    paddingHorizontal:
      size === "sm"
        ? t.controlPxSm
        : size === "lg"
          ? t.controlPxLg
          : t.controlPxMd,
    borderWidth: t.borderWidthThin,
    borderColor: "transparent",
    borderRadius: sm ? t.controlRadiusSm : t.controlRadius,
    backgroundColor: "transparent",
  };
  if (variant === "outline")
    Object.assign(rest, {
      borderColor: t.toggleOutlineBorder,
      backgroundColor: t.toggleOutlineBg,
    });
  if (variant === "dashed")
    Object.assign(rest, {
      borderColor: t.toggleOutlineBorder,
      borderStyle: on ? "solid" : "dashed",
    });
  if (on) Object.assign(rest, { backgroundColor: t.toggleOnBg });
  return {
    rest,
    // Hover on the web; an "on" toggle keeps its fill.
    pressed: on ? {} : { backgroundColor: t.surfaceHover },
    focused: {
      borderColor: t.accentEdge,
      zIndex: t.zRaised,
      ...shadow(t.focusRing),
    },
    fg: {
      color: on ? t.textPrimary : t.toggleFg,
      fontSize,
      fontWeight: weight(t.fontWeightMedium),
      fontFamily: fontFamily(theme),
      lineHeight: Math.round(fontSize * t.leadingNone),
      fontVariant:
        t.controlNumeric === "tabular-nums" ? ["tabular-nums"] : undefined,
      iconSize: sm ? t.controlIconSm : t.controlIcon,
    },
    pressedFg: { color: t.textPrimary },
  };
}

interface GroupValue {
  readonly variant: ToggleVariant;
  readonly size: ToggleSize;
  readonly spacing: number;
  readonly orientation: ToggleOrientation;
  readonly stretch: boolean;
  readonly disabled: boolean;
  readonly isOn: (value: string) => boolean;
  readonly toggle: (value: string) => void;
}

interface Slot {
  readonly first: boolean;
  readonly last: boolean;
}

const GroupContext = createContext<GroupValue | null>(null);
const SlotContext = createContext<Slot | null>(null);

/** Joined items (`spacing` 0): square inner corners, one shared seam. */
function joinedStyle(
  theme: SoneTheme,
  group: GroupValue,
  slot: Slot,
): ViewStyle {
  const t = theme.tokens;
  const r = t.controlRadius;
  const horizontal = group.orientation === "horizontal";
  const out: ViewStyle = {
    paddingHorizontal: t.toggleGroupItemPx,
    borderRadius: 0,
    justifyContent: horizontal ? "center" : "flex-start",
  };
  if (slot.first)
    Object.assign(
      out,
      horizontal
        ? { borderTopLeftRadius: r, borderBottomLeftRadius: r }
        : { borderTopLeftRadius: r, borderTopRightRadius: r },
    );
  if (slot.last)
    Object.assign(
      out,
      horizontal
        ? { borderTopRightRadius: r, borderBottomRightRadius: r }
        : { borderBottomLeftRadius: r, borderBottomRightRadius: r },
    );
  if (!slot.first && group.variant !== "default")
    Object.assign(
      out,
      horizontal ? { borderLeftWidth: 0 } : { borderTopWidth: 0 },
    );
  return out;
}

interface SingleSelection {
  readonly type?: "single";
  /** The pressed item's `value` (controlled; `null` for none), with `onValueChange`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
}

interface MultipleSelection {
  readonly type: "multiple";
  /** The pressed items' values (controlled), with `onValueChange`. */
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: readonly string[]) => void;
}

export type SoneToggleGroupProps = Omit<ViewProps, "children"> &
  (SingleSelection | MultipleSelection) & {
    readonly variant?: ToggleVariant;
    readonly size?: ToggleSize;
    /** The gap between items in spacing units; 0 joins them into one bar. */
    readonly spacing?: number;
    readonly orientation?: ToggleOrientation;
    /** Fill the container's width on one row, every item an equal share. */
    readonly stretch?: boolean;
    /** Every item disabled. */
    readonly disabled?: boolean;
    readonly children?: ReactNode;
  };

const toList = (
  v: string | readonly string[] | null | undefined,
): readonly string[] => (v == null ? [] : typeof v === "string" ? [v] : v);

/**
 * `[soneToggleGroup]` — a set of toggle buttons. Items with a `value` are pressed by
 * the group: `type="single"` (the default; pressing the pressed one clears it) or
 * `"multiple"`, with `value` / `defaultValue` / `onValueChange`; items without one
 * take their own `pressed`.
 */
export function SoneToggleGroup(props: SoneToggleGroupProps): ReactElement {
  const {
    type,
    value,
    defaultValue,
    onValueChange,
    variant = "default",
    size = "default",
    spacing = 0,
    orientation = "horizontal",
    stretch = false,
    disabled = false,
    style,
    children,
    ...rest
  } = props as SoneToggleGroupProps & {
    value?: string | readonly string[] | null;
    defaultValue?: string | readonly string[] | null;
    onValueChange?: (value: never) => void;
  };
  const theme = useSoneTheme();
  const multiple = type === "multiple";
  const [list, setList] = useControllable<readonly string[]>(
    value === undefined ? undefined : toList(value),
    toList(defaultValue),
    (next) =>
      (onValueChange as ((v: unknown) => void) | undefined)?.(
        multiple ? next : (next[0] ?? null),
      ),
  );
  const group = useMemo<GroupValue>(
    () => ({
      variant,
      size,
      spacing,
      orientation,
      stretch,
      disabled,
      isOn: (v) => list.includes(v),
      toggle: (v) =>
        setList(
          list.includes(v)
            ? list.filter((x) => x !== v)
            : multiple
              ? [...list, v]
              : [v],
        ),
    }),
    [
      variant,
      size,
      spacing,
      orientation,
      stretch,
      disabled,
      list,
      setList,
      multiple,
    ],
  );
  const items = Children.toArray(children);
  const vertical = orientation === "vertical";
  return (
    <GroupContext.Provider value={group}>
      <View
        role="group"
        {...rest}
        style={[
          {
            flexDirection: vertical ? "column" : "row",
            alignItems: vertical ? "stretch" : "center",
            alignSelf: stretch && !vertical ? "stretch" : "flex-start",
            flexWrap:
              spacing !== 0 && !vertical && !stretch ? "wrap" : "nowrap",
            gap: theme.tokens.space1 * spacing,
          },
          style,
        ]}
      >
        {items.map((child, i) => (
          <SlotContext.Provider
            key={i}
            value={{ first: i === 0, last: i === items.length - 1 }}
          >
            {child}
          </SlotContext.Provider>
        ))}
      </View>
    </GroupContext.Provider>
  );
}

export interface SoneToggleProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly variant?: ToggleVariant;
  readonly size?: ToggleSize;
  /** On (`aria-pressed` on the web, a checked toggle button natively). */
  readonly pressed?: boolean;
  /** A failed check: the destructive border. */
  readonly invalid?: boolean;
  /** The label (a string becomes text) and icons. */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/** `[soneToggle]` — a single two-state button; the owner flips `pressed` in `onPress`. */
export function SoneToggle({
  variant = "default",
  size = "default",
  pressed: on = false,
  invalid = false,
  disabled,
  style,
  children,
  onFocus,
  onBlur,
  ...rest
}: SoneToggleProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const look = useMemo(
    () => toggleLook(theme, variant, size, on),
    [theme, variant, size, on],
  );
  const focus = useFocusRing(onFocus, onBlur);
  const isDisabled = disabled === true;
  return (
    <Pressable
      {...pressedProps(on)}
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        look.rest,
        pressed && !isDisabled && look.pressed,
        invalid && { borderColor: t.danger },
        focus.focused && look.focused,
        focus.focused &&
          invalid && {
            borderColor: t.danger,
            boxShadow: `0px 0px 0px ${t.focusRingWidth}px ${t.toggleInvalidRing}`,
          },
        isDisabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {({ pressed }) => (
        <SoneForegroundProvider
          value={
            pressed && !isDisabled ? { ...look.fg, ...look.pressedFg } : look.fg
          }
        >
          {textChildren(children)}
        </SoneForegroundProvider>
      )}
    </Pressable>
  );
}

export interface SoneToggleGroupItemProps extends Omit<
  SoneToggleProps,
  "variant" | "size"
> {
  /** The group presses it (`type` single / multiple); without one, `pressed` decides. */
  readonly value?: string;
}

/** `[soneToggleGroupItem]` — takes its variant, size and pressed state from the group. */
export function SoneToggleGroupItem({
  value,
  pressed,
  disabled,
  style,
  onPress,
  ...rest
}: SoneToggleGroupItemProps): ReactElement {
  const theme = useSoneTheme();
  const group = useContext(GroupContext);
  const slot = useContext(SlotContext);
  const on = pressed ?? (value !== undefined && !!group?.isOn(value));
  return (
    <SoneToggle
      {...rest}
      variant={group?.variant}
      size={group?.size}
      pressed={on}
      disabled={disabled || group?.disabled}
      onPress={(e) => {
        onPress?.(e);
        if (value !== undefined) group?.toggle(value);
      }}
      style={[
        group?.stretch &&
          group.orientation === "horizontal" && { flex: 1, minWidth: 0 },
        group && slot && group.spacing === 0 && joinedStyle(theme, group, slot),
        style,
      ]}
    />
  );
}
