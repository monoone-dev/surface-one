---
name: surface-one-angular
description: Build Angular UI with the Surface One design system (@surface-one/angular, sone- components). Use whenever a task creates or changes a screen, form, dialog, table, layout or any component in an Angular app that depends on @surface-one/angular or @surface-one/tokens, or when the user mentions Surface One, sone- components or soneBtn-style directives.
---

# Building UI with Surface One (Angular)

Surface One is an accessible Angular 22 design system: standalone components, signal inputs,
zoneless- and SSR-safe, styled only through design tokens. Its anatomy follows spartan/ui, its look
follows shadcn/ui, its docs follow Nuxt UI.

## Before writing code

1. If the **`surface-one-angular` MCP server** is available, call `list_components`, then
   `get_component_docs` for every component you will use — it returns the exact selectors, inputs,
   outputs and a working example. Do not guess input names.
2. Otherwise read `references/components.md` (the whole catalogue with entry points and selectors)
   and, for setup, `references/setup.md`.

## Setup (once per app)

- `npm install @surface-one/angular @surface-one/tokens`
- `angular.json` → `styles`: `"@surface-one/tokens"`, then `"@surface-one/angular/styles.css"`,
  then the app's own styles. Components rely on these global styles.
- `ng add @angular/localize` — built-in strings use `$localize`.
- Set `<html data-skin="studio">` (or `paper` / `minimalist`); see the `surface-one-theming` skill.

## Writing components

- Import every part from its own entry point: `import { SoneButtonDirective } from
"@surface-one/angular/button";`. Part arrays (`SONE_CARD_PARTS`, `SONE_DIALOG_PARTS`,
  `SONE_FIELD_PARTS`, …) can go straight into `imports`.
- Element selectors start with `sone-` (`<sone-dialog>`, `<sone-switch>`); attribute directives with
  `sone` on native elements (`<button soneBtn variant="outline" type="button">`, `<div soneCard>`).
  Never create a parallel button/card/input — use the system's.
- Prefer native elements the system styles: `<input>`, `<textarea>`, `<select>` (or
  `<sone-select>`), checkbox and radio are already themed. Wrap them in `soneField` with
  `soneFieldLabel` / `soneFieldDescription` / `soneFieldError`.
- Two-way binding uses signals: `[(checked)]`, `[(value)]`, `[(open)]`, `[(expanded)]`.
- Overlays (`sone-dialog`, `sone-alert-dialog`, `sone-sheet`) are rendered with `@if` and closed on
  their `(dismiss)` output; they manage focus and Escape themselves.
- Your own components: standalone, `ChangeDetectionStrategy.OnPush`, signals, `@if` / `@for`, no
  `window` / `document` at construction (SSR).

## Styling

- Only tokens: `var(--surface-raised)`, `var(--text-secondary)`, `var(--border)`,
  `var(--accent)`, `var(--space-4)`, `var(--radius-md)`, `var(--font-size-sm)`. No hex colours, no
  magic pixel values for colour, space or radius — the skins and dark mode depend on it.
- Layout (grid/flex, widths) is yours; visual decisions come from tokens.

## Accessibility (required)

- Every icon-only button has an `aria-label`; every control has a visible label or `ariaLabel`.
- Real `<button type="button">` for actions, `<a>` for navigation.
- One `<h1>` per page, no skipped heading levels.
- Run the `surface-one-a11y-review` skill before finishing a screen.

## Full-screen starting points

The MCP tools `list_templates` / `get_template` return complete screens (dashboard with sidebar,
AI chat, settings, meeting notes). Start from one when building a new page.
