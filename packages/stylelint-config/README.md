# @surface-one/stylelint-config

The SurfaceOne design-system rules for [stylelint](https://stylelint.io): a component reads
`var(--token)` and never invents a colour, a spacing step, a radius, a shadow, a z-index, a
hairline, a blur or a duration of its own. Core stylelint rules only, and every message names the
token to use instead.

## Install

```bash
npm install -D stylelint @surface-one/stylelint-config
# from GitHub Packages (published as @monoone-dev/surface-one-stylelint-config):
npm install -D stylelint @surface-one/stylelint-config@npm:@monoone-dev/surface-one-stylelint-config
```

```js
// stylelint.config.mjs
export default {
  extends: ["@surface-one/stylelint-config"],
  // Your own token definitions are the one place raw values belong.
  ignoreFiles: ["src/styles/tokens/**"],
};
```

```bash
npx stylelint "src/**/*.{css,scss,vue}"
```

`.scss` is parsed with `postcss-scss` and the `<style>` blocks of `.vue` files with `postcss-html`;
both come with the package.

## Rules

| What                                                                                    | Rule                                         | Use instead                                                                                             |
| --------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Hex colours                                                                             | `color-no-hex`                               | a theme token: `var(--text-primary)`, `var(--surface-base)`, `var(--accent)`                            |
| Named colours (`transparent`, `currentColor` stay allowed)                              | `color-named: never`                         | a theme token                                                                                           |
| `rgb()` `rgba()` `hsl()` `hsla()` `hwb()` `lab()` `lch()` `oklab()` `oklch()` `color()` | `function-disallowed-list`                   | a theme token, or `color-mix(in oklab, var(--accent) 20%, transparent)` for a tint                      |
| `px` in `gap` / `row-gap` / `column-gap`                                                | `declaration-property-unit-disallowed-list`  | `--space-*` (`--space-px`, `--space-0_5`, `--space-1` … `--space-8`)                                    |
| `px` in `padding*` / `margin*`                                                          | `declaration-property-unit-disallowed-list`  | `--space-*`                                                                                             |
| `px` in `border-radius` (and its longhands)                                             | `declaration-property-unit-disallowed-list`  | `--radius-*` (`--radius-sm`, `--radius-md`, `--radius-pill`, …)                                         |
| `px` in `box-shadow`                                                                    | `declaration-property-unit-disallowed-list`  | `--shadow-*`, `--focus-ring`; ring widths `--border-width-thin`, `--border-width-thick`, `--halo-width` |
| `px` in `font-size`                                                                     | `declaration-property-unit-disallowed-list`  | `--font-size-*`                                                                                         |
| `px` in `letter-spacing`                                                                | `declaration-property-unit-disallowed-list`  | `--tracking-*`                                                                                          |
| `ms` / `s` in `transition`, `transition-duration`, `animation`, `animation-duration`    | `declaration-property-unit-disallowed-list`  | `--transition`, `--transition-fast`, `--transition-dur`, `--motion-enter-dur`, `--duration-*`           |
| any `z-index` but `0`, `auto` and the CSS-wide keywords                                 | `declaration-property-value-allowed-list`    | `var(--z-*)`, or one step off a rung: `calc(var(--z-raised) + 1)`                                       |
| `backdrop-filter` / `-webkit-backdrop-filter` but `none`                                | `declaration-property-value-allowed-list`    | `blur(var(--scrim-blur))` — the skin's scrim                                                            |
| `1px` in `border*` / `border*-width`                                                    | `declaration-property-value-disallowed-list` | `var(--border-width-thin) solid var(--border)`                                                          |

`0` is always fine, and structural sizes — `width`, `height`, `min-*`, `max-*`, `inset`, `top` … —
keep their pixels. Delays (`animation-delay`, `transition-delay`) are not checked.

## Escape hatch

When a raw value is truly structural, silence that one line and say why:

```css
/* stylelint-disable-next-line declaration-property-unit-disallowed-list -- the 3px halo is part of the glyph */
box-shadow: 0 0 0 3px var(--surface-base);
```

The config turns on `reportDescriptionlessDisables`, `reportNeedlessDisables` and
`reportInvalidScopeDisables`, so a disable without a reason, or one that silences nothing, is an
error too.

## License

MIT
