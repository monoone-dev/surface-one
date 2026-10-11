// TypeScript-compiler readers for the repo's own sources: Angular decorators, the
// docs catalogue and template-literal snippets. A parser, not regexes, so quoting,
// formatting (prettier line breaks) and comments never change what is read.
import { dirname, join } from "node:path";
import ts from "typescript";

import { DOCS_APP, abs, readText, walk } from "./repo.mjs";

export { ts };

/** Parses a TypeScript file (path relative to the repo root or absolute). */
export function parse(path, source = readText(path)) {
  return ts.createSourceFile(abs(path), source, ts.ScriptTarget.Latest, true);
}

/** The text of a string / no-substitution template literal, else undefined. */
export const literalText = (node) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : undefined;

/** The initializer of `key` in an object literal, else undefined. */
export function property(object, key) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
  const prop = object.properties.find(
    (p) =>
      ts.isPropertyAssignment(p) &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
      p.name.text === key,
  );
  return prop?.initializer;
}

/**
 * The value of the template literal `const <name> = \`…\`` (or `export const`) in a
 * source file, with its escapes resolved — `undefined` when there is none. Throws when
 * the literal interpolates (`${…}`): a snippet is copied verbatim.
 */
export function templateLiteral(source, name, file = "snippet.ts") {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  let found;
  const visit = (node) => {
    if (found !== undefined) return;
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer
    ) {
      if (ts.isTemplateExpression(node.initializer)) {
        throw new Error(
          `${file}: ${name} must not interpolate (\${…}); escape it as \\\${`,
        );
      }
      found = literalText(node.initializer);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

/** `@Component` / `@Directive` / `@Pipe` of a class: `{ kind, meta }` or null. */
export function angularDecorator(cls) {
  for (const dec of ts.getDecorators(cls) ?? []) {
    const call = dec.expression;
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression))
      continue;
    const name = call.expression.text;
    if (name === "Component" || name === "Directive" || name === "Pipe") {
      return { kind: name.toLowerCase(), meta: call.arguments[0] };
    }
  }
  return null;
}

/**
 * Every decorated class of one Angular source file:
 * `{ name, node, sf, kind, meta, exported, selector, styleUrls }` — `selector` is the
 * pipe name for a pipe; `styleUrls` are absolute (from `styleUrl` and `styleUrls`).
 */
export function angularDeclarations(path) {
  const sf = parse(path);
  const out = [];
  ts.forEachChild(sf, (node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const dec = angularDecorator(node);
    if (!dec) return;
    const styles = property(dec.meta, "styleUrls");
    const styleUrls = [
      literalText(property(dec.meta, "styleUrl")),
      ...(styles && ts.isArrayLiteralExpression(styles)
        ? styles.elements.map(literalText)
        : []),
    ]
      .filter(Boolean)
      .map((url) => join(dirname(sf.fileName), url));
    out.push({
      name: node.name.text,
      node,
      sf,
      kind: dec.kind,
      meta: dec.meta,
      exported: !!node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      ),
      selector:
        literalText(
          property(dec.meta, dec.kind === "pipe" ? "name" : "selector"),
        ) ?? "",
      styleUrls,
    });
  });
  return out;
}

/** Every `@Component` under `dir` (default packages/angular), sorted by file. */
export function angularComponents(dir = "packages/angular") {
  return walk(dir, (_, name) => name.endsWith(".component.ts"))
    .sort()
    .flatMap((file) =>
      angularDeclarations(file)
        .filter((d) => d.kind === "component")
        .map(({ name, selector, styleUrls }) => ({
          file,
          name,
          selector,
          styleUrls,
        })),
    );
}

/** The docs catalogue (`CATALOG` in catalog.ts): `{ slug, name, category }[]` in order. */
export function catalogEntries(path = `${DOCS_APP}/catalog/catalog.ts`) {
  const sf = parse(path);
  let list;
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "CATALOG"
    ) {
      let init = node.initializer;
      while (
        init &&
        (ts.isAsExpression(init) || ts.isSatisfiesExpression(init))
      )
        init = init.expression;
      list = init;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!list || !ts.isArrayLiteralExpression(list))
    throw new Error(`${path}: no CATALOG array`);
  return list.elements.map((e) => ({
    slug: literalText(property(e, "slug")),
    name: literalText(property(e, "name")),
    category: literalText(property(e, "category")),
  }));
}
