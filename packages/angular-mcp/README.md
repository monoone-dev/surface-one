# @surface-one/angular-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI assistants direct
access to the SurfaceOne Angular documentation: every component's API, a working example, its
source and styles, the guides, the screen templates and the theme variables. Modelled on
[HeroUI's MCP server](https://heroui.com/docs/react/getting-started/mcp-server).

Everything is bundled with the package (no network, no API key), so the answers always match the
`@surface-one/angular` version you install. Transport: stdio. Requires Node.js 22+.

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

| Tool                          | Parameters             | Returns                                                                                                                                                                                                      |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list_components`             | `category?`            | Every component family: name, slug, category, entry point, selectors, description.                                                                                                                           |
| `get_component_docs`          | `components: string[]` | Description, import, a working example (template + standalone component) and the full API. Accepts names, slugs, classes or selectors (`Button`, `dialog`, `SoneSwitchComponent`, `sone-select`, `soneBtn`). |
| `get_component_source_code`   | `components: string[]` | The `.ts` / `.html` source.                                                                                                                                                                                  |
| `get_component_source_styles` | `components: string[]` | The `.css` / `.scss`, every variant and state.                                                                                                                                                               |
| `get_docs`                    | `path`                 | A guide or release-notes page as markdown, e.g. `/docs/angular/guide/theming`.                                                                                                                               |
| `get_theme_variables`         | `skin?`, `mode?`       | Token values: shared files plus Studio / Paper / Minimalist / Neumorphism in light and dark.                                                                                                                 |
| `list_templates`              | —                      | The screen templates.                                                                                                                                                                                        |
| `get_template`                | `name`                 | A template's complete standalone component (`dashboard`, `chat`, `settings`, `notes`).                                                                                                                       |

## Try asking

- “Build a settings page with SurfaceOne: a switch, a select and a save button.”
- “Show me the API of the SurfaceOne dialog.”
- “Which tokens does the Paper skin use in dark mode?”
- “Start a dashboard screen from the SurfaceOne template.”

## Development

The data file is generated from the repository by `npm run ai:build` (part of `npm run build`).
`npm test -w @surface-one/angular-mcp` runs the end-to-end stdio test.
