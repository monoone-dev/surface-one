// CHANGELOG.md → apps/docs/src/app/pages/changelog/changelog.generated.json for the
// docs Changelog page. Runs before `ng serve`, `ng build` and the type-check.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { readChangelog } from "./changelog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(
  root,
  "apps/docs/src/app/pages/changelog/changelog.generated.json",
);

const entries = readChangelog().map(({ version, date, html }) => ({
  version,
  date,
  html,
}));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(entries, null, 2) + "\n");
console.log(`changelog: ${entries.length} versions → ${relative(root, out)}`);
