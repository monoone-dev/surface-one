// The API of @surface-one/react, read by the TypeScript checker from the package's own sources
// through its public entry point: exactly what it exports, with the props each component declares.
// Props inherited from the React DOM types are left out; `forwardsProps` says they exist.
import { dirname } from "node:path";

import { abs } from "./repo.mjs";
import { ts } from "./source.mjs";

const ENTRY = "packages/react/src/index.ts";
const TSCONFIG = "packages/react/tsconfig.json";

function compilerOptions(entry) {
  if (entry !== abs(ENTRY)) return { noEmit: true };
  const config = abs(TSCONFIG);
  const { config: raw } = ts.readConfigFile(config, ts.sys.readFile);
  return ts.parseJsonConfigFileContent(raw, ts.sys, dirname(config)).options;
}

const oneLine = (text) => text.replace(/\s+/g, " ").trim();

/** A symbol's doc comment as written: the checker would cut it at a package name (`@scope/x`). */
function docOf(symbol) {
  const docs = ts
    .getJSDocCommentsAndTags(
      symbol.declarations?.[0] ?? symbol.valueDeclaration,
    )
    .filter(ts.isJSDoc);
  const raw = docs.at(-1)?.getText() ?? "";
  return oneLine(raw.replace(/^\/\*\*|\*\/$/g, "").replace(/^\s*\* ?/gm, ""));
}

/**
 * The `{ a = 1, … }` parameter of a component's implementation: of the function itself, or of the
 * first function in the `define…(…)` call a `const` component is made by.
 */
function destructuredProps(declaration) {
  if (ts.isFunctionLike(declaration)) {
    const name = declaration.parameters[0]?.name;
    return name && ts.isObjectBindingPattern(name) ? name : undefined;
  }
  let found;
  const visit = (node) => {
    if (found) return;
    if (ts.isFunctionLike(node) && node.parameters?.length) {
      const name = node.parameters[0].name;
      if (ts.isObjectBindingPattern(name)) {
        found = name;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration);
  return found;
}

function defaultsOf(declaration) {
  const defaults = new Map();
  for (const element of destructuredProps(declaration)?.elements ?? []) {
    if (!element.initializer) continue;
    const prop = element.propertyName ?? element.name;
    if (ts.isIdentifier(prop))
      defaults.set(prop.text, element.initializer.getText());
  }
  return defaults;
}

/** A prop's type as written; a bare `E` reads as its constraint (`as?: E` is an `ElementType`). */
function writtenType(node, checker) {
  const declaration =
    checker.getTypeFromTypeNode(node).symbol?.declarations?.[0];
  return declaration &&
    ts.isTypeParameterDeclaration(declaration) &&
    declaration.constraint
    ? declaration.constraint.getText()
    : node.getText();
}

/**
 * Every `Sone*` component a React entry point exports: `Map<name, { description, props,
 * forwardsProps }>`, in export order. `entry` is the package itself unless a test passes another.
 */
export function reactApi(entry = ENTRY) {
  const file = abs(entry);
  const program = ts.createProgram([file], compilerOptions(file));
  const checker = program.getTypeChecker();
  const isOwn = (declaration) => {
    const source = declaration.getSourceFile();
    return (
      !source.isDeclarationFile &&
      !program.isSourceFileFromExternalLibrary(source)
    );
  };
  const module = checker.getSymbolAtLocation(program.getSourceFile(file));
  const api = new Map();
  for (const exported of checker.getExportsOfModule(module)) {
    if (!/^Sone[A-Z]/.test(exported.name) || exported.name.endsWith("Context"))
      continue;
    const symbol =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    const declaration = symbol.valueDeclaration;
    if (!declaration) continue;
    const [signature] = checker
      .getTypeOfSymbolAtLocation(symbol, declaration)
      .getCallSignatures();
    if (!signature) continue;
    const parameter = signature.parameters[0];
    const all = parameter
      ? checker
          .getTypeOfSymbolAtLocation(parameter, declaration)
          .getApparentProperties()
      : [];
    const defaults = defaultsOf(declaration);
    const own = all.filter((p) => p.declarations?.some(isOwn));
    api.set(exported.name, {
      description: docOf(symbol),
      forwardsProps:
        own.length < all.length || own.some((p) => p.name === "as"),
      props: own.map((prop) => {
        const written = prop.declarations.find(isOwn).type;
        return {
          name: prop.name,
          type: oneLine(
            written
              ? writtenType(written, checker)
              : checker.typeToString(
                  checker.getTypeOfSymbolAtLocation(prop, declaration),
                ),
          ),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          default: defaults.get(prop.name) ?? "",
          description: docOf(prop),
        };
      }),
    });
  }
  return api;
}
