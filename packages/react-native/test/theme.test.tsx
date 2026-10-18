import { render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it } from "vitest";

import {
  SONE_ACCENTS,
  SONE_DEFAULT_THEME,
  SoneText,
  SurfaceOneProvider,
  minimalist as baseSkin,
  resolveTokens,
  useSoneTheme,
} from "@surface-one/react-native";
import * as skins from "@surface-one/react-native/skins";

// @ts-expect-error — a plain .mjs module of the repo scripts, untyped on purpose.
import { convert, toColor } from "../../../scripts/lib/css-native.mjs";

const SKINS = [
  skins.minimalist,
  skins.studio,
  skins.paper,
  skins.neumorphism,
  skins.material,
  skins.surface,
];

describe("css → React Native values", () => {
  it("computes oklch() and color-mix() into sRGB", () => {
    expect(toColor("oklch(0.205 0 0)")).toBe("#171717");
    expect(toColor("oklch(68.5% 0.169 237.323)")).toBe("#00a6f4");
    expect(toColor("oklch(0.708 0 0 / 50%)")).toBe("rgba(161, 161, 161, 0.5)");
    expect(
      toColor("color-mix(in oklch, oklch(0.205 0 0) 90%, transparent)"),
    ).toBe("rgba(23, 23, 23, 0.9)");
    expect(toColor("color-mix(in srgb, #ffffff 50%, #000000)")).toBe("#808080");
    expect(toColor("rgb(0 0 0 / 0.1)")).toBe("rgba(0, 0, 0, 0.1)");
  });

  it("evaluates lengths, shadows and the rest", () => {
    expect(convert("calc(10px * 0.8)")).toEqual({ kind: "length", value: 8 });
    expect(convert("0.875rem")).toEqual({ kind: "length", value: 14 });
    expect(convert("min(75vw, 24rem)")).toBeNull();
    expect(convert("-0.01em", "--btn-tracking")).toEqual({
      kind: "em",
      value: -0.01,
    });
    expect(convert("0 0 #0000", "--btn-shadow")).toEqual({
      kind: "shadow",
      value: "",
    });
    expect(convert("0 1px 3px 0 rgb(0 0 0 / 0.1)", "--card-shadow")).toEqual({
      kind: "shadow",
      value: "0px 1px 3px 0px rgba(0, 0, 0, 0.1)",
    });
    expect(convert('"Geist", system-ui', "--font-sans")).toEqual({
      kind: "font",
      value: "Geist",
    });
    expect(convert("48px 24px")).toEqual({
      kind: "box",
      value: [48, 24, 48, 24],
    });
  });
});

describe("the generated skins", () => {
  it("give every skin at least the base tokens", () => {
    const keys = Object.keys(baseSkin.light);
    expect(keys.length).toBeGreaterThan(500);
    for (const skin of SKINS)
      expect(keys.filter((k) => !(k in skin.light))).toEqual([]);
  });

  it("only hold React Native values", () => {
    const bad = /oklch|color-mix|var\(|calc\(|rem\b/;
    for (const skin of SKINS)
      for (const value of Object.values(skin.light))
        if (typeof value === "string") expect(value).not.toMatch(bad);
  });

  it("resolve dark mode and accents on top of light", () => {
    const light = resolveTokens(skins.studio, "light");
    const dark = resolveTokens(skins.studio, "dark");
    expect(dark.surfaceBase).not.toBe(light.surfaceBase);
    expect(dark.space4).toBe(light.space4);
    for (const accent of SONE_ACCENTS) {
      const t = resolveTokens(skins.studio, "light", accent);
      expect(t.accent).not.toBe(light.accent);
    }
    expect(
      resolveTokens(skins.studio, "light", null, { accent: "#ff0000" }).accent,
    ).toBe("#ff0000");
  });
});

describe("SurfaceOneProvider", () => {
  function Probe() {
    const theme = useSoneTheme();
    return (
      <Text testID="probe">{`${theme.skin} ${theme.scheme} ${theme.accent ?? "-"}`}</Text>
    );
  }

  it("defaults to Minimalist light without a provider", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("minimalist light -");
    expect(SONE_DEFAULT_THEME.tokens.accent).toBe(
      resolveTokens(baseSkin, "light").accent,
    );
  });

  it("hands its skin, mode and accent down", () => {
    render(
      <SurfaceOneProvider skin={skins.paper} colorMode="dark" accent="pink">
        <Probe />
        <SoneText testID="text">Hello</SoneText>
      </SurfaceOneProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("paper dark pink");
    const ink = resolveTokens(skins.paper, "dark", "pink").textPrimary;
    const color = getComputedStyle(screen.getByTestId("text")).color;
    expect(color.replace(/\s/g, "")).toBe(hexToRgb(ink));
  });
});

function hexToRgb(hex: string): string {
  if (!hex.startsWith("#")) return hex.replace(/\s/g, "");
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return `rgb(${n(1)},${n(3)},${n(5)})`;
}
