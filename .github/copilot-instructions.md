# Copilot instructions — SurfaceOne

Read and follow [`AGENTS.md`](../AGENTS.md): it is the single source of rules for every coding
agent in this repository (prefix `sone-`, tokens only, accessibility, nine locales, Conventional
Commits, no AI attribution, code-owner review).

- Skills live in `.agents/skills/` (Copilot and Codex read them there; Claude reads the
  `.claude/skills/` symlinks): `add-component`, `docs-i18n`, `pr-description`, `release`,
  `surface-one-angular`, `surface-one-theming`, `surface-one-a11y-review`.
- The SurfaceOne MCP server is configured for VS Code in `.vscode/mcp.json`; use its tools
  (`get_component_docs`, `get_theme_variables`, …) instead of guessing component APIs.
