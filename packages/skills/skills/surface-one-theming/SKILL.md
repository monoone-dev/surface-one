---
name: surface-one-theming
description: Theme a Surface One app — skins (Studio, Paper, Minimalist), light/dark/system colour mode, accent palettes, custom token overrides and latin-ext fonts. Use when the task changes colours, dark mode, fonts, radius, spacing or branding of an app built on @surface-one/tokens, or adds a theme switcher.
---

# Theming Surface One

Every visual value is a CSS custom property from `@surface-one/tokens`. A skin re-declares tokens;
components never change. If the `surface-one-angular` MCP server is available, call
`get_theme_variables` (optionally `{ skin, mode }`) for live values; otherwise read
`references/tokens.md`.

## The three switches on `<html>`

| Attribute     | Values                                    | Default                          |
| ------------- | ----------------------------------------- | -------------------------------- |
| `data-skin`   | `studio`, `paper`, `minimalist`           | set one explicitly (`studio`)    |
| `data-theme`  | `light`, `dark`, `system`                 | no attribute = follow the OS     |
| `data-accent` | `blue`, `teal`, `green`, `orange`, `pink` | no attribute = the skin's accent |

Apply the stored choice before the first paint with a tiny inline script in `index.html`
(read localStorage, set the attributes, wrap in `try`), then keep it in sync from a service. Never
toggle a `.dark` class — the tokens listen to `data-theme` and `prefers-color-scheme`.

## Overriding tokens

Re-declare tokens under the same selector the skin uses, in a stylesheet loaded **after**
`@surface-one/tokens`:

```css
:root[data-skin="studio"] {
  --radius: 1rem;
}
:root[data-skin="studio"][data-theme="dark"] {
  --surface-base: oklch(18% 0.01 260);
}
```

Change semantic roles (`--surface-*`, `--text-*`, `--accent*`, `--border*`, `--danger*`), not
palette steps. Every colour you change needs a light AND a dark value and must keep 4.5:1 text
contrast (3:1 for large text and UI boundaries).

## Fonts

Bundled families (Geist, Geist Mono, Figtree, DM Sans, JetBrains Mono, Source Serif 4) ship latin
AND latin-ext subsets. A custom font must too — two WOFF2 files and two `@font-face` rules split by
`unicode-range`; otherwise ą, ł, ő, ř, ș fall back to a system face mid-word. Self-host; no font CDNs.
