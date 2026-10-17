// @vitest-environment node
// Core re-exports these packages/angular files as they are (src/angular.ts), and the
// Vue and React packages bundle them: none may import an Angular module, and the only
// Angular entry points they may name are the icon TYPE (mapped to src/angular-icon.ts)
// and the Angular-free format entry point (aliased to its sources).
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const packages = join(here, "../..");
const ANGULAR_FORMAT = "@surface-one/angular/format";
const IMPORT = /^\s*(import|export)\s+(type\s+)?[^;]*?\sfrom\s+"([^"]+)"/gms;

function reExported(): string[] {
  const source = readFileSync(join(here, "../src/angular.ts"), "utf8");
  return [...source.matchAll(/from "(\.\.\/\.\.\/angular\/[^"]+)"/g)].map(
    ([, spec]) => join(here, "../src", `${spec}.ts`),
  );
}

/** Every file reached from `entry` through relative imports, with its imports. */
function graph(entry: string, seen = new Map<string, string[][]>()) {
  if (seen.has(entry)) return seen;
  const imports = [...readFileSync(entry, "utf8").matchAll(IMPORT)].map(
    ([, , type, spec]) => [type ? "type" : "value", spec],
  );
  seen.set(entry, imports);
  for (const [, spec] of imports) {
    if (spec.startsWith(".")) graph(join(dirname(entry), `${spec}.ts`), seen);
    // The Angular-free format entry point, aliased to its sources in every build.
    if (spec === ANGULAR_FORMAT)
      graph(join(packages, "angular/format/index.ts"), seen);
  }
  return seen;
}

describe("the Angular files core shares", () => {
  const files = reExported();

  it("are the chart, format, agent, flow, floating-position and list-navigation helpers", () => {
    expect(files.map((f) => relative(packages, f)).sort()).toEqual([
      "angular/chart-utils/chart.ts",
      "angular/chart-utils/scale.ts",
      "angular/core/floating-position.ts",
      "angular/core/list-navigation.ts",
      "angular/flow/flow.geometry.ts",
      "angular/flow/flow.types.ts",
      "angular/format/agent.ts",
      "angular/format/format.ts",
      "angular/format/speaker.ts",
    ]);
  });

  it("import nothing from Angular", () => {
    const offending: string[] = [];
    for (const file of files) {
      for (const [from, imports] of graph(file)) {
        for (const [kind, spec] of imports) {
          if (spec.startsWith(".") || spec === ANGULAR_FORMAT) continue;
          const iconType =
            kind === "type" && spec === "@surface-one/angular/icon";
          if (!iconType)
            offending.push(`${relative(packages, from)} → ${spec}`);
        }
      }
    }
    expect(offending).toEqual([]);
  });
});
