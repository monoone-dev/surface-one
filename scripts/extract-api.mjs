// Reads every secondary entry point of @surface-one/angular with the TypeScript
// compiler and writes the docs site's API catalogue: one record per component,
// directive and pipe (selector, exportAs, inputs, models, outputs and their JSDoc),
// plus the Storybook story id of each entry. The docs pages render these tables,
// so the API reference can never drift from the source.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lib = join(root, "packages/angular");
const out = join(root, "apps/docs/src/app/catalog/api.generated.json");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

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

function decoratorOf(cls) {
  for (const dec of ts.getDecorators(cls) ?? []) {
    const call = dec.expression;
    if (!ts.isCallExpression(call)) continue;
    const name = call.expression.getText();
    if (["Component", "Directive", "Pipe"].includes(name)) {
      return { kind: name.toLowerCase(), meta: call.arguments[0] };
    }
  }
  return null;
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

const entries = {};
for (const entry of readdirSync(lib).sort()) {
  const dir = join(lib, entry);
  if (entry.startsWith(".") || !statSync(dir).isDirectory()) continue;
  const files = walk(dir).filter((f) => f.endsWith(".ts"));
  const symbols = [];
  const stories = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    if (file.endsWith(".stories.ts")) {
      const m = /title:\s*"(Components\/[^"]+)"/.exec(source);
      if (m) stories.push({ title: m[1], id: storyId(m[1]) });
      continue;
    }
    ts.forEachChild(sf, (node) => {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const exported = node.modifiers?.some(
        (x) => x.kind === ts.SyntaxKind.ExportKeyword,
      );
      const dec = decoratorOf(node);
      if (!exported || !dec) return;
      const { inputs, outputs } = members(node, sf);
      symbols.push({
        name: node.name.text,
        kind: dec.kind,
        selector:
          metaProp(dec.meta, dec.kind === "pipe" ? "name" : "selector", sf) ??
          "",
        exportAs: metaProp(dec.meta, "exportAs", sf) ?? "",
        description: jsDoc(node),
        file: relative(root, file),
        inputs,
        outputs,
      });
    });
  }
  entries[entry] = {
    import: `@surface-one/angular/${entry}`,
    symbols: symbols.sort((a, b) => a.name.localeCompare(b.name)),
    stories: stories.sort((a, b) => a.title.localeCompare(b.title)),
  };
}

writeFileSync(out, JSON.stringify(entries, null, 2) + "\n");
const count = Object.values(entries).reduce((n, e) => n + e.symbols.length, 0);
console.log(
  `api: ${Object.keys(entries).length} entry points, ${count} symbols → ${relative(root, out)}`,
);

// ---- Tokens: the custom properties each token / theme file declares ----
const tokenRoot = join(root, "packages/tokens/src");
const tokenFiles = [
  ...readdirSync(join(tokenRoot, "tokens")).map((f) => `tokens/${f}`),
  ...readdirSync(join(tokenRoot, "themes"))
    .filter((f) => f.endsWith(".theme.scss"))
    .map((f) => `themes/${f}`),
].sort();
const tokens = tokenFiles.map((file) => {
  const source = readFileSync(join(tokenRoot, file), "utf8");
  const names = [
    ...new Set(
      [...source.matchAll(/^\s*(--[a-z0-9_-]+)\s*:/gm)].map((m) => m[1]),
    ),
  ];
  return { file, names };
});
const tokensOut = join(root, "apps/docs/src/app/catalog/tokens.generated.json");
writeFileSync(tokensOut, JSON.stringify(tokens, null, 2) + "\n");
console.log(
  `tokens: ${tokens.length} files, ${tokens.reduce((n, t) => n + t.names.length, 0)} declarations → ${relative(root, tokensOut)}`,
);
