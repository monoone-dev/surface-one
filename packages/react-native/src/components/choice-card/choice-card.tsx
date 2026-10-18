import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ReactNode,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneStyles, useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
} from "../../theme/foreground";
import { fontFamily, shadow, weight } from "../../theme/style";
import { useFocusRing } from "../../utils/focus";
import { pressedProps } from "../../utils/a11y";

export type ChoiceOrientation = "vertical" | "horizontal";

/** Inside a `SoneChoiceGroup`: the cards are radios. */
const GroupContext = createContext(false);
/** The card's state, for its indicator. */
const CardContext = createContext({ checked: false, horizontal: false });

export interface SoneChoiceGroupProps extends ViewProps {
  /** Lays the cards out in a column or a row (the web leaves layout to the owner). */
  readonly orientation?: ChoiceOrientation | null;
}

/** `[soneChoiceGroup]` — a `radiogroup` of choice cards; the owner selects them. */
export function SoneChoiceGroup({
  orientation,
  style,
  children,
  ...rest
}: SoneChoiceGroupProps) {
  return (
    <GroupContext.Provider value={true}>
      <View
        role="radiogroup"
        {...rest}
        style={[
          orientation && {
            flexDirection: orientation === "horizontal" ? "row" : "column",
          },
          style,
        ]}
      >
        {children}
      </View>
    </GroupContext.Provider>
  );
}

export interface SoneChoiceCardProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly selected?: boolean;
  readonly orientation?: ChoiceOrientation;
  /** Title, description, indicator — or any content (a string becomes text). */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `[soneChoiceCard]` — a large selectable card. Inside a `SoneChoiceGroup` it is a
 * `radio`; with `role="checkbox"` a checkbox; alone a pressed / not-pressed toggle.
 * The owner selects it: `selected` + `onPress`.
 */
export function SoneChoiceCard({
  selected = false,
  orientation = "vertical",
  role,
  disabled,
  style,
  children,
  onFocus,
  onBlur,
  ...rest
}: SoneChoiceCardProps) {
  const inGroup = useContext(GroupContext);
  const focus = useFocusRing(onFocus, onBlur);
  const isDisabled = disabled === true;
  const horizontal = orientation === "horizontal";
  const withIndicator = Children.toArray(children).some(
    (c) => isValidElement(c) && c.type === SoneChoiceCardIndicator,
  );
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    const inset = `inset 0px 0px 0px ${t.choiceCardCheckedInset}px ${t.choiceCardCheckedEdge}`;
    return {
      rest: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: t.choiceCardGap,
        minWidth: 0,
        padding: t.choiceCardPadding,
        borderWidth: t.borderWidthThin,
        borderColor: t.choiceCardBorder,
        borderRadius: t.choiceCardRadius,
        backgroundColor: t.choiceCardBg,
      } as ViewStyle,
      horizontal: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.fieldGap,
      } as ViewStyle,
      // Room for the indicator in the top corner.
      indicatorRoom: {
        paddingRight: t.choiceCardPadding * 2 + t.controlIcon,
      } as ViewStyle,
      pressed: {
        borderColor: t.choiceCardHoverBorder,
        backgroundColor: t.choiceCardHoverBg,
      } as ViewStyle,
      checked: {
        borderColor: t.choiceCardCheckedEdge,
        backgroundColor: t.choiceCardCheckedBg,
        ...shadow(t.choiceCardCheckedInset ? inset : ""),
      } as ViewStyle,
      focused: {
        borderColor: t.accentEdge,
        ...shadow(t.focusRing),
      } as ViewStyle,
      checkedFocused: {
        borderColor: t.accentEdge,
        boxShadow: [t.choiceCardCheckedInset ? inset : "", t.focusRing]
          .filter(Boolean)
          .join(", "),
      } as ViewStyle,
      disabled: { opacity: t.disabledOpacity } as ViewStyle,
      fg: {
        color: t.choiceCardFg,
        fontSize: t.fontSizeSm,
        lineHeight: Math.round(t.fontSizeSm * t.leadingSnug),
        fontFamily: fontFamily(th),
        iconSize: t.controlIcon,
      },
      ink: t.textPrimary,
    };
  });
  const a11y =
    inGroup || role === "radio" || role === "checkbox"
      ? { role: inGroup ? ("radio" as const) : role, "aria-checked": selected }
      : role
        ? { role }
        : pressedProps(selected);
  return (
    <Pressable
      {...a11y}
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        s.rest,
        horizontal && s.horizontal,
        withIndicator && !horizontal && s.indicatorRoom,
        pressed && !isDisabled && !selected && s.pressed,
        selected && s.checked,
        focus.focused && (selected ? s.checkedFocused : s.focused),
        isDisabled && s.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <CardContext.Provider value={{ checked: selected, horizontal }}>
          <SoneForegroundProvider
            value={
              selected || (pressed && !isDisabled)
                ? { ...s.fg, color: s.ink }
                : s.fg
            }
          >
            {textChildren(children)}
          </SoneForegroundProvider>
        </CardContext.Provider>
      )}
    </Pressable>
  );
}

/** `.choice-card-title` — the card's name. */
export function SoneChoiceCardTitle({ style, ...rest }: TextProps) {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        { color: t.textPrimary, fontWeight: weight(t.fontWeightMedium) },
        style,
      ]}
    />
  );
}

/** `.choice-card-description` — the secondary line. */
export function SoneChoiceCardDescription({ style, ...rest }: TextProps) {
  const t = useSoneTheme().tokens;
  const size = t.choiceCardDescriptionSize;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: size,
          lineHeight: Math.round(size * t.leadingNormal),
        },
        style,
      ]}
    />
  );
}

/** The radio dot; a card with one makes room for it. Decorative. */
export function SoneChoiceCardIndicator({
  style,
}: {
  readonly style?: StyleProp<ViewStyle>;
}) {
  const { checked, horizontal } = useContext(CardContext);
  const t = useSoneTheme().tokens;
  const size = t.controlIcon;
  return (
    <View
      aria-hidden
      style={[
        // In a vertical card it sits in the top corner; in a horizontal one, at the end.
        horizontal
          ? { marginLeft: "auto" }
          : {
              position: "absolute",
              top: t.choiceCardPadding,
              right: t.choiceCardPadding,
            },
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: t.borderWidthThin,
          borderColor: checked
            ? t.choiceCardIndicatorChecked
            : t.checkboxBorder,
          borderRadius: t.radiusPill,
          backgroundColor: checked ? t.choiceCardIndicatorChecked : t.inputBg,
        },
        style,
      ]}
    >
      <View
        style={{
          width: t.space2,
          height: t.space2,
          borderRadius: t.radiusPill,
          backgroundColor: checked ? t.choiceCardIndicatorDot : "transparent",
        }}
      />
    </View>
  );
}
