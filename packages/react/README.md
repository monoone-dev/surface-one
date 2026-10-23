# @surface-one/react

React 19 and Next.js components of the SurfaceOne design system — the twins of
`@surface-one/angular` and `@surface-one/vue`: the same tokens, skins and component stylesheets,
the same markup (`class`, `data-slot`, `data-variant`, …) and the same behaviour (focus, keyboard,
ARIA). Every component is `Sone*`, SSR-safe and tree-shakable.

```bash
npm install @surface-one/react @surface-one/tokens
```

## Next.js (App Router)

```tsx
// app/layout.tsx
import "@surface-one/tokens";
import "@surface-one/react/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-skin="surface" data-theme="system">
      <body>{children}</body>
    </html>
  );
}
```

Use the components anywhere, server components included: every module that holds state,
effects or context is marked `"use client"` in the package, so a page only ships the client code
it needs. A link button: `<SoneButton as={Link} href="/pricing">` (`import Link from "next/link"`).

## React (Vite)

```tsx
import { createRoot } from "react-dom/client";
import { SurfaceOneProvider } from "@surface-one/react";
import "@surface-one/tokens";
import "@surface-one/react/styles.css";

createRoot(document.getElementById("app")!).render(
  <SurfaceOneProvider messages={{ close: "Zamknij" }}>
    <App />
  </SurfaceOneProvider>,
);
```

`SurfaceOneProvider` is optional: it translates the built-in strings (`messages`, the same
`SoneMessages` as the Vue package) and sets where `SoneLogo` loads the brand marks from
(`logoAssetBase`, default `/brand/`). Without it everything works in English.

## Theming

`@surface-one/tokens` is driven by three attributes on `<html>`: `data-skin`
(`surface` | `studio` | `paper` | `minimalist` | `neumorphism`), `data-theme`
(`light` | `dark` | `system`) and `data-accent` (`blue` | `teal` | `green` | `orange` | `pink`).

## From Vue to React

| Vue                                      | React                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `<SoneButton as="a" href="/x">`          | `<SoneButton as="a" href="/x">` / `as={Link}`                                       |
| `<SoneSwitch v-model="on">`              | `<SoneSwitch checked={on} onCheckedChange={setOn}>` (or `defaultChecked`)           |
| `<SoneSelect v-model>` / `SoneSlider` …  | `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled)             |
| `v-model:open` / `v-model:expanded`      | `open` + `onOpenChange` / `expanded` + `onExpandedChange` (`default*` too)          |
| `<SoneDialog v-model:open>` / `@dismiss` | `<SoneDialog open={open} onOpenChange={setOpen}>` / `onDismiss`                     |
| `@submit`, `@selected`, `@connect` …     | `onSubmit`, `onSelected`, `onConnect` …                                             |
| the `#actions` / `#summary` slots        | the `actions` / `summary` props (`ReactNode`)                                       |
| `#cell-<key>="{ row }"` (table)          | `columns={[{ key, header, cell: (row) => … }]}`                                     |
| `#label` (bar list) / `#node` (flow)     | `renderLabel={(item) => …}` / `renderNode={({ node, selected }) => …}`              |
| `v-sone-tooltip="'Copy'"`                | `ref={useSoneTooltip("Copy")}` or `<SoneTooltip text="Copy">{button}</SoneTooltip>` |
| `app.use(SurfaceOne, { messages })`      | `<SurfaceOneProvider messages={…}>` / `<SoneMessagesProvider>`                      |
| `provideSoneSidebar(config)`             | `<SoneSidebarProvider config>` or the wrapper's `config`; `useSoneSidebar()`        |
| exposed methods (`focus()`, `clear()`)   | `ref` (flow: `SoneFlowApi`, confirm: `{ focus() }`), search field `handleRef`       |

Parts render the same element as their Angular directive (change it with `as`); every other prop
— `className` (merged), `ref`, `id`, `aria-*`, handlers — goes to that element. Components that
wrap a native control (switch, select, slider, OTP, password, search) put `className` and `style`
on the host element and everything else, `ref` included, on the control. Element components render
the same host tag (`<sone-icon>`, `<sone-switch>`, …), so the shared stylesheets apply unchanged.

## Components

Every `@surface-one/vue` component has its React twin (a test keeps the two lists in step):
Button, ButtonGroup · Badge · Card (+ parts) · Alert (+ parts) · Banner · Separator · Skeleton ·
Kbd · Spinner · StatusDot · Icon · Logo · Avatar · Item · Empty · PageHeader · SectionHeading · Field,
InputGroup · Switch · Select · Slider · Segmented · ToggleGroup, Tabs · ChoiceGroup, ChoiceCard ·
InputNumber · InputOtp · PasswordInput · Rating · SearchField · FilterChips · CopyButton ·
Collapsible · CollapsibleSection · Disclosure · Menu, Popover · Dialog, AlertDialog, Sheet ·
Confirm · Progress · Meter · Sparkline · BarList · ChartLegend, Swatch · StackedBar · Stat ·
Table · Stepper · LoadMore · ElapsedTimer · SpeakerChip · ChatHistory · Terminal (+ parts) ·
AgentChat (+ parts) · Dock · Flow (+ controls, minimap) · Sidebar (+ parts) · Tooltip.

React-only so far: Markdown (`SoneMarkdown`, the read-only twin of `sone-markdown`).

## Markdown

`<SoneMarkdown source={text} />` renders untrusted markdown read-only, with the look of the
Angular `sone-markdown` (its styles are part of `styles.css`). Raw HTML is shown as text, links
open in a new tab, images render only from inline `data:` URLs, and everything goes through
DOMPurify. `size="sm"` tightens it for side panels; `breaks={false}` keeps single newlines inside
a paragraph. The server renders the empty host (there is no sanitizer without a DOM) and the
browser fills it in after hydration. `marked` and `dompurify` come as dependencies.

## Sidebar

`SoneSidebarWrapper` holds the sidebar state for its subtree (open or collapsed, the dragged
width) and toggles it on ⌘B / Ctrl+B. Pass `config` (the same fields as the Angular
`SoneSidebarConfig`), or wrap the app in `<SoneSidebarConfigProvider>`; `useSoneSidebar()` reads
the state anywhere below. The open state and width persist to `localStorage` under the same keys
as the other packages (set `openStorageKey` / `widthStorageKey` to `null` to opt out). They are
read after mount, never on the server, so a Next.js page hydrates without a mismatch and then shows
the stored state.

## Brand marks

`SoneLogo` loads its SVGs from `logoAssetBase` (default `/brand/`): copy
`node_modules/@surface-one/tokens/brand` into `public/brand/`.

## Development

```bash
npm run build -w @surface-one/react        # generate → vite build → .d.ts
npm run test -w @surface-one/react         # SSR + behaviour, docs demos and templates (vitest)
npm run typecheck -w @surface-one/react    # the sources, tests, playground and docs templates
npm run playground -w @surface-one/react   # http://localhost:5176
```

The icons (`src/components/icon/icons.generated.ts`) and the scoped component styles
(`src/styles/hosts.generated.css`) are generated from `packages/angular` by
`scripts/generate-*.mjs` at the repository root on every build — change them there, never by
hand. The docs demos' React twins (`apps/docs/src/app/demos/react/<slug>.tsx`) and templates
(`apps/docs/src/app/templates/react/<slug>.tsx`) are type-checked and rendered by the tests, so
the snippets readers copy always compile and render.

## License

MIT — see [LICENSE](LICENSE).
