# @surface-one/angular-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI assistants direct
access to the SurfaceOne documentation for Angular (`@surface-one/angular`), Vue 3 / Nuxt
(`@surface-one/vue`) and React 19 / Next.js (`@surface-one/react`): every component's API, a
working example in each framework, its source and styles, the guides, the screen templates and the
theme variables. Modelled on
[HeroUI's MCP server](https://heroui.com/docs/react/getting-started/mcp-server).

Everything is bundled with the package (no network, no API key), so the answers always match the
SurfaceOne version you install. Transport: stdio. Requires Node.js 22+. The name stays
`surface-one-angular` for every framework, so existing setups keep working.

## Setup

### Claude Code

```bash
claude mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest
```

### Codex

```bash
codex mcp add surface-one-angular -- npx -y @surface-one/angular-mcp@latest
```

or in `~/.codex/config.toml`:

```toml
[mcp_servers.surface-one-angular]
command = "npx"
args = ["-y", "@surface-one/angular-mcp@latest"]
```

### VS Code (GitHub Copilot)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "surface-one-angular": {
      "command": "npx",
      "args": ["-y", "@surface-one/angular-mcp@latest"]
    }
  }
}
```

### Cursor, Windsurf, Claude Desktop

```json
{
  "mcpServers": {
    "surface-one-angular": {
      "command": "npx",
      "args": ["-y", "@surface-one/angular-mcp@latest"]
    }
  }
}
```

Cursor: Settings → Tools → MCP. Windsurf: `.windsurf/mcp.json`. Claude Desktop:
`claude_desktop_config.json`.

## Tools

`framework` is `"angular"` (the default), `"vue"` or `"react"`.

| Tool                          | Parameters                           | Returns                                                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_components`             | `category?`, `framework?`            | Every component family: name, slug, category, entry point, selectors, Vue / React names, description. With `framework`, only the families that package has.                                                                                                                 |
| `get_component_docs`          | `components: string[]`, `framework?` | Description, import, a working example (Angular: template + standalone component; Vue: the SFC; React: the component) and the full API. Accepts names, slugs, classes, selectors or Vue / React names (`Button`, `dialog`, `SoneSwitchComponent`, `soneBtn`, `SoneDialog`). |
| `get_component_source_code`   | `components: string[]`               | The Angular `.ts` / `.html` source (the twins render the same markup).                                                                                                                                                                                                      |
| `get_component_source_styles` | `components: string[]`               | The `.css` / `.scss`, every variant and state — shared by all three packages.                                                                                                                                                                                               |
| `get_docs`                    | `path`                               | A guide, a package guide or a release-notes page as markdown, e.g. `/docs/angular/guide/theming`, `/docs/vue/package`, `/docs/react/package`.                                                                                                                               |
| `get_theme_variables`         | `skin?`, `mode?`                     | Token values: shared files plus Studio / Paper / Minimalist / Neumorphism / Material / Surface in light and dark.                                                                                                                                                           |
| `list_templates`              | —                                    | The screen templates and the frameworks each one exists in.                                                                                                                                                                                                                 |
| `get_template`                | `name`, `framework?`                 | A template's complete source (`dashboard`, `chat`, `settings`, `notes`, …): the standalone Angular component, the Vue SFC or the React component.                                                                                                                           |

## Try asking

- “Build a settings page with SurfaceOne: a switch, a select and a save button.”
- “Show me the API of the SurfaceOne dialog.”
- “Which tokens does the Paper skin use in dark mode?”
- “Start a dashboard screen from the SurfaceOne template.”
- “Add a SurfaceOne dialog to my Nuxt page.” / “Use the SurfaceOne select in my Next.js form.”

## Development

The data file is generated from the repository by `npm run ai:build` (part of `npm run generate`,
which `npm ci` runs; it is not committed).
`npm test -w @surface-one/angular-mcp` runs the end-to-end stdio test.

## License

MIT — see [LICENSE](LICENSE).
