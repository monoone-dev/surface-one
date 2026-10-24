import {
  Children,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type ComponentRef,
  type Ref,
  type ReactElement,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme, type SoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneForeground,
} from "../../theme/foreground";
import {
  em,
  fontFamily,
  shadow,
  textTransform,
  weight,
} from "../../theme/style";
import { useFocusRing } from "../../utils/focus";

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

export type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface SoneButtonProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly ref?: Ref<ComponentRef<typeof Pressable>>;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Held open or on — the look of `aria-expanded` / `aria-pressed` on the web. */
  readonly active?: boolean;
  /** A failed check: the destructive ring. */
  readonly invalid?: boolean;
  /** The label (a string becomes button text) and icons (`SoneIcon` takes the ink). */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  /** The style of the label text (a string child). */
  readonly labelStyle?: StyleProp<TextStyle>;
}

interface Look {
  readonly rest: ViewStyle;
  readonly pressed: ViewStyle;
  readonly focused: ViewStyle;
  readonly fg: SoneForeground;
  readonly pressedFg?: Partial<SoneForeground>;
  readonly underlineWhenPressed: boolean;
}

/** The look of one variant × size — the `.btn` rules of the shared stylesheet. */
export function buttonLook(
  theme: SoneTheme,
  variant: ButtonVariant,
  size: ButtonSize,
  active: boolean,
): Look {
  const t = theme.tokens;
  const icon = size.startsWith("icon");
  const step =
    size === "xs" || size === "icon-xs"
      ? "xs"
      : size === "sm" || size === "icon-sm"
        ? "sm"
        : size === "lg" || size === "icon-lg"
          ? "lg"
          : "md";
  const height = {
    xs: t.controlHXs,
    sm: t.controlHSm,
    md: t.controlHMd,
    lg: t.controlHLg,
  }[step];
  const px = {
    xs: t.controlPxXs,
    sm: t.controlPxSm,
    md: t.controlPxMd,
    lg: t.controlPxLg,
  }[step];
  const radius =
    step === "xs" ? t.btnRadiusXs : step === "sm" ? t.btnRadiusSm : t.btnRadius;
  const fontSize =
    step === "xs"
      ? t.fontSizeXs
      : step === "sm"
        ? t.controlFontSizeSm
        : t.controlFontSize;

  const rest: ViewStyle = {
    flexDirection: "row",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: step === "xs" || step === "sm" ? t.controlGapSm : t.controlGapMd,
    height,
    paddingHorizontal: icon ? 0 : px,
    width: icon ? height : undefined,
    borderWidth: t.borderWidthThin,
    borderColor: "transparent",
    borderRadius: radius,
    backgroundColor: "transparent",
  };
  const pressed: ViewStyle = {
    transform: [{ translateY: t.btnPressShift }],
  };
  let focused: ViewStyle = {
    borderColor: t.accentEdge,
    ...shadow(t.focusRing),
  };
  let color = t.textPrimary;
  let pressedFg: Partial<SoneForeground> | undefined;

  switch (variant) {
    case "default":
      Object.assign(rest, {
        backgroundColor: active ? t.btnDefaultExpanded : t.btnDefaultBg,
        ...shadow(active ? t.btnShadowActive : t.btnShadow),
      });
      Object.assign(pressed, {
        backgroundColor: t.btnDefaultHover,
        ...shadow(t.btnShadowActive),
      });
      color = t.btnDefaultFg;
      focused = {
        borderColor: t.btnDefaultFocusBorder,
        ...shadow(t.btnDefaultFocusRing),
      };
      break;
    case "secondary":
      Object.assign(rest, {
        backgroundColor: active ? t.btnSecondaryExpanded : t.btnSecondaryBg,
        ...shadow(active ? t.btnShadowActive : t.btnShadow),
      });
      Object.assign(pressed, {
        backgroundColor: t.btnSecondaryHover,
        ...shadow(t.btnShadowActive),
      });
      color = t.btnSecondaryFg;
      break;
    case "outline":
      Object.assign(rest, {
        borderColor: active ? t.btnOutlineHoverBorder : t.btnOutlineBorder,
        backgroundColor: active ? t.surfaceHover : t.btnBg,
        ...shadow(active ? t.btnQuietShadowActive : t.btnOutlineShadow),
      });
      Object.assign(pressed, {
        borderColor: t.btnOutlineHoverBorder,
        backgroundColor: t.btnOutlineHoverBg,
        ...shadow(t.btnQuietShadowActive),
      });
      break;
    case "ghost":
      color = active ? t.textPrimary : t.btnGhostFg;
      if (active)
        Object.assign(rest, {
          backgroundColor: t.surfaceHover,
          ...shadow(t.btnQuietShadowActive),
        });
      Object.assign(pressed, { backgroundColor: t.btnGhostHoverBg });
      pressedFg = { color: t.textPrimary };
      break;
    case "destructive":
      Object.assign(rest, {
        backgroundColor: t.dangerSoft,
        ...shadow(t.btnShadow),
      });
      Object.assign(pressed, {
        backgroundColor: t.btnDestructiveHover,
        ...shadow(t.btnShadowActive),
      });
      color = t.dangerText;
      focused = {
        borderColor: t.btnDestructiveFocusBorder,
        boxShadow: `0px 0px 0px ${t.focusRingWidth}px ${t.destructiveRing}`,
      };
      break;
    case "link":
      color = t.accentText;
      break;
  }

  return {
    rest,
    pressed,
    focused,
    fg: {
      color,
      fontSize,
      fontWeight: weight(t.fontWeightMedium),
      fontFamily: fontFamily(theme),
      lineHeight: Math.round(fontSize * 1.25),
      letterSpacing: em(t.btnTracking, fontSize),
      textTransform:
        variant === "link" ? "none" : textTransform(t.btnTransform),
      iconSize: step === "xs" ? t.controlIconXs : t.controlIcon,
    },
    pressedFg,
    underlineWhenPressed: variant === "link",
  };
}

interface GroupSlot {
  readonly orientation: ButtonGroupOrientation;
  readonly first: boolean;
  readonly last: boolean;
}

const GroupContext = createContext<GroupSlot | null>(null);

/** Inside a button group: the inner corners square off and the seams join. */
function groupStyle(
  theme: SoneTheme,
  slot: GroupSlot | null,
  variant: ButtonVariant,
): ViewStyle | null {
  if (!slot) return null;
  const t = theme.tokens;
  const out: ViewStyle = { borderRadius: t.btnRadius };
  const seam = variant === "outline" ? 0 : t.btnGroupFilledSeam;
  if (slot.orientation === "horizontal") {
    if (!slot.first)
      Object.assign(out, {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderLeftWidth: seam,
      });
    if (!slot.last)
      Object.assign(out, {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      });
  } else {
    if (!slot.first)
      Object.assign(out, {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: seam,
      });
    if (!slot.last)
      Object.assign(out, {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      });
  }
  return out;
}

/**
 * `button[soneBtn]` — a `Pressable` with the skin's button look: `variant`, `size`,
 * pressed and focus states. A string child becomes the label; `SoneIcon` children take
 * the label's ink and the control icon size.
 */
export function SoneButton({
  variant = "default",
  size = "default",
  active = false,
  invalid = false,
  disabled,
  children,
  style,
  labelStyle,
  onFocus,
  onBlur,
  ...rest
}: SoneButtonProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const look = useMemo(
    () => buttonLook(theme, variant, size, active),
    [theme, variant, size, active],
  );
  const focus = useFocusRing(onFocus, onBlur);
  const slot = useContext(GroupContext);
  const isDisabled = disabled === true;
  return (
    <Pressable
      role="button"
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || rest["aria-disabled"] || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        look.rest,
        pressed && !isDisabled && look.pressed,
        groupStyle(theme, slot, variant),
        focus.focused && look.focused,
        invalid && {
          borderColor: t.btnInvalidBorder,
          boxShadow: `0px 0px 0px ${t.focusRingWidth}px ${t.destructiveRing}`,
        },
        isDisabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {({ pressed }) => (
        <SoneForegroundProvider
          value={
            pressed && !isDisabled && look.pressedFg
              ? { ...look.fg, ...look.pressedFg }
              : look.fg
          }
        >
          {labelStyle || (pressed && look.underlineWhenPressed)
            ? withLabelStyle(children, [
                pressed &&
                  look.underlineWhenPressed && {
                    textDecorationLine: "underline",
                  },
                labelStyle,
              ])
            : textChildren(children)}
        </SoneForegroundProvider>
      )}
    </Pressable>
  );
}

function withLabelStyle(
  children: ReactNode,
  style: StyleProp<TextStyle>,
): ReactNode {
  return Children.map(children, (c) =>
    typeof c === "string" || typeof c === "number" ? (
      <SoneText style={style}>{c}</SoneText>
    ) : (
      c
    ),
  );
}

export interface SoneButtonGroupProps extends ViewProps {
  readonly orientation?: ButtonGroupOrientation;
}

/** `[soneButtonGroup]` — buttons joined into one control, side by side or stacked. */
export function SoneButtonGroup({
  orientation = "horizontal",
  style,
  children,
  ...rest
}: SoneButtonGroupProps): ReactElement {
  const items = Children.toArray(children);
  return (
    <View
      role="group"
      {...rest}
      style={[
        {
          flexDirection: orientation === "horizontal" ? "row" : "column",
          alignItems: "stretch",
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {items.map((child, i) => (
        <GroupContext.Provider
          key={i}
          value={{
            orientation,
            first: i === 0,
            last: i === items.length - 1,
          }}
        >
          {child}
        </GroupContext.Provider>
      ))}
    </View>
  );
}
