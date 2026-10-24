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

## Only the CSS you use

`styles.css` holds every component (about 265 KB, 36 KB gzipped). To ship less, import
`dist/styles/<slug>.css` for each component you render (the slug is its kebab-case name:
`SoneButton` → `button`, `SoneDatePicker` → `date-picker`) and then `base.css` (native form
controls, the layout and text utilities, keyframes) in its place:

```ts
import "@surface-one/tokens";
import "@surface-one/react/styles/button.css";
import "@surface-one/react/styles/date-picker.css";
import "@surface-one/react/styles/base.css";
```

Each file already carries the components it renders inside (`date-picker.css` brings the calendar,
the popover and the button), so one import per component you use is enough. The build checks
that every component has its file and that together they hold every rule of `styles.css`.

## Theming

`@surface-one/tokens` is driven by three attributes on `<html>`: `data-skin`
(`surface` | `linen` | `studio` | `paper` | `minimalist` | `neumorphism`), `data-theme`
(`light` | `dark` | `system`) and `data-accent` (`blue` | `teal` | `green` | `orange` | `pink`).

## From Vue to React

| Vue                                       | React                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `<SoneButton as="a" href="/x">`           | `<SoneButton as="a" href="/x">` / `as={Link}`                                       |
| `<SoneSwitch v-model="on">`               | `<SoneSwitch checked={on} onCheckedChange={setOn}>` (or `defaultChecked`)           |
| `<SoneSelect v-model>` / `SoneSlider` …   | `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled)             |
| `<SoneToggleGroup type="single" v-model>` | `<SoneToggleGroup type="single" value onValueChange>` + items with `value`          |
| `v-model:open` / `v-model:expanded`       | `open` + `onOpenChange` / `expanded` + `onExpandedChange` (`default*` too)          |
| `<SoneDialog v-model:open>` / `@dismiss`  | `<SoneDialog open={open} onOpenChange={setOpen}>` / `onDismiss`                     |
| `@submit`, `@selected`, `@connect` …      | `onSubmit`, `onSelected`, `onConnect` …                                             |
| the `#actions` / `#summary` slots         | the `actions` / `summary` props (`ReactNode`)                                       |
| `#cell-<key>="{ row }"` (table)           | `columns={[{ key, header, cell: (row) => … }]}`                                     |
| `#label` (bar list) / `#node` (flow)      | `renderLabel={(item) => …}` / `renderNode={({ node, selected }) => …}`              |
| `v-sone-tooltip="'Copy'"`                 | `ref={useSoneTooltip("Copy")}` or `<SoneTooltip text="Copy">{button}</SoneTooltip>` |
| `app.use(SurfaceOne, { messages })`       | `<SurfaceOneProvider messages={…}>` / `<SoneMessagesProvider>`                      |
| `provideSoneSidebar(config)`              | `<SoneSidebarProvider config>` or the wrapper's `config`; `useSoneSidebar()`        |
| exposed methods (`focus()`, `clear()`)    | `ref` (flow: `SoneFlowApi`, confirm: `{ focus() }`), search field `handleRef`       |

Parts render the same element as their Angular directive (change it with `as`); every other prop
— `className` (merged), `ref`, `id`, `aria-*`, handlers — goes to that element. Components that
wrap a native control (switch, select, slider, OTP, password, search) put `className` and `style`
on the host element and everything else, `ref` included, on the control. Element components render
the same host tag (`<sone-icon>`, `<sone-switch>`, …), so the shared stylesheets apply unchanged.

## Components

Every `@surface-one/vue` component has its React twin (a test keeps the two lists in step):
Button, ButtonGroup · Badge · Card (+ parts) · Carousel (+ parts) · Alert (+ parts) · Banner · Separator · ScrollArea · Resizable (+ parts) · Skeleton ·
Kbd · Spinner · StatusDot · Icon · Logo · Avatar · Item · Empty · PageHeader · SectionHeading · Field,
InputGroup · Switch · Checkbox · Calendar · DatePicker · RadioGroup, Radio · Select · Combobox · Slider · Segmented · ToggleGroup, Tabs · ChoiceGroup, ChoiceCard ·
Textarea · FileUpload · InputNumber · InputOtp · PasswordInput · SecretField · TagInput · Rating · SearchField · FilterChips · CopyButton ·
Collapsible · CollapsibleSection · Disclosure · Accordion (+ parts) · Breadcrumb (+ parts) · NavigationMenu (+ parts) · Pagination (+ parts) · Menu · ContextMenuTrigger · Menubar, MenubarTrigger · Popover (+ parts) · HoverCard (+ parts) · Dialog, AlertDialog, Sheet ·
Confirm · Toaster · Progress · Meter · Sparkline · BarList · BarChart · LineChart · AreaChart · DonutChart · ChartLegend, Swatch · StackedBar · Stat ·
Table · DataTable · Stepper · LoadMore · ElapsedTimer · SpeakerChip · ChatHistory · Terminal (+ parts) ·
AgentChat (+ parts) · Dock · Flow (+ controls, minimap) · Graph (+ canvas, controls, card, legend) ·
Sidebar (+ parts) · Tooltip ·
Command (+ parts), CommandDialog · Tree, TreeItem · TreeRow · Timeline (+ legend, chapters) ·
Message, Bubble, Marker (+ parts) ·
Chat (pane, thread, message, composer, suggestion chips, typing indicator) · SourceList ·
RowMenu · PageActions (+ parts) · Recording (RecordButton, MicToggle, StatusOrb, LevelMeter,
RecordingIndicator, ProcessingStatus) · AudioPlayer · FloatingBar · DownloadProgress · PowerSlider ·
Transcript · LiveTranscript · Markdown · MarkdownEditor (+ tools, footer) · SidePanel (+ parts).

## Markdown

`<SoneMarkdown source={text} />` renders untrusted markdown read-only, with the look of the
Angular `sone-markdown` (its styles are part of `styles.css`). Raw HTML is shown as text, links
open in a new tab, images render only from inline `data:` URLs, and everything goes through
DOMPurify. `size="sm"` tightens it for side panels; `breaks={false}` keeps single newlines inside
a paragraph. The server renders the empty host (there is no sanitizer without a DOM) and the
browser fills it in after hydration. Install `marked` and `dompurify` alongside it: they are
optional peer dependencies, so apps without markdown never download them.

`<SoneMarkdownEditor value={text} onValueChange={setText} />` is the twin of
`sone-markdown-editor`: a formatting toolbar (`toolbar="full" | "minimal" | "document" | "none"`,
⌘/Ctrl + B, I, K, Shift+X, Shift+9), Write / Preview tabs or `mode="split"`, list continuation on
Enter and paste-as-markdown; `handleRef` gives `applyCommand`, `insertText`, `wrapSelection` and
the rest. `live` swaps the textarea for a live-preview editor built on CodeMirror: install
`@codemirror/{commands,lang-markdown,language,state,view}` and
`@lezer/{common,highlight,markdown}` for it (optional peer dependencies too). It loads on demand
after mount, so the server renders only its empty host; `preloadLiveMarkdown()` starts it early.

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

The icons come from `packages/angular/icon/icons.ts` and the scoped component styles
(`src/styles/hosts.generated.css`) are generated from `packages/angular` by
`scripts/generate-host-css.mjs` at the repository root on every build — change them there, never by
hand. The docs demos' React twins (`apps/docs/src/app/demos/react/<slug>.tsx`) and templates
(`apps/docs/src/app/templates/react/<slug>.tsx`) are type-checked and rendered by the tests, so
the snippets readers copy always compile and render.

## License

MIT — see [LICENSE](LICENSE).
