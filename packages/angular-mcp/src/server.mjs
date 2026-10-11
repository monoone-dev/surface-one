// The SurfaceOne MCP server. Everything it serves is bundled in
// `data/surface-one-angular.json` (built from the repo by scripts/build-ai.mjs), so
// it works offline and always matches the package version it ships with. It covers the
// three component packages — @surface-one/angular, @surface-one/vue and
// @surface-one/react — which share one catalogue, one API and one set of stylesheets.
import { readFileSync } from "node:fs";

import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const DATA_URL = new URL("../data/surface-one-angular.json", import.meta.url);

export const FRAMEWORKS = ["angular", "vue", "react"];

/** Where build-ai.mjs left the template in the stored Angular demo component. */
const TEMPLATE_SLOT = "/*@template*/";
const escapeTemplate = (s) =>
  s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/**
 * Reads the bundled data. Each component's demo is stored once per framework
 * (`angular`, `vue`, `react`); `example` (the Angular template) and `exampleSource`
 * (the standalone Angular demo component) are filled in from it, as before.
 */
export function loadData() {
  const data = JSON.parse(readFileSync(DATA_URL, "utf8"));
  for (const c of data.components) {
    if (!c.angular) continue;
    c.example ??= c.angular.template;
    c.exampleSource ??= c.angular.component.replace(TEMPLATE_SLOT, () =>
      escapeTemplate(c.angular.template),
    );
  }
  return data;
}

const text = (t) => ({ content: [{ type: "text", text: t }] });
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Finds a component by slug (`dialog`), name (`Dialog`, `Toggle Group & Tabs`),
 * class (`SoneDialogComponent`), selector (`sone-dialog`, `soneBtn`, `[soneCard]`)
 * or Vue / React component name (`SoneDialog`).
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
    data.components.find((c) =>
      [c.vue, c.react].some((t) =>
        t?.names.some((n) => norm(n) === norm(query)),
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

const header = (c) => [
  `# ${c.name}`,
  "",
  c.description,
  "",
  `Category: ${c.categoryName} · Docs: ${c.docsUrl}${c.storybook[0] ? ` · Storybook: ${c.storybook[0]}` : ""}`,
  "",
];

/** How the Angular API below maps onto the Vue / React props (the twins share it). */
const API_MAPPING = {
  vue: "The Vue component takes the Angular inputs below as props (same names; kebab-case in templates). A two-way input `[(x)]` is `v-model:x` (`v-model` for `value` / `checked`), an output `(x)` is the event `@x`, a projected part is a child component or a slot. See `get_docs` → `/docs/vue/package` for the full mapping.",
  react:
    "The React component takes the Angular inputs below as props (same names, camelCase). A two-way input `[(x)]` is `x` + `onXChange` (controlled) or `defaultX` (uncontrolled), an output `(x)` is the callback `onX`, a projected part is a child component or a `ReactNode` prop. See `get_docs` → `/docs/react/package` for the full mapping.",
};

function angularDocs(c) {
  const names = c.symbols.map((s) => s.name);
  return [
    ...header(c),
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

function twinDocs(c, framework) {
  const twin = c[framework];
  const label = framework === "vue" ? "Vue" : "React";
  if (!twin)
    return [
      ...header(c),
      `> ${c.name} has no @surface-one/${framework} twin yet — it is Angular only (\`${c.import}\`). Call \`list_components\` with \`framework: "${framework}"\` for the ones that have.`,
    ].join("\n");
  return [
    ...header(c),
    "## Import",
    "",
    "```ts",
    `import { ${twin.names.join(", ")} } from "${twin.import}";`,
    "```",
    "",
    "## Usage",
    "",
    `${label} demo (the same demo as the docs page):`,
    "",
    framework === "vue" ? "```vue" : "```tsx",
    twin.example.trim(),
    "```",
    "",
    "## API",
    "",
    API_MAPPING[framework],
    "",
    c.symbols.map(apiMarkdown).join("\n\n"),
  ].join("\n");
}

/** The docs of one component for one framework (default Angular). */
export function componentDocs(c, framework = "angular") {
  return framework === "angular" ? angularDocs(c) : twinDocs(c, framework);
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

const framework = z
  .enum(FRAMEWORKS)
  .default("angular")
  .describe(
    'The app\'s framework: "angular" (@surface-one/angular, default), "vue" (@surface-one/vue, Vue 3 / Nuxt) or "react" (@surface-one/react, React 19 / Next.js).',
  );

const INSTRUCTIONS = `SurfaceOne is an accessible design system for Angular 22 (@surface-one/angular: signals, zoneless, SSR-safe), Vue 3 / Nuxt (@surface-one/vue) and React 19 / Next.js (@surface-one/react). The three packages render the same markup with the same stylesheets and share one catalogue, one API and the tokens.
Rules when writing code with it:
- Angular: install \`@surface-one/angular\` + \`@surface-one/tokens\`; load "@surface-one/tokens" then "@surface-one/angular/styles.css" in angular.json styles. Import each component from its own entry point (\`@surface-one/angular/<slug>\`); element selectors start with \`sone-\`, attribute directives with \`sone\` (\`button[soneBtn]\`).
- Vue: install \`@surface-one/vue\` + \`@surface-one/tokens\`; Nuxt: \`modules: ["@surface-one/vue/nuxt"]\`; Vite: import "@surface-one/tokens" and "@surface-one/vue/styles.css". Components are \`Sone*\` (\`<SoneButton>\`), two-way inputs are \`v-model\`.
- React: install \`@surface-one/react\` + \`@surface-one/tokens\`; import "@surface-one/tokens" and "@surface-one/react/styles.css" once (Next.js: app/layout.tsx). Components are \`Sone*\`, two-way inputs are \`value\` + \`onValueChange\` style pairs.
- Use tokens (\`var(--surface-raised)\`, \`var(--space-4)\`), never raw colours. Theme with data-skin / data-theme / data-accent on <html>.
- Accessibility is required: labels for controls, aria-label for icon-only buttons, native elements first.
Workflow: list_components → get_component_docs (pass \`framework\` for Vue or React) for the exact API before writing code; get_docs for guides; get_theme_variables for tokens; list_templates / get_template (with \`framework\`) for full-screen examples.`;

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
        "List every SurfaceOne component family (name, slug, category, Angular entry point and selectors, Vue / React names, one-line description). Call this first to get exact component names. With `framework`, only the families that package has.",
      inputSchema: z.object({
        category: z
          .enum(Object.keys(data.categories))
          .optional()
          .describe(
            `Only this category (${Object.keys(data.categories).join(", ")}).`,
          ),
        framework: z
          .enum(FRAMEWORKS)
          .optional()
          .describe(
            'Only what this package has: "angular" (everything), "vue" or "react".',
          ),
      }),
    },
    async ({ category, framework }) => {
      const rows = data.components
        .filter((c) => !category || c.category === category)
        .filter((c) => !framework || framework === "angular" || c[framework])
        .map((c) => {
          const twins = ["vue", "react"]
            .filter((f) => c[f])
            .map(
              (f) =>
                `${f === "vue" ? "Vue" : "React"}: ${c[f].names.map((n) => `\`${n}\``).join(", ")}`,
            );
          return (
            `- **${c.name}** (\`${c.slug}\`, ${c.categoryName}) — ${c.description}\n  Import from \`${c.import}\`; selectors: ${c.symbols
              .filter((s) => s.kind !== "pipe")
              .map((s) => `\`${s.selector}\``)
              .join(", ")}` + (twins.length ? `\n  ${twins.join("; ")}` : "")
          );
        });
      const install = framework
        ? (data.frameworks?.[framework]?.install ?? data.install)
        : data.install;
      return text(
        `# SurfaceOne components (v${data.version})\n\nInstall: \`${install}\`\n\n${rows.join("\n")}`,
      );
    },
  );

  server.registerTool(
    "get_component_docs",
    {
      title: "Get component documentation",
      description:
        'Complete documentation for one or more components: description, import, a working usage example and the full API (selectors, inputs with types and defaults, outputs). Angular by default (template + standalone component); `framework: "vue"` or `"react"` returns the @surface-one/vue or @surface-one/react import and demo with how the API maps to props. Accepts names, slugs, classes, selectors or Vue / React names (Button, dialog, SoneSwitchComponent, sone-select, soneBtn, SoneDialog).',
      inputSchema: z.object({
        components: z
          .array(z.string())
          .min(1)
          .describe('Component names, e.g. ["Button", "Dialog"].'),
        framework,
      }),
    },
    async ({ components, framework = "angular" }) => {
      const { found, hint } = resolveMany(data, components);
      return text(
        found.map((c) => componentDocs(c, framework)).join("\n\n---\n\n") +
          hint,
      );
    },
  );

  server.registerTool(
    "get_component_source_code",
    {
      title: "Get component source code",
      description:
        "The Angular source (.ts and .html) of components — for learning how they work or debugging (the Vue and React twins render the same markup). Use get_component_docs for usage.",
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
        "The CSS/SCSS of components, including every variant and state — shared by the Angular, Vue and React packages. Every value is a design token (see get_theme_variables).",
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
      description: `Guides, principles, the Vue and React package guides and release notes (not component docs). Paths: ${data.docs.map((d) => d.path).join(", ")}.`,
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
        "SurfaceOne design tokens with their values: the shared token files (typography, layout, scale, accents) and each skin (studio, paper, minimalist, neumorphism, material, surface) in light and dark mode. The same for every framework.",
      inputSchema: z.object({
        skin: z
          .enum([
            "studio",
            "paper",
            "minimalist",
            "neumorphism",
            "material",
            "surface",
          ])
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
        "Full screens built only from SurfaceOne (dashboard, AI chat, settings, meeting notes, sign-in and sign-up, forms, messages, workspaces, editors, media, finances, CRM), with the frameworks each one exists in.",
      inputSchema: z.object({}),
    },
    async () =>
      text(
        data.templates
          .map((t) => {
            const also = ["vue", "react"].filter((f) => t[f]);
            return `- **${t.title}** (\`${t.slug}\`) — ${t.description} ${t.url}${also.length ? ` (also ${also.map((f) => (f === "vue" ? "Vue" : "React")).join(", ")})` : ""}`;
          })
          .join("\n"),
      ),
  );

  server.registerTool(
    "get_template",
    {
      title: "Get a screen template",
      description:
        'The complete source of a template — a starting point for a new screen: the standalone Angular component by default, the Vue single-file component with `framework: "vue"`, the React component with `framework: "react"`.',
      inputSchema: z.object({
        name: z.string().describe('Template slug, e.g. "dashboard".'),
        framework,
      }),
    },
    async ({ name, framework = "angular" }) => {
      const t = data.templates.find(
        (x) => norm(x.slug) === norm(name) || norm(x.title) === norm(name),
      );
      if (!t)
        return text(
          `No template "${name}". Available: ${data.templates.map((x) => x.slug).join(", ")}.`,
        );
      if (framework === "angular")
        return text(
          `# ${t.title}\n\n${t.description}\n\n\`\`\`ts\n${t.source.trim()}\n\`\`\``,
        );
      const source = t[framework];
      if (!source)
        return text(
          `# ${t.title}\n\nNo ${framework} version of this template yet. Templates with one: ${data.templates
            .filter((x) => x[framework])
            .map((x) => x.slug)
            .join(", ")}.`,
        );
      return text(
        `# ${t.title} (${framework === "vue" ? "Vue" : "React"})\n\n${t.description}\n\n\`\`\`${framework === "vue" ? "vue" : "tsx"}\n${source.trim()}\n\`\`\``,
      );
    },
  );

  return server;
}
