// The docs templates: apps/docs/src/app/templates/<slug>.template.ts (Angular), vue/<slug>.vue
// (its Vue twin) and react/<slug>.tsx (its React twin) share two framework-free files:
//   - data/<slug>.ts — the mock data, imported by all three;
//   - styles/<slug>.css — the stylesheet: Angular's `styleUrl`, Vue's `<style scoped src>`, and
//     for React (no scoping) a copy with every selector prefixed by `.tpl-<slug>`, generated here
//     into styles/scoped/<slug>.generated.ts (`export const css`). styles/<slug>.twins.css holds
//     the rules only the Vue and React screens need, and is appended for both.
// → templates/sources/<slug>.generated.ts, the code a template page shows under "Code": each
//   file with its data and styles inlined, so the copied source stands alone. One small module
//   per template, so a page loads only its own sources; templates/sources/templates.generated.json
//   holds them all for scripts that are not bundled (scripts/build-ai.mjs).
//
// The same for the component demos: apps/docs/src/app/demos/vue/<slug>.vue and
// react/<slug>.tsx (the twins of <slug>.demo.ts)
// → demos/sources/<slug>.generated.ts (`vue`, `react`), a lazy loader per slug in
//   demos/sources/index.generated.ts, and every twin in demos/sources/twins.generated.json
//   ({ [slug]: { vue: string | null, react: string | null } }) for scripts that are not
//   bundled (scripts/build-ai.mjs).
// Runs before `ng serve`, `ng build`, the type-check and the Vue / React package tests.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import postcss from "postcss";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "apps/docs/src/app/templates");
const out = join(dir, "sources");
const scopedOut = join(dir, "styles/scoped");

const slugs = readdirSync(dir)
  .filter((f) => f.endsWith(".template.ts"))
  .map((f) => f.slice(0, -".template.ts".length))
  .sort();

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
rmSync(scopedOut, { recursive: true, force: true });
mkdirSync(scopedOut, { recursive: true });

const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);
/** Escapes text for a JS template literal. */
const literal = (text) => text.replace(/[`\\]|\$\{/g, (m) => `\\${m}`);
const indent = (text, by) =>
  text.replace(/^(?=.)/gm, " ".repeat(by)).replace(/\s*$/, "\n");
/** A CSS file without its leading header comment. */
const cssBody = (path) => (read(path) ?? "").replace(/^\/\*[\s\S]*?\*\/\n/, "");

/**
 * The React twin has no style scoping: every selector gets the template's `.tpl-<slug>` class,
 * as a descendant (`.tpl-crm .card`), or on the same element for the classes that sit next to
 * a `tpl-*` class in the twin's markup (`.tpl-crm.shell`, a portaled `.tpl-board-menu.row-panel`).
 * `:host` rules are Angular's and are dropped.
 */
function scope(css, slug, reactSource) {
  const roots = new Map();
  for (const m of reactSource.matchAll(/className="([^"]*)"/g)) {
    const classes = m[1].split(/\s+/);
    const tpl = classes.find(
      (c) => c === `tpl-${slug}` || c.startsWith(`tpl-${slug}-`),
    );
    if (!tpl) continue;
    for (const c of classes) if (c !== tpl && !roots.has(c)) roots.set(c, tpl);
  }
  const ast = postcss.parse(css);
  ast.walkRules((rule) => {
    if (rule.parent.type === "atrule" && /keyframes$/.test(rule.parent.name))
      return;
    const selectors = rule.selectors
      .filter((sel) => !/^:host(?![\w-])/.test(sel))
      .map((sel) => {
        const first = /^\.([\w-]+)/.exec(sel)?.[1];
        return first && roots.has(first)
          ? `.${roots.get(first)}${sel}`
          : `.tpl-${slug} ${sel}`;
      });
    if (selectors.length) rule.selectors = selectors;
    else rule.remove();
  });
  return ast.toString();
}

/** `import { … } from "./data/<slug>";` → the data module itself, without `export`s. */
function inlineData(source, slug) {
  const re = new RegExp(`import \\{[^}]*\\} from "\\.{1,2}/data/${slug}";\\n`);
  if (!re.test(source)) return source;
  const data = readFileSync(join(dir, "data", `${slug}.ts`), "utf8")
    .replace(/^(\/\/.*\n)+\n/, "")
    .replace(
      /^export (?=(?:const|let|function|async function|interface|type|class|enum) )/gm,
      "",
    );
  return source.replace(re, () => data);
}

const missingVue = [];
const missingReact = [];
const all = {};
for (const slug of slugs) {
  const sharedCss = cssBody(join(dir, "styles", `${slug}.css`));
  const twinsCss = cssBody(join(dir, "styles", `${slug}.twins.css`));
  let angular = readFileSync(join(dir, `${slug}.template.ts`), "utf8");
  let vue = read(join(dir, "vue", `${slug}.vue`));
  let react = read(join(dir, "react", `${slug}.tsx`));
  if (vue === null) missingVue.push(slug);
  if (react === null) missingReact.push(slug);

  if (react !== null && sharedCss) {
    writeFileSync(
      join(scopedOut, `${slug}.generated.ts`),
      `// Generated by scripts/build-template-sources.mjs from ../${slug}.css` +
        (twinsCss ? ` and ../${slug}.twins.css` : "") +
        ` — do not edit.\n` +
        `export const css = ${JSON.stringify(scope(sharedCss + twinsCss, slug, react))};\n`,
    );
  }

  // The displayed sources: the data and the stylesheet inlined, as a reader copies them.
  angular = inlineData(angular, slug).replace(
    /styles: `\n([\s\S]*?)\n  `,\n  styleUrl: "\.\/styles\/[\w-]+\.css",?\n/,
    (_, host) =>
      "styles: `\n" +
      indent(literal(host.replace(/^ {4}/gm, "") + "\n" + sharedCss), 4) +
      "  `,\n",
  );
  if (vue !== null) {
    vue = inlineData(vue, slug).replace(
      /<style scoped src="\.\.\/styles\/[\w-]+\.css"><\/style>\n(<style scoped src="\.\.\/styles\/[\w-]+\.twins\.css"><\/style>\n)?/,
      () =>
        `<style scoped>\n${sharedCss}${twinsCss ? "\n" + twinsCss : ""}</style>\n`,
    );
  }
  if (react !== null) {
    react = inlineData(react, slug).replace(
      /(\/\/ The shared stylesheet .*\n)?import \{ css \} from "\.\.\/styles\/scoped\/[\w-]+\.generated";\n/,
      () =>
        "const css = `\n" +
        literal(scope(sharedCss + twinsCss, slug, react)) +
        "`;\n",
    );
  }

  all[slug] = { angular, vue, react };
  writeFileSync(
    join(out, `${slug}.generated.ts`),
    `// Generated by scripts/build-template-sources.mjs — do not edit.\n` +
      `export const angular = ${JSON.stringify(angular)};\n` +
      `export const vue: string | null = ${JSON.stringify(vue)};\n` +
      `export const react: string | null = ${JSON.stringify(react)};\n`,
  );
}
writeFileSync(
  join(out, "templates.generated.json"),
  JSON.stringify(all, null, 2) + "\n",
);

console.log(
  `templates: ${slugs.length} sources → ${relative(root, out)}` +
    (missingVue.length ? ` (no Vue twin: ${missingVue.join(", ")})` : "") +
    (missingReact.length ? ` (no React twin: ${missingReact.join(", ")})` : ""),
);

// ---- Demos: the Vue and React twins shown under a component page's "Code" tab ----
const demoDir = join(root, "apps/docs/src/app/demos");
const demoOut = join(demoDir, "sources");
rmSync(demoOut, { recursive: true, force: true });
mkdirSync(demoOut, { recursive: true });

const demoSlugs = readdirSync(demoDir)
  .filter((f) => f.endsWith(".demo.ts"))
  .map((f) => f.slice(0, -".demo.ts".length))
  .sort();
const twinFiles = (sub, ext) =>
  existsSync(join(demoDir, sub))
    ? readdirSync(join(demoDir, sub))
        .filter((f) => f.endsWith(ext))
        .map((f) => f.slice(0, -ext.length))
    : [];
const orphans = [
  ...twinFiles("vue", ".vue"),
  ...twinFiles("react", ".tsx"),
].filter((slug) => !demoSlugs.includes(slug));
if (orphans.length) {
  throw new Error(`demo twins without a <slug>.demo.ts: ${orphans.join(", ")}`);
}

const twins = {};
for (const slug of demoSlugs) {
  const vue = read(join(demoDir, "vue", `${slug}.vue`));
  const react = read(join(demoDir, "react", `${slug}.tsx`));
  if (vue === null && react === null) continue;
  twins[slug] = { vue, react };
  writeFileSync(
    join(demoOut, `${slug}.generated.ts`),
    `// Generated by scripts/build-template-sources.mjs — do not edit.\n` +
      `export const vue: string | null = ${JSON.stringify(vue)};\n` +
      `export const react: string | null = ${JSON.stringify(react)};\n`,
  );
}
writeFileSync(
  join(demoOut, "index.generated.ts"),
  `// Generated by scripts/build-template-sources.mjs — do not edit.\n` +
    `/** One lazy chunk per demo with a Vue and/or React twin. */\n` +
    `export const DEMO_TWINS: Readonly<\n` +
    `  Record<string, () => Promise<{ vue: string | null; react: string | null }>>\n` +
    `> = {\n` +
    Object.keys(twins)
      .map(
        (slug) =>
          `  ${JSON.stringify(slug)}: () => import("./${slug}.generated"),\n`,
      )
      .join("") +
    `};\n`,
);
writeFileSync(
  join(demoOut, "twins.generated.json"),
  JSON.stringify(twins, null, 2) + "\n",
);
const twinCount = (key) =>
  Object.values(twins).filter((t) => t[key] !== null).length;
console.log(
  `demos: ${twinCount("vue")} Vue and ${twinCount("react")} React twins of ${demoSlugs.length} demos → ${relative(root, demoOut)}`,
);
