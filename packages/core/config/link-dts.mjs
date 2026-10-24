// Moves the declarations of @surface-one/vue / @surface-one/react into dist/ and makes
// them self-contained. Run from the package directory after `tsc -p tsconfig.build.json`
// (outDir dist/.types, rootDir packages/):
//
//   node ../core/config/link-dts.mjs
//
// dist/.types/<pkg>/src/**  → dist/**             (the package's own declarations)
// dist/.types/core/**       → dist/_shared/core/**  (the bundled private core package)
// dist/.types/angular/**    → dist/_shared/angular/** (the Angular-free files core re-exports)
//
// Every import specifier is rewritten to the new relative location, the core package
// name and the `@surface-one/angular/icon` type shim included, so a consumer resolves
// every type inside the published package. It fails when a declaration or a module
// still names the private package, or an Angular entry point.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const CORE_NAME = ["@surface-one", "core"].join("/");
const pkgDir = process.cwd();
const pkg = basename(pkgDir);
const dist = join(pkgDir, "dist");
const tmp = join(dist, ".types");
const ownSrc = join(tmp, pkg, "src");
const shared = join(dist, "_shared");
const coreSrc = join(tmp, "core", "src");

if (!existsSync(ownSrc)) {
  throw new Error(
    `link-dts: ${relative(pkgDir, ownSrc)} not found — run tsc first`,
  );
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const inside = (path, dir) => path === dir || path.startsWith(dir + sep);

/** Where a path under dist/.types ends up. */
const moved = (path) =>
  inside(path, ownSrc)
    ? join(dist, relative(ownSrc, path))
    : join(shared, relative(tmp, path));

/** The dist/.types path a bare specifier stands for, or null to keep it. */
function bare(spec, file) {
  if (spec === CORE_NAME) return join(coreSrc, "index");
  if (spec.startsWith(`${CORE_NAME}/`)) {
    return join(coreSrc, spec.slice(CORE_NAME.length + 1));
  }
  if (spec === "@surface-one/angular/icon")
    return join(coreSrc, "angular-icon");
  if (spec === "@surface-one/angular/format")
    return join(tmp, "angular", "format", "index");
  if (spec === "@surface-one/angular/graph-layout")
    return join(tmp, "angular", "graph-layout", "index");
  if (spec.startsWith("@surface-one/angular")) {
    throw new Error(`link-dts: ${relative(tmp, file)} imports ${spec}`);
  }
  return null;
}

const SPECIFIER =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|<reference\s+path=)(["'])([^"'\n]+)\2/g;

const files = walk(tmp).filter((f) => f.endsWith(".d.ts"));
for (const file of files) {
  const out = moved(file);
  const text = readFileSync(file, "utf8").replace(
    SPECIFIER,
    (match, lead, quote, spec) => {
      const target = spec.startsWith(".")
        ? resolve(dirname(file), spec)
        : bare(spec, file);
      if (target === null) return match;
      let next = relative(dirname(out), moved(target)).split(sep).join("/");
      if (!next.startsWith(".")) next = `./${next}`;
      return `${lead}${quote}${next}${quote}`;
    },
  );
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
}
rmSync(tmp, { recursive: true, force: true });

const leaks = walk(dist).filter(
  (f) => /\.(d\.ts|js)$/.test(f) && readFileSync(f, "utf8").includes(CORE_NAME),
);
if (leaks.length) {
  throw new Error(
    `link-dts: ${leaks.map((f) => relative(pkgDir, f)).join(", ")} still name ${CORE_NAME}`,
  );
}
console.log(
  `link-dts: ${files.length} declarations → ${relative(pkgDir, dist)}/`,
);
