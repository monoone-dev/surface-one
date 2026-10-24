import { useMemo, useState, type ReactElement } from "react";
import {
  Animated,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  donutChartModel,
  formatChartNumber,
  type SoneDonutChartSegmentLike,
} from "@surface-one/core/chart";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { toneColor, useEnterProgress } from "../../utils/chart";
import { SoneChartLegend } from "../chart-legend";

/** A segment of a donut chart: `{ key, label, value, tone }`. */
export type SoneDonutChartSegment = SoneDonutChartSegmentLike;
export type SoneDonutChartFormat = (value: number) => string;

export interface SoneDonutChartProps extends Omit<ViewProps, "style"> {
  /** The parts, clockwise from 12 o'clock; zero and negative values draw nothing. */
  readonly segments?: readonly SoneDonutChartSegment[];
  /** The ring's diameter. */
  readonly size?: number;
  /** The ring's width as a part of its radius: 0.3 by default, 1 draws a pie. */
  readonly thickness?: number;
  /** The gap between neighbouring segments, in degrees. */
  readonly padAngle?: number;
  /** The caption under the centre value (default: the `donutChartTotal` message). */
  readonly label?: string;
  /** The centre value at rest; default: the formatted total. */
  readonly centerValue?: string | null;
  readonly legend?: boolean;
  /** Formats values (default: a number in the `numberLocale` message's locale). */
  readonly valueFormat?: SoneDonutChartFormat | null;
  readonly style?: StyleProp<ViewStyle>;
}

const NONE: readonly never[] = [];

/**
 * `<sone-donut-chart>` — the parts of a whole as a ring drawn with react-native-svg: one
 * segment per part, clockwise from 12 o'clock, the total (or the pressed segment) in the
 * centre and a legend. The ring is one `img` named by `aria-label` and every part
 * (“Visitors: Chrome: 275 (39%), Safari: 200 (28%)”), like the stacked bar; a press on a
 * segment writes it in the centre.
 */
export function SoneDonutChart({
  segments = NONE,
  size = 200,
  thickness = 0.3,
  padAngle = 1,
  label,
  centerValue = null,
  legend = true,
  valueFormat = null,
  "aria-label": ariaLabel,
  style,
  ...rest
}: SoneDonutChartProps): ReactElement {
  const m = useSoneMessages();
  const { tokens: t, reduceMotion } = useSoneTheme();
  const enter = useEnterProgress(t.motionEnterDur, t.easeSpring, reduceMotion);
  const locale = m.numberLocale;
  const [shown, setShown] = useState<number | null>(null);

  const model = useMemo(
    () =>
      donutChartModel({
        segments,
        thickness,
        padAngle,
        locale,
        valueFormat: valueFormat ?? ((n) => formatChartNumber(n, locale)),
      }),
    [segments, thickness, padAngle, locale, valueFormat],
  );
  const slice =
    shown !== null && shown < model.drawn.length ? model.drawn[shown] : null;
  const center = slice
    ? { value: slice.valueText, label: slice.label }
    : {
        value: centerValue ?? model.totalText,
        label: label ?? m.donutChartTotal,
      };

  // One image named by every part, like the stacked bar: “Visitors: Chrome: 275 (30%), …”.
  const parts = model.drawn.map((d) => d.summary).join(", ");
  const prefix = (ariaLabel ?? "").trim();
  const summary = [prefix, parts || model.totalText].filter(Boolean).join(": ");

  const s = useSoneStyles(({ tokens }) => ({
    root: { alignItems: "center", gap: tokens.space4 } satisfies ViewStyle,
    center: {
      position: "absolute",
      top: 0,
      bottom: 0,
      start: 0,
      end: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.space1,
    } satisfies ViewStyle,
  }));

  return (
    <View {...rest} style={[s.root, style]}>
      <View
        role="img"
        accessible
        aria-label={summary}
        style={{ width: size, height: size, maxWidth: "100%" }}
      >
        <Animated.View style={{ flex: 1, opacity: enter }}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            {model.drawn.map((d, i) => (
              <Path
                key={d.key}
                d={d.path}
                fill={toneColor(t, d.tone, t.accent)}
                opacity={shown !== null && shown !== i ? 0.45 : 1}
                onPress={() => setShown(shown === i ? null : i)}
              />
            ))}
          </Svg>
        </Animated.View>
        {thickness < 0.75 ? (
          <View style={s.center} aria-hidden pointerEvents="none">
            <SoneText size="2xl" weight="semibold" numeric>
              {center.value}
            </SoneText>
            <SoneText size="xs" tone="secondary">
              {center.label}
            </SoneText>
          </View>
        ) : null}
      </View>
      {legend && segments.length > 0 ? (
        <SoneChartLegend
          shape="square"
          items={model.slices.map((x) => ({
            key: x.key,
            label: x.label,
            tone: x.tone,
            value: x.valueText,
          }))}
        />
      ) : null}
    </View>
  );
}
