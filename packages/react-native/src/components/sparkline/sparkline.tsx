import {
  Animated,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import {
  formatChartNumber,
  niceCeiling,
  sparklineGeometry,
  type SoneChartTone,
  type SoneSparklineType,
} from "@surface-one/core/chart";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { toneColor, useEnterProgress } from "../../utils/chart";

export interface SoneSparklineProps extends Omit<ViewProps, "style"> {
  readonly values?: readonly number[];
  readonly type?: SoneSparklineType;
  readonly min?: number;
  /** The top of the scale; default: a nice ceiling of the values. */
  readonly max?: number | null;
  readonly tone?: SoneChartTone;
  readonly decorative?: boolean;
  /** The accessible name when not decorative; default: the `sparklineSummary` message. */
  readonly summary?: string | null;
  /** The size; the default is the full width and `--space-6` tall. */
  readonly style?: StyleProp<ViewStyle>;
}

const NO_VALUES: readonly number[] = [];

/**
 * `<sone-sparkline>` — a word-sized line, area, bar or heat chart in one stretched
 * `Svg`. Decorative (hidden from assistive tech) by default; `decorative={false}` makes
 * it an `img` named by `summary` or the `sparklineSummary` message.
 */
export function SoneSparkline({
  values = NO_VALUES,
  type = "line",
  min = 0,
  max = null,
  tone = "accent",
  decorative = true,
  summary = null,
  style,
  ...rest
}: SoneSparklineProps) {
  const messages = useSoneMessages();
  const { tokens: t, reduceMotion } = useSoneTheme();
  const enter = useEnterProgress(t.motionEnterDur, t.ease, reduceMotion);
  const top =
    max !== null && Number.isFinite(max) ? max : niceCeiling(values, 4);
  const g = sparklineGeometry(values, type, min, top);
  const color = toneColor(t, tone, t.accent);

  let label: string | undefined;
  if (!decorative) {
    if (summary) label = summary;
    else {
      const finite = values.filter((v) => Number.isFinite(v));
      const peak = finite.reduce((a, b) => Math.max(a, b), -Infinity);
      const total = finite.reduce((a, b) => a + b, 0);
      label = messages.sparklineSummary(
        finite.length,
        formatChartNumber(finite.length ? peak : 0, messages.numberLocale),
        formatChartNumber(total, messages.numberLocale),
      );
    }
  }

  // Heat cells read the sequential ramp, not the tone.
  const ramp = [
    t.trackBg,
    t.chartSeq1,
    t.chartSeq2,
    t.chartSeq3,
    t.chartSeq4,
    t.chartSeq5,
  ];
  const marks =
    type === "heat" ? (
      g.cells.map((cell, i) => (
        <Rect
          key={i}
          x={cell.x}
          y={0}
          width={cell.width}
          height={100}
          fill={ramp[cell.level]}
        />
      ))
    ) : type === "bar" ? (
      g.bars ? (
        <Path d={g.bars} fill={color} />
      ) : null
    ) : (
      <>
        {/* The area is a wash under the line; the line carries the contrast. */}
        {g.area ? <Path d={g.area} fill={color} fillOpacity={0.16} /> : null}
        {g.line ? (
          <Path
            d={g.line}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </>
    );

  return (
    <Animated.View
      role={decorative ? undefined : "img"}
      accessible={!decorative}
      aria-label={label}
      aria-hidden={decorative || undefined}
      {...rest}
      style={[
        { width: "100%", minWidth: 0, height: t.space6, opacity: enter },
        style,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        {marks}
      </Svg>
    </Animated.View>
  );
}
