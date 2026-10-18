import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { columnCount } from "@surface-one/core/numbers";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  type SoneTextProps,
} from "../../theme/foreground";
import {
  em,
  fontFamily,
  shadow,
  textTransform,
  weight,
} from "../../theme/style";

export type SoneStatGroupLayout = "grid" | "inline";
export type SoneStatVariant = "card" | "inset" | "plain";
export type SoneStatSize = "sm" | "md" | "lg";
export type SoneStatLabelPosition = "top" | "bottom";
export type SoneStatAlign = "start" | "center";
export type SoneStatTrendTone = "auto" | "positive" | "negative" | "neutral";

// `minmax(min(100%, 10rem), 1fr)`: the narrowest a grid figure gets.
const MIN_COLUMN = 160;

interface GroupSlot {
  readonly layout: SoneStatGroupLayout;
  readonly separated: boolean;
  readonly first: boolean;
  /** The figure's width in a measured grid. */
  readonly width?: number;
}

const GroupContext = createContext<GroupSlot | null>(null);
const SizeContext = createContext<SoneStatSize>("md");

export interface SoneStatGroupProps extends ViewProps {
  readonly layout?: SoneStatGroupLayout;
  /** A fixed column count (grid layout); default: as many as fit. */
  readonly columns?: number | null;
  /** One joined panel with hairlines between the figures (grid), or rules (inline). */
  readonly separated?: boolean;
}

/** `<dl data-slot="stat-group">` — a grid or inline row of key figures. */
export function SoneStatGroup({
  layout = "grid",
  columns = null,
  separated = false,
  style,
  children,
  onLayout,
  ...rest
}: SoneStatGroupProps) {
  const t = useSoneTheme().tokens;
  const [outer, setOuter] = useState<number | null>(null);
  const items = Children.toArray(children);
  const grid = layout === "grid";
  const gap = grid ? (separated ? t.spacePx : t.space4) : t.space5;
  let width: number | undefined;
  if (grid && outer !== null) {
    const inner = outer - (separated ? 2 * t.borderWidthThin : 0);
    const fixed = columnCount(columns);
    const cols =
      fixed ??
      Math.max(
        1,
        Math.min(items.length, Math.floor((inner + gap) / (MIN_COLUMN + gap))),
      );
    width = (inner - gap * (cols - 1)) / cols;
  }
  return (
    <View
      {...rest}
      onLayout={(e) => {
        setOuter(e.nativeEvent.layout.width);
        onLayout?.(e);
      }}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: grid ? "stretch" : "flex-start",
          rowGap: grid ? gap : t.space3,
          columnGap: grid ? gap : separated ? 0 : gap,
        },
        grid &&
          separated && {
            overflow: "hidden",
            borderWidth: t.borderWidthThin,
            borderColor: t.cardRing,
            borderRadius: t.cardRadius,
            backgroundColor: t.cardRing,
          },
        style,
      ]}
    >
      {items.map((child, i) => (
        <GroupContext.Provider
          key={isValidElement(child) && child.key != null ? child.key : i}
          value={{ layout, separated, first: i === 0, width }}
        >
          {child}
        </GroupContext.Provider>
      ))}
    </View>
  );
}

export interface SoneStatProps extends ViewProps {
  readonly variant?: SoneStatVariant;
  readonly size?: SoneStatSize;
  readonly labelPosition?: SoneStatLabelPosition;
  /** `center` centres the label, value and hint (a hero figure). */
  readonly align?: SoneStatAlign;
}

const is = (c: ReactNode, type: unknown) =>
  isValidElement(c) && c.type === type;

/** `[data-slot="stat"]` — one figure: label, value and optional hint / trend. */
export function SoneStat({
  variant = "card",
  size = "md",
  labelPosition = "top",
  align = "start",
  style,
  children,
  ...rest
}: SoneStatProps) {
  const t = useSoneTheme().tokens;
  const slot = useContext(GroupContext);
  const sm = size === "sm";
  const parts = Children.toArray(children);
  const label = parts.filter((c) => is(c, SoneStatLabel));
  const value = parts.filter((c) => is(c, SoneStatValue));
  const trend = parts.filter((c) => is(c, SoneStatTrend));
  const hint = parts.filter((c) => is(c, SoneStatHint));
  const other = parts.filter(
    (c) =>
      !is(c, SoneStatLabel) &&
      !is(c, SoneStatValue) &&
      !is(c, SoneStatTrend) &&
      !is(c, SoneStatHint),
  );
  const [lead, second] =
    labelPosition === "bottom" ? [value, label] : [label, value];
  const box: ViewStyle = {
    minWidth: 0,
    gap: sm ? t.space1 : t.space2,
    alignItems: align === "center" ? "center" : "stretch",
  };
  if (variant === "card")
    Object.assign(box, {
      padding: sm ? t.cardSpacingSm : t.cardSpacing,
      borderWidth: t.borderWidthThin,
      borderColor: t.cardRing,
      borderRadius: t.cardRadius,
      backgroundColor: t.surfaceRaised,
      ...shadow(t.cardShadow),
    });
  else if (variant === "inset")
    Object.assign(box, {
      paddingVertical: sm ? t.space2 : t.space3,
      paddingHorizontal: sm ? t.space3 : t.space4,
      borderRadius: t.radiusLg,
      backgroundColor: t.surfaceHover,
    });
  let place: ViewStyle | null = null;
  if (slot?.layout === "grid")
    place =
      slot.width !== undefined
        ? { width: slot.width }
        : { flexGrow: 1, flexBasis: MIN_COLUMN };
  const joined: ViewStyle | null =
    slot?.separated && slot.layout === "grid"
      ? {
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: t.surfaceRaised,
          boxShadow: "",
        }
      : slot?.separated
        ? {
            paddingLeft: slot.first ? 0 : t.space5,
            paddingRight: t.space5,
            borderLeftWidth: slot.first ? 0 : t.borderWidthThin,
            borderLeftColor: t.border,
          }
        : null;
  return (
    <View {...rest} style={[box, place, joined, style]}>
      <SizeContext.Provider value={size}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            alignSelf: "stretch",
            justifyContent: align === "center" ? "center" : "space-between",
            gap: sm ? t.space2 : t.space3,
          }}
        >
          <View style={{ flexShrink: 1, minWidth: 0 }}>{lead}</View>
          {trend}
        </View>
        {second}
        {hint}
        {other}
      </SizeContext.Provider>
    </View>
  );
}

/** `<dt data-slot="stat-label">` — what the figure counts. */
export function SoneStatLabel({ style, ...rest }: SoneTextProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.sectionLabelSize,
          fontWeight: weight(t.sectionLabelWeight),
          letterSpacing: em(t.sectionLabelTracking, t.sectionLabelSize),
          lineHeight: Math.round(t.sectionLabelSize * t.leadingSm),
          textTransform: textTransform(t.sectionLabelTransform),
        },
        style,
      ]}
    />
  );
}

/** `<dd data-slot="stat-value">` — the figure, in tabular monospace. */
export function SoneStatValue({ style, ...rest }: SoneTextProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const size = useContext(SizeContext);
  const fontSize =
    size === "sm"
      ? t.fontSizeLg
      : size === "lg"
        ? t.fontSize3xl
        : t.fontSize2xl;
  return (
    <SoneText
      numeric
      {...rest}
      style={[
        {
          color: t.textPrimary,
          fontFamily: fontFamily(theme, "mono"),
          fontSize,
          fontWeight: weight(
            size === "sm" ? t.fontWeightMedium : t.fontWeightSemibold,
          ),
          letterSpacing: em(t.trackingHeading, fontSize),
          // `--leading-none` (1) clips the descenders of a native Text; a hair more.
          lineHeight: Math.round(fontSize * Math.max(t.leadingNone, 1.1)),
        },
        style,
      ]}
    />
  );
}

/** `<dd data-slot="stat-hint">` — context under the figure. */
export function SoneStatHint({ style, ...rest }: SoneTextProps) {
  const t = useSoneTheme().tokens;
  const fontSize =
    useContext(SizeContext) === "sm" ? t.fontSizeXs : t.fontSizeSm;
  return (
    <SoneText
      numeric
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize,
          lineHeight: Math.round(fontSize * t.leadingSm),
        },
        style,
      ]}
    />
  );
}

const GLYPH = {
  up: "M6 2.5 10 8H2z",
  down: "M6 9.5 2 4h8z",
  flat: "M2 5.25h8v1.5H2z",
};

export interface SoneStatTrendProps extends ViewProps {
  /** The change; its sign draws the arrow (none when `null`). */
  readonly delta?: number | null;
  readonly tone?: SoneStatTrendTone;
}

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? String(c)
        : isValidElement<{ children?: ReactNode }>(c)
          ? textOf(c.props.children)
          : "",
    )
    .join("");

/**
 * `<dd data-slot="stat-trend">` — the change since the last period. `delta`'s sign draws
 * the arrow and, with `tone="auto"`, the colour; screen readers hear the direction
 * ("up") before the text.
 */
export function SoneStatTrend({
  delta = null,
  tone = "auto",
  style,
  children,
  ...rest
}: SoneStatTrendProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const m = useSoneMessages();
  const dir: keyof typeof GLYPH | null =
    delta === null || !Number.isFinite(delta)
      ? null
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat";
  const resolved =
    tone !== "auto"
      ? tone
      : dir === "up"
        ? "positive"
        : dir === "down"
          ? "negative"
          : "neutral";
  const color =
    resolved === "positive"
      ? t.successText
      : resolved === "negative"
        ? t.dangerText
        : t.textSecondary;
  const spoken =
    dir === "up"
      ? m.statTrendUp
      : dir === "down"
        ? m.statTrendDown
        : m.statTrendFlat;
  const text = textOf(children);
  const fontSize = t.fontSizeXs;
  return (
    <View
      accessible
      aria-label={dir ? `${spoken} ${text}`.trim() : text || undefined}
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexShrink: 0,
          alignItems: "center",
          gap: t.space1,
        },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color,
          fontSize,
          fontWeight: weight(t.fontWeightMedium),
          fontVariant: ["tabular-nums"],
          lineHeight: Math.round(fontSize * t.leadingXs),
          iconSize: t.controlIconXs,
        }}
      >
        {dir && (
          <Svg
            viewBox="0 0 12 12"
            width={t.controlIconXs}
            height={t.controlIconXs}
            aria-hidden
          >
            <Path d={GLYPH[dir]} fill={color} />
          </Svg>
        )}
        {Children.map(children, (c) =>
          typeof c === "string" || typeof c === "number" ? (
            <SoneText numberOfLines={1}>{c}</SoneText>
          ) : (
            c
          ),
        )}
      </SoneForegroundProvider>
    </View>
  );
}
