import { expect, test } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";

import { CATALOG } from "../apps/docs/src/app/catalog/catalog";
import { DEMOS } from "../apps/docs/src/app/demos/registry";

/**
 * Every secondary entry point of @surface-one/angular is documented: a catalogue entry
 * (apps/docs/src/app/catalog/catalog.ts) and a demo (apps/docs/src/app/demos/registry.ts).
 * A plain file check — no page is opened.
 */

/** Entry points with no component of their own: helpers the components share. */
const UTILITIES = ["chart-utils", "core", "format", "graph-layout"];

const ENTRY_POINTS = readdirSync("packages/angular")
  .filter((name) => existsSync(`packages/angular/${name}/ng-package.json`))
  .filter((name) => !UTILITIES.includes(name))
  .sort();

test.describe("docs coverage of @surface-one/angular", () => {
  test("finds the entry points", () => {
    expect(ENTRY_POINTS.length).toBeGreaterThan(50);
  });

  test("every entry point has a catalogue entry", () => {
    const slugs = new Set(CATALOG.map((e) => e.slug));
    expect(ENTRY_POINTS.filter((name) => !slugs.has(name))).toEqual([]);
  });

  test("every entry point has a demo", () => {
    expect(ENTRY_POINTS.filter((name) => !(name in DEMOS))).toEqual([]);
  });

  test("every catalogue entry and demo is an entry point", () => {
    const extra = [...CATALOG.map((e) => e.slug), ...Object.keys(DEMOS)].filter(
      (slug) => !ENTRY_POINTS.includes(slug),
    );
    expect([...new Set(extra)]).toEqual([]);
  });
});
