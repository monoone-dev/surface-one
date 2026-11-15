// The docs site's component CSS, split by page. packages/angular/styles.css is every
// component stylesheet at once (~280 kB of source) — what an app loads, but far more than a
// docs page shows. This script splits it the way the pages use it:
//
//   - the SHELL: the stylesheets of the entry points the docs chrome and its common pages
//     import (header, catalogue, component page, guide, theme, changelog …), found by
//     following their imports through packages/angular, plus the utilities at the end of
//     styles.css → apps/docs/src/generated/library-shell.css, @imported by styles.scss;
//   - every OTHER entry point's stylesheets, bundled and minified one file per entry point
//     → apps/docs/src/generated/library-css/<entry>.css (served at /library-css/);
//   - which of those each demo, template and the home page needs (the same import walk)
//     → apps/docs/src/app/shared/library-css.generated.ts, read by the route resolvers,
//     which link them before the page renders (so the prerendered HTML links them too).
//
// The files keep styles.css's order: LIBRARY_CSS lists them in it, and the links are
// inserted in that order, so the cascade is the one an app gets.
// Runs in `npm run generate` (before `ng serve`, `ng build` and the type-check).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { buildSync } from "esbuild";

import { DOCS_APP, abs, rel, walk, writeText } from "./lib/repo.mjs";

const LIB = "packages/angular";
const OUT = "apps/docs/src/generated";
const MAP = `${DOCS_APP}/shared/library-css.generated.ts`;

/** Docs pages whose components load with their route instead of with the shell. */
const ROUTED = [/\/demos\//, /\/templates\//, /\/pages\/home\//];

// ---- styles.css: the stylesheets in cascade order, and the utilities after them --------
const stylesCss = readFileSync(abs(`${LIB}/styles.css`), "utf8");
const imports = [...stylesCss.matchAll(/^@import "\.\/([^"]+)";$/gm)];
if (imports.length === 0) throw new Error(`${LIB}/styles.css: no @import`);
const sheets = imports.map((m) => m[1]);
const utilities = stylesCss.slice(
  imports.at(-1).index + imports.at(-1)[0].length,
);
/** The entry point a stylesheet belongs to: its first folder. */
const entryOf = (sheet) => sheet.split("/")[0];

// ---- what each stylesheet styles ---------------------------------------------------------
// A component can wear another entry point's classes without importing it (Command's items
// are `.menu-item`s), so a page also needs every stylesheet whose classes or `data-slot`s its
// sources — or its components' sources — use.
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
/** A stylesheet's text with its relative `@import`s inlined (forms.css → field.css …). */
const withImports = (file) =>
  readFileSync(file, "utf8").replace(/^@import "(\.[^"]+)";$/gm, (_, path) =>
    withImports(join(dirname(file), path)),
  );
/**
 * key (a class or data-slot value) → the entry point that owns it: the first stylesheet in
 * cascade order that selects it. Later ones only restyle it in their own context (chat.css
 * tunes `.alert` inside a chat), which a page showing just an alert does not need.
 */
const styledBy = new Map();
for (const sheet of sheets) {
  const css = stripComments(withImports(abs(`${LIB}/${sheet}`)));
  for (const [, selector] of css.matchAll(/([^{}]+)\{/g)) {
    if (selector.trim().startsWith("@")) continue;
    const keys = [
      ...[...selector.matchAll(/\.(-?[a-z][\w-]*)/gi)].map((m) => m[1]),
      ...[...selector.matchAll(/data-slot[~|^$*]?=\s*"?([\w-]+)/g)].map(
        (m) => m[1],
      ),
    ];
    for (const key of keys)
      if (!styledBy.has(key)) styledBy.set(key, entryOf(sheet));
  }
}
/**
 * The entry points that own a class or data-slot this source sets — where it sets a class
 * (`class="…"`, `class: "menu-item command-item"`, `[class.x]`, `classList`) or a slot. Not
 * any name in the text: the docs copy names components (`"scroll-area"`) without wearing them.
 */
function styledEntries(source) {
  const used = new Set();
  for (const m of source.matchAll(
    /(?:\bclass(?:Name)?\s*[=:]\s*["'`]|classList\.(?:add|toggle)\(\s*["'`])([^"'`]*)/g,
  ))
    for (const word of m[1].split(/[^\w-]+/)) used.add(word);
  for (const m of source.matchAll(
    /\[class\.([\w-]+)\]|"?data-slot"?\s*[=:]\s*"([\w-]+)"/g,
  ))
    used.add(m[1] ?? m[2]);
  const entries = new Set();
  for (const key of used) if (styledBy.has(key)) entries.add(styledBy.get(key));
  return entries;
}

// ---- the import walk ----------------------------------------------------------------------
const libEntryRe = /from\s+"@surface-one\/angular\/([a-z-]+)"/g;
const tsFiles = (dir) =>
  walk(
    dir,
    (_, name) => name.endsWith(".ts") && !/\.(stories|spec)\.ts$/.test(name),
  );

/** The entry points an entry point's sources import (by package name or `../<entry>/`). */
const libDeps = new Map();
function depsOf(entry) {
  if (libDeps.has(entry)) return libDeps.get(entry);
  const deps = new Set();
  const sources = walk(
    `${LIB}/${entry}`,
    (_, name) =>
      /\.(ts|html)$/.test(name) && !/\.(stories|spec)\.ts$/.test(name),
  );
  for (const file of sources) {
    const source = readFileSync(file, "utf8");
    for (const m of source.matchAll(libEntryRe)) deps.add(m[1]);
    for (const e of styledEntries(source)) deps.add(e);
    for (const m of source.matchAll(/from\s+"(\.\.\/[^"]+)"/g)) {
      const target = rel(join(dirname(file), m[1]));
      const name = target.startsWith(`${LIB}/`)
        ? target.slice(LIB.length + 1).split("/")[0]
        : null;
      if (name) deps.add(name);
    }
  }
  deps.delete(entry);
  const known = [...deps].filter((d) => existsSync(abs(`${LIB}/${d}`)));
  libDeps.set(entry, known);
  return known;
}

/** Every entry point reachable from `entries`. */
function closure(entries) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const entry = queue.pop();
    if (seen.has(entry)) continue;
    seen.add(entry);
    queue.push(...depsOf(entry));
  }
  return seen;
}

/** The entry points a docs file imports, following its relative imports inside the app. */
function appEntries(file, seen = new Set()) {
  const entries = new Set();
  if (seen.has(file) || !existsSync(file)) return entries;
  seen.add(file);
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(libEntryRe)) entries.add(m[1]);
  for (const e of styledEntries(source)) entries.add(e);
  const html = file.replace(/\.ts$/, ".html");
  if (html !== file && existsSync(html))
    for (const e of styledEntries(readFileSync(html, "utf8"))) entries.add(e);
  for (const m of source.matchAll(
    /(?:from\s+|import\()\s*"(\.{1,2}\/[^"]+)"/g,
  )) {
    const base = join(dirname(file), m[1]);
    const target = [`${base}.ts`, join(base, "index.ts"), base].find(
      (p) => p.endsWith(".ts") && existsSync(p),
    );
    if (target) for (const e of appEntries(target, seen)) entries.add(e);
  }
  return entries;
}

// ---- the shell and the routed pages ------------------------------------------------------
const appFiles = tsFiles(DOCS_APP).filter((f) => {
  const r = rel(f);
  return (
    !ROUTED.some((re) => re.test(r)) &&
    !r.includes("/i18n/") &&
    !r.includes(".generated.")
  );
});
const shell = closure(
  appFiles.flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(libEntryRe)].map((m) => m[1]),
  ),
);
// The shell's own markup (the docs chrome): imports above, classes here.
for (const f of appFiles) {
  const html = f.replace(/\.ts$/, ".html");
  for (const source of [f, html].filter(existsSync))
    for (const e of styledEntries(readFileSync(source, "utf8")))
      for (const d of closure([e])) shell.add(d);
}

const withCss = new Set(sheets.map(entryOf));
/** The stylesheets a page needs beyond the shell, as entry points in cascade order. */
const routed = (file) => {
  const need = closure(appEntries(file));
  return [...withCss].filter((e) => need.has(e) && !shell.has(e));
};
const slugsIn = (dir, suffix) =>
  walk(`${DOCS_APP}/${dir}`, (_, name) => name.endsWith(suffix))
    .filter((f) => dirname(f) === abs(`${DOCS_APP}/${dir}`))
    .map((f) => f.slice(dirname(f).length + 1, -suffix.length))
    .sort();

const demoCss = Object.fromEntries(
  slugsIn("demos", ".demo.ts").map((s) => [
    s,
    routed(abs(`${DOCS_APP}/demos/${s}.demo.ts`)),
  ]),
);
const templateCss = Object.fromEntries(
  slugsIn("templates", ".template.ts").map((s) => [
    s,
    routed(abs(`${DOCS_APP}/templates/${s}.template.ts`)),
  ]),
);
const homeCss = routed(abs(`${DOCS_APP}/pages/home/home.page.ts`));

// ---- write --------------------------------------------------------------------------------
rmSync(abs(OUT), { recursive: true, force: true });

const fromOut = (sheet) =>
  relative(abs(OUT), abs(`${LIB}/${sheet}`))
    .split("\\")
    .join("/");
writeText(
  `${OUT}/library-shell.css`,
  "/* Generated by scripts/build-docs-css.mjs from packages/angular/styles.css — do not edit. */\n" +
    sheets
      .filter((s) => shell.has(entryOf(s)))
      .map((s) => `@import "${fromOut(s)}";\n`)
      .join("") +
    utilities,
);

const hrefs = {};
let total = 0;
for (const entry of [...withCss].filter((e) => !shell.has(e))) {
  const own = sheets.filter((s) => entryOf(s) === entry);
  const { outputFiles } = buildSync({
    stdin: {
      contents: own.map((s) => `@import "./${s}";`).join("\n"),
      resolveDir: abs(LIB),
      loader: "css",
    },
    bundle: true,
    minify: true,
    write: false,
    logLevel: "silent",
  });
  const css = outputFiles[0].text;
  total += css.length;
  writeText(`${OUT}/library-css/${entry}.css`, css);
  const hash = createHash("sha256").update(css).digest("hex").slice(0, 10);
  hrefs[entry] = `library-css/${entry}.css?v=${hash}`;
}

const json = (value) => JSON.stringify(value, null, 2);
writeText(
  MAP,
  `// Generated by scripts/build-docs-css.mjs — do not edit.

/** The stylesheet of every entry point outside the docs shell, in styles.css's cascade order. */
export const LIBRARY_CSS: Readonly<Record<string, string>> = ${json(hrefs)};

/** The entry points (keys of LIBRARY_CSS) each component demo needs. */
export const DEMO_CSS: Readonly<Record<string, readonly string[]>> = ${json(demoCss)};

/** The entry points each template screen needs. */
export const TEMPLATE_CSS: Readonly<Record<string, readonly string[]>> = ${json(templateCss)};

/** The entry points the home page needs. */
export const HOME_CSS: readonly string[] = ${json(homeCss)};
`,
);

console.log(
  `docs css: shell ${shell.size} entry points, ${Object.keys(hrefs).length} routed stylesheets (${Math.round(total / 1024)} kB) → ${OUT}, ${MAP}`,
);
