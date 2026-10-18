# Copilot instructions — SurfaceOne

Read and follow [`AGENTS.md`](../AGENTS.md): it is the single source of rules for every coding
agent in this repository (prefix `sone-`, tokens only, accessibility, nine locales, Conventional
Commits, no AI attribution, code-owner review).

- Skills live in `.agents/skills/` (Copilot and Codex read them there; Claude reads the
  `.claude/skills/` symlinks): `add-component`, `docs-i18n`, `pr-description`, `release`,
  `surface-one-angular`, `surface-one-vue`, `surface-one-react`, `surface-one-react-native`,
  `surface-one-theming`, `surface-one-a11y-review`.
- The SurfaceOne MCP server is configured for VS Code in `.vscode/mcp.json` (its data is
  generated, so run `npm ci` first); use its tools (`get_component_docs`, `get_template` — both
  with `framework: "vue"` / `"react"` for the twins — `get_theme_variables`, …) instead of
  guessing component APIs.
- Every Angular component in `packages/angular` has a Vue twin in `packages/vue` and a React twin
  in `packages/react` with the same markup: change all three together, then run
  `npm run test:vue`, `npm run test:react`, `npm run typecheck:vue` and `npm run typecheck:react`.
  When the family has a React Native twin in `packages/react-native` (no shared markup: styles
  come from the resolved tokens), update its props and behaviour too and run
  `npm run test:react-native` and `npm run typecheck:react-native`.
