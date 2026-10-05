# @surface-one/skills

[Agent skills](https://agentskills.io) that teach AI coding assistants to build with Surface One —
for **Claude Code**, **OpenAI Codex** and **GitHub Copilot** (one `SKILL.md` format, three locations).

| Skill                     | Use it for                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `surface-one-angular`     | Building screens with `@surface-one/angular`: setup, entry points, `sone-` selectors, tokens, overlays, forms. Ships the full component catalogue in `references/`. |
| `surface-one-theming`     | Skins, light/dark/system, accents, token overrides, latin-ext fonts.                                                                                                |
| `surface-one-a11y-review` | A WCAG 2.2 AA checklist for Surface One screens, fixed not just reported.                                                                                           |

## Install

```bash
npx @surface-one/skills add                    # every skill, for Claude, Codex and Copilot
npx @surface-one/skills add --agent claude      # only .claude/skills
npx @surface-one/skills add surface-one-theming --agent codex --agent copilot
npx @surface-one/skills add --global            # user-level: ~/.claude/skills, ~/.agents/skills, ~/.copilot/skills
npx @surface-one/skills list
```

| Assistant      | Project folder                                                      | Global folder        |
| -------------- | ------------------------------------------------------------------- | -------------------- |
| Claude Code    | `.claude/skills/`                                                   | `~/.claude/skills/`  |
| Codex          | `.agents/skills/`                                                   | `~/.agents/skills/`  |
| GitHub Copilot | `.agents/skills/` (also reads `.github/skills/`, `.claude/skills/`) | `~/.copilot/skills/` |

Re-run with `--force` after upgrading Surface One to refresh the skills. Pair them with the MCP
server `@surface-one/angular-mcp` — the skills tell the assistant to use its tools when present.
