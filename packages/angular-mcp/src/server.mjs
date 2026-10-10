// The SurfaceOne MCP server. Everything it serves is bundled in
// `data/surface-one-angular.json` (built from the repo by scripts/build-ai.mjs), so
// it works offline and always matches the package version it ships with.
import { readFileSync } from "node:fs";

import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const DATA_URL = new URL("../data/surface-one-angular.json", import.meta.url);

export function loadData() {
  return JSON.parse(readFileSync(DATA_URL, "utf8"));
}

const text = (t) => ({ content: [{ type: "text", text: t }] });
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Finds a component by slug (`dialog`), name (`Dialog`, `Toggle Group & Tabs`),
 * class (`SoneDialogComponent`) or selector (`sone-dialog`, `soneBtn`, `[soneCard]`).
 */
export function findComponent(data, query) {
  const q = norm(query.replace(/^sone-?/i, ""));
  return (
    data.components.find((c) => norm(c.slug) === q || norm(c.name) === q) ??
    data.components.find((c) =>
      c.symbols.some(
        (s) =>
          norm(s.name) === norm(query) ||
          s.selector
            .split(",")
            .some(
              (sel) =>
                norm(
                  sel.replace(/^[a-z]+(?=\[)/, "").replace(/^sone-?/, ""),
                ) === q,
            ),
      ),
    ) ??
    data.components.find(
      (c) => norm(c.name).includes(q) || norm(c.slug).includes(q),
    )
  );
}

function apiMarkdown(symbol) {
  const lines = [
    `### ${symbol.name} (${symbol.kind})`,
    "",
    `- Selector: \`${symbol.selector}\``,
  ];
  if (symbol.exportAs) lines.push(`- Export as: \`${symbol.exportAs}\``);
  if (symbol.description) lines.push("", symbol.description);
  if (symbol.inputs.length) {
    lines.push(
      "",
      "| Input | Type | Default | Notes |",
      "| --- | --- | --- | --- |",
    );
    for (const i of symbol.inputs) {
      const notes = [
        i.required && "required",
        i.model && "two-way `[( )]`",
        i.description,
      ]
        .filter(Boolean)
        .join("; ");
      lines.push(
        `| \`${i.name}\` | \`${i.type || "—"}\` | \`${i.default || "—"}\` | ${notes} |`,
      );
    }
  }
  if (symbol.outputs.length) {
    lines.push("", "| Output | Type | Notes |", "| --- | --- | --- |");
    for (const o of symbol.outputs)
      lines.push(`| \`${o.name}\` | \`${o.type}\` | ${o.description} |`);
  }
  return lines.join("\n");
}

export function componentDocs(c) {
  const names = c.symbols.map((s) => s.name);
  return [
    `# ${c.name}`,
    "",
    c.description,
    "",
    `Category: ${c.categoryName} · Docs: ${c.docsUrl}${c.storybook[0] ? ` · Storybook: ${c.storybook[0]}` : ""}`,
    "",
    "## Import",
    "",
    "```ts",
    `import {\n${names.map((n) => `  ${n},`).join("\n")}\n} from "${c.import}";`,
    "```",
    "",
    "## Usage",
    "",
    "Template (from the live docs demo):",
    "",
    "```html",
    c.example.trim(),
    "```",
    "",
    "Full standalone component of the demo (state, imports):",
    "",
    "```ts",
    c.exampleSource.trim(),
    "```",
    "",
    "## API",
    "",
    c.symbols.map(apiMarkdown).join("\n\n"),
  ].join("\n");
}

const filesMarkdown = (files, lang) =>
  files
    .map(
      (f) =>
        `### ${f.path}\n\n\`\`\`${lang(f.path)}\n${f.content.trim()}\n\`\`\``,
    )
    .join("\n\n");

function resolveMany(data, names) {
  const found = [];
  const missing = [];
  for (const n of names) {
    const c = findComponent(data, n);
    if (c) found.push(c);
    else missing.push(n);
  }
  const hint = missing.length
    ? `\n\n> Not found: ${missing.join(", ")}. Call \`list_components\` for the exact names.`
    : "";
  return { found, hint };
}

const INSTRUCTIONS = `SurfaceOne is an accessible Angular 22 design system (signals, zoneless, SSR-safe).
Rules when writing code with it:
- Install \`@surface-one/angular\` + \`@surface-one/tokens\`; load "@surface-one/tokens" then "@surface-one/angular/styles.css" in angular.json styles.
- Import each component from its own entry point (\`@surface-one/angular/<slug>\`); element selectors start with \`sone-\`, attribute directives with \`sone\` (\`button[soneBtn]\`).
- Use tokens (\`var(--surface-raised)\`, \`var(--space-4)\`), never raw colours. Theme with data-skin / data-theme / data-accent on <html>.
- Accessibility is required: labels for controls, aria-label for icon-only buttons, native elements first.
Workflow: list_components → get_component_docs for the exact API before writing a template; get_docs for guides; get_theme_variables for tokens; get_template for full-screen examples.`;

export function createSurfaceOneServer(data = loadData()) {
  const server = new McpServer(
    { name: "surface-one-angular", version: data.version },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "list_components",
    {
      title: "List SurfaceOne components",
      description:
        "List every @surface-one/angular component family (name, slug, category, entry point, selectors, one-line description). Call this first to get exact component names.",
      inputSchema: z.object({
        category: z
          .enum(Object.keys(data.categories))
          .optional()
          .describe(
            "Only this category (layout, element, form, data, navigation, overlay, page, chat, editor, media).",
          ),
      }),
    },
    async ({ category }) => {
      const rows = data.components
        .filter((c) => !category || c.category === category)
        .map(
          (c) =>
            `- **${c.name}** (\`${c.slug}\`, ${c.categoryName}) — ${c.description}\n  Import from \`${c.import}\`; selectors: ${c.symbols
              .filter((s) => s.kind !== "pipe")
              .map((s) => `\`${s.selector}\``)
              .join(", ")}`,
        );
      return text(
        `# SurfaceOne components (v${data.version})\n\nInstall: \`${data.install}\`\n\n${rows.join("\n")}`,
      );
    },
  );

  server.registerTool(
    "get_component_docs",
    {
      title: "Get component documentation",
      description:
        "Complete documentation for one or more components: description, import, a working usage example (template + standalone component) and the full API (selectors, inputs with types and defaults, outputs). Accepts names, slugs, classes or selectors (Button, dialog, SoneSwitchComponent, sone-select, soneBtn).",
      inputSchema: z.object({
        components: z
          .array(z.string())
          .min(1)
          .describe('Component names, e.g. ["Button", "Dialog"].'),
      }),
    },
    async ({ components }) => {
      const { found, hint } = resolveMany(data, components);
      return text(found.map(componentDocs).join("\n\n---\n\n") + hint);
    },
  );

  server.registerTool(
    "get_component_source_code",
    {
      title: "Get component source code",
      description:
        "The Angular source (.ts and .html) of components — for learning how they work or debugging. Use get_component_docs for usage.",
      inputSchema: z.object({ components: z.array(z.string()).min(1) }),
    },
    async ({ components }) => {
      const { found, hint } = resolveMany(data, components);
      return text(
        found
          .map(
            (c) =>
              `# ${c.name} — source\n\n${filesMarkdown(c.source, (p) => (p.endsWith(".html") ? "html" : "ts"))}`,
          )
          .join("\n\n---\n\n") + hint,
      );
    },
  );

  server.registerTool(
    "get_component_source_styles",
    {
      title: "Get component styles",
      description:
        "The CSS/SCSS of components, including every variant and state. Every value is a design token (see get_theme_variables).",
      inputSchema: z.object({ components: z.array(z.string()).min(1) }),
    },
    async ({ components }) => {
      const { found, hint } = resolveMany(data, components);
      return text(
        found
          .map((c) =>
            c.styles.length
              ? `# ${c.name} — styles\n\n${filesMarkdown(c.styles, (p) => (p.endsWith(".scss") ? "scss" : "css"))}`
              : `# ${c.name} — styles\n\nNo stylesheet of its own; it is styled by the global component CSS of another entry point.`,
          )
          .join("\n\n---\n\n") + hint,
      );
    },
  );

  server.registerTool(
    "get_docs",
    {
      title: "Get a documentation page",
      description: `Guides, principles and release notes (not component docs). Paths: ${data.docs.map((d) => d.path).join(", ")}.`,
      inputSchema: z.object({
        path: z
          .string()
          .describe('Exact path, e.g. "/docs/angular/guide/installation".'),
      }),
    },
    async ({ path }) => {
      const page =
        data.docs.find((d) => d.path === path) ??
        data.docs.find((d) =>
          d.path.endsWith(
            "/" +
              path
                .replace(/^\/+|\/+$/g, "")
                .split("/")
                .pop(),
          ),
        );
      if (page) return text(`${page.markdown}\n\nSource: ${page.url}`);
      return text(
        `No page at "${path}". Available:\n${data.docs.map((d) => `- \`${d.path}\` — ${d.title}: ${d.description}`).join("\n")}`,
      );
    },
  );

  server.registerTool(
    "get_theme_variables",
    {
      title: "Get theme variables",
      description:
        "SurfaceOne design tokens with their values: the shared token files (typography, layout, scale, accents) and each skin (studio, paper, minimalist, neumorphism, material) in light and dark mode.",
      inputSchema: z.object({
        skin: z
          .enum(["studio", "paper", "minimalist", "neumorphism", "material"])
          .optional(),
        mode: z.enum(["light", "dark"]).optional(),
      }),
    },
    async ({ skin, mode }) => {
      const t = data.theme;
      const block = (title, vars) =>
        `## ${title}\n\n${Object.entries(vars)
          .map(([k, v]) => `${k}: ${v};`)
          .join("\n")}`;
      const parts = [
        `# SurfaceOne theme variables\n\n${t.note}\n\nAttributes: ${Object.entries(
          t.attributes,
        )
          .map(([k, v]) => `\`${k}\` = ${v.join(" | ")}`)
          .join("; ")}`,
      ];
      if (!skin)
        for (const [file, vars] of Object.entries(t.shared))
          parts.push(block(`${file}.css (all skins)`, vars));
      for (const s of skin ? [skin] : Object.keys(t.skins)) {
        for (const m of mode ? [mode] : ["light", "dark"])
          parts.push(block(`${s} · ${m}`, t.skins[s][m]));
      }
      return text(parts.join("\n\n"));
    },
  );

  server.registerTool(
    "list_templates",
    {
      title: "List screen templates",
      description:
        "Full screens built only from SurfaceOne (dashboard, AI chat, settings, meeting notes, sign-in and sign-up, forms, messages, workspaces, editors, media, finances, CRM).",
      inputSchema: z.object({}),
    },
    async () =>
      text(
        data.templates
          .map(
            (t) =>
              `- **${t.title}** (\`${t.slug}\`) — ${t.description} ${t.url}`,
          )
          .join("\n"),
      ),
  );

  server.registerTool(
    "get_template",
    {
      title: "Get a screen template",
      description:
        "The complete standalone Angular component of a template — a starting point for a new screen.",
      inputSchema: z.object({
        name: z.string().describe('Template slug, e.g. "dashboard".'),
      }),
    },
    async ({ name }) => {
      const t = data.templates.find(
        (x) => norm(x.slug) === norm(name) || norm(x.title) === norm(name),
      );
      if (!t)
        return text(
          `No template "${name}". Available: ${data.templates.map((x) => x.slug).join(", ")}.`,
        );
      return text(
        `# ${t.title}\n\n${t.description}\n\n\`\`\`ts\n${t.source.trim()}\n\`\`\``,
      );
    },
  );

  return server;
}
