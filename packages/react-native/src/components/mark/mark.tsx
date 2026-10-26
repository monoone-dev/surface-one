import { useId, type ReactElement } from "react";
import { View, type ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import type { MarkSize, MarkTone } from "@surface-one/core/mark";

import { useSoneTheme } from "../../theme/context";
import { SoneIcon, type ShellIcon } from "../icon/icon";

export type { MarkSize, MarkTone } from "@surface-one/core/mark";
export { MARK_TONES } from "@surface-one/core/mark";

export interface SoneMarkProps extends ViewProps {
  readonly icon?: ShellIcon;
  readonly tone?: MarkTone;
  /** `sm` (20), `md` (28), `lg` (40) or a size in dp. */
  readonly size?: MarkSize;
  /** The accessible name; leave it out when text beside the mark already names it. */
  readonly label?: string | null;
}

const capitalise = (tone: MarkTone): string =>
  tone.charAt(0).toUpperCase() + tone.slice(1);

/**
 * `<sone-mark>` — an app or source mark: a small rounded tile with a gradient `tone` and a
 * white glyph. Decorative unless it has a `label` (then `role="img"`).
 */
export function SoneMark({
  icon = "layout-grid",
  tone = "brand",
  size = "md",
  label = null,
  style,
  ...rest
}: SoneMarkProps): ReactElement {
  const t = useSoneTheme().tokens;
  const id = `sone-mark-${useId().replace(/[^\w-]/g, "")}`;
  const px =
    typeof size === "number"
      ? size
      : { sm: t.markSizeSm, md: t.markSizeMd, lg: t.markSizeLg }[size];
  const radius = px * t.markRadiusRatio;
  const key = capitalise(tone);
  const tones = t as unknown as Readonly<Record<string, string>>;
  const from = tones[`mark${key}From`];
  const to = tones[`mark${key}To`];
  return (
    <View
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
      style={[
        {
          width: px,
          height: px,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Svg
        width={px}
        height={px}
        style={{ position: "absolute", top: 0, left: 0 }}
        aria-hidden
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect
          x={0.5}
          y={0.5}
          width={px - 1}
          height={px - 1}
          rx={radius}
          fill={`url(#${id})`}
          stroke={t.markEdge}
          strokeWidth={t.borderWidthThin}
        />
      </Svg>
      <SoneIcon name={icon} size={px * t.markIconRatio} color={t.markFg} />
    </View>
  );
}
