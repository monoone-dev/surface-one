import {
  Children,
  isValidElement,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneTheme, type SoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  textChildren,
  useForeground,
  type SoneForeground,
} from "../../theme/foreground";
import { em, fontFamily, shadow, weight } from "../../theme/style";
import { useFocusRing } from "../../utils/focus";
import { mix } from "../../utils/color";
import { SoneIcon } from "../icon/icon";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "accent"
  | "live"
  | "dashed";

export interface SoneBadgeProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly variant?: BadgeVariant;
  /** A leading status dot in the badge's colour. */
  readonly dot?: boolean;
  /** Pressed feedback for a badge that is not itself the button (one with `onPress` has it). */
  readonly interactive?: boolean;
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

interface BadgeLook {
  readonly rest: ViewStyle;
  readonly pressed: ViewStyle;
  readonly fg: SoneForeground;
  readonly pressedColor?: string;
}

/** The look of one variant — the `.badge[data-variant]` rules; hover becomes pressed. */
export function badgeLook(theme: SoneTheme, variant: BadgeVariant): BadgeLook {
  const t = theme.tokens;
  let bg = "transparent";
  let border = "transparent";
  let color = t.textPrimary;
  let pressedBg: string | undefined;
  let pressedColor: string | undefined;
  switch (variant) {
    case "default":
      [bg, color, pressedBg] = [
        t.badgeDefaultBg,
        t.badgeDefaultFg,
        t.badgeDefaultHover,
      ];
      break;
    case "secondary":
      bg = t.badgeSecondaryBg ?? t.btnSecondaryBg;
      [color, pressedBg, pressedColor] = [
        t.badgeSecondaryFg,
        t.badgeSecondaryHover,
        t.badgeSecondaryHoverFg,
      ];
      break;
    case "destructive":
      [bg, color, pressedBg] = [
        t.dangerSoft,
        t.dangerText,
        t.badgeDestructiveHover,
      ];
      break;
    case "outline":
    case "dashed":
      border = t.badgeOutlineBorder;
      bg = variant === "outline" ? t.badgeOutlineBg : "transparent";
      [color, pressedBg, pressedColor] = [
        t.badgeOutlineFg,
        t.surfaceHover,
        t.badgeOutlineHoverFg,
      ];
      break;
    case "ghost":
      [color, pressedBg, pressedColor] = [
        t.badgeGhostFg,
        t.btnGhostHoverBg,
        t.badgeGhostHoverFg,
      ];
      break;
    case "link":
      color = t.accentText;
      break;
    case "success":
      [bg, color, pressedBg] = [
        t.successSoft,
        t.successText,
        t.badgeSuccessHover,
      ];
      break;
    case "warning":
      [bg, color, pressedBg] = [
        t.warningSoft,
        t.warningText,
        t.badgeWarningHover,
      ];
      break;
    case "accent":
      [bg, color, pressedBg] = [t.accentSoft, t.accentText, t.badgeAccentHover];
      break;
    case "live":
      [bg, color, pressedBg] = [t.liveSoft, t.liveText, t.badgeLiveHover];
      break;
  }
  const fontSize = t.fontSizeXs;
  return {
    rest: {
      flexDirection: "row",
      flexShrink: 0,
      alignSelf: "flex-start",
      alignItems: "center",
      justifyContent: "center",
      gap: t.space1,
      maxWidth: "100%",
      height: t.badgeH,
      paddingHorizontal: t.space2,
      overflow: "hidden",
      borderWidth: t.borderWidthThin,
      borderStyle: variant === "dashed" ? "dashed" : "solid",
      borderColor: border,
      borderRadius: t.radiusPill,
      backgroundColor: bg,
    },
    pressed: pressedBg ? { backgroundColor: pressedBg } : {},
    pressedColor,
    fg: {
      color,
      fontSize,
      fontWeight: weight(t.fontWeightMedium),
      fontFamily: fontFamily(theme),
      lineHeight: Math.round(fontSize * t.leadingXs),
      letterSpacing: em(t.badgeTracking, fontSize),
      fontVariant:
        t.controlNumeric === "tabular-nums" ? ["tabular-nums"] : undefined,
      iconSize: t.controlIconXs,
    },
  };
}

/** The leading dot of `dot`, in the badge's ink. */
function Dot() {
  const t = useSoneTheme().tokens;
  const { color } = useForeground();
  const size = t.space1 * 1.5;
  return (
    <View
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: t.radiusPill,
        backgroundColor: color,
      }}
    />
  );
}

/**
 * `[soneBadge]` — a small pill label. With `onPress` it is a button (pressed and focus
 * states); `dot` draws a leading dot in its ink; a `SoneBadgeRemove` child makes it a
 * removable tag chip.
 */
export function SoneBadge({
  variant = "default",
  dot = false,
  interactive = false,
  disabled,
  children,
  style,
  onFocus,
  onBlur,
  ...rest
}: SoneBadgeProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const look = useMemo(() => badgeLook(theme, variant), [theme, variant]);
  const focus = useFocusRing(onFocus, onBlur);
  const isDisabled = disabled === true;
  const removable = Children.toArray(children).some(
    (c) => isValidElement(c) && c.type === SoneBadgeRemove,
  );
  const pressable = rest.onPress != null || interactive;
  const content = (pressed: boolean) => (
    <SoneForegroundProvider
      value={
        pressed && look.pressedColor
          ? { ...look.fg, color: look.pressedColor }
          : look.fg
      }
    >
      {dot && <Dot />}
      {textChildren(children)}
    </SoneForegroundProvider>
  );
  const base = [look.rest, removable && { paddingRight: t.space1 / 2 }];
  if (!pressable)
    return (
      <View {...(rest as object)} style={[base, style]}>
        {content(false)}
      </View>
    );
  return (
    <Pressable
      role={rest.onPress ? "button" : undefined}
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        base,
        pressed && !isDisabled && look.pressed,
        focus.focused && {
          borderColor: t.accentEdge,
          ...shadow(
            variant === "destructive"
              ? `0px 0px 0px ${t.focusRingWidth}px ${t.badgeDestructiveRing}`
              : t.focusRing,
          ),
        },
        isDisabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {({ pressed }) => content(pressed && !isDisabled)}
    </Pressable>
  );
}

export interface SoneBadgeRemoveProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  /** default: the close glyph. */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/** `button[soneBadgeRemove]` — the remove button of a tag chip; name it `aria-label="Remove {tag}"`. */
export function SoneBadgeRemove({
  disabled,
  children,
  style,
  onFocus,
  onBlur,
  ...rest
}: SoneBadgeRemoveProps): ReactElement {
  const t = useSoneTheme().tokens;
  const focus = useFocusRing(onFocus, onBlur);
  const isDisabled = disabled === true;
  const { color } = useForeground();
  const size = t.space1 * 4;
  return (
    <Pressable
      role="button"
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: t.radiusPill,
        },
        pressed &&
          !isDisabled && { backgroundColor: mix(color, "transparent", 0.14) },
        focus.focused && {
          boxShadow: `inset 0px 0px 0px ${t.focusRingWidth}px ${t.focusRingColor}`,
        },
        isDisabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {children ?? <SoneIcon name="close" size={t.controlIconXs} />}
    </Pressable>
  );
}
