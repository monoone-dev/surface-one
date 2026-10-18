# @surface-one/react-native

React Native and Expo components of the SurfaceOne design system. They are the mobile twins of
`@surface-one/angular`, `@surface-one/vue` and `@surface-one/react`: the same tokens and skins,
the same component names (`Sone*`), the same props wherever they make sense on a phone, and the
same accessibility semantics (roles, names, states). React Native has no CSS, so the package does
not ship a stylesheet. Instead every token of `@surface-one/tokens` is resolved at build time into
React Native values, per skin × light/dark × accent. That includes `oklch()` and `color-mix()`
computed into sRGB, `rem` and `calc()` into dp, and shadows into `boxShadow`.

```bash
npm install @surface-one/react-native react-native-svg
```

Peer dependencies: `react` 19, `react-native` 0.78 or newer (the New Architecture, for
`boxShadow`) and `react-native-svg` 15 (icons, the spinner and the charts). Expo SDK 53+ works
out of the box: `npx expo install @surface-one/react-native react-native-svg`.

## Setup

```tsx
// App.tsx
import { SurfaceOneProvider, SoneButton } from "@surface-one/react-native";
import { studio } from "@surface-one/react-native/skins";

export default function App() {
  return (
    <SurfaceOneProvider skin={studio} colorMode="system" accent="teal">
      <SoneButton onPress={() => console.log("saved")}>Save</SoneButton>
    </SurfaceOneProvider>
  );
}
```

`SurfaceOneProvider` is optional. Without it the components render Minimalist, light, in English.
It takes:

| Prop        | Default      | What it does                                                                                                                                                                                         |
| ----------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skin`      | `minimalist` | A skin from `@surface-one/react-native/skins`: `studio`, `paper`, `minimalist`, `neumorphism`, `material`, `surface`. Each skin is its own module, so an app only bundles the skins it imports.      |
| `colorMode` | `"system"`   | `"light"`, `"dark"` or `"system"` (follows the device, the twin of `data-theme`).                                                                                                                    |
| `accent`    | `null`       | `"blue"`, `"teal"`, `"green"`, `"orange"` or `"pink"` (the twin of `data-accent`).                                                                                                                   |
| `tokens`    | none         | Token overrides on top of the skin: `{ accent: "#7c3aed", radius: 14 }`.                                                                                                                             |
| `fonts`     | `"system"`   | `"system"` keeps the platform font; `"skin"` uses the skin's families (Geist, Figtree …), which you load yourself (e.g. `expo-font`); or name your own: `{ sans: "Inter", mono: "JetBrains Mono" }`. |
| `messages`  | English      | Translations of the built-in strings, the same `SoneMessages` as the web packages.                                                                                                                   |

The device's reduce-motion setting is respected: spinners, skeletons and transitions stand
still while it is on.

## Tokens in your own components

```tsx
import { useSoneStyles, SoneText } from "@surface-one/react-native";

function Panel({ children }: { children: React.ReactNode }) {
  const s = useSoneStyles((t) => ({
    box: {
      padding: t.tokens.space4,
      borderRadius: t.tokens.radiusLg,
      backgroundColor: t.tokens.surfaceRaised,
      borderWidth: t.tokens.borderWidthThin,
      borderColor: t.tokens.border,
    },
  }));
  return <View style={s.box}>{children}</View>;
}
```

Every token has its CSS name in camelCase (`--btn-default-bg` → `btnDefaultBg`, `--space-4` →
`space4`). The values are typed by kind: colours are strings, lengths are dp, shadows are
`boxShadow` strings, and letter spacing (`em`) is read with `em(token, fontSize)`.
`useSoneTheme()` returns the whole theme (`tokens`, `scheme`, `skin`, `accent`, `fonts`,
`reduceMotion`). `resolveTokens(skin, scheme, accent)` works outside React.

Text inherits from its component, because React Native has no CSS inheritance. `SoneText` and
`SoneIcon` take the ink, size and weight of the button, badge or alert they sit in. You can set
these yourself with `SoneForegroundProvider`.

## From React to React Native

| React (web)                                            | React Native                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `import "@surface-one/tokens"` + `styles.css`          | `<SurfaceOneProvider skin={studio}>`: no CSS to load                     |
| `<html data-skin data-theme data-accent>`              | `skin`, `colorMode`, `accent` on the provider                            |
| `className`                                            | `style` (merged last)                                                    |
| `onClick`                                              | `onPress`                                                                |
| `<SoneButton as={Link}>`                               | wrap it: `<Link asChild><SoneButton>…</SoneButton></Link>` (Expo Router) |
| `value` + `onValueChange`, `defaultValue`              | the same                                                                 |
| `checked` + `onCheckedChange`, `open` + `onOpenChange` | the same                                                                 |
| `aria-*` props                                         | the same React Native `aria-*` props (`aria-label`, `aria-checked` …)    |
| hover states                                           | pressed states                                                           |
| `SoneDialog` / `SoneSheet` (portal)                    | React Native `Modal` (scrim press and Android back dismiss)              |
| `SoneCopyButton` writes the clipboard                  | pass `copy={(text) => Clipboard.setStringAsync(text)}` (expo-clipboard)  |

## Components

Actions and display: `SoneButton` / `SoneButtonGroup`, `SoneBadge`, `SoneCard` and its parts,
`SoneAlert`, `SoneBanner`, `SoneAvatar`, `SoneSeparator`, `SoneSkeleton`, `SoneSpinner`,
`SoneStatusDot`, `SoneEmpty` and its parts, `SoneItem`, `SoneStat`, `SoneSectionHeading`,
`SonePageHeader`, `SoneIcon`.

Forms: `SoneInput`, `SoneTextarea` and the field parts, `SonePasswordInput`, `SoneSearchField`,
`SoneInputNumber`, `SoneInputOtp`, `SoneSwitch`, `SoneSlider`, `SoneSegmented`,
`SoneToggleGroup`, `SoneSelect`, `SoneRating`, `SoneChoiceCard`, `SoneFilterChips`,
`SoneStepper`.

Overlays and disclosure: `SoneDialog`, `SoneAlertDialog`, `SoneSheet`, `SoneConfirm`, `SoneCollapsible`,
`SoneDisclosure`, `SoneCopyButton`, `SoneLoadMore`, `SoneElapsedTimer`.

Data: `SoneProgress`, `SoneMeter`, `SoneSparkline`, `SoneBarList`, `SoneStackedBar`,
`SoneChartLegend`.

The web-only families (sidebar, dock, menus, tooltips, tables, markdown, terminal, flow, the AI chat
and the editor) have no React Native twin yet.

## Development

```bash
npm run test:react-native        # behaviour, rendered through react-native-web (vitest)
npm run typecheck:react-native
npm run playground:react-native  # every component in the browser via react-native-web (http://localhost:5177)
npm run build:react-native
```

The theme (`src/theme/generated`) and the glyphs (`src/components/icon/glyphs.generated.ts`) are
generated from `@surface-one/tokens` and `packages/angular/icon` by
`scripts/generate-native-theme.mjs` and `scripts/generate-native-icons.mjs`. Never edit them by hand.

## License

MIT
