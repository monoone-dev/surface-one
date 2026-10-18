import { useMemo, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  textChildren,
  useForeground,
} from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { alertBox, alertLook, type AlertVariant } from "../alert/alert";

export type BannerKind = "info" | "success" | "warning" | "danger";

const stroke = { stroke: "currentColor", strokeWidth: 1.5 } as const;
const RING = <Circle cx="8" cy="8" r="6.25" {...stroke} />;

const GLYPHS: Record<BannerKind, ReactNode> = {
  success: (
    <>
      {RING}
      <Path
        d="m5.4 8.2 1.8 1.8 3.4-3.6"
        {...stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  warning: (
    <>
      <Path
        d="M7.13 2.5a1 1 0 0 1 1.74 0l5.4 9.5a1 1 0 0 1-.87 1.5H2.6a1 1 0 0 1-.87-1.5l5.4-9.5Z"
        {...stroke}
        strokeLinejoin="round"
      />
      <Path d="M8 6.2v3" {...stroke} strokeLinecap="round" />
      <Circle cx="8" cy="11.3" r="0.85" fill="currentColor" />
    </>
  ),
  danger: (
    <>
      {RING}
      <Path d="M8 4.9v3.5" {...stroke} strokeLinecap="round" />
      <Circle cx="8" cy="10.9" r="0.85" fill="currentColor" />
    </>
  ),
  info: (
    <>
      {RING}
      <Path d="M8 7.4v3.7" {...stroke} strokeLinecap="round" />
      <Circle cx="8" cy="5.05" r="0.85" fill="currentColor" />
    </>
  ),
};

export interface SoneBannerGlyphProps {
  readonly kind?: BannerKind;
  /** dp; default: the control icon size. */
  readonly size?: number;
  /** The ink; default: the inherited one. */
  readonly color?: string;
}

/** The glyph of a banner kind (decorative) — for other status surfaces such as `SoneToaster`. */
export function SoneBannerGlyph({
  kind = "info",
  size,
  color,
}: SoneBannerGlyphProps) {
  const t = useSoneTheme().tokens;
  const fg = useForeground();
  const px = size ?? t.controlIcon;
  return (
    <Svg
      viewBox="0 0 16 16"
      width={px}
      height={px}
      fill="none"
      color={color ?? fg.color}
      aria-hidden
    >
      {GLYPHS[kind] ?? GLYPHS.info}
    </Svg>
  );
}

export interface SoneBannerProps extends ViewProps {
  readonly kind?: BannerKind;
  /** An opaque overlay banner: overlay surface, strong or status border, large shadow. */
  readonly floating?: boolean;
}

/**
 * `<sone-banner>` — a one-line alert with its kind's glyph; `danger` / `warning` are
 * announced at once (`role="alert"`), the others politely. `floating` makes it an
 * opaque overlay banner.
 */
export function SoneBanner({
  kind = "info",
  floating = false,
  style,
  children,
  ...rest
}: SoneBannerProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const variant: AlertVariant = kind === "danger" ? "destructive" : kind;
  const look = useMemo(() => alertLook(theme, variant), [theme, variant]);
  const urgent = kind === "danger" || kind === "warning";
  const hue = {
    danger: t.danger,
    warning: t.warning,
    success: t.success,
    info: null,
  }[kind];
  return (
    <View
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      {...rest}
      style={[
        alertBox(theme, look),
        floating && {
          borderColor: hue ?? t.borderStrong,
          backgroundColor: t.surfaceOverlay,
          ...shadow(t.shadowLg),
        },
        style,
      ]}
    >
      <Svg
        viewBox="0 0 16 16"
        width={t.controlIcon}
        height={t.controlIcon}
        fill="none"
        color={look.icon}
        aria-hidden
        style={{ marginTop: t.space1 / 2 }}
      >
        {GLYPHS[kind] ?? GLYPHS.info}
      </Svg>
      <SoneForegroundProvider
        value={{
          color: floating ? t.textPrimary : look.color,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          iconSize: t.controlIcon,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>{textChildren(children)}</View>
      </SoneForegroundProvider>
    </View>
  );
}
