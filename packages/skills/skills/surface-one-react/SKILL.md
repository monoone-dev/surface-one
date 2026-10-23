---
name: surface-one-react
description: Build React 19 or Next.js UI with the SurfaceOne design system (@surface-one/react, Sone* components). Use whenever a task creates or changes a page, form, dialog, table, layout or any component in a React or Next.js app that depends on @surface-one/react or @surface-one/tokens, or when the user mentions SurfaceOne or SoneButton-style components in React.
---

# Building UI with SurfaceOne (React 19 / Next.js)

`@surface-one/react` is the React twin of `@surface-one/angular` and `@surface-one/vue`: the same
tokens, skins and component stylesheets, the same markup (`class`, `data-slot`, host tags such as
`<sone-icon>`) and the same behaviour (focus, keyboard, ARIA). Every component is `Sone*`,
SSR-safe and tree-shakable.

## Before writing code

1. If the **`surface-one-angular` MCP server** is available (it serves every framework), call
   `list_components` with `framework: "react"`, then `get_component_docs` with
   `framework: "react"` for every component you will use — it returns the import, a working React
   demo and the API the props follow. Do not guess prop names.
2. Otherwise read `references/components.md` (every component with a React twin and its names)
   and, for setup and the Vue → React mapping, `references/setup.md`.

## Setup (once per app)

- `npm install @surface-one/react @surface-one/tokens`
- Import the CSS once, at the root: `import "@surface-one/tokens";` then
  `import "@surface-one/react/styles.css";` (Next.js App Router: `app/layout.tsx`).
- Set `<html data-skin="studio" data-theme="system">` (or `paper` / `minimalist` / `neumorphism` /
  `material` / `surface` / `airy`); see the `surface-one-theming` skill.
- Optional: `<SurfaceOneProvider messages={…} logoAssetBase="/brand/">` to translate the built-in
  strings and place the brand marks (copy `node_modules/@surface-one/tokens/brand` into
  `public/brand/` if you use `SoneLogo`).

## Writing components

- Import from the package root: `import { SoneButton, SoneDialog } from "@surface-one/react";`.
  Server components can render them — every stateful module is already `"use client"`. Never
  create a parallel button/card/input — use the system's.
- The props are the Angular inputs (same names, camelCase): `<SoneButton variant="outline"
size="sm" type="button">`. `className` is merged; `ref`, `id`, `aria-*` and handlers go to the
  rendered element.
- Two-way inputs are controlled pairs or uncontrolled defaults: `checked` + `onCheckedChange`,
  `value` + `onValueChange`, `open` + `onOpenChange` (or `defaultChecked` / `defaultValue` /
  `defaultOpen`). Outputs are callbacks: `onDismiss`, `onSubmit`.
- Angular parts become child components (`<SoneCard>` + `<SoneCardHeader>`, `<SoneField>` +
  `<SoneFieldLabel>`); projections become `ReactNode` props (`actions`) or render props
  (`renderLabel`). Change the rendered element with `as` (`<SoneButton as={Link} href="/x">`).
- Tooltips: `<SoneTooltip text="Copy">{button}</SoneTooltip>` or `ref={useSoneTooltip("Copy")}`.
- Your own components: function components and hooks, no `window` / `document` outside effects
  (SSR); add `"use client"` to the ones with state or effects.

## Styling

- Only tokens: `var(--surface-raised)`, `var(--text-secondary)`, `var(--border)`,
  `var(--accent)`, `var(--space-4)`, `var(--radius-md)`, `var(--font-size-sm)`. No hex colours, no
  magic pixel values for colour, space or radius — the skins and dark mode depend on it.
- Layout (grid/flex, widths) is yours; visual decisions come from tokens.

## Accessibility (required)

- Every icon-only button has an `aria-label`; every control has a visible label or `aria-label`.
- Real `<button type="button">` for actions, `<a>` / `Link` for navigation.
- One `<h1>` per page, no skipped heading levels.
- Run the `surface-one-a11y-review` skill before finishing a screen.

## Full-screen starting points

The MCP tools `list_templates` / `get_template` with `framework: "react"` return complete screens
(dashboard with sidebar, AI chat, settings, meeting notes, …) as React components.
