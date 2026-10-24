// The user-selectable accent palettes (`data-accent`). The generator writes them to
// src/tokens/accents.css, loaded after the skins so a chosen palette beats a skin's default.
export default {
  comment: `
/* The default accent lives in each skin's theme file, scoped :not([data-accent]); this
   file loads after themes.scss so a chosen palette always wins. Dark mode does not
   follow shadcn's <hue>-800+<hue>-50 dark pairing: --accent also serves as ink (links,
   icons, borders), and an 800 step is only ~2:1 on a dark ground. */`,

  /** The ramp step each hue's swatch (`--accent-option-<hue>`) shows, per mode. */
  option: { light: 700, dark: 400 },

  /**
   * Each hue: its Tailwind ramp, the shell's active-icon colour (a hand-tuned hex per hue and
   * mode, not a ramp step) and `textStep`, the ramp step of `--accent-text` in light mode —
   * 800 for every hue but blue, whose 700 already clears 4.5:1.
   */
  hues: {
    blue: {
      ramp: {
        50: "oklch(97% 0.014 254.604)",
        200: "oklch(88.2% 0.059 254.128)",
        300: "oklch(80.9% 0.105 251.813)",
        400: "oklch(70.7% 0.165 254.624)",
        500: "oklch(62.3% 0.214 259.815)",
        700: "oklch(48.8% 0.243 264.376)",
        800: "oklch(42.4% 0.199 265.638)",
        900: "oklch(37.9% 0.146 265.522)",
        950: "oklch(28.2% 0.091 267.935)",
      },
      icon: { light: "#2f7fdc", dark: "#6fb2ff" },
      textStep: 700,
    },
    teal: {
      ramp: {
        50: "oklch(98.4% 0.014 180.72)",
        200: "oklch(91% 0.096 180.426)",
        300: "oklch(85.5% 0.138 181.071)",
        400: "oklch(77.7% 0.152 181.912)",
        500: "oklch(70.4% 0.14 182.503)",
        700: "oklch(51.1% 0.096 186.391)",
        800: "oklch(43.7% 0.078 188.216)",
        900: "oklch(38.6% 0.063 188.416)",
        950: "oklch(27.7% 0.046 192.524)",
      },
      icon: { light: "#1a8a84", dark: "#52d6cf" },
      textStep: 800,
    },
    green: {
      ramp: {
        50: "oklch(98.2% 0.018 155.826)",
        200: "oklch(92.5% 0.084 155.995)",
        300: "oklch(87.1% 0.15 154.449)",
        400: "oklch(79.2% 0.209 151.711)",
        500: "oklch(72.3% 0.219 149.579)",
        700: "oklch(52.7% 0.154 150.069)",
        800: "oklch(44.8% 0.119 151.328)",
        900: "oklch(39.3% 0.095 152.535)",
        950: "oklch(26.6% 0.065 152.934)",
      },
      icon: { light: "#2a9555", dark: "#63cf8c" },
      textStep: 800,
    },
    orange: {
      ramp: {
        50: "oklch(98% 0.016 73.684)",
        200: "oklch(90.1% 0.076 70.697)",
        300: "oklch(83.7% 0.128 66.29)",
        400: "oklch(75% 0.183 55.934)",
        500: "oklch(70.5% 0.213 47.604)",
        700: "oklch(55.3% 0.195 38.402)",
        800: "oklch(47% 0.157 37.304)",
        900: "oklch(40.8% 0.123 38.172)",
        950: "oklch(26.6% 0.079 36.259)",
      },
      icon: { light: "#c0660f", dark: "#ffb46b" },
      textStep: 800,
    },
    pink: {
      ramp: {
        50: "oklch(97.1% 0.014 343.198)",
        200: "oklch(89.9% 0.061 343.231)",
        300: "oklch(82.3% 0.12 346.018)",
        400: "oklch(71.8% 0.202 349.761)",
        500: "oklch(65.6% 0.241 354.308)",
        700: "oklch(52.5% 0.223 3.958)",
        800: "oklch(45.9% 0.187 3.815)",
        900: "oklch(40.8% 0.153 2.432)",
        950: "oklch(28.4% 0.109 3.907)",
      },
      icon: { light: "#d63f7c", dark: "#ff7fb0" },
      textStep: 800,
    },
  },

  /** The tokens a picked accent sets, per mode, as a function of the hue. */
  roles: {
    light: {
      "--accent": (h) => `var(--${h}-700)`,
      "--accent-hover": (h) => `var(--${h}-800)`,
      "--accent-active": (h) => `var(--${h}-900)`,
      "--accent-soft": (h) =>
        `color-mix(in oklch, var(--${h}-500) 13%, transparent)`,
      "--accent-ring": (h) =>
        `color-mix(in oklch, var(--${h}-500) 50%, transparent)`,
      "--accent-edge": (h) => `var(--${h}-700)`,
      "--shell-active-icon": (h, def) => def.icon.light,
      "--text-on-accent": (h) => `var(--${h}-50)`,
      "--accent-text": (h, def) => `var(--${h}-${def.textStep})`,
    },
    dark: {
      "--accent": (h) => `var(--${h}-400)`,
      "--accent-hover": (h) => `var(--${h}-300)`,
      "--accent-active": (h) => `var(--${h}-200)`,
      "--accent-soft": (h) =>
        `color-mix(in oklch, var(--${h}-400) 16%, transparent)`,
      "--accent-ring": (h) =>
        `color-mix(in oklch, var(--${h}-400) 50%, transparent)`,
      "--accent-edge": (h) => `var(--${h}-400)`,
      "--shell-active-icon": (h, def) => def.icon.dark,
      "--text-on-accent": (h) => `var(--${h}-950)`,
      "--accent-text": (h) => `var(--${h}-300)`,
    },
  },
};
