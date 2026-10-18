# Contributing to SurfaceOne

1. Open an issue or discuss the change first for anything non-trivial.
2. Branch from `main` as `<type>/<kebab-slug>` and keep the change focused. Follow `AGENTS.md`.
3. Commit with Conventional Commits (`<type>(<scope>): <subject>`, lowercase, ≤ 100 characters).
   No AI attribution of any kind. The git hooks check both — never bypass them.
4. Make sure `npm run build` and `npm run test:a11y` are green, plus the checks of what you
   touched: `npm run typecheck`, `npm run lint:styles`, `npm run format:check`; for a component,
   its Vue and React twins too (`npm run typecheck:vue`, `npm run test:vue`,
   `npm run typecheck:react`, `npm run test:react`) and its React Native twin when it has one
   (`npm run typecheck:react-native`, `npm run test:react-native`); for docs copy, tokens or components,
   `npm run generate` (commit the regenerated API and skill references) and `npm run test:mcp`.
   A change to an Angular component's markup, inputs or behaviour needs the same change in
   `packages/vue` and `packages/react` (the `add-component` skill lists the files).
5. Open a PR against `main` using the template: one short line per real change.
   A code owner (@JakubGawr or @Lukas9315) must approve it.

The full recipe is the `pr-description` skill in `.agents/skills/pr-description/SKILL.md`.
