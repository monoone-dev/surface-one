// @surface-one/stylelint-config — the SurfaceOne design-system rules for stylelint.
//
// A component reads var(--token); it never invents a colour, a spacing step, a radius, a
// shadow, a z-index, a border width, a blur or a duration of its own. Every rule below
// uses a stylelint core rule (no plugin) and carries a message naming the token to use.
//
// Token DEFINITION files (the skins and the scale that set --space-*, --radius-*, … to raw
// values) are the one place raw values belong: exempt them in the consuming repository's
// own config with `overrides` or `ignoreFiles`, never here.
//
//   // stylelint.config.mjs
//   export default { extends: ["@surface-one/stylelint-config"] };

// The parsers are imported, not named, so they resolve from this package (pnpm-safe).
import postcssHtml from "postcss-html";
import postcssScss from "postcss-scss";

/** Colour functions that build a raw colour. color-mix() over tokens stays allowed. */
const RAW_COLOR_FUNCTIONS = [
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
];

/** Properties whose lengths come from --space-* / --radius-* / --shadow-* / --font-size-* / --tracking-*.
 *  Structural sizes (width, height, min-*, max-*, inset, top, …) are not listed: they keep px. */
const SPACING =
  "/^(gap|row-gap|column-gap|grid-gap|grid-row-gap|grid-column-gap)$/";
const PADDING =
  "/^padding(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/";
const MARGIN =
  "/^margin(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/";
const RADIUS =
  "/^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/";
const SHADOW = "/^box-shadow$/";
const FONT_SIZE = "/^font-size$/";
const LETTER_SPACING = "/^letter-spacing$/";

/** border, border-top, border-inline-start, … and their -width longhands. */
const BORDER_WIDTH =
  "/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/";

const BACKDROP_FILTER = "/^(-webkit-)?backdrop-filter$/";
const Z_INDEX = "z-index";
const MOTION =
  "/^(transition|transition-duration|animation|animation-duration)$/";

const unitMessages = {
  [SPACING]: "gap takes a --space-* token (var(--space-2)), not raw px",
  [PADDING]: "padding takes a --space-* token (var(--space-3)), not raw px",
  [MARGIN]: "margin takes a --space-* token (var(--space-4)), not raw px",
  [RADIUS]:
    "border-radius takes a --radius-* token (var(--radius-md), var(--radius-pill)), not raw px",
  [SHADOW]:
    "box-shadow takes a --shadow-* or var(--focus-ring) token; a ring's width is var(--border-width-thin), var(--border-width-thick) or var(--halo-width), not raw px",
  [FONT_SIZE]:
    "font-size takes a --font-size-* token (var(--font-size-sm)), not raw px",
  [LETTER_SPACING]:
    "letter-spacing takes a --tracking-* token (var(--tracking-tight)), not raw px",
  [MOTION]:
    "durations are motion tokens: var(--transition) / var(--transition-fast) for hover and press (from the skin), a --duration-* step (var(--duration-pop), var(--duration-spin), …) or var(--motion-enter-dur) for everything else, not raw ms/s",
};

/** @type {import("stylelint").Config} */
export default {
  // Every escape hatch is a single, explained line:
  //   /* stylelint-disable-next-line <rule> -- why the raw value is structural */
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  overrides: [
    // Sass sources (and the Angular components' .scss) need the SCSS parser.
    { files: ["**/*.scss"], customSyntax: postcssScss },
    // Vue single-file components: the rules apply to their <style> blocks.
    { files: ["**/*.vue"], customSyntax: postcssHtml() },
  ],
  rules: {
    // --- Colour: every colour is a theme token (var(--text-primary), var(--surface-base), …).
    "color-no-hex": [
      true,
      {
        message:
          "No raw hex colours — use a theme colour token such as var(--text-primary), var(--surface-base) or var(--accent)",
      },
    ],
    "color-named": [
      "never",
      {
        message:
          "No named colours — use a theme colour token such as var(--text-primary) or var(--border); transparent and currentColor stay allowed",
      },
    ],
    "function-disallowed-list": [
      RAW_COLOR_FUNCTIONS,
      {
        message: (fn) =>
          `No raw ${fn}() colours — use a theme colour token (var(--accent)), or color-mix(in oklab, var(--accent) 20%, transparent) for a tint`,
      },
    ],

    // --- Spacing, radius, shadow, type size, tracking: no raw px (0 is fine).
    "declaration-property-unit-disallowed-list": [
      {
        [SPACING]: ["px"],
        [PADDING]: ["px"],
        [MARGIN]: ["px"],
        [RADIUS]: ["px"],
        [SHADOW]: ["px"],
        [FONT_SIZE]: ["px"],
        [LETTER_SPACING]: ["px"],
        [MOTION]: ["ms", "s"],
      },
      {
        message: (property, unit) => {
          for (const [pattern, text] of Object.entries(unitMessages)) {
            if (new RegExp(pattern.slice(1, -1)).test(property)) {
              return `${text} (${property}: …${unit})`;
            }
          }
          return `Raw ${unit} in ${property} — use a SurfaceOne token`;
        },
      },
    ],

    // --- Borders: the hairline is var(--border-width-thin), never 1px.
    // --- backdrop-filter: only the skin's scrim blur.
    // --- z-index: only the --z-* ladder.
    "declaration-property-value-allowed-list": [
      {
        [BACKDROP_FILTER]: [
          "none",
          "/^var\\(--scrim-blur\\)$/",
          "/^blur\\(var\\(--scrim-blur\\)\\)$/",
        ],
        [Z_INDEX]: [
          "0",
          "auto",
          "inherit",
          "initial",
          "unset",
          "revert",
          "revert-layer",
          "/^var\\(--z-[a-z0-9-]+\\)$/",
          // One step above or below a ladder rung, for a pair that must stack inside one layer.
          "/^calc\\(var\\(--z-[a-z0-9-]+\\) [+-] 1\\)$/",
        ],
      },
      {
        message: (property, value) =>
          property === "z-index"
            ? `z-index takes a --z-* token (var(--z-raised), var(--z-dropdown), var(--z-modal), …), not ${value}`
            : `${property} is reserved for the scrim: use blur(var(--scrim-blur)), not ${value}`,
      },
    ],
    "declaration-property-value-disallowed-list": [
      {
        [BORDER_WIDTH]: ["/(^|[\\s(,])1px\\b/"],
      },
      {
        message: (property, value) =>
          `The hairline is a token: write ${property}: var(--border-width-thin) solid …, not ${value}`,
      },
    ],
  },
};
