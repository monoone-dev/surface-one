---
name: docs-i18n
description: Change or add copy on the SurfaceOne docs site in all nine languages (en, pl, es, it, fr, pt, de, zh, ja). Use for any edit to apps/docs/src/app/i18n/messages/*.ts — new guide pages, component descriptions, UI labels — and when adding a locale.
---

# Docs copy in nine languages

`apps/docs/src/app/i18n/messages/en.ts` is the source. Every other locale is typed `Messages`, so a
missing, extra or renamed key fails `npm run typecheck` and the build. Always change all nine.

## Rules

- Same keys, nesting, array lengths and guide block order as `en.ts`. Guide pages are arrays of
  blocks: `{ p }`, `{ h2 }`, `{ list }`, `{ note }`, `{ code: "<snippet id>" }`. Code lives in
  `i18n/snippets.ts` and is never translated.
- Inline markup stays byte-identical: `` `code` ``, `**bold**`, `[label](/path)` (translate the label
  only; paths starting with `/` are localized automatically). Keep `{placeholders}`.
- Never translate: SurfaceOne, IndexOne, MonoOne, Ivy, Storybook, GitHub, Angular, Vue, React,
  shadcn/ui, spartan/ui, Nuxt UI, WAI-ARIA, WCAG, MCP, Studio / Paper / Minimalist / Neumorphism / Material, component names.
- Terminology already used: pl „skórka” (skin), „tryb kolorów”; de „Skin”, „Farbmodus”, formal
  „Sie”; zh 皮肤 / 令牌; ja スキン / トークン. Quotes: pl/de „…”, es/it «…», fr « … », pt “…”,
  zh “…”, ja 「…」.
- `a11y.*` labels are read by screen readers — idiomatic, short.
- A new guide page: add it to `guide.pages` in every locale (order = sidebar order); routes,
  prerendering, sitemap and the MCP `get_docs` tool pick it up automatically.

## Verify

`npm run typecheck`, then `npm run build` and open `/pl/…` and `/ja/…` of the changed page.
