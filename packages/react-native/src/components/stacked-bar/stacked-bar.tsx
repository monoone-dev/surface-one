import {
  Animated,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { chartTone, formatChartNumber } from "@surface-one/core/chart";
import { nonNegative } from "@surface-one/core/numbers";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { startOrigin, toneColor, useEnterProgress } from "../../utils/chart";
import { SoneChartLegend } from "../chart-legend";

export interface SoneStackedBarSegment {
  key: string;
  label: string;
  value: number;
  tone?: string;
}
export type SoneStackedBarSize = "sm" | "md" | "lg";
export type SoneStackedBarValueFn = (value: number) => string;

export interface SoneStackedBarProps extends Omit<ViewProps, "style"> {
  readonly segments?: readonly SoneStackedBarSegment[];
  /** The whole; above the sum, the rest stays the empty track. */
  readonly max?: number | null;
  readonly showLegend?: boolean;
  readonly size?: SoneStackedBarSize;
  readonly locale?: string | null;
  /** Formats a value in the summary and legend; default: a localized number. */
  readonly valueLabel?: SoneStackedBarValueFn | null;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-stacked-bar>` — one bar split into the parts of a whole; `max` above the sum
 * leaves the rest as the empty track. The bar is an `img` named by a generated summary
 * (prefixed with `aria-label`); `showLegend` adds a `SoneChartLegend`.
 */
export function SoneStackedBar({
  segments = [],
  max = null,
  showLegend = false,
  size = "md",
  locale: localeProp = null,
  valueLabel = null,
  "aria-label": ariaLabel,
  style,
  ...rest
}: SoneStackedBarProps) {
  const m = useSoneMessages();
  const { tokens: t, reduceMotion } = useSoneTheme();
  const grow = useEnterProgress(t.durationGrowLg, t.easeSpring, reduceMotion);
  const locale = localeProp || m.numberLocale;
  const format: SoneStackedBarValueFn =
    valueLabel ?? ((v: number) => formatChartNumber(v, locale));
  const parts = segments
    .map((s, i) => ({
      ...s,
      value: nonNegative(s.value),
      tone: s.tone || chartTone(i),
    }))
    .filter((s) => s.value > 0);
  const total = parts.reduce((n, s) => n + s.value, 0);
  const hasMax = max !== null && Number.isFinite(max) && max > 0;
  const scale = hasMax && max > total ? max : total;

  // Each part runs from the start to its cumulative end; earlier parts sit on top.
  let run = 0;
  const geometry =
    scale <= 0
      ? []
      : parts.map((s, i) => {
          run += s.value;
          return {
            key: s.key,
            end: Math.min(100, (run / scale) * 100),
            color: toneColor(t, s.tone, t.chart1),
            z: parts.length - i,
            gap: i < parts.length - 1,
          };
        });

  const prefix = (ariaLabel ?? "").trim()
    ? `${(ariaLabel ?? "").trim()}: `
    : "";
  let summary: string;
  if (parts.length === 0 || scale <= 0) summary = prefix + m.stackedBarEmpty;
  else {
    const pct = (v: number) =>
      formatChartNumber(v / scale, locale, {
        style: "percent",
        maximumFractionDigits: 0,
      });
    const list = parts
      .map((s) => m.stackedBarPart(s.label, format(s.value), pct(s.value)))
      .join(", ");
    const sum = format(total);
    const whole = hasMax
      ? m.stackedBarOf(sum, format(max))
      : m.stackedBarTotal(sum);
    summary = `${prefix}${list}; ${whole}`;
  }

  const s = useSoneStyles(
    ({ tokens }) => ({
      root: {
        gap: tokens.space3,
        width: "100%",
        minWidth: 0,
      } satisfies ViewStyle,
      track: {
        position: "relative",
        width: "100%",
        height:
          size === "sm"
            ? tokens.progressH
            : size === "lg"
              ? tokens.progressHMd * 2
              : tokens.progressHMd,
        overflow: "hidden",
        borderRadius: tokens.radiusPill,
        backgroundColor: tokens.trackBg,
        boxShadow: `inset 0px 0px 0px ${tokens.borderWidthThin}px ${tokens.trackBorder}`,
      } satisfies ViewStyle,
      segment: {
        position: "absolute",
        top: 0,
        bottom: 0,
        start: 0,
      } satisfies ViewStyle,
      gap: {
        borderEndWidth: tokens.space1 / 2,
        borderEndColor: tokens.surfaceRaised,
      } satisfies ViewStyle,
    }),
    [size],
  );

  return (
    <View {...rest} style={[s.root, style]}>
      <View role="img" accessible aria-label={summary} style={s.track}>
        {geometry.map((g) => (
          <Animated.View
            key={g.key}
            style={[
              s.segment,
              g.gap && s.gap,
              {
                width: `${g.end}%`,
                backgroundColor: g.color,
                zIndex: g.z,
                transformOrigin: startOrigin(),
                transform: [{ scaleX: grow }],
              },
            ]}
          />
        ))}
      </View>
      {showLegend ? (
        <SoneChartLegend
          items={segments.map((seg, i) => ({
            key: seg.key,
            label: seg.label,
            tone: seg.tone || chartTone(i),
            value: format(nonNegative(seg.value)),
          }))}
          shape="square"
          locale={locale}
        />
      ) : null}
    </View>
  );
}
