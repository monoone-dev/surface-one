// @vitest-environment node
// src/react/ holds the hooks and helpers @surface-one/react and @surface-one/react-native
// share. They import it by module (`@surface-one/core/react/controllable`); the core entry
// must never reach it, or the Vue bundle would pull React in.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const src = join(dirname(fileURLToPath(import.meta.url)), "../src");
const IMPORT =
  /^\s*(?:import|export)\s+(?:type\s+)?[^;]*?\sfrom\s+"([^"]+)"/gms;

/** Every file reached from `entry` through relative imports. */
function reach(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  for (const [, spec] of readFileSync(entry, "utf8").matchAll(IMPORT)) {
    if (spec?.startsWith(".")) reach(join(dirname(entry), `${spec}.ts`), seen);
  }
  return seen;
}

describe("the React-only part of core", () => {
  it("is never reached from the core entry, nor imports anything but React", () => {
    const fromEntry = [...reach(join(src, "index.ts"))].map((f) =>
      relative(src, f),
    );
    expect(fromEntry.filter((f) => f.startsWith("react/"))).toEqual([]);
    for (const file of readdirSync(join(src, "react"))) {
      const specs = [
        ...readFileSync(join(src, "react", file), "utf8").matchAll(IMPORT),
      ].map(([, spec]) => spec);
      expect(specs.every((spec) => spec === "react")).toBe(true);
    }
  });
});
