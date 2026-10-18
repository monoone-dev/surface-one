import { useState, type ReactNode } from "react";
import {
  Animated,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import {
  formatChartNumber,
  scaleToPercent,
  type SoneChartTone,
} from "@surface-one/core/chart";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { weight } from "../../theme/style";
import { startOrigin, toneColor, useEnterProgress } from "../../utils/chart";

export interface SoneBarListItem {
  /** Stable identity (the `key` of each row). */
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** The shown value; defaults to `valueFormat(value)`. */
  readonly valueLabel?: string;
  /** The bar colour; defaults to `accent`. */
  readonly tone?: SoneChartTone;
}

export type SoneBarListScale = "max" | "total";
export type SoneBarListFormat = (value: number) => string;

export interface SoneBarListProps<
  Item extends SoneBarListItem = SoneBarListItem,
> extends Omit<ViewProps, "style"> {
  readonly items?: readonly Item[];
  readonly scale?: SoneBarListScale;
  readonly max?: number | null;
  /** Formats `value` when an item has no `valueLabel`; default: a localized number. */
  readonly valueFormat?: SoneBarListFormat | null;
  /** Renders a row's label in place of its text (Angular's `<ng-template soneBarListLabel>`). */
  readonly renderLabel?: (item: Item) => ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-bar-list>` — labelled horizontal bars with the value written next to each. A
 * list (named by `aria-label`); the bar is decoration. Labels and values share one
 * column width across the rows, like the web grid.
 */
export function SoneBarList<Item extends SoneBarListItem = SoneBarListItem>({
  items = [],
  scale = "max",
  max = null,
  valueFormat = null,
  renderLabel,
  style,
  ...rest
}: SoneBarListProps<Item>) {
  const messages = useSoneMessages();
  const { tokens: t, reduceMotion } = useSoneTheme();
  const grow = useEnterProgress(t.motionEnterDur, t.easeSpring, reduceMotion);
  const format: SoneBarListFormat =
    valueFormat ?? ((n) => formatChartNumber(n, messages.numberLocale));
  let full: number;
  if (max !== null && Number.isFinite(max)) full = max;
  else {
    const values = items
      .map((i) => i.value)
      .filter((v) => Number.isFinite(v) && v > 0);
    full =
      scale === "total"
        ? values.reduce((a, b) => a + b, 0)
        : values.reduce((a, b) => Math.max(a, b), 0);
  }

  // No subgrid: every row measures its label and value, all take the widest.
  const [cols, setCols] = useState({ label: 0, value: 0 });
  const measure = (col: "label" | "value") => (e: LayoutChangeEvent) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    setCols((c) => (w > c[col] ? { ...c, [col]: w } : c));
  };

  const s = useSoneStyles(({ tokens }) => ({
    list: { gap: tokens.space3, minWidth: 0 } satisfies ViewStyle,
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.space3,
      minWidth: 0,
    } satisfies ViewStyle,
    label: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
      maxWidth: "40%",
      minWidth: 0,
      overflow: "hidden",
    } satisfies ViewStyle,
    labelText: { color: tokens.textSecondary, fontSize: tokens.fontSizeSm },
    track: {
      flex: 1,
      minWidth: tokens.space8,
      height: tokens.progressHMd,
      borderRadius: tokens.radiusPill,
      backgroundColor: tokens.trackBg,
      overflow: "hidden",
    } satisfies ViewStyle,
    fill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      start: 0,
      minWidth: tokens.progressHMd,
      borderRadius: tokens.radiusPill,
    } satisfies ViewStyle,
    value: {
      color: tokens.textPrimary,
      fontSize: tokens.fontSizeSm,
      fontWeight: weight(tokens.fontWeightMedium),
      textAlign: "right" as const,
    },
  }));

  return (
    <View role="list" {...rest} style={[s.list, style]}>
      {items.map((item) => {
        const pct = scaleToPercent(item.value, full);
        return (
          <View key={item.key} role="listitem" style={s.row}>
            <View
              style={[s.label, { minWidth: cols.label }]}
              onLayout={measure("label")}
            >
              {renderLabel ? (
                renderLabel(item)
              ) : (
                <SoneText numberOfLines={1} style={s.labelText}>
                  {item.label}
                </SoneText>
              )}
            </View>
            <View style={s.track} aria-hidden>
              {pct > 0 ? (
                <Animated.View
                  style={[
                    s.fill,
                    {
                      width: `${pct}%`,
                      backgroundColor: toneColor(t, item.tone ?? "accent"),
                      transformOrigin: startOrigin(),
                      transform: [{ scaleX: grow }],
                    },
                  ]}
                />
              ) : null}
            </View>
            <SoneText
              mono
              numeric
              numberOfLines={1}
              onLayout={measure("value")}
              style={[s.value, { minWidth: cols.value }]}
            >
              {item.valueLabel ?? format(item.value)}
            </SoneText>
          </View>
        );
      })}
    </View>
  );
}
