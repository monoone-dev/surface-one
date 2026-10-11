import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  darkWithoutLight,
  redundantDeclarations,
  sharedCandidates,
  undefinedReferences,
} from "../scripts/checks.mjs";
import { allRules, generatedSources } from "../scripts/generate.mjs";
import defs from "../src/definitions/index.mjs";
import { currentSnapshot, SNAPSHOT } from "./resolved.mjs";

const src = join(dirname(fileURLToPath(import.meta.url)), "../src");
const read = (file) => readFileSync(join(src, file), "utf8");
const rules = allRules(
  defs,
  Object.fromEntries(
    ["typography", "layout", "scale"].map((f) => [f, read(`tokens/${f}.css`)]),
  ),
);

test("every token resolves to the recorded value in every skin × theme × media × accent", () => {
  const want = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  const got = currentSnapshot();
  assert.deepEqual(got.contexts, want.contexts, "the context list changed");
  const diffs = [];
  for (const prop of new Set([
    ...Object.keys(want.tokens),
    ...Object.keys(got.tokens),
  ])) {
    const a = JSON.stringify(want.tokens[prop] ?? null);
    const b = JSON.stringify(got.tokens[prop] ?? null);
    if (a !== b) diffs.push(`${prop}\n    recorded: ${a}\n    now:      ${b}`);
  }
  assert.equal(
    diffs.length,
    0,
    `${diffs.length} token(s) resolve differently (contexts are indexes into "contexts" of ${SNAPSHOT}; ` +
      `if the change is intended, run npm run test:update -w @surface-one/tokens):\n  ${diffs.slice(0, 20).join("\n  ")}`,
  );
});

test("the generated theme files and accents.css are up to date", () => {
  for (const [file, source] of Object.entries(generatedSources(defs, src))) {
    assert.equal(
      read(file),
      source,
      `src/${file} is stale — run npm run build:tokens`,
    );
  }
});

test("no declaration repeats the value it would inherit", () => {
  assert.deepEqual(redundantDeclarations(rules), []);
});

test("no light value is repeated by ≥4 skins outside shared.mjs", () => {
  assert.deepEqual(sharedCandidates(defs), []);
});

test("every dark token of a skin has a light value", () => {
  assert.deepEqual(darkWithoutLight(defs), []);
});

test("no token references an undefined token", () => {
  assert.deepEqual(undefinedReferences(rules), []);
});
