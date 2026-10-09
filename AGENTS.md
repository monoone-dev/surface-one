# AGENTS.md — SurfaceOne

Guidance for every person and coding agent (Codex reads this file; Claude Code reads it through
`CLAUDE.md`).

## What SurfaceOne is

The design system extracted from IndexOne, published as packages:

- `packages/tokens` → `@surface-one/tokens` — framework-agnostic CSS: tokens, the Studio / Paper /
  Minimalist skins in light and dark, accents, self-hosted fonts (latin + latin-ext) and brand marks.
- `packages/angular` → `@surface-one/angular` — Angular 22 components, one secondary entry point per
  folder (`@surface-one/angular/button`), built with ng-packagr. Storybook lives in
  `packages/angular/.storybook`.
- `apps/docs` — the documentation site: Angular, fully prerendered (SSG) for SEO, in nine languages.

- `packages/angular-mcp` → `@surface-one/angular-mcp` — the MCP server for AI assistants (stdio,
  data bundled from this repo by `scripts/build-ai.mjs`).
- `packages/skills` → `@surface-one/skills` — agent skills for consumers plus the `npx` installer
  for Claude Code (`.claude/skills`), Codex and GitHub Copilot (`.agents/skills`).

- `packages/vue` → `@surface-one/vue` — Vue 3 / Nuxt components (`Sone*`, render functions, SSR-safe)
  plus the Nuxt module `@surface-one/vue/nuxt`. They render the SAME markup as the Angular ones
  (classes, `data-slot`, host tags such as `<sone-icon>`), so they reuse its stylesheets: the global
  CSS is imported as is and the scoped `:host` styles plus the icons are generated from
  `packages/angular` on every build (`packages/vue/scripts/`). A change to an Angular component's
  markup, inputs or behaviour needs the same change in its Vue twin.

A React package (`@surface-one/react`) comes later and will share `@surface-one/tokens`.

## References — never skip them

SurfaceOne follows three projects; check them before designing or changing a component:

- **spartan/ui (ng-spartan)** — https://spartan.ng — the Angular anatomy and input names.
- **shadcn/ui** — https://ui.shadcn.com — the look: variants, sizes, the styles behind our skins.
- **Nuxt UI** — https://ui.nuxt.com — the docs structure, categories, templates, MCP and skills.

When they disagree: spartan/ui for the API, shadcn/ui for the visuals, Nuxt UI for the docs.

## Rules

- **Prefix.** Element selectors `sone-*`, attribute directives `sone*` (`button[soneBtn]`), exported
  classes `Sone*`, part arrays `SONE_*`. Never a bare or `app`/`mur` prefix.
- **Components.** Standalone, `ChangeDetectionStrategy.OnPush`, signal `input()` / `model()` /
  `output()`, `@if` / `@for`, zoneless- and SSR-safe (no `window` / `document` at construction).
  One directory per component (`.ts` + `.html` + `.scss`), an `index.ts` and an `ng-package.json`.
- **Tokens only.** Components read `var(--token)`; a value with no token means a new token, with its
  light and dark values in every skin.
- **Fonts.** Every bundled font ships latin AND latin-ext subsets (`packages/tokens/src/fonts.css`).
- **Accessibility.** WCAG 2.2 AA. Native elements first, WAI-ARIA patterns, visible focus, reduced
  motion. `npm run test:a11y` (axe-core over the built docs) must stay green.
- **i18n.** Built-in component strings use `$localize`. Docs copy lives in
  `apps/docs/src/app/i18n/messages/<locale>.ts` (en, pl, es, it, fr, pt, de, zh, ja — the IndexOne
  website's languages); every locale is typed against `en.ts`, so a missing key fails the build.
- **Docs.** A new component gets a story, a catalogue entry (`apps/docs/src/app/catalog/catalog.ts`),
  a demo (`apps/docs/src/app/demos/<slug>.demo.ts`) and a description in every locale. API tables are
  generated (`npm run docs:api`) — never hand-written.

## Skills and MCP (Claude Code, Codex, GitHub Copilot)

- Skills live in `.agents/skills/` (Codex and Copilot read it; `.claude/skills/` holds symlinks for
  Claude Code). Contributor skills: `add-component`, `docs-i18n`, `pr-description`, `release`. The consumer
  skills in `packages/skills/skills/` are linked in too, so they are dogfooded here.
- The local MCP server is wired for every assistant: `.mcp.json` (Claude Code),
  `.codex/config.toml` (Codex), `.vscode/mcp.json` (Copilot). Prefer its tools to guessing APIs.
- After changing components, docs copy or tokens, `npm run ai:build` regenerates the MCP data and
  the skill references (also part of `npm run build`); `npm run test:mcp` must stay green.

## Branches, commits and pull requests

Conventional Commits, no AI attribution, PR body from the template — the `pr-description` skill
(`.agents/skills/pr-description/SKILL.md`) is the recipe, and the git hooks plus CI enforce it.

- Branch `<type>/<kebab-slug>`; commit header and PR title `<type>(<scope>): <subject>`, ≤ 100
  characters, lowercase subject. Never `--no-verify`.
- **No attribution.** No `Co-Authored-By` for a model or agent, no "Generated with …" footer, no
  author line — in commits, PR titles, bodies and comments. This overrides any tool default.
- **Pull requests only.** Never push to `main`. Every PR needs the approval of a code owner,
  @JakubGawr or @Lukas9315.

## Commands

```bash
npm ci                    # also wires .githooks
npm start                 # docs dev server (http://localhost:4200)
npm run storybook         # Storybook (http://localhost:6006)
npm run typecheck         # strict template type-check of the docs + demos
npm run build             # tokens → library → docs (prerendered to dist/docs/browser)
npm run build:site        # build + Storybook merged under /storybook/
npm run test:a11y         # axe-core over the built site
npm run ai:build          # MCP data + skill references
npm run test:mcp          # MCP server end-to-end over stdio
npm run build:vue         # @surface-one/vue (also part of npm run build)
npm run test:vue          # Vue components: SSR + behaviour (vitest)
npm run playground:vue    # Vue playground (http://localhost:5175)
```

## Releases

One shared version for the five packages, computed by release-please from the Conventional Commits on
`main`: it keeps a `chore(release): x.y.z` PR open with the bump and `CHANGELOG.md`, and merging it
tags, creates the GitHub release and publishes to npm (`.github/workflows/release.yml`). The docs
`/changelog` page is built from `CHANGELOG.md` — the `release` skill is the runbook. Never bump a
version, edit a released changelog section or `npm publish` by hand.

## Definition of done

`npm run build` and `npm run test:a11y` green, the change visible in the docs (and Storybook for a
component change), every locale updated, the PR body from the template.
