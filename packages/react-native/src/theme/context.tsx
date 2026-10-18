import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";

import { SoneMessagesProvider, type SoneMessages } from "../context/messages";
import { minimalist } from "./generated/minimalist";
import type { SoneAccent, SoneTokens } from "./generated/tokens";
import {
  resolveTokens,
  type SoneColorScheme,
  type SoneSkin,
  type SoneSkinName,
} from "./skin";

/** `light`, `dark`, or `system` (follows the device) — `data-theme` on the web. */
export type SoneColorMode = SoneColorScheme | "system";

/** The font families the components set; `undefined` keeps the platform font. */
export interface SoneFonts {
  readonly sans?: string;
  readonly mono?: string;
}

/** Everything a component styles itself from. */
export interface SoneTheme {
  readonly skin: SoneSkinName;
  readonly scheme: SoneColorScheme;
  readonly accent: SoneAccent | null;
  readonly tokens: SoneTokens;
  readonly fonts: SoneFonts;
  /** The device asks for reduced motion: animations jump to their end state. */
  readonly reduceMotion: boolean;
}

/** Minimalist, light, the default accent, the platform font — the theme with no provider. */
export const SONE_DEFAULT_THEME: SoneTheme = {
  skin: minimalist.name,
  scheme: "light",
  accent: null,
  tokens: resolveTokens(minimalist, "light"),
  fonts: {},
  reduceMotion: false,
};

export const SoneThemeContext = createContext<SoneTheme>(SONE_DEFAULT_THEME);

/**
 * The theme of the nearest `SurfaceOneProvider` (Minimalist light without one — still
 * following the device's reduce-motion setting).
 */
export function useSoneTheme(): SoneTheme {
  const theme = useContext(SoneThemeContext);
  const standalone = theme === SONE_DEFAULT_THEME;
  const reduceMotion = useReducedMotion(standalone);
  return useMemo(
    () =>
      standalone && reduceMotion !== theme.reduceMotion
        ? { ...theme, reduceMotion }
        : theme,
    [theme, standalone, reduceMotion],
  );
}

/** The resolved tokens: `useSoneTokens().accent`, `.space4`, `.radiusMd` … */
export function useSoneTokens(): SoneTokens {
  return useContext(SoneThemeContext).tokens;
}

/**
 * Styles derived from the theme, recomputed only when the theme (or a dep) changes:
 * `const s = useSoneStyles((t) => ({ box: { padding: t.tokens.space4 } }))`.
 */
export function useSoneStyles<T>(
  factory: (theme: SoneTheme) => T,
  deps: readonly unknown[] = [],
): T {
  const theme = useSoneTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(theme), [theme, ...deps]);
}

/** The device's reduce-motion setting, kept current (`enabled: false` skips the listener). */
export function useReducedMotion(enabled = true): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => alive && setReduce(on))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (on: boolean) => setReduce(on),
    );
    return () => {
      alive = false;
      sub?.remove();
    };
  }, [enabled]);
  return reduce;
}

export interface SurfaceOneProviderProps {
  /** The skin (default Minimalist): `import { studio } from "@surface-one/react-native/skins"`. */
  readonly skin?: SoneSkin;
  /** `light`, `dark` or `system` (the default — follows the device). */
  readonly colorMode?: SoneColorMode;
  /** An accent palette instead of the skin's default. */
  readonly accent?: SoneAccent | null;
  /** Token overrides on top of the skin: `{ accent: "#7c3aed" }`. */
  readonly tokens?: Partial<SoneTokens>;
  /**
   * `"system"` (the default) keeps the platform font; `"skin"` uses the skin's families
   * (Geist, Figtree, …: load them first, e.g. with expo-font); or name your own.
   */
  readonly fonts?: "system" | "skin" | SoneFonts;
  /** Translations of the built-in strings (pass new ones on a locale switch). */
  readonly messages?: Partial<SoneMessages>;
  readonly children?: ReactNode;
}

/**
 * The app-wide theme — the twin of `data-skin` / `data-theme` / `data-accent` on the web
 * — and the translations: wrap the app once. Every component also works without it
 * (Minimalist, light, English).
 */
export function SurfaceOneProvider({
  skin = minimalist,
  colorMode = "system",
  accent = null,
  tokens: overrides,
  fonts = "system",
  messages,
  children,
}: SurfaceOneProviderProps) {
  const device = useColorScheme();
  const reduceMotion = useReducedMotion();
  const scheme: SoneColorScheme =
    colorMode === "system" ? (device === "dark" ? "dark" : "light") : colorMode;
  const theme = useMemo<SoneTheme>(() => {
    const tokens = resolveTokens(skin, scheme, accent, overrides);
    return {
      skin: skin.name,
      scheme,
      accent,
      tokens,
      fonts:
        fonts === "system"
          ? {}
          : fonts === "skin"
            ? { sans: tokens.fontSans, mono: tokens.fontMono }
            : fonts,
      reduceMotion,
    };
  }, [skin, scheme, accent, overrides, fonts, reduceMotion]);
  const tree = (
    <SoneThemeContext.Provider value={theme}>
      {children}
    </SoneThemeContext.Provider>
  );
  return messages ? (
    <SoneMessagesProvider messages={messages}>{tree}</SoneMessagesProvider>
  ) : (
    tree
  );
}
