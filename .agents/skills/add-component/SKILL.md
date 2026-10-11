---
name: add-component
description: Add a new component (or a new part/variant of an existing one) to @surface-one/angular end to end — entry point, sone- selectors, tokens, story, its @surface-one/vue and @surface-one/react twins, docs catalogue, demo (with vueCode / reactCode), translations, API, MCP data and checks. Use whenever a task creates a component or changes a component's public API in this repo.
---

# Add a component to SurfaceOne

Follow spartan/ui (https://spartan.ng) for the Angular anatomy and input names, shadcn/ui
(https://ui.shadcn.com) for the look, and Nuxt UI (https://ui.nuxt.com) for where it sits in the
docs. Read the closest existing component first and copy its shape.

## 1. Library — `packages/angular/<slug>/`

- `<name>.component.ts` + `.html` + `.scss` (or `<name>.directive.ts` + a global `<name>.css`
  `@import`ed from `packages/angular/styles.css` when parts are projected/portaled).
- Selector `sone-<name>` / `[soneName]`, class `Sone<Name>Component|Directive`, part array
  `SONE_<NAME>_PARTS`. Standalone, `OnPush`, `input()` / `model()` / `output()`, `@if` / `@for`.
- SSR-safe: no `window` / `document` / `localStorage` at construction; inject `DOCUMENT`; browser
  work in `afterNextRender` or event handlers.
- Tokens only (`var(--…)`); a missing value means a new token in every skin, light and dark —
  added in `packages/tokens/src/definitions/` (never the generated `src/themes/*.theme.scss`),
  then `npm run build:tokens` and `npm test -w @surface-one/tokens`.
- Built-in strings with `$localize`; ARIA via `[attr.aria-*]` bindings (not the `ariaLabel` DOM
  property, which is lost on the server).
- `index.ts` (public API) and `ng-package.json` (`{ "lib": { "entryFile": "index.ts" } }`).
  Import other components from their entry point (`@surface-one/angular/button`), never `../button`.

## 2. Storybook

`<name>.stories.ts` next to it: `title: "Components/<Group>/<Name>"`, `tags: ["autodocs"]`, a
`parameters.docs.description.component` with spartan/shadcn reference links, one story per state.

## 3. The Vue and React twins

The twins render the SAME markup (classes, `data-slot`, host tags such as `<sone-kbd>`), so they
reuse the Angular stylesheets: the scoped `:host` styles and the icons are generated from
`packages/angular` (`npm run generate`). Same props as the Angular inputs; two-way inputs are
`v-model` (Vue) and `value` + `onValueChange` / `defaultValue` (React); outputs are events /
`on*` callbacks; parts are child components. A component that is not ported yet is listed as
such in both package READMEs.

- **Vue** — `packages/vue/src/components/<slug>/<name>.ts` (`defineComponent` + render function,
  SSR-safe) and its `index.ts`; export it from `src/components/index.ts` and add every new
  `Sone*` name to `src/component-names.ts` (Nuxt auto-import; `test/exports.test.ts` checks it).
  Tests in `packages/vue/test/`.
- **React** — `packages/react/src/components/<slug>/<name>.tsx` (`"use client"` when it holds
  state, effects or context) and its `index.ts`; export it from `src/components/index.ts`. Tests in
  `packages/react/test/`; the React list must match the Vue one.

## 4. Docs site — `apps/docs/src/app/`

- `catalog/catalog.ts`: add `{ slug, name, category }` in the right Nuxt UI category.
- `demos/<slug>.demo.ts`: `const TEMPLATE`, `export const code = TEMPLATE`, `export const vueCode`
  (a `<script setup lang="ts">` SFC importing from `@surface-one/vue`) and
  `export const reactCode` (`export default function <Name>Demo()` importing from
  `@surface-one/react`) — template literals without `${…}` — and the default-exported standalone
  component (copy `demos/button.demo.ts`); register it in `demos/registry.ts`. The React snippet
  is type-checked and rendered by `packages/react` (`scripts/extract-demos.mjs`); the MCP server
  serves all three (`get_component_docs` with `framework`).
- `i18n/messages/<locale>.ts`: `components.entries.<slug>` in ALL nine locales (en, pl, es, it, fr,
  pt, de, zh, ja) — the build fails on a missing key. See the `docs-i18n` skill.

## 5. Generated data — never hand-edit

`npm run generate` runs `docs:api` (API tables), `ai:build` (MCP data + skill references,
including the Vue and React catalogues) and the Vue / React generators; `npm ci`, `npm start` and
`npm run build` call it. Commit the regenerated `api.generated.json` and skill references — CI
fails when they drift.

## 6. Verify

```bash
npm run generate
npm run typecheck
npm run typecheck:vue && npm run test:vue
npm run typecheck:react && npm run test:react
npm run test:mcp
npm run build:site
npm run test:a11y
```

Open the component page in light and dark mode and in Storybook. Then commit and open the PR with
the `pr-description` skill.
