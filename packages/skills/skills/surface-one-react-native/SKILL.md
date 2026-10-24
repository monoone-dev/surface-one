---
name: surface-one-react-native
description: Build React Native or Expo UI with the SurfaceOne design system (@surface-one/react-native, Sone* components). Use whenever a task creates or changes a screen, form, dialog, sheet, list or any component in a React Native or Expo app that depends on @surface-one/react-native, or when the user mentions SurfaceOne or SoneButton-style components in a mobile app.
---

# Building UI with SurfaceOne (React Native / Expo)

`@surface-one/react-native` is the mobile twin of `@surface-one/angular`, `@surface-one/vue` and
`@surface-one/react`. It has the same component names (`Sone*`), the same props wherever they make
sense on a phone, and the same accessibility semantics. React Native has no CSS, so every token
of `@surface-one/tokens` is resolved per skin × light/dark × accent into React Native values, and
the provider hands them to every component.

## Before writing code

1. Read `references/components.md`: every component the package has, with its exported names.
   Read `references/setup.md` for setup, tokens and the React → React Native mapping.
2. If the **`surface-one-angular` MCP server** is available, `get_component_docs` with
   `framework: "react"` gives a family's props (the native twin follows them), and `get_docs`
   `/docs/react-native/package` gives the package guide. Do not guess prop names.

## Setup (once per app)

- `npx expo install @surface-one/react-native react-native-svg` (or `npm install …` in a bare
  React Native app, 0.78+ with the New Architecture).
- Wrap the root once:
  `<SurfaceOneProvider skin={surface} colorMode="system">`, with
  `import { surface } from "@surface-one/react-native/skins/surface"` (the default look; or `linen` /
  `studio` / `paper` / `minimalist` / `neumorphism` — one path per skin, so Metro ships only it). `accent="teal"` picks a palette, `tokens={…}`
  overrides values, and `messages={…}` translates the built-in strings.
- Fonts: the platform font by default. `fonts="skin"` uses the skin's families (Geist, Figtree …)
  once you have loaded them with `expo-font`.

## Writing components

- Import from the package root: `import { SoneButton, SoneCard, SoneDialog } from
"@surface-one/react-native";`. Never build a parallel button, card or input: use the system's.
- The props match the React twin, with `onPress` for `onClick` and `style` for `className`
  (merged last). Two-way values are controlled pairs or uncontrolled defaults: `checked` +
  `onCheckedChange`, `value` + `onValueChange`, `open` + `onOpenChange` (or `defaultChecked` /
  `defaultValue` / `defaultOpen`).
- A string child of a button, badge or alert becomes its label. `SoneIcon name="plus"` takes the
  surrounding ink and size. Write your own text as `SoneText` (`tone`, `size`, `weight`, `mono`),
  not a bare `Text`, so it follows the theme.
- Dialogs and sheets are React Native `Modal`s: a scrim press and the Android back button dismiss
  them unless you prevent it.

- Mobile patterns the package already has — do not hand-roll them: `toast("Saved")` /
  `toast.error(…)` with one `<SoneToaster insets={…} />` for transient messages, `SoneTabBar`
  (floating bottom tabs), `SoneAppBar` (top bar with back button), `SoneAvatarGroup`,
  `SoneDateField` (calendar sheet, or inject `pick`) and `SoneImagePicker` (inject
  `pick`, e.g. from expo-image-picker). Safe areas are props: pass `useSafeAreaInsets()` values
  as `insets` / `topInset` / `bottomInset`.

## Styling your own views

- Only tokens: `useSoneStyles(({ tokens: t }) => ({ box: { padding: t.space4, borderRadius:
t.radiusLg, backgroundColor: t.surfaceRaised, borderColor: t.border } }))`. Token names are
  the CSS names in camelCase (`--text-secondary` → `textSecondary`). No hex colours, no magic
  numbers for colour, space or radius: the skins and dark mode depend on it.
- Shadows are `boxShadow` strings (`t.cardShadow`, with "" for none). Use `shadow(t.cardShadow)`.
  For an em letter spacing, use `em(t.trackingHeading, fontSize)`.
- Layout (flex, widths) is yours; visual decisions come from tokens.

## Accessibility (required)

- Every icon-only button has an `aria-label`. Every input has a visible label or `aria-label`.
- Use the React Native `aria-*` props and `role` the components already set (`aria-checked`,
  `aria-expanded`, `aria-valuenow` …) for your own controls, too.
- Touch targets: keep a control at the skin's control height or larger, and never shrink below it.
- Respect reduce motion: `useSoneTheme().reduceMotion` (the components already do).
