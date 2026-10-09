# @surface-one/tokens

The framework-agnostic foundation of SurfaceOne: CSS custom properties for colour, type, space,
radius, shadow and motion; the Studio, Paper and Minimalist skins in light and dark; five accent
palettes; self-hosted variable fonts with **latin and latin-ext** subsets; and the brand marks.

```css
@import "@surface-one/tokens"; /* = css/index.css */
```

Three attributes on `<html>` drive it: `data-skin` (`studio` | `paper` | `minimalist`),
`data-theme` (`light` | `dark` | `system`, absent = system) and `data-accent`
(`blue` | `teal` | `green` | `orange` | `pink`, absent = the skin's own accent).

The SCSS sources are published under `@surface-one/tokens/scss/*` for Sass users.
