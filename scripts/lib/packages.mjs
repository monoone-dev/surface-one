// The published SurfaceOne packages: every npm workspace of the root package.json that is
// not `"private": true`, in dependency order, plus the few facts the release scripts need
// about each one (PACKAGE_TABLE). A new public workspace is picked up automatically.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { abs, readJson, root } from "./repo.mjs";

/**
 * Per-package release facts, keyed by package name (all optional):
 * - `publishDir`: the folder that is published, when it is not the workspace itself
 * - `required`: a file (relative to publishDir) that proves the package was built
 * - `versionFile`: a source file with an `export const VERSION = "x.y.z"` to keep in step
 */
export const PACKAGE_TABLE = {
  "@surface-one/tokens": { required: "css/index.css" },
  "@surface-one/angular": {
    publishDir: "dist/angular",
    required: "fesm2022/surface-one-angular-button.mjs",
    versionFile: "public-api.ts",
  },
  "@surface-one/vue": {
    required: "dist/styles.css",
    versionFile: "src/index.ts",
  },
  "@surface-one/react": {
    required: "dist/styles.css",
    versionFile: "src/index.ts",
  },
  "@surface-one/angular-mcp": { required: "data/surface-one-angular.json" },
  "@surface-one/skills": {
    required: "skills/surface-one-angular/references/components.md",
  },
  "@surface-one/stylelint-config": { required: "index.js" },
};

/** The workspace folders of the root package.json (`packages/*` style globs). */
export function workspaceDirs() {
  const { workspaces = [] } = readJson("package.json");
  const patterns = Array.isArray(workspaces) ? workspaces : workspaces.packages;
  return patterns.flatMap((pattern) => {
    if (!pattern.endsWith("/*")) return [pattern];
    const parent = pattern.slice(0, -2);
    return readdirSync(abs(parent), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => `${parent}/${d.name}`)
      .sort();
  });
}

/**
 * The public workspaces, dependencies first:
 * `{ name, dir, publishDir, required, versionFile, manifest }[]` (paths relative to the root).
 */
export function publicPackages() {
  const all = workspaceDirs()
    .filter((dir) => existsSync(join(root, dir, "package.json")))
    .map((dir) => ({ dir, manifest: readJson(`${dir}/package.json`) }))
    .filter(({ manifest }) => manifest.private !== true && manifest.name);
  const byName = new Map(all.map((p) => [p.manifest.name, p]));
  const ordered = [];
  const seen = new Set();
  const visit = (pkg) => {
    if (seen.has(pkg.manifest.name)) return;
    seen.add(pkg.manifest.name);
    const { dependencies, peerDependencies, optionalDependencies } =
      pkg.manifest;
    for (const dep of Object.keys({
      ...dependencies,
      ...peerDependencies,
      ...optionalDependencies,
    })) {
      if (byName.has(dep)) visit(byName.get(dep));
    }
    ordered.push(pkg);
  };
  all.forEach(visit);
  return ordered.map(({ dir, manifest }) => {
    const facts = PACKAGE_TABLE[manifest.name] ?? {};
    return {
      name: manifest.name,
      dir,
      publishDir: facts.publishDir ?? dir,
      required: facts.required,
      versionFile: facts.versionFile && `${dir}/${facts.versionFile}`,
      manifest,
    };
  });
}
