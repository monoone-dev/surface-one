// Builds everything AI assistants read about Surface One from ONE source of truth
// (the catalogue, the generated API, the demos, the component sources, the guide
// copy and the token files):
//
//   packages/angular-mcp/data/surface-one-angular.json   ← @surface-one/angular-mcp
//   packages/skills/skills/*/references/*.md              ← @surface-one/skills
//
// Run with `npm run ai:build` (part of `npm run build`). Never edit the outputs by hand.
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const docs = "apps/docs/src/app";

const { en } = await import(join(root, docs, "i18n/messages/en.ts"));
const { SNIPPETS } = await import(join(root, docs, "i18n/snippets.ts"));
const api = JSON.parse(read(`${docs}/catalog/api.generated.json`));
const site = read(`${docs}/site.config.ts`);
const SITE_URL = /url: "([^"]+)"/.exec(site)[1];
const VERSION = JSON.parse(read("packages/angular/package.json")).version;
const catalog = [
  ...read(`${docs}/catalog/catalog.ts`).matchAll(
    /\{ slug: "([a-z-]+)", name: "([^"]+)", category: "([a-z]+)" \}/g,
  ),
].map(([, slug, name, category]) => ({ slug, name, category }));

function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(join(root, path)).isDirectory() ? walk(path) : [path];
  });
}

/** The template string of a demo (`const TEMPLATE = \`…\`;`). */
function demoTemplate(source) {
  const start = source.indexOf("const TEMPLATE = `");
  if (start < 0) return "";
  const from = start + "const TEMPLATE = `".length;
  const end = source.indexOf("`;", from);
  return source.slice(from, end).replace(/\\`/g, "`").replace(/\\\$/g, "$");
}

// ---------- Components ----------
const components = catalog.map((entry) => {
  const entryApi = api[entry.slug];
  const demoPath = `${docs}/demos/${entry.slug}.demo.ts`;
  const demoSource = read(demoPath);
  const files = walk(`packages/angular/${entry.slug}`).filter(
    (f) => !f.endsWith(".stories.ts") && !f.endsWith("ng-package.json"),
  );
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
    example: demoTemplate(demoSource),
    exampleSource: demoSource,
    source: files
      .filter((f) => /\.(ts|html)$/.test(f))
      .map((path) => ({ path, content: read(path) })),
    styles: files
      .filter((f) => /\.(css|scss)$/.test(f))
      .map((path) => ({ path, content: read(path) })),
  };
});

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
const release = Object.entries(en.release.entries).map(([version, r]) => ({
  path: `/docs/angular/releases/v${version.replace(/\./g, "-")}`,
  url: `${SITE_URL}/release/`,
  title: `v${version} — ${r.title}`,
  description: r.title,
  markdown: `# v${version} — ${r.title}\n\n${r.notes.map((n) => `- ${n}`).join("\n")}\n`,
}));

// ---------- Templates ----------
const templates = Object.entries(en.templates.items).map(([slug, t]) => ({
  slug,
  title: t.title,
  description: t.description,
  url: `${SITE_URL}/templates/${slug}/`,
  source: read(`${docs}/templates/${slug}.template.ts`),
}));

// ---------- Theme variables ----------
/** `--name: value;` declarations of one block of SCSS/CSS source (values kept verbatim). */
function declarations(source) {
  const out = {};
  for (const m of source.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    out[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }
  return out;
}
const skins = {};
for (const skin of ["studio", "paper", "minimalist"]) {
  skins[skin] = {
    light: declarations(
      read(`packages/tokens/src/themes/${skin}.light.theme.scss`),
    ),
    dark: declarations(
      read(`packages/tokens/src/themes/${skin}.dark.theme.scss`),
    ),
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
    "data-skin": ["studio", "paper", "minimalist"],
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
  categories: Object.fromEntries(
    Object.entries(en.components.categories).map(([k, v]) => [k, v]),
  ),
  components,
  docs: [...guide, ...release],
  templates,
  theme,
};

const mcpOut = join(root, "packages/angular-mcp/data/surface-one-angular.json");
mkdirSync(dirname(mcpOut), { recursive: true });
writeFileSync(mcpOut, JSON.stringify(data) + "\n");

// ---------- Skill references ----------
const skillRoot = join(root, "packages/skills/skills");
const header = (title) =>
  `<!-- Generated by scripts/build-ai.mjs from the Surface One sources (v${VERSION}). Do not edit. -->\n\n# ${title}\n\n`;

const componentsMd =
  header("Surface One — component catalogue") +
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
  header("Surface One — design tokens") +
  "Attributes on `<html>`: `data-skin` (studio | paper | minimalist), `data-theme` (light | dark | system), `data-accent` (blue | teal | green | orange | pink; absent = the skin's accent).\n\n" +
  "## Shared token files\n\n" +
  Object.entries(shared)
    .map(
      ([file, vars]) =>
        `### ${file}.css\n\n${Object.entries(vars)
          .map(([k, v]) => `- \`${k}: ${v}\``)
          .join("\n")}\n`,
    )
    .join("\n") +
  "\n## Semantic colour roles (Studio light)\n\n" +
  Object.entries(skins.studio.light)
    .filter(([k]) =>
      /^--(surface|text|accent|border|danger|success|warning)/.test(k),
    )
    .map(([k, v]) => `- \`${k}: ${v}\``)
    .join("\n") +
  "\n";

const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};
write(
  join(skillRoot, "surface-one-angular/references/components.md"),
  componentsMd,
);
write(join(skillRoot, "surface-one-theming/references/tokens.md"), tokensMd);
write(
  join(skillRoot, "surface-one-angular/references/setup.md"),
  header("Surface One — setup") +
    guide
      .find((g) => g.path.endsWith("/installation"))
      .markdown.replace(/^# .*\n+/, ""),
);

const kb = (n) => `${Math.round(n / 1024)} kB`;
console.log(
  `ai: ${components.length} components, ${guide.length + release.length} docs, ${templates.length} templates → ${relative(root, mcpOut)} (${kb(JSON.stringify(data).length)}), skill references`,
);
