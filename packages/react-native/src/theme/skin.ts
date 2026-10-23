import type { SoneAccent, SoneTokens } from "./generated/tokens";

export type SoneSkinName =
  "minimalist" | "studio" | "paper" | "neumorphism" | "surface";

export type SoneColorScheme = "light" | "dark";

/**
 * One skin of @surface-one/tokens, resolved for React Native: `light` holds every token,
 * `dark` and each accent only what they change. Generated (src/theme/generated) — the
 * twin of `data-skin` on the web.
 */
export interface SoneSkin {
  readonly name: SoneSkinName;
  readonly light: SoneTokens;
  readonly dark: Partial<SoneTokens>;
  readonly accents: Readonly<
    Record<
      SoneAccent,
      {
        readonly light: Partial<SoneTokens>;
        readonly dark: Partial<SoneTokens>;
      }
    >
  >;
}

/**
 * The tokens of a skin in one colour scheme with one accent — what `data-skin`,
 * `data-theme` and `data-accent` resolve to on the web — plus any overrides.
 */
export function resolveTokens(
  skin: SoneSkin,
  scheme: SoneColorScheme,
  accent: SoneAccent | null = null,
  overrides?: Partial<SoneTokens>,
): SoneTokens {
  return {
    ...skin.light,
    ...(scheme === "dark" ? skin.dark : null),
    ...(accent ? skin.accents[accent]?.[scheme] : null),
    ...overrides,
  };
}
