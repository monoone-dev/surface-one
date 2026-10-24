import {
  createContext,
  useContext,
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

import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { useFocusRing } from "../../utils/focus";
import { SoneSeparator } from "../separator/separator";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";
export type ItemMediaVariant = "default" | "icon" | "image";

const ItemSizeContext = createContext<ItemSize>("default");

export interface SoneItemProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly variant?: ItemVariant;
  readonly size?: ItemSize;
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `[soneItem]` — a row of media, content and actions. With `onPress` the whole row is a
 * button (pressed and focus states).
 */
export function SoneItem({
  variant = "default",
  size = "default",
  disabled,
  children,
  style,
  onFocus,
  onBlur,
  ...rest
}: SoneItemProps): ReactElement {
  const t = useSoneTheme().tokens;
  const focus = useFocusRing(onFocus, onBlur);
  const isDisabled = disabled === true;
  const [gap, py, px] = {
    default: [t.itemGap, t.itemPy, t.itemPx],
    sm: [t.itemGapSm, t.itemPySm, t.itemPxSm],
    xs: [t.itemGapXs, t.itemPyXs, t.itemPxXs],
  }[size];
  const box: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap,
    width: "100%",
    minWidth: 0,
    paddingVertical: py,
    paddingHorizontal: px,
    borderWidth: t.borderWidthThin,
    borderColor:
      variant === "outline"
        ? t.border
        : variant === "muted"
          ? t.itemMutedBorder
          : "transparent",
    borderRadius: t.itemRadius,
    backgroundColor: variant === "muted" ? t.itemMutedBg : "transparent",
  };
  const content = (
    <ItemSizeContext.Provider value={size}>
      <SoneForegroundProvider
        value={{
          color: t.textPrimary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          iconSize: t.controlIcon,
        }}
      >
        {textChildren(children)}
      </SoneForegroundProvider>
    </ItemSizeContext.Provider>
  );
  if (!rest.onPress)
    return (
      <View {...(rest as ViewProps)} style={[box, style]}>
        {content}
      </View>
    );
  return (
    <Pressable
      role="button"
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        box,
        pressed && !isDisabled && { backgroundColor: t.surfaceHover },
        focus.focused && { borderColor: t.accentEdge, ...shadow(t.focusRing) },
        isDisabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

export interface SoneItemMediaProps extends ViewProps {
  readonly variant?: ItemMediaVariant;
}

/** `[soneItemMedia]` — an icon, an avatar or (`variant="image"`) a square thumbnail. */
export function SoneItemMedia({
  variant = "default",
  style,
  ...rest
}: SoneItemMediaProps): ReactElement {
  const t = useSoneTheme().tokens;
  const size = useContext(ItemSizeContext);
  const thumb = {
    default: t.space6 + t.space2,
    sm: t.space6,
    xs: t.space5,
  }[size];
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          gap: t.space2,
        },
        variant === "image" && {
          width: thumb,
          height: thumb,
          overflow: "hidden",
          borderRadius: size === "xs" ? t.itemMediaRadiusXs : t.itemMediaRadius,
        },
        style,
      ]}
    />
  );
}

/** `[soneItemContent]` — the title and description; takes the free space. */
export function SoneItemContent({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  const xs = useContext(ItemSizeContext) === "xs";
  return (
    <View
      {...rest}
      style={[
        {
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 0,
          gap: xs ? t.itemContentGapXs : t.space1,
        },
        style,
      ]}
    >
      {textChildren(children)}
    </View>
  );
}

/** `[soneItemTitle]` */
export function SoneItemTitle({ style, ...rest }: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textPrimary,
          fontWeight: weight(t.fontWeightMedium),
          lineHeight: Math.round(t.fontSizeSm * t.leadingSnug),
        },
        style,
      ]}
    />
  );
}

/** `[soneItemDescription]` — two lines at most. */
export function SoneItemDescription({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  const xs = useContext(ItemSizeContext) === "xs";
  const fontSize = xs ? t.itemDescriptionSizeXs : t.fontSizeSm;
  return (
    <SoneText
      numberOfLines={2}
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize,
          fontWeight: weight(t.fontWeightNormal),
          lineHeight: Math.round(fontSize * t.leadingNormal),
        },
        style,
      ]}
    />
  );
}

/** `[soneItemActions]` — buttons at the end of the row. */
export function SoneItemActions({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexShrink: 0,
          alignItems: "center",
          gap: t.space2,
          marginLeft: "auto",
        },
        style,
      ]}
    />
  );
}

function Band({ style, children, ...rest }: ViewProps) {
  const t = useSoneTheme().tokens;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexBasis: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.space2,
        },
        style,
      ]}
    >
      {textChildren(children)}
    </View>
  );
}

/** `[soneItemHeader]` — a full-width row above the media and content. */
export const SoneItemHeader = (props: ViewProps) => <Band {...props} />;

/** `[soneItemFooter]` — a full-width row below them. */
export const SoneItemFooter = (props: ViewProps) => <Band {...props} />;

export interface SoneItemGroupProps extends ViewProps {
  readonly size?: ItemSize;
}

/** `[soneItemGroup]` — a list of items. */
export function SoneItemGroup({
  size = "default",
  style,
  ...rest
}: SoneItemGroupProps): ReactElement {
  const t = useSoneTheme().tokens;
  const gap = {
    default: t.space4,
    sm: t.space2 + t.space1 / 2,
    xs: t.space2,
  }[size];
  return <View role="list" {...rest} style={[{ width: "100%", gap }, style]} />;
}

/** `[soneItemSeparator]` — a decorative rule between items. */
export function SoneItemSeparator({ style, ...rest }: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneSeparator {...rest} style={[{ marginVertical: t.space2 }, style]} />
  );
}
