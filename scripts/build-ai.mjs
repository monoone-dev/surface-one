// Builds everything AI assistants read about SurfaceOne from ONE source of truth
// (the catalogue, the generated API, the demos with their Vue and React twins, the
// component sources, the templates, the guide copy, the Vue / React package READMEs,
// CHANGELOG.md and the token files):
//
//   packages/angular-mcp/data/surface-one-angular.json   ← @surface-one/angular-mcp
//   packages/skills/skills/*/references/*.md              ← @surface-one/skills
//
// Run with `npm run ai:build` (part of `npm run build`). Never edit the outputs by hand.
import { existsSync } from "node:fs";
import { join } from "node:path";

import { readChangelog } from "./changelog.mjs";
import {
  DOCS_APP as docs,
  abs,
  cssDeclarations as declarations,
  readJson,
  readText as read,
  rel,
  siteUrl,
  walk,
  writeJson,
  writeText as write,
} from "./lib/repo.mjs";
import { catalogEntries, literalText, parse, ts } from "./lib/source.mjs";

const { en } = await import(abs(`${docs}/i18n/messages/en.ts`));
const { SNIPPETS } = await import(abs(`${docs}/i18n/snippets.ts`));
const api = readJson(`${docs}/catalog/api.generated.json`);
const SITE_URL = siteUrl();
const VERSION = readJson("packages/angular/package.json").version;
const catalog = catalogEntries();

const optional = (path) => (existsSync(abs(path)) ? read(path) : null);

// ---------- Demos: one source, three frameworks ----------
/** Where the Angular template goes back into the stored demo component (see the MCP server). */
const TEMPLATE_SLOT = "/*@template*/";
const escapeTemplate = (s) =>
  s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/** A snippet literal (`TEMPLATE`): its text, never interpolated. */
function snippet(node, file, name) {
  if (ts.isTemplateExpression(node))
    throw new Error(
      `${file}: ${name} must not interpolate (\${…}); escape it as \\\${`,
    );
  return literalText(node);
}

/**
 * Splits a docs demo (apps/docs/src/app/demos/<slug>.demo.ts) into the Angular template and
 * the Angular component (the template replaced by TEMPLATE_SLOT, so it is stored once). Its
 * Vue and React twins are real files next to it (demos/vue/<slug>.vue, demos/react/<slug>.tsx).
 */
function splitDemo(file) {
  const source = read(file);
  const sf = parse(file, source);
  const out = { template: "", component: source, vue: null, react: null };
  const cuts = [];
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const d of statement.declarationList.declarations) {
      if (!ts.isIdentifier(d.name) || !d.initializer) continue;
      const name = d.name.text;
      if (name === "TEMPLATE") {
        out.template = snippet(d.initializer, file, name) ?? "";
        const from = d.initializer.getStart(sf) + 1;
        const to = d.initializer.getEnd() - 1;
        // Only when the template round-trips exactly; otherwise the component keeps it.
        if (escapeTemplate(out.template) === source.slice(from, to))
          cuts.push([from, to, TEMPLATE_SLOT]);
      }
    }
  }
  let component = source;
  for (const [from, to, by] of cuts.sort((a, b) => b[0] - a[0]))
    component = component.slice(0, from) + by + component.slice(to);
  out.component = component;
  const slug = file.split("/").pop().replace(/\.demo\.ts$/, "");
  out.vue = optional(`${docs}/demos/vue/${slug}.vue`);
  out.react = optional(`${docs}/demos/react/${slug}.tsx`);
  return out;
}

/** The names a snippet imports from one package (`import { SoneButton } from "@surface-one/vue"`). */
function importedNames(code, pkg) {
  const names = [];
  const re = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${pkg.replace("/", "\\/")}["']`,
    "g",
  );
  for (const [, list] of code.matchAll(re))
    for (const part of list.split(",")) {
      const name = part
        .replace(/^\s*type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (name) names.push(name);
    }
  return [...new Set(names)];
}

const twin = (code, pkg) =>
  code ? { import: pkg, names: importedNames(code, pkg), example: code } : null;

// ---------- Components ----------
const components = catalog.map((entry) => {
  const entryApi = api[entry.slug];
  const demo = splitDemo(`${docs}/demos/${entry.slug}.demo.ts`);
  const files = walk(
    `packages/angular/${entry.slug}`,
    (f) => !f.endsWith(".stories.ts") && !f.endsWith("ng-package.json"),
  ).map(rel);
  return {
    slug: entry.slug,
    name: entry.name,
    category: entry.category,
    categoryName: en.components.categories[entry.category].name,
    description: en.components.entries[entry.slug] ?? "",
    import: entryApi.import,
    symbols: entryApi.symbols,
    storybook: entryApi.stories.map(
      (s) => `${SITE_URL}/storybook/?path=/docs/${s.id}`,
    ),
    docsUrl: `${SITE_URL}/components/${entry.slug}/`,
    // The MCP server's loadData() turns these back into `example` / `exampleSource`.
    angular: { template: demo.template, component: demo.component },
    vue: twin(demo.vue, "@surface-one/vue"),
    react: twin(demo.react, "@surface-one/react"),
    source: files
      .filter((f) => /\.(ts|html)$/.test(f))
      .map((path) => ({ path, content: read(path) })),
    styles: files
      .filter((f) => /\.(css|scss)$/.test(f))
      .map((path) => ({ path, content: read(path) })),
  };
});

// A demo also imports helpers of other families (the sidebar demo uses SoneButton and
// SoneIcon): a name belongs to the family whose slug is its longest prefix
// (SoneSidebarMenuButton → sidebar, SoneIcon → icon) or alias (SoneField* → input);
// names nothing prefixes stay where they are.
{
  const ALIASES = { field: "input", popover: "menu", tabs: "toggle-group" };
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const prefixes = [
    ...components.map((c) => [key(c.slug), c]),
    ...Object.entries(ALIASES).map(([alias, slug]) => [
      alias,
      components.find((c) => c.slug === slug),
    ]),
  ].sort((a, b) => b[0].length - a[0].length);
  const owner = (name) =>
    prefixes.find(([p]) => key(name.replace(/^Sone/, "")).startsWith(p))?.[1];
  for (const c of components)
    for (const framework of ["vue", "react"]) {
      const twin = c[framework];
      if (!twin) continue;
      const own = twin.names.filter((n) => {
        const o = owner(n);
        return !o || o === c;
      });
      if (own.length) twin.names = own;
    }
}

// ---------- Guide pages as markdown ----------
function blocksToMarkdown(blocks) {
  return blocks
    .map((b) => {
      if ("h2" in b) return `## ${b.h2}`;
      if ("p" in b) return b.p;
      if ("note" in b) return `> ${b.note}`;
      if ("list" in b) return b.list.map((i) => `- ${i}`).join("\n");
      const s = SNIPPETS[b.code];
      return s ? "```" + s.lang + "\n" + s.code + "\n```" : "";
    })
    .join("\n\n");
}

const guide = Object.entries(en.guide.pages).map(([slug, page]) => ({
  path: `/docs/angular/guide/${slug}`,
  url: `${SITE_URL}/guide/${slug}/`,
  title: page.title,
  description: page.description,
  markdown: `# ${page.title}\n\n${page.description}\n\n${blocksToMarkdown(page.blocks)}\n`,
}));
/** A package README as a docs page, without its Development and License sections. */
const readme = (dir) =>
  read(`${dir}/README.md`)
    .split(/^(?=## )/m)
    .filter((s) => !/^## (Development|License)\b/.test(s))
    .join("")
    .trim() + "\n";
const packageDocs = [
  {
    path: "/docs/vue/package",
    url: `${SITE_URL}/guide/installation/`,
    title: "@surface-one/vue",
    description:
      "Vue 3 / Nuxt: install, the Nuxt module and the Vue plugin, from Angular to Vue, the components.",
    markdown: readme("packages/vue"),
  },
  {
    path: "/docs/react/package",
    url: `${SITE_URL}/guide/installation/`,
    title: "@surface-one/react",
    description:
      "React 19 / Next.js: install, the provider, from Vue to React, the components.",
    markdown: readme("packages/react"),
  },
];
const release = readChangelog().map(({ version, date, markdown }) => ({
  path: `/docs/angular/releases/v${version.replace(/\./g, "-")}`,
  url: `${SITE_URL}/changelog/#v${version}`,
  title: `v${version} (${date})`,
  description: `What changed in SurfaceOne v${version}, released ${date}.`,
  markdown: `# v${version} (${date})\n\n${markdown}\n`,
}));

// ---------- Templates (Angular, and the Vue / React twins when there are) ----------
// The displayed sources, with each template's shared data and stylesheet inlined
// (scripts/build-template-sources.mjs), so a copied template stands alone.
const templateSources = readJson(
  `${docs}/templates/sources/templates.generated.json`,
);
const templates = Object.entries(en.templates.items).map(([slug, t]) => ({
  slug,
  title: t.title,
  description: t.description,
  url: `${SITE_URL}/templates/${slug}/`,
  source: templateSources[slug].angular,
  vue: templateSources[slug].vue ?? null,
  react: templateSources[slug].react ?? null,
}));

// ---------- Theme variables ----------
const SKINS = [
  "studio",
  "paper",
  "minimalist",
  "neumorphism",
  "material",
  "surface",
];
/** A skin is `<skin>.light.theme.scss` + `<skin>.dark.theme.scss`, or one `<skin>.theme.scss` whose dark blocks follow its light ones. */
function skinSource(skin) {
  const single = `packages/tokens/src/themes/${skin}.theme.scss`;
  if (existsSync(abs(single))) {
    const source = read(single);
    const at = source.search(/@include dark\(/);
    return { light: source.slice(0, at), dark: source.slice(at) };
  }
  return {
    light: read(`packages/tokens/src/themes/${skin}.light.theme.scss`),
    dark: read(`packages/tokens/src/themes/${skin}.dark.theme.scss`),
  };
}
const skins = {};
for (const skin of SKINS) {
  const source = skinSource(skin);
  skins[skin] = {
    light: declarations(source.light),
    dark: declarations(source.dark),
  };
}
const shared = Object.fromEntries(
  ["typography", "layout", "scale", "accents"].map((f) => [
    f,
    declarations(read(`packages/tokens/src/tokens/${f}.css`)),
  ]),
);
const theme = {
  attributes: {
    "data-skin": SKINS,
    "data-theme": ["light", "dark", "system (or no attribute)"],
    "data-accent": [
      "blue",
      "teal",
      "green",
      "orange",
      "pink",
      "(no attribute = the skin's accent)",
    ],
  },
  note: "Minimalist light is the base layer every skin starts from; a skin's dark file only re-declares what changes. Values are verbatim from the source and may reference other tokens.",
  skins,
  shared,
};

const data = {
  name: "@surface-one/angular",
  version: VERSION,
  site: SITE_URL,
  storybook: `${SITE_URL}/storybook/`,
  install: SNIPPETS.install.code,
  styles: SNIPPETS.angularJson.code,
  frameworks: {
    angular: {
      package: "@surface-one/angular",
      install: SNIPPETS.install.code,
      setup: SNIPPETS.angularJson.code,
    },
    vue: {
      package: "@surface-one/vue",
      install: SNIPPETS.installVue.code,
      setup: SNIPPETS.nuxtConfig.code,
    },
    react: {
      package: "@surface-one/react",
      install: SNIPPETS.installReact.code,
      setup: SNIPPETS.reactStyles.code,
    },
  },
  categories: Object.fromEntries(
    Object.entries(en.components.categories).map(([k, v]) => [k, v]),
  ),
  components,
  docs: [...guide, ...packageDocs, ...release],
  templates,
  theme,
};

const mcpOut = "packages/angular-mcp/data/surface-one-angular.json";
writeJson(mcpOut, data, 0);

// ---------- Skill references ----------
const skillRoot = "packages/skills/skills";
const header = (title) =>
  `<!-- Generated by scripts/build-ai.mjs from the SurfaceOne sources (v${VERSION}). Do not edit. -->\n\n# ${title}\n\n`;

const componentsMd =
  header("SurfaceOne — component catalogue") +
  `Install: \`${SNIPPETS.install.code}\`. One entry point per component family; import from it.\n\n` +
  Object.entries(en.components.categories)
    .map(([key, cat]) => {
      const rows = components
        .filter((c) => c.category === key)
        .map((c) => {
          const selectors = c.symbols
            .filter((s) => s.kind !== "pipe")
            .map((s) => `\`${s.selector}\``)
            .slice(0, 6)
            .join(", ");
          const all = c.symbols.map((s) => s.name);
          const names =
            all.length > 8
              ? `${all.slice(0, 6).join(", ")}, /* +${all.length - 6} more */`
              : all.join(", ");
          return `### ${c.name}\n\n${c.description}\n\n- Import: \`import { ${names} } from "${c.import}";\`\n- Selectors: ${selectors}\n- Docs: ${c.docsUrl}\n`;
        })
        .join("\n");
      return `## ${cat.name}\n\n${cat.description}\n\n${rows}`;
    })
    .join("\n");

const tokensMd =
  header("SurfaceOne — design tokens") +
  `Attributes on \`<html>\`: \`data-skin\` (${SKINS.join(" | ")}), ` +
  "`data-theme` (light | dark | system), `data-accent` (blue | teal | green | orange | pink; absent = the skin's accent).\n\n" +
  "## Shared token files\n\n" +
  Object.entries(shared)
    .map(
      ([file, vars]) =>
        `### ${file}.css\n\n${Object.entries(vars)
          .map(([k, v]) => `- \`${k}: ${v}\``)
          .join("\n")}\n`,
    )
    .join("\n") +
  "\n## Semantic colour roles and chart colours (Studio light)\n\n" +
  Object.entries(skins.studio.light)
    .filter(([k]) =>
      /^--(surface|text|accent|border|danger|success|warning|chart)/.test(k),
    )
    .map(([k, v]) => `- \`${k}: ${v}\``)
    .join("\n") +
  "\n";

write(
  join(skillRoot, "surface-one-angular/references/components.md"),
  componentsMd,
);
write(join(skillRoot, "surface-one-theming/references/tokens.md"), tokensMd);
write(
  join(skillRoot, "surface-one-angular/references/setup.md"),
  header("SurfaceOne — setup") +
    guide
      .find((g) => g.path.endsWith("/installation"))
      .markdown.replace(/^# .*\n+/, ""),
);

// The Vue and React skills: the families each package has, with their Sone* names.
const twinComponentsMd = (framework, label, install) => {
  const missing = components.filter((c) => !c[framework]);
  return (
    header(`SurfaceOne for ${label} — component catalogue`) +
    `Install: \`${install}\`. Every component is exported from \`@surface-one/${framework}\`; ` +
    "its props are the Angular inputs of the same family (see the docs page for the API).\n\n" +
    Object.entries(en.components.categories)
      .map(([key, cat]) => {
        const rows = components
          .filter((c) => c.category === key && c[framework])
          .map(
            (c) =>
              `### ${c.name}\n\n${c.description}\n\n- Import: \`import { ${c[framework].names.join(", ")} } from "@surface-one/${framework}";\`\n- Docs: ${c.docsUrl}\n`,
          );
        return rows.length
          ? `## ${cat.name}\n\n${cat.description}\n\n${rows.join("\n")}`
          : "";
      })
      .filter(Boolean)
      .join("\n") +
    (missing.length
      ? `\n## Not in @surface-one/${framework} yet\n\n${missing.map((c) => c.name).join(", ")} — Angular only for now.\n`
      : "")
  );
};
for (const [framework, label, install, doc] of [
  ["vue", "Vue", SNIPPETS.installVue.code, packageDocs[0]],
  ["react", "React", SNIPPETS.installReact.code, packageDocs[1]],
]) {
  write(
    join(skillRoot, `surface-one-${framework}/references/components.md`),
    twinComponentsMd(framework, label, install),
  );
  write(
    join(skillRoot, `surface-one-${framework}/references/setup.md`),
    header(`SurfaceOne for ${label} — setup`) +
      doc.markdown.replace(/^# .*\n+/, ""),
  );
}

const kb = (n) => `${Math.round(n / 1024)} kB`;
console.log(
  `ai: ${components.length} components, ${guide.length + packageDocs.length + release.length} docs, ${templates.length} templates → ${mcpOut} (${kb(JSON.stringify(data).length)}), skill references`,
);
