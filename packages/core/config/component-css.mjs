// Splits the stylesheet of @surface-one/vue / @surface-one/react into one file per
// component, next to the full bundle. Run from the package directory after `vite build`:
//
//   node ../core/config/component-css.mjs
//
// dist/styles.css             every rule (unchanged, built by Vite)
// dist/styles/base.css        what every component leans on: native form controls, the
//                             layout / text utilities, keyframes, the scrollbar, the
//                             framework-only rules
// dist/styles/<slug>.css      one per src/components/<slug> (and the tooltip directive):
//                             the CSS of that component AND of every component it renders
//                             inside (a date picker brings the calendar and the popover)
//
// The source is the same as the bundle's (src/styles.css): the global stylesheets of
// packages/angular plus src/styles/hosts.generated.css, cut into chunks — one per imported
// file, one per generated host stylesheet. A chunk belongs to a component when it lives in
// the folder of the same name, or when its selectors name a class, a `sone-*` element or a
// `data-slot` that the component's sources (or the sources they import) write. A chunk no
// component of this package renders is dead here and is reported, never silently dropped.
//
// It fails the build when a component folder has no stylesheet, or when the rules of
// base.css plus every component file differ from those of dist/styles.css (each compared
// as context + selector + declaration, so the minifier merging rules differently does not
// matter) — no CSS can go missing from the per-component path.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

import { transform } from "lightningcss";
import postcss from "postcss";

const pkgDir = process.cwd();
const src = join(pkgDir, "src");
const dist = join(pkgDir, "dist");
const angular = resolve(pkgDir, "../angular");
const out = join(dist, "styles");

/** The folders of packages/angular whose global stylesheet is base, not a component's. */
const BASE_GLOBAL = new Set(["input"]);
/** Sources outside src/components that render a styled part: slug → path under src/. */
const EXTRA_SLUGS = {
  vue: { tooltip: "directives/tooltip.ts" },
  react: { tooltip: "tooltip" },
}[basename(pkgDir)];

// The minifier and targets of the Vite build (build.cssMinify: lightningcss, cssTarget:
// es2022 → Vite's esMap), so a chunk minifies exactly as it does inside the bundle.
const TARGETS = Object.fromEntries(
  Object.entries({
    chrome: [94],
    edge: [94],
    safari: [16, 4],
    ios_saf: [16, 4],
    firefox: [93],
    opera: [80],
  }).map(([browser, [major, minor = 0]]) => [
    browser,
    (major << 16) | (minor << 8),
  ]),
);
const minify = (css, filename) =>
  new TextDecoder().decode(
    transform({
      filename,
      code: Buffer.from(css),
      minify: true,
      targets: TARGETS,
    }).code,
  );

// ---- chunks: { owner, css, base } in bundle order -----------------------------------

const IMPORT = /^@import\s+"([^"]+)";\s*$/gm;
/** A stylesheet with its relative `@import`s inlined (none of them is a URL or a layer). */
const inline = (file) =>
  readFileSync(file, "utf8").replace(IMPORT, (_, path) =>
    inline(resolve(dirname(file), path)),
  );
/** The first folder of a path under packages/angular (`recording/record-button/…` → recording). */
const ownerOf = (file) => relative(angular, file).split("/")[0];

const chunks = [];
function collect(file) {
  const text = readFileSync(file, "utf8");
  const imports = [...text.matchAll(IMPORT)].map((m) =>
    resolve(dirname(file), m[1]),
  );
  const rest = text.replace(IMPORT, "").trim();
  if (file === join(angular, "styles.css")) {
    for (const path of imports) {
      const owner = ownerOf(path);
      chunks.push({ owner, css: inline(path), base: BASE_GLOBAL.has(owner) });
    }
    if (rest) chunks.push({ owner: "base", css: rest, base: true });
    return;
  }
  if (basename(file) === "hosts.generated.css") {
    for (const part of text.split(/^(?=\/\* [\w./-]+\.scss \*\/$)/m)) {
      const marker = /^\/\* ([\w./-]+\.scss) \*\/$/m.exec(part);
      if (marker) {
        chunks.push({
          owner: marker[1].split("/")[0],
          css: part,
          base: false,
        });
      }
    }
    return;
  }
  for (const path of imports) collect(path);
  if (rest && file !== join(src, "styles.css")) {
    chunks.push({ owner: "base", css: rest, base: true });
  }
}
collect(join(src, "styles.css"));

// ---- hooks: what a chunk's selectors need -------------------------------------------

// A selector applies to a component when the component writes EVERY class, `sone-*`
// element, `data-slot` value and other `data-*` attribute it names (`.btn sone-icon` needs both); for `:is()` / `:where()`
// ONE of the alternatives is enough, and what sits inside any other functional
// pseudo-class (`:not()`, `:has()`, …) is left out, which can only widen the match. A
// chunk belongs to a component when one of its selectors applies.
const HOOKS = [
  /\.(-?[_a-zA-Z][\w-]*)/g, // classes
  /(?:^|[\s>+~,])(sone-[a-z-]+)/g, // host elements
  /data-slot[~|^$*]?="([^"]+)"/g, // parts
  /\[(data-(?!slot\b)[\w-]+)/g, // other data attributes, by name
];
/** `{ hooks, groups }`: the hooks a selector names outside parentheses, and its `:is()` lists. */
function need(selector) {
  let plain = "";
  const groups = [];
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] !== "(") {
      plain += selector[i];
      continue;
    }
    let depth = 1;
    let j = i + 1;
    for (; j < selector.length && depth; j++) {
      if (selector[j] === "(") depth++;
      if (selector[j] === ")") depth--;
    }
    const inner = selector.slice(i + 1, j - 1);
    if (/:(is|where|matches)$/.test(plain)) {
      groups.push(postcss.list.comma(inner).map(need));
    }
    plain += " ";
    i = j - 1;
  }
  const hooks = HOOKS.flatMap((re) => [...plain.matchAll(re)].map((m) => m[1]));
  return { hooks, groups };
}
const met = ({ hooks, groups }, words) =>
  hooks.every((hook) => words.has(hook)) &&
  groups.every((alternatives) => alternatives.some((alt) => met(alt, words)));
const anchored = ({ hooks, groups }) =>
  hooks.length > 0 ||
  groups.some((alternatives) => alternatives.every(anchored));
for (const chunk of chunks) {
  chunk.needs = [];
  postcss.parse(chunk.css).walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name))
      return;
    for (const selector of postcss.list.comma(rule.selector)) {
      const n = need(selector);
      if (anchored(n)) chunk.needs.push(n);
    }
  });
}
const applies = (chunk, words) => chunk.needs.some((n) => met(n, words));

// ---- components: the tokens their sources write -------------------------------------

const walk = (path) =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((f) => walk(join(path, f)))
    : [path];
const SOURCE = /\.(ts|tsx|vue)$/;
const RELATIVE = /from\s+"(\.{1,2}\/[^"]+)"/g;
const resolveSource = (from, spec) => {
  const base = resolve(dirname(from), spec);
  for (const candidate of [
    base,
    ...[".ts", ".tsx", ".vue"].map((ext) => base + ext),
    ...["index.ts", "index.tsx"].map((index) => join(base, index)),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
};
/**
 * Every word inside a string or template literal (plus the JSX element and data attribute
 * names) of the given files and of the package files they import.
 */
function tokens(entryFiles) {
  const seen = new Set();
  const words = new Set();
  const queue = [...entryFiles];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
      for (const word of (m[1] ?? m[2] ?? m[3]).split(/[^\w-]+/)) {
        if (word) words.add(word);
      }
    }
    // JSX writes element and attribute names outside strings: <sone-icon data-size="sm">.
    for (const m of text.matchAll(/<(sone-[a-z-]+)|\s(data-[\w-]+)=/g)) {
      words.add(m[1] ?? m[2]);
    }
    for (const m of text.matchAll(RELATIVE)) {
      const dep = resolveSource(file, m[1]);
      if (dep?.startsWith(src)) queue.push(dep);
    }
  }
  return words;
}

const componentsDir = join(src, "components");
const slugs = new Map(
  readdirSync(componentsDir)
    .filter((d) => statSync(join(componentsDir, d)).isDirectory())
    .map((d) => [d, join(componentsDir, d)]),
);
for (const [slug, path] of Object.entries(EXTRA_SLUGS ?? {})) {
  slugs.set(slug, join(src, path));
}

const files = new Map([["base", chunks.filter((c) => c.base)]]);
const used = new Set(files.get("base"));
for (const [slug, path] of [...slugs].sort()) {
  const words = tokens(walk(path).filter((f) => SOURCE.test(f)));
  const own = chunks.filter(
    (c) => !c.base && (c.owner === slug || applies(c, words)),
  );
  own.forEach((c) => used.add(c));
  files.set(slug, own);
}
const dead = chunks.filter((c) => !used.has(c));

// ---- write --------------------------------------------------------------------------

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const header = (slug) =>
  slug === "base"
    ? `/* base: native form controls, utilities, keyframes — import it after the component stylesheets. */\n`
    : `/* ${slug}: this component and the ones it renders inside. */\n`;
for (const [slug, list] of files) {
  const css = minify(list.map((c) => c.css).join("\n"), `${slug}.css`);
  writeFileSync(join(out, `${slug}.css`), header(slug) + css);
}

// ---- check --------------------------------------------------------------------------

/** Every `context | selector | declaration` of a stylesheet. */
function rules(css) {
  const set = new Set();
  postcss.parse(css).walkDecls((decl) => {
    const context = [];
    let selector = "";
    for (let node = decl.parent; node && node.type !== "root";) {
      if (node.type === "rule") selector ||= node.selector;
      else if (node.type === "atrule")
        context.unshift(`@${node.name} ${node.params}`);
      node = node.parent;
    }
    for (const sel of postcss.list.comma(selector || ":root")) {
      set.add(
        `${context.join(" ")} | ${sel} | ${decl.prop}:${decl.value}${decl.important ? "!important" : ""}`,
      );
    }
  });
  return set;
}

const problems = [];
for (const slug of slugs.keys()) {
  if (!existsSync(join(out, `${slug}.css`))) {
    problems.push(`no stylesheet for the ${slug} component`);
  }
}
const bundle = rules(readFileSync(join(dist, "styles.css"), "utf8"));
const split = new Set();
for (const slug of files.keys()) {
  for (const r of rules(readFileSync(join(out, `${slug}.css`), "utf8")))
    split.add(r);
}
const unused = new Set();
for (const c of dead)
  for (const r of rules(minify(c.css, "dead.css"))) unused.add(r);
const missing = [...bundle].filter((r) => !split.has(r) && !unused.has(r));
const extra = [...split].filter((r) => !bundle.has(r));
if (missing.length) {
  problems.push(
    `${missing.length} rules of styles.css are in no per-component file, e.g.\n  ${missing.slice(0, 5).join("\n  ")}`,
  );
}
if (extra.length) {
  problems.push(
    `${extra.length} rules of the per-component files are not in styles.css, e.g.\n  ${extra.slice(0, 5).join("\n  ")}`,
  );
}
if (problems.length) {
  console.error(`component-css: ${problems.join("\n")}`);
  process.exit(1);
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const baseCss = readFileSync(join(out, "base.css"));
console.log(
  `component css: ${files.size - 1} components + base.css (${kb(baseCss.length)}, ${kb(gzipSync(baseCss).length)} gzip) → dist/styles/` +
    (dead.length
      ? `; not rendered by any component here: ${[...new Set(dead.map((c) => c.owner))].join(", ")}`
      : ""),
);
