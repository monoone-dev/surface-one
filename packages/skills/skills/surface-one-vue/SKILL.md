---
name: surface-one-vue
description: Build Vue 3 or Nuxt UI with the SurfaceOne design system (@surface-one/vue, Sone* components). Use whenever a task creates or changes a page, form, dialog, table, layout or any component in a Vue or Nuxt app that depends on @surface-one/vue or @surface-one/tokens, or when the user mentions SurfaceOne, SoneButton-style components or the v-sone-tooltip directive.
---

# Building UI with SurfaceOne (Vue 3 / Nuxt)

`@surface-one/vue` is the Vue twin of `@surface-one/angular`: the same tokens, skins and
component stylesheets, the same markup (`class`, `data-slot`, host tags such as `<sone-icon>`) and
the same behaviour (focus, keyboard, ARIA). Every component is `Sone*`, SSR-safe and tree-shakable.

## Before writing code

1. If the **`surface-one-angular` MCP server** is available (it serves every framework), call
   `list_components` with `framework: "vue"`, then `get_component_docs` with `framework: "vue"`
   for every component you will use — it returns the import, a working Vue demo and the API the
   props follow. Do not guess prop names.
2. Otherwise read `references/components.md` (every component with a Vue twin and its names) and,
   for setup and the Angular → Vue mapping, `references/setup.md`.

## Setup (once per app)

- `npm install @surface-one/vue @surface-one/tokens`
- **Nuxt:** `modules: ["@surface-one/vue/nuxt"]` in `nuxt.config.ts` — it adds the CSS,
  auto-imports every `Sone*` component and registers `v-sone-tooltip`.
- **Vue (Vite):** `import "@surface-one/tokens"` then `import "@surface-one/vue/styles.css"`, and
  either `app.use(SurfaceOne)` or import each component where you use it.
- Smaller CSS (opt-in): instead of `styles.css`, import `@surface-one/vue/styles/<slug>.css` for each
  component used (`button`, `date-picker`, …; each includes the components it renders inside)
  and then `@surface-one/vue/styles/base.css`. Nuxt: `surfaceOne: { css: false }` and list `@surface-one/tokens` and them in `css`.
- Set `<html data-skin="surface">` (the default; or `linen` / `studio` / `paper` / `minimalist` / `neumorphism`); see the `surface-one-theming` skill.
- Copy `node_modules/@surface-one/tokens/brand` into `public/brand/` if you use `SoneLogo`.

## Writing components

- Import from the package root: `import { SoneButton, SoneDialog } from "@surface-one/vue";` (Nuxt
  auto-imports them). Never create a parallel button/card/input — use the system's.
- The props are the Angular inputs (same names, kebab-case in templates):
  `<SoneButton variant="outline" size="sm" type="button">`.
- Two-way inputs are `v-model`: `<SoneSwitch v-model="on">`, `<SoneSelect v-model="value">`,
  `v-model:open`, `v-model:expanded`. Outputs are events: `@dismiss`, `@submit`.
- Angular parts become child components (`<SoneCard>` + `<SoneCardHeader>`, `<SoneField>` +
  `<SoneFieldLabel>`); projections become slots (`#actions`). Attribute directives render the same
  element; change it with `as` (`<SoneButton as="a" href="/x">`, Nuxt: `:as="NuxtLink" to="/x"`
  with `import { NuxtLink } from "#components"`).
- Prefer native elements the system styles: `<input>`, `<textarea>`, `<select>`, checkbox and radio
  are already themed inside `SoneField`.
- Your own components: `<script setup lang="ts">`, no `window` / `document` outside `onMounted`
  (SSR).

## Styling

- Only tokens: `var(--surface-raised)`, `var(--text-secondary)`, `var(--border)`,
  `var(--accent)`, `var(--space-4)`, `var(--radius-md)`, `var(--font-size-sm)`. No hex colours, no
  magic pixel values for colour, space or radius — the skins and dark mode depend on it.
- Layout (grid/flex, widths) is yours; visual decisions come from tokens.

## Accessibility (required)

- Every icon-only button has an `aria-label`; every control has a visible label or `aria-label`.
- Real `<button type="button">` for actions, `<a>` / `NuxtLink` for navigation.
- One `<h1>` per page, no skipped heading levels.
- Run the `surface-one-a11y-review` skill before finishing a screen.

## Full-screen starting points

The MCP tools `list_templates` / `get_template` with `framework: "vue"` return complete screens
(dashboard with sidebar, AI chat, settings, meeting notes, …) as Vue single-file components.
