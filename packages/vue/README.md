# @surface-one/vue

Vue 3 and Nuxt components of the Surface One design system — the twins of
`@surface-one/angular`: the same tokens, skins and component stylesheets, the same markup
(`class`, `data-slot`, `data-variant`, …) and the same behaviour (focus, keyboard, ARIA).
Every component is `Sone*`, SSR-safe and tree-shakable.

```bash
npm install @surface-one/vue @surface-one/tokens
```

## Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@surface-one/vue/nuxt"],
  surfaceOne: {
    // all optional
    messages: { close: "Zamknij", loading: "Ładowanie" },
    logoAssetBase: "/brand/",
  },
  app: {
    head: { htmlAttrs: { "data-skin": "studio", "data-theme": "system" } },
  },
});
```

The module adds the CSS (`@surface-one/tokens`, then `@surface-one/vue/styles.css`),
auto-imports every `Sone*` component (a page bundles only what it uses) and registers the
`v-sone-tooltip` directive. Options: `css`, `components` (both default `true`),
`messages`, `logoAssetBase`.

## Vue (Vite)

```ts
import { createApp } from "vue";
import { SurfaceOne } from "@surface-one/vue";
import "@surface-one/tokens";
import "@surface-one/vue/styles.css";

createApp(App)
  .use(SurfaceOne, { messages: { close: "Zamknij" } })
  .mount("#app");
```

`SurfaceOne` registers every component globally; pass `{ components: false }` and import
them where you use them (`import { SoneButton } from "@surface-one/vue"`).

## Theming

`@surface-one/tokens` is driven by three attributes on `<html>`: `data-skin`
(`studio` | `paper` | `minimalist`), `data-theme` (`light` | `dark` | `system`) and
`data-accent` (`blue` | `teal` | `green` | `orange` | `pink`).

## From Angular to Vue

| Angular                                   | Vue                                                        |
| ----------------------------------------- | ---------------------------------------------------------- |
| `<button soneBtn variant="outline">`      | `<SoneButton variant="outline">`                           |
| `<a soneBtn href="/x">`                   | `<SoneButton as="a" href="/x">` / `:as="NuxtLink" to=…`    |
| `<div soneCard>` + `soneCardHeader` …     | `<SoneCard>` + `<SoneCardHeader>` …                        |
| `<sone-switch [(checked)]="on">`          | `<SoneSwitch v-model="on">`                                |
| `<sone-select [(value)]>` / `sone-slider` | `<SoneSelect v-model>` / `<SoneSlider v-model>`            |
| `<sone-segmented [(value)]>`              | `<SoneSegmented v-model :options>`                         |
| `[(expanded)]` / `[(open)]`               | `v-model:expanded` / `v-model:open`                        |
| `@if (open) { <sone-dialog (dismiss)> }`  | `<SoneDialog v-model:open>` or `v-if` + `@dismiss`         |
| `<sone-table-column key>` + template      | `:columns="[{ key, header }]"` + `#cell-<key>="{ row }"`   |
| `[soneTooltip]="'Copy'"`                  | `v-sone-tooltip="'Copy'"` (`v-sone-tooltip:top` = side)    |
| `$localize` strings                       | `messages` (plugin / module option, `provideSoneMessages`) |
| `provideSoneLogoAssets("/brand/")`        | `logoAssetBase` option (default `/brand/`)                 |

A Nuxt link button: `import { NuxtLink } from "#components"` in `<script setup>`, then
`<SoneButton :as="NuxtLink" to="/pricing">` (`resolveComponent("NuxtLink")` does not work
here — Nuxt components are not registered globally).

Attribute directives become components that render the same element (change it with
`as`); every attribute and listener falls through to that element. Element components
render the same host tag (`<sone-icon>`, `<sone-switch>`, …), so the shared stylesheets
apply unchanged.

## Components

Button, ButtonGroup · Badge · Card (+ parts) · Alert (+ parts) · Banner · Separator ·
Skeleton · Kbd, KbdGroup · Spinner · Icon · Logo · Avatar (+ Image, Fallback) · Item
(+ parts) · Empty (+ parts) · PageHeader (+ parts) · Field (+ parts), Label · InputGroup
(+ parts) · Switch · Select · Slider · Segmented · Toggle, ToggleGroup, TabsList,
TabsTrigger · ChoiceGroup, ChoiceCard (+ parts) · Collapsible (+ parts) · Disclosure ·
Menu, Popover (+ parts) · Progress · Meter · Table · Dialog, AlertDialog, Sheet (+ parts) ·
`v-sone-tooltip`.

Not ported yet (app-specific): audio player, chat, markdown / editor, timeline,
transcripts, recording, sidebar, row menu, tree row, power slider, source list, download
progress, toaster, floating bar, side panel, page actions, secret field, message, bubble,
marker.

## Brand marks

`SoneLogo` loads its SVGs from `logoAssetBase` (default `/brand/`): copy
`node_modules/@surface-one/tokens/brand` into `public/brand/`.

## Development

```bash
npm run build -w @surface-one/vue        # generate → vite build → .d.ts
npm run test -w @surface-one/vue         # SSR + behaviour (vitest)
npm run playground -w @surface-one/vue   # http://localhost:5175
```

The icons (`src/components/icon/icons.generated.ts`) and the scoped component styles
(`src/styles/hosts.generated.css`) are generated from `packages/angular` by
`scripts/generate-*.mjs` on every build — change them there, never by hand.
