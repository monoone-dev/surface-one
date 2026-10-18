import type { TextStyle, ViewStyle } from "react-native";

import type { SoneTheme } from "./context";

type FontWeight = NonNullable<TextStyle["fontWeight"]>;

/** A token weight (500, 550, 650 …) → the nearest React Native weight. */
export function weight(n: number): FontWeight {
  const step = Math.min(900, Math.max(100, Math.round(n / 100) * 100));
  return String(step) as FontWeight;
}

/** An em letter spacing token at a font size → dp. */
export function em(
  token: { readonly em: number } | number,
  fontSize: number,
): number {
  return typeof token === "number" ? token : token.em * fontSize;
}

/** A shadow token → `{ boxShadow }` (nothing for a skin that draws none). */
export function shadow(token: string | undefined): ViewStyle {
  return token ? { boxShadow: token } : {};
}

/** A 4-value padding token → React Native padding. */
export function padding(
  box: readonly [number, number, number, number],
): ViewStyle {
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = box;
  return { paddingTop, paddingRight, paddingBottom, paddingLeft };
}

/** The theme's family for running text (`undefined`: the platform font). */
export function fontFamily(
  theme: SoneTheme,
  kind: "sans" | "mono" = "sans",
): string | undefined {
  return theme.fonts[kind];
}

/** A web `text-transform` keyword the tokens carry → React Native's. */
export function textTransform(keyword: string): TextStyle["textTransform"] {
  return keyword === "uppercase" ||
    keyword === "lowercase" ||
    keyword === "capitalize"
    ? keyword
    : "none";
}
