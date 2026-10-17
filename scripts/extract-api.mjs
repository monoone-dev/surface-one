// Reads every secondary entry point of @surface-one/angular with the TypeScript
// compiler and writes the docs site's API catalogue: one record per component,
// directive and pipe (selector, exportAs, inputs, models, outputs and their JSDoc),
// plus the Storybook story id of each entry. The docs pages render these tables,
// so the API reference can never drift from the source.
//
// Outputs (apps/docs/src/app/catalog/):
// - api.generated.json — every entry point in one file (read by scripts/build-ai.mjs);
// - api/<slug>.json + api/index.generated.ts — the same records split per entry point,
//   with one lazy loader each and SYMBOL_COUNT as a constant, so only a component page
//   loads its own API table and the home page / catalogue never bundle the JSON;
// - tokens.generated.json — the custom properties each token / theme file declares.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

import {
  DOCS_APP,
  abs,
  cssDeclarations,
  rel,
  walk,
  writeJson,
  writeText,
} from "./lib/repo.mjs";
import { angularDeclarations, ts } from "./lib/source.mjs";

const lib = abs("packages/angular");
const out = `${DOCS_APP}/catalog/api.generated.json`;

const text = (node, sf) => (node ? node.getText(sf).replace(/\s+/g, " ") : "");

function jsDoc(node) {
  const docs = node.jsDoc ?? [];
  return docs
    .map((d) =>
      typeof d.comment === "string"
        ? d.comment
        : (d.comment ?? []).map((c) => c.text ?? "").join(""),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaProp(meta, key, sf) {
  if (!meta || !ts.isObjectLiteralExpression(meta)) return undefined;
  const prop = meta.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === key,
  );
  if (!prop) return undefined;
  const init = prop.initializer;
  return ts.isStringLiteralLike(init) ? init.text : text(init, sf);
}

/** `input<T>(d)`, `input.required<T>()`, `model<T>(d)`, `output<T>()` and the decorator forms. */
function members(cls, sf) {
  const inputs = [];
  const outputs = [];
  for (const m of cls.members) {
    if (!ts.isPropertyDeclaration(m) || !m.name) continue;
    const name = m.name.getText(sf);
    if (
      name.startsWith("#") ||
      m.modifiers?.some(
        (x) =>
          x.kind === ts.SyntaxKind.PrivateKeyword ||
          x.kind === ts.SyntaxKind.ProtectedKeyword,
      )
    )
      continue;
    const description = jsDoc(m);
    const decorators = ts.getDecorators(m) ?? [];
    for (const dec of decorators) {
      const dn = ts.isCallExpression(dec.expression)
        ? dec.expression.expression.getText(sf)
        : "";
      if (dn === "Input") {
        inputs.push({
          name,
          type: text(m.type, sf) || "unknown",
          default: text(m.initializer, sf),
          required: false,
          description,
        });
      } else if (dn === "Output") {
        outputs.push({
          name,
          type: text(m.type, sf) || "EventEmitter",
          description,
        });
      }
    }
    const init = m.initializer;
    if (!init || !ts.isCallExpression(init)) continue;
    const callee = init.expression.getText(sf);
    const typeArg = init.typeArguments?.[0]
      ? text(init.typeArguments[0], sf)
      : "";
    const args = init.arguments;
    const optsAlias = (arg) => {
      if (!arg || !ts.isObjectLiteralExpression(arg)) return undefined;
      const alias = arg.properties.find(
        (p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "alias",
      );
      return alias && ts.isStringLiteralLike(alias.initializer)
        ? alias.initializer.text
        : undefined;
    };
    if (callee === "input" || callee === "model") {
      const def = args[0] ? text(args[0], sf) : "";
      inputs.push({
        name: optsAlias(args[1]) ?? name,
        type: typeArg || inferType(def),
        default: def,
        required: false,
        model: callee === "model",
        description,
      });
    } else if (callee === "input.required" || callee === "model.required") {
      inputs.push({
        name: optsAlias(args[0]) ?? name,
        type: typeArg || "unknown",
        default: "",
        required: true,
        model: callee === "model.required",
        description,
      });
    } else if (callee === "output") {
      outputs.push({
        name: optsAlias(args[0]) ?? name,
        type: typeArg || "void",
        description,
      });
    }
  }
  return { inputs, outputs };
}

function inferType(def) {
  if (def === "true" || def === "false") return "boolean";
  if (/^-?\d/.test(def)) return "number";
  if (/^["'`]/.test(def)) return "string";
  if (def === "null") return "null";
  if (def.startsWith("[")) return "array";
  return "";
}

function storyId(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9/ -]/g, "")
      .replace(/[ /]+/g, "-") + "--docs"
  );
}

/** Every declaration by class name, so a part that extends a shared base gets its inputs too. */
const byName = new Map(
  walk(lib, (f) => f.endsWith(".ts") && !f.endsWith(".stories.ts"))
    .flatMap((file) => angularDeclarations(file))
    .map((dec) => [dec.name, dec]),
);

function baseOf(node) {
  const clause = node.heritageClauses?.find(
    (h) => h.token === ts.SyntaxKind.ExtendsKeyword,
  );
  const name = clause?.types[0]?.expression.getText();
  return name ? byName.get(name) : undefined;
}

/** The members of a declaration and of the bases it extends (base first, own last). */
function allMembers(dec) {
  const own = members(dec.node, dec.sf);
  const base = baseOf(dec.node);
  if (!base) return own;
  const inherited = allMembers(base);
  const named = (list) => new Set(list.map((m) => m.name));
  const ownInputs = named(own.inputs);
  const ownOutputs = named(own.outputs);
  return {
    inputs: [
      ...inherited.inputs.filter((m) => !ownInputs.has(m.name)),
      ...own.inputs,
    ],
    outputs: [
      ...inherited.outputs.filter((m) => !ownOutputs.has(m.name)),
      ...own.outputs,
    ],
  };
}

const isAbstract = (node) =>
  !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);

const entries = {};
for (const entry of readdirSync(lib).sort()) {
  const dir = join(lib, entry);
  if (entry.startsWith(".") || !statSync(dir).isDirectory()) continue;
  const files = walk(dir, (f) => f.endsWith(".ts"));
  const symbols = [];
  const stories = [];
  for (const file of files) {
    if (file.endsWith(".stories.ts")) {
      const source = readFileSync(file, "utf8");
      const m = /title:\s*["'`](Components\/[^"'`]+)["'`]/.exec(source);
      if (m) stories.push({ title: m[1], id: storyId(m[1]) });
      continue;
    }
    for (const dec of angularDeclarations(file)) {
      if (!dec.exported || isAbstract(dec.node)) continue;
      const { inputs, outputs } = allMembers(dec);
      symbols.push({
        name: dec.name,
        kind: dec.kind,
        selector:
          metaProp(
            dec.meta,
            dec.kind === "pipe" ? "name" : "selector",
            dec.sf,
          ) ?? "",
        exportAs: metaProp(dec.meta, "exportAs", dec.sf) ?? "",
        description: jsDoc(dec.node),
        file: rel(file),
        inputs,
        outputs,
      });
    }
  }
  entries[entry] = {
    import: `@surface-one/angular/${entry}`,
    symbols: symbols.sort((a, b) => a.name.localeCompare(b.name)),
    stories: stories.sort((a, b) => a.title.localeCompare(b.title)),
  };
}

writeJson(out, entries);
const count = Object.values(entries).reduce((n, e) => n + e.symbols.length, 0);

// The per-entry-point split: a component page lazy-loads only its own record.
const splitDir = abs(`${DOCS_APP}/catalog/api`);
rmSync(splitDir, { recursive: true, force: true });
mkdirSync(splitDir, { recursive: true });
for (const [slug, entry] of Object.entries(entries)) {
  writeText(join(splitDir, `${slug}.json`), JSON.stringify(entry) + "\n");
}
const symbolCount = Object.values(entries).reduce(
  (n, e) => n + e.symbols.filter((s) => s.kind !== "pipe").length,
  0,
);
writeText(
  join(splitDir, "index.generated.ts"),
  `// Generated by scripts/extract-api.mjs — do not edit.

/** Every component and directive the package exports (pipes excluded) — the home page stats. */
export const SYMBOL_COUNT = ${symbolCount};

/** One lazy chunk per entry point: \`@surface-one/angular/<slug>\`'s API record. */
export const API_LOADERS: Readonly<
  Record<string, () => Promise<{ default: unknown }>>
> = {
${Object.keys(entries)
  .map((slug) => `  ${JSON.stringify(slug)}: () => import("./${slug}.json"),`)
  .join("\n")}
};
`,
);
console.log(
  `api: ${Object.keys(entries).length} entry points, ${count} symbols → ${out}`,
);

// ---- Tokens: the custom properties each token / theme file declares ----
const tokenRoot = abs("packages/tokens/src");
const tokenFiles = [
  ...readdirSync(join(tokenRoot, "tokens")).map((f) => `tokens/${f}`),
  ...readdirSync(join(tokenRoot, "themes"))
    .filter((f) => f.endsWith(".theme.scss"))
    .map((f) => `themes/${f}`),
].sort();
const tokens = tokenFiles.map((file) => {
  const source = readFileSync(join(tokenRoot, file), "utf8");
  return { file, names: Object.keys(cssDeclarations(source)) };
});
const tokensOut = `${DOCS_APP}/catalog/tokens.generated.json`;
writeJson(tokensOut, tokens);
console.log(
  `tokens: ${tokens.length} files, ${tokens.reduce((n, t) => n + t.names.length, 0)} declarations → ${tokensOut}`,
);
