// The token definitions — the one source of the skins and accents. `npm run build:tokens`
// (packages/tokens/build.mjs) writes them out as src/themes/*.theme.scss and
// src/tokens/accents.css, compiles css/, and emits dist/tokens.json for scripts.
//
// The cascade they produce, lowest to highest:
//   base.light        :root                                    (minimalist light)
//   base.dark         :root[data-theme="dark"] (+ the system/no-attribute media duplicate)
//   base.darkAccent   … :not([data-accent]) — the default accent, beaten by a picked one
//   <skin>.light      :root[data-skin="<skin>"]   ← shared.light merged in first
//   <skin>.lightAccent, <skin>.dark, <skin>.darkAccent   as above, scoped to the skin
//   accents           :root[data-accent="<hue>"] (and its dark pair), after every skin
// A skin's light block also applies in dark mode (it outranks base.dark), so a skin only
// re-declares a token in `dark` when its dark value differs from its light one.
//
// Every block holds only what differs from what it would inherit: the build fails on a
// declaration that changes no resolved value, on a light value ≥4 skins repeat (it belongs in
// shared.mjs), on a dark-only token and on a var() reference to a token nothing defines.
import accents from "./accents.mjs";
import base from "./base.mjs";
import neumorphism from "./neumorphism.mjs";
import paper from "./paper.mjs";
import shared from "./shared.mjs";
import studio from "./studio.mjs";
import surface from "./surface.mjs";

export default {
  base,
  shared,
  /** In the order the theme files load (see themes/index.scss). */
  skins: { studio, paper, neumorphism, surface },
  accents,
};
