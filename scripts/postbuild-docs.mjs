// After `ng build docs`: the static-host files the prerender does not write —
// sitemap.xml (with hreflang alternates for all nine locales), robots.txt, the
// 404.html fallback, and the removal of the CSR shell a static host never needs.
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist/docs/browser");
const config = readFileSync(
  join(root, "apps/docs/src/app/site.config.ts"),
  "utf8",
);
const SITE_URL = /url: "([^"]+)"/.exec(config)?.[1];
const locales = [
  ...readFileSync(
    join(root, "apps/docs/src/app/i18n/locales.ts"),
    "utf8",
  ).matchAll(/code: "(\w+)", tag: "([\w-]+)"/g),
].map((m) => ({ code: m[1], tag: m[2] }));
if (!SITE_URL || locales.length === 0)
  throw new Error("could not read site url / locales");

function pages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return name === "index.html" ? [path] : [];
  });
}

const codes = new Set(locales.map((l) => l.code).filter((c) => c !== "en"));
const neutral = new Set();
for (const file of pages(out)) {
  const html = readFileSync(file, "utf8");
  if (
    html.includes('http-equiv="refresh"') ||
    html.includes('content="noindex')
  )
    continue;
  const parts = relative(out, dirname(file)).split(sep).filter(Boolean);
  if (codes.has(parts[0])) parts.shift();
  neutral.add("/" + parts.join("/"));
}

const href = (path, code) => {
  const p =
    code === "en" ? path : path === "/" ? `/${code}` : `/${code}${path}`;
  return SITE_URL + (p === "/" ? "/" : `${p}/`);
};
const today = new Date().toISOString().slice(0, 10);
const urls = [...neutral].sort().flatMap((path) =>
  locales.map(({ code }) => {
    const alternates = locales
      .map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l.tag}" href="${href(path, l.code)}"/>`,
      )
      .concat(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${href(path, "en")}"/>`,
      )
      .join("\n");
    return `  <url>\n    <loc>${href(path, code)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`;
  }),
);
writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
);
writeFileSync(
  join(out, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

// llms.txt (https://llmstxt.org): a map of the docs for language models, plus
// llms-full.txt with every component's docs — the same content the MCP server serves.
const { loadData, componentDocs } =
  await import("../packages/angular-mcp/src/server.mjs");
const ai = loadData();
const llms = [
  `# SurfaceOne`,
  "",
  `> Accessible Angular design system (@surface-one/angular v${ai.version}): signal-first sone- components, design tokens, Studio / Paper / Minimalist / Neumorphism / Material skins in light and dark. Built on spartan/ui, shadcn/ui and Nuxt UI conventions.`,
  "",
  `Install: \`${ai.install}\`. MCP server: \`npx -y @surface-one/angular-mcp@latest\`. Agent skills: \`npx @surface-one/skills add\`.`,
  "",
  "## Guide",
  ...ai.docs.map((d) => `- [${d.title}](${d.url}): ${d.description}`),
  "",
  "## Components",
  ...ai.components.map((c) => `- [${c.name}](${c.docsUrl}): ${c.description}`),
  "",
  "## Templates",
  ...ai.templates.map((t) => `- [${t.title}](${t.url}): ${t.description}`),
  "",
  "## Optional",
  `- [Full component documentation](${SITE_URL}/llms-full.txt)`,
  `- [Storybook](${ai.storybook})`,
  "",
].join("\n");
writeFileSync(join(out, "llms.txt"), llms);
writeFileSync(
  join(out, "llms-full.txt"),
  [
    llms,
    ...ai.docs.map((d) => d.markdown),
    ...ai.components.map(componentDocs),
  ].join("\n\n---\n\n"),
);

const notFound = join(out, "404/index.html");
if (existsSync(notFound)) {
  copyFileSync(notFound, join(out, "404.html"));
  rmSync(join(out, "404"), { recursive: true });
}
rmSync(join(out, "index.csr.html"), { force: true });
// Source maps are for local debugging, not for the published site.
for (const f of readdirSync(out)) if (f.endsWith(".map")) rmSync(join(out, f));

console.log(
  `postbuild: ${neutral.size} pages × ${locales.length} locales in sitemap.xml, robots.txt, 404.html`,
);
