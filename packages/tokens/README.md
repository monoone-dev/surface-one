# @surface-one/tokens

The framework-agnostic foundation of SurfaceOne: CSS custom properties for colour, type, space,
radius, shadow and motion; the Studio, Paper, Minimalist, Neumorphism, Material and Surface skins in light and dark; five accent
palettes; self-hosted variable fonts with **latin and latin-ext** subsets; and the brand marks.

```css
@import "@surface-one/tokens"; /* = css/index.css */
```

Three attributes on `<html>` drive it: `data-skin` (`studio` | `paper` | `minimalist` | `neumorphism` | `material` | `surface`),
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
