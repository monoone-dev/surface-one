import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";

import { useSoneTheme, type SoneTheme } from "./context";
import { em, fontFamily, weight } from "./style";

/**
 * What text and icons inside a component inherit — React Native has no CSS inheritance,
 * so a button, a badge or an alert hands its ink, size and weight down through this
 * context, and `SoneText` / `SoneIcon` read it (the twin of `color: currentColor`).
 */
export interface SoneForeground {
  readonly color: string;
  readonly fontSize: number;
  readonly fontWeight?: TextStyle["fontWeight"];
  readonly fontFamily?: string;
  readonly letterSpacing?: number;
  readonly lineHeight?: number;
  readonly textTransform?: TextStyle["textTransform"];
  readonly fontVariant?: TextStyle["fontVariant"];
  /** The size `SoneIcon` draws at. */
  readonly iconSize: number;
}

const ForegroundContext = createContext<SoneForeground | null>(null);

/** The body text of a theme: `--text-primary`, `--font-size-md`, `--leading-body`. */
export function bodyForeground(theme: SoneTheme): SoneForeground {
  const t = theme.tokens;
  return {
    color: t.textPrimary,
    fontSize: t.fontSizeMd,
    lineHeight: Math.round(t.fontSizeMd * t.leadingBody),
    fontFamily: fontFamily(theme),
    letterSpacing: em(t.trackingBody, t.fontSizeMd),
    iconSize: t.controlIcon,
  };
}

/** The inherited foreground (the body text when no component set one). */
export function useForeground(): SoneForeground {
  const theme = useSoneTheme();
  const own = useContext(ForegroundContext);
  return useMemo(() => own ?? bodyForeground(theme), [own, theme]);
}

export interface SoneForegroundProviderProps {
  /** What changes for the subtree; the rest is inherited. */
  readonly value: Partial<SoneForeground>;
  readonly children?: ReactNode;
}

/** Sets the ink, size and weight its text and icons inherit. */
export function SoneForegroundProvider({
  value,
  children,
}: SoneForegroundProviderProps) {
  const outer = useForeground();
  const merged = useMemo(() => {
    const next: Record<string, unknown> = { ...outer };
    for (const [k, v] of Object.entries(value))
      if (v !== undefined) next[k] = v;
    // A new size without a new line height keeps the ratio sensible.
    if (value.fontSize !== undefined && value.lineHeight === undefined)
      delete next.lineHeight;
    return next as unknown as SoneForeground;
  }, [outer, value]);
  return (
    <ForegroundContext.Provider value={merged}>
      {children}
    </ForegroundContext.Provider>
  );
}

export type SoneTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "destructive"
  | "success"
  | "warning";

export type SoneTextSize =
  "3xs" | "2xs" | "xs" | "sm" | "md" | "base" | "lg" | "xl" | "2xl" | "3xl";

export type SoneTextWeight = "normal" | "medium" | "semibold" | "bold";

export interface SoneTextProps extends TextProps {
  /** A themed ink instead of the inherited one. */
  readonly tone?: SoneTextTone;
  /** A step of the type scale (`--font-size-*`) instead of the inherited size. */
  readonly size?: SoneTextSize;
  readonly weight?: SoneTextWeight;
  /** The theme's monospace family. */
  readonly mono?: boolean;
  /** Tabular figures, for numbers that line up. */
  readonly numeric?: boolean;
  readonly style?: StyleProp<TextStyle>;
}

const SIZE_TOKEN = {
  "3xs": "fontSize3xs",
  "2xs": "fontSize2xs",
  xs: "fontSizeXs",
  sm: "fontSizeSm",
  md: "fontSizeMd",
  base: "fontSizeBase",
  lg: "fontSizeLg",
  xl: "fontSizeXl",
  "2xl": "fontSize2xl",
  "3xl": "fontSize3xl",
} as const;

const WEIGHT_TOKEN = {
  normal: "fontWeightNormal",
  medium: "fontWeightMedium",
  semibold: "fontWeightSemibold",
  bold: "fontWeightBold",
} as const;

const TONE_TOKEN = {
  primary: "textPrimary",
  secondary: "textSecondary",
  muted: "textMuted",
  accent: "accentText",
  destructive: "dangerText",
  success: "successText",
  warning: "warningText",
} as const;

/**
 * Text in the inherited foreground — inside a button it is the button's label ink and
 * size, on its own the body text. `tone`, `size`, `weight` and `mono` pick theme values.
 */
export function SoneText({
  tone,
  size,
  weight: w,
  mono = false,
  numeric = false,
  style,
  ...rest
}: SoneTextProps) {
  const theme = useSoneTheme();
  const fg = useForeground();
  const t = theme.tokens;
  const fontSize = size ? t[SIZE_TOKEN[size]] : fg.fontSize;
  const own: TextStyle = {
    color: tone ? t[TONE_TOKEN[tone]] : fg.color,
    fontSize,
    fontWeight: w ? weight(t[WEIGHT_TOKEN[w]]) : fg.fontWeight,
    fontFamily: mono ? fontFamily(theme, "mono") : fg.fontFamily,
    letterSpacing: fg.letterSpacing,
    lineHeight: size ? undefined : fg.lineHeight,
    textTransform: fg.textTransform,
    fontVariant: numeric ? ["tabular-nums"] : fg.fontVariant,
  };
  for (const key of Object.keys(own) as (keyof TextStyle)[])
    if (own[key] === undefined) delete own[key];
  return <Text {...rest} style={[own, style]} />;
}

/**
 * Children with every bare string or number wrapped in `SoneText` (React Native draws
 * text only inside `<Text>`); elements pass through.
 */
export function textChildren(children: ReactNode): ReactNode {
  const parts = Children.toArray(children);
  if (parts.every((c) => isValidElement(c))) return children;
  return parts.map((c, i) =>
    typeof c === "string" || typeof c === "number" ? (
      <SoneText key={`t${i}`}>{c}</SoneText>
    ) : (
      c
    ),
  );
}
