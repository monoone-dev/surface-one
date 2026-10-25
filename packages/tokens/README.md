# @surface-one/tokens

The framework-agnostic foundation of SurfaceOne: CSS custom properties for colour, type, space,
radius, shadow and motion; the Surface, Linen, Studio, Paper, Minimalist and Neumorphism skins in light and dark; five accent
palettes; self-hosted variable fonts with **latin and latin-ext** subsets; and the brand marks.

```css
@import "@surface-one/tokens"; /* = css/index.css: every skin */
```

An app that ships one skin can load just that one (about a fifth of the skin CSS):

```css
@import "@surface-one/tokens/css/surface.css"; /* or linen, studio, paper, minimalist, neumorphism */
```

`<html data-skin="surface">` still selects it; accents, fonts and defaults are included.

Surface, the default skin, follows the Isles style guide: opaque white islands on one pane of glass
over a painted backdrop, ink pill buttons, a lagoon accent, Inter and JetBrains Mono. The frame is
tokens too — `--app-backdrop`, `--app-bar-*` and `--island-*` — and the flat skins keep them
neutral, so the same markup works in every skin.

Three attributes on `<html>` drive it: `data-skin` (`surface` | `linen` | `studio` | `paper` | `minimalist` | `neumorphism`),
`data-theme` (`light` | `dark` | `system`, absent = system) and `data-accent`
(`blue` | `teal` | `green` | `orange` | `pink`, absent = the skin's own accent).

The SCSS sources are published under `@surface-one/tokens/scss/*` for Sass users, and
`@surface-one/tokens/tokens.json` lists every token's value per skin and mode (and what each
accent changes) for scripts and tools.

## Editing tokens

The skins and accents are data in `src/definitions/` (`base.mjs` is Minimalist, the base layer;
each skin holds only what differs from it; `shared.mjs` holds what every other skin shares;
`accents.mjs` is the accent table). `npm run build:tokens` writes `src/themes/*.theme.scss` and
`src/tokens/accents.css` from them — never edit those by hand — and fails on a declaration that
repeats the value it inherits, on a dark-only token and on an undefined `var()` reference.
`npm test -w @surface-one/tokens` also compares the resolved value of every token in every
skin × theme × colour-scheme × accent against `test/resolved.snapshot.json`; after an intended
change, re-record it with `npm run test:update -w @surface-one/tokens` and review the diff.

## License

MIT — see [LICENSE](LICENSE).
