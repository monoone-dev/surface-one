# Surface One

Design system and component library — the one behind IndexOne — as packages any app can use.

| Package                                    | What it is                                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@surface-one/tokens`](packages/tokens)   | Framework-agnostic CSS: design tokens, the Studio / Paper / Minimalist skins in light and dark, five accents, self-hosted latin + latin-ext fonts, brand marks. |
| [`@surface-one/angular`](packages/angular) | Angular 22 components with the `sone-` prefix — one secondary entry point per component (`@surface-one/angular/button`).                                        |

Vue and React packages are planned on top of the same tokens.

## Built on the shoulders of

Surface One does not invent its component model — it deliberately follows three open-source
projects. Keep them in mind for every new component and every docs change:

| Project                                       | What we take from it                                                                                                                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [spartan/ui (ng-spartan)](https://spartan.ng) | The Angular anatomy: directive-first parts (`hlmBtn` → `soneBtn`, `hlmCard*` → `soneCard*`), inputs and their names, the brain/helm split of behaviour and styling.                                        |
| [shadcn/ui](https://ui.shadcn.com)            | The visual core: variants, sizes, spacing and the Nova / Vega / Maia styles our Minimalist, Studio and Paper skins are built on. Components are shadcn 1:1 with the base tokens.                           |
| [Nuxt UI](https://ui.nuxt.com)                | The documentation and catalogue: component categories (Layout, Element, Form, Data, Navigation, Overlay, Page, AI Chat, Editor), the Templates section, the MCP server and agent skills for AI assistants. |

Every component page in Storybook links its spartan/ui and shadcn/ui reference. When the three
disagree, follow spartan/ui for the Angular API, shadcn/ui for the look, and Nuxt UI for the docs.

## Install

```bash
npm install @surface-one/angular @surface-one/tokens
```

```jsonc
// angular.json → build.options
"styles": ["@surface-one/tokens", "@surface-one/angular/styles.css", "src/styles.css"]
```

```ts
import { SoneButtonDirective } from "@surface-one/angular/button";
```

```html
<button soneBtn variant="outline" type="button">Save</button>
```

## Documentation

- **Docs site** (`apps/docs`) — Home, Components, Guide, Theme, Templates and Release, in English,
  Polski, Español, Italiano, Français, Português, Deutsch, 简体中文 and 日本語. Fully prerendered for
  SEO, tested with axe-core in light and dark mode.
- **Storybook** — every component and token page; published under `/storybook/` of the docs site.

## AI assistants

- **MCP server** — `@surface-one/angular-mcp` gives Claude Code, Codex, Copilot, Cursor and Windsurf
  the component docs, API, source, styles, templates and theme variables:
  `claude mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest`.
- **Agent skills** — `npx @surface-one/skills add` installs the Surface One skills for Claude
  (`.claude/skills/`), Codex and GitHub Copilot (`.agents/skills/`).

See the Guide pages _MCP server_ and _Agent skills_ on the docs site.

## Develop

```bash
npm ci                 # installs and wires the git hooks
npm start              # docs on http://localhost:4200
npm run storybook      # Storybook on http://localhost:6006
npm run build:site     # tokens → library → docs (+ Storybook) into dist/docs/browser
npm run test:a11y      # axe-core over the built site
```

Branches, Conventional Commits and pull requests: see [`AGENTS.md`](AGENTS.md) and
[`CONTRIBUTING.md`](CONTRIBUTING.md). Code owners: @JakubGawr, @Lukas9315.
