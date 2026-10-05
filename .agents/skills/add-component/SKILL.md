---
name: add-component
description: Add a new component (or a new part/variant of an existing one) to @surface-one/angular end to end — entry point, sone- selectors, tokens, story, docs catalogue, demo, translations, API, MCP data and checks. Use whenever a task creates a component or changes a component's public API in this repo.
---

# Add a component to Surface One

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
- Tokens only (`var(--…)`); a missing value means a new token in every skin, light and dark.
- Built-in strings with `$localize`; ARIA via `[attr.aria-*]` bindings (not the `ariaLabel` DOM
  property, which is lost on the server).
- `index.ts` (public API) and `ng-package.json` (`{ "lib": { "entryFile": "index.ts" } }`).
  Import other components from their entry point (`@surface-one/angular/button`), never `../button`.

## 2. Storybook

`<name>.stories.ts` next to it: `title: "Components/<Group>/<Name>"`, `tags: ["autodocs"]`, a
`parameters.docs.description.component` with spartan/shadcn reference links, one story per state.

## 3. Docs site — `apps/docs/src/app/`

- `catalog/catalog.ts`: add `{ slug, name, category }` in the right Nuxt UI category.
- `demos/<slug>.demo.ts`: `const TEMPLATE`, `export const code = TEMPLATE`, default-exported
  standalone component (copy `demos/button.demo.ts`); register it in `demos/registry.ts`.
- `i18n/messages/<locale>.ts`: `components.entries.<slug>` in ALL nine locales (en, pl, es, it, fr,
  pt, de, zh, ja) — the build fails on a missing key. See the `docs-i18n` skill.

## 4. Generated data — never hand-edit

`npm run docs:api` (API tables) and `npm run ai:build` (MCP data + skill references); both run in
`npm run build`.

## 5. Verify

```bash
npm run typecheck
npm run build:site
npm run test:a11y
npm test -w @surface-one/angular-mcp
```

Open the component page in light and dark mode and in Storybook. Then commit and open the PR with
the `pr-description` skill.
