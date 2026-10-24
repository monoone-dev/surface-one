import { useMemo, useState, type ReactElement } from "react";
import {
  Animated,
  Pressable,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  formatChartNumber,
  lineChartModel,
  lineChartTip,
  type SoneChartX,
  type SoneLineChartCurve,
  type SoneLineChartSeriesLike,
  type SoneLineChartXScale,
} from "@surface-one/core/chart";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { toneColor, useEnterProgress } from "../../utils/chart";
import { SoneChartLegend, SoneSwatch } from "../chart-legend";

export type {
  SoneChartX,
  SoneLineChartCurve,
  SoneLineChartXScale,
} from "@surface-one/core/chart";

/** A series of a line or area chart: the row key of its values, its name and colour. */
export type SoneLineChartSeries = SoneLineChartSeriesLike;
export type SoneLineChartXFormat = (x: SoneChartX, index: number) => string;
export type SoneLineChartFormat = (value: number) => string;

/** The props a line chart and an area chart share. */
export interface SoneSeriesChartProps<T extends object = object> extends Omit<
  ViewProps,
  "style"
> {
  /** The rows, left to right: each holds the x value (`xKey`) and one value per series. */
  readonly data?: readonly T[];
  /** The series: `{ key, label, tone }`, `key` naming the row property of its values. */
  readonly series?: readonly SoneLineChartSeries[];
  /** The row property of the x value. */
  readonly xKey?: string;
  /** `category` — evenly spaced; `time` — spaced by date (`Date`, epoch ms or ISO string). */
  readonly xScale?: SoneLineChartXScale;
  /** The label of an x value (axis, tooltip); default: the text, or a short date. */
  readonly xFormat?: SoneLineChartXFormat | null;
  /** At most this many x-axis labels (stepped back from the last one); 0 hides the axis. */
  readonly xTicks?: number;
  /** About this many value-axis steps. */
  readonly yTicks?: number;
  readonly yMin?: number | null;
  readonly yMax?: number | null;
  /** The plot height. */
  readonly height?: number;
  readonly curve?: SoneLineChartCurve;
  readonly stacked?: boolean;
  /** Draws a dot on every value (the pressed x value always shows its dots). */
  readonly dots?: boolean;
  readonly legend?: boolean;
  /** Formats values (default: a number in the `numberLocale` message's locale). */
  readonly valueFormat?: SoneLineChartFormat | null;
  readonly style?: StyleProp<ViewStyle>;
}

export interface SoneLineChartProps<
  T extends object = object,
> extends SoneSeriesChartProps<T> {
  /** Fills under each line. */
  readonly area?: boolean;
}

const NONE: readonly never[] = [];

/**
 * `<sone-line-chart>` — one or more series over categories or time, drawn with
 * react-native-svg: a value axis with round ticks and grid lines, straight or smoothed
 * lines that break at a missing value, dots, a legend and a tooltip. `area` fills under the
 * lines and `stacked` stacks them (what `SoneAreaChart` draws). Each x value is a pressable
 * `img` named by its values (“Jan: Desktop 186, Mobile 80”), so a screen reader walks the
 * data point by point; a press shows its tooltip.
 */
export function SoneLineChart<T extends object = object>({
  data = NONE,
  series = NONE,
  xKey = "x",
  xScale = "category",
  xFormat = null,
  xTicks = 6,
  yTicks = 4,
  yMin = null,
  yMax = null,
  height = 200,
  curve = "linear",
  area = false,
  stacked = false,
  dots = true,
  legend = true,
  valueFormat = null,
  style,
  ...rest
}: SoneLineChartProps<T>): ReactElement {
  const messages = useSoneMessages();
  const { tokens: t, reduceMotion } = useSoneTheme();
  const enter = useEnterProgress(t.motionEnterDur, t.ease, reduceMotion);
  const locale = messages.numberLocale;
  const [shown, setShown] = useState<number | null>(null);
  const [tipWidth, setTipWidth] = useState(0);

  const model = useMemo(
    () =>
      lineChartModel({
        data,
        series,
        xKey,
        xScale,
        xFormat,
        xTicks,
        yTicks,
        yMin,
        yMax,
        curve,
        area,
        stacked,
        locale,
        valueFormat: valueFormat ?? ((n) => formatChartNumber(n, locale)),
      }),
    [
      data,
      series,
      xKey,
      xScale,
      xFormat,
      xTicks,
      yTicks,
      yMin,
      yMax,
      curve,
      area,
      stacked,
      locale,
      valueFormat,
    ],
  );
  const col =
    shown !== null && shown < model.columns.length
      ? model.columns[shown]
      : null;
  const tip = col ? lineChartTip(col.x) : null;
  const dot = t.space1 * 1.5;
  const label = t.space16;

  const s = useSoneStyles(({ tokens }) => ({
    root: {
      gap: tokens.space3,
      width: "100%",
      minWidth: 0,
    } satisfies ViewStyle,
    frame: { flexDirection: "row", gap: tokens.space2 } satisfies ViewStyle,
    yAxis: { position: "relative" } satisfies ViewStyle,
    sizer: { height: 0, opacity: 0 },
    tick: { color: tokens.chartAxis },
    yTick: {
      position: "absolute",
      end: 0,
      marginBottom: -tokens.fontSize2xs * 0.75,
    } satisfies TextStyle,
    main: { flex: 1, minWidth: 0 } satisfies ViewStyle,
    plot: {
      position: "relative",
      borderBottomWidth: tokens.borderWidthThin,
      borderBottomColor: tokens.chartBaseline,
    } satisfies ViewStyle,
    fill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
    } satisfies ViewStyle,
    gridLine: {
      position: "absolute",
      start: 0,
      end: 0,
      borderTopWidth: tokens.borderWidthThin,
      borderTopColor: tokens.chartGrid,
      borderStyle: "dashed",
    } satisfies ViewStyle,
    cursor: {
      position: "absolute",
      top: 0,
      bottom: 0,
      borderStartWidth: tokens.borderWidthThin,
      borderStartColor: tokens.chartAxis,
      opacity: 0.5,
    } satisfies ViewStyle,
    col: { position: "absolute", top: 0, bottom: 0 } satisfies ViewStyle,
    tooltip: {
      position: "absolute",
      top: 0,
      gap: tokens.space1,
      minWidth: tokens.space16 * 2,
      padding: tokens.space2,
      borderWidth: tokens.borderWidthThin,
      borderColor: tokens.chartTooltipBorder,
      borderRadius: tokens.radiusSm,
      backgroundColor: tokens.chartTooltipBg,
      ...shadow(tokens.shadowLg),
    } satisfies ViewStyle,
    tipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.space2,
    } satisfies ViewStyle,
    xAxis: {
      position: "relative",
      height: tokens.fontSize2xs * 1.5,
      marginTop: tokens.space1,
    } satisfies ViewStyle,
    xTick: { position: "absolute", top: 0 } satisfies TextStyle,
  }));

  return (
    <View role="group" {...rest} style={[s.root, style]}>
      <View style={s.frame}>
        <View style={[s.yAxis, { height }]} aria-hidden>
          <SoneText size="2xs" mono numeric style={[s.tick, s.sizer]}>
            {model.widestY}
          </SoneText>
          {model.yTicks.map((y) => (
            <SoneText
              key={y.pct}
              size="2xs"
              mono
              numeric
              style={[s.tick, s.yTick, { bottom: `${y.pct}%` }]}
            >
              {y.label}
            </SoneText>
          ))}
        </View>
        <View style={s.main}>
          <View style={[s.plot, { height }]}>
            <View style={s.fill} aria-hidden pointerEvents="none">
              {model.yTicks.map((y) => (
                <View
                  key={y.pct}
                  style={[s.gridLine, { bottom: `${y.pct}%` }]}
                />
              ))}
            </View>
            <Animated.View
              style={[s.fill, { opacity: enter }]}
              aria-hidden
              pointerEvents="none"
            >
              <Svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
              >
                {model.paths.map((p) =>
                  p.area ? (
                    <Path
                      key={`area-${p.key}`}
                      d={p.area}
                      fill={toneColor(t, p.tone, t.accent)}
                      fillOpacity={0.2}
                    />
                  ) : null,
                )}
                {model.paths.map((p) => (
                  <Path
                    key={`line-${p.key}`}
                    d={p.line}
                    fill="none"
                    stroke={toneColor(t, p.tone, t.accent)}
                    strokeWidth={t.borderWidthThick}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </Svg>
            </Animated.View>
            {col ? (
              <View
                aria-hidden
                pointerEvents="none"
                style={[s.cursor, { left: `${col.x}%` }]}
              />
            ) : null}
            <View style={s.fill} aria-hidden pointerEvents="none">
              {model.paths.flatMap((p) =>
                p.points.flatMap((pt, i) =>
                  pt.value !== null && pt.y !== null && (dots || shown === i)
                    ? [
                        <View
                          key={`${p.key}-${i}`}
                          style={{
                            position: "absolute",
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                            width: shown === i ? dot * 1.5 : dot,
                            height: shown === i ? dot * 1.5 : dot,
                            marginLeft: -(shown === i ? dot * 1.5 : dot) / 2,
                            marginTop: -(shown === i ? dot * 1.5 : dot) / 2,
                            borderRadius: t.radiusPill,
                            backgroundColor: toneColor(t, p.tone, t.accent),
                          }}
                        />,
                      ]
                    : [],
                ),
              )}
            </View>
            {model.columns.map((c, i) => (
              <Pressable
                key={c.key}
                role="img"
                accessible
                aria-label={c.summary}
                aria-selected={shown === i}
                onPress={() => setShown(shown === i ? null : i)}
                style={[s.col, { left: `${c.left}%`, width: `${c.width}%` }]}
              />
            ))}
            {col && tip ? (
              <View
                aria-hidden
                pointerEvents="none"
                onLayout={(e: LayoutChangeEvent) =>
                  setTipWidth(Math.ceil(e.nativeEvent.layout.width))
                }
                style={[
                  s.tooltip,
                  {
                    left: `${tip.at}%`,
                    marginLeft:
                      tip.align === "start"
                        ? 0
                        : tip.align === "end"
                          ? -tipWidth
                          : -tipWidth / 2,
                  },
                ]}
              >
                <SoneText size="xs" weight="medium">
                  {col.label}
                </SoneText>
                {col.values.map((v) => (
                  <View key={v.key} style={s.tipRow}>
                    <SoneSwatch tone={v.tone} shape="square" />
                    <SoneText size="xs" tone="secondary" style={{ flex: 1 }}>
                      {v.label}
                    </SoneText>
                    <SoneText size="xs" mono numeric>
                      {v.value}
                    </SoneText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {xTicks > 0 ? (
            <View style={s.xAxis} aria-hidden>
              {model.xTicks.map((x) => (
                <SoneText
                  key={x.pct}
                  size="2xs"
                  mono
                  numberOfLines={1}
                  style={[
                    s.tick,
                    s.xTick,
                    x.align === "start"
                      ? { left: `${x.pct}%` }
                      : x.align === "end"
                        ? { right: `${100 - x.pct}%` }
                        : {
                            left: `${x.pct}%`,
                            width: label,
                            marginLeft: -label / 2,
                            textAlign: "center",
                          },
                  ]}
                >
                  {x.label}
                </SoneText>
              ))}
            </View>
          ) : null}
        </View>
      </View>
      {legend && series.length > 0 ? (
        <SoneChartLegend
          shape="square"
          items={model.paths.map((p) => ({
            key: p.key,
            label: p.label,
            tone: p.tone,
          }))}
        />
      ) : null}
    </View>
  );
}
