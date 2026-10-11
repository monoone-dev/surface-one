// CHANGELOG.md → apps/docs/src/app/pages/changelog/changelog.generated.json for the
// docs Changelog page. Runs before `ng serve`, `ng build` and the type-check.
import { readChangelog } from "./changelog.mjs";
import { DOCS_APP, writeJson } from "./lib/repo.mjs";

const out = `${DOCS_APP}/pages/changelog/changelog.generated.json`;

/** The kind of a release-please section, from its heading. */
function kindOf(title) {
  if (/breaking/i.test(title)) return "breaking";
  if (/^features?$/i.test(title)) return "features";
  if (/fix/i.test(title)) return "fixes";
  if (/^documentation$/i.test(title)) return "docs";
  return "other";
}

/** Splits a release's HTML on its `<h3>` headings: one section per kind of change. */
function sectionsOf(html) {
  return html
    .split(/(?=<h3>)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const heading = /^<h3>(.*?)<\/h3>/.exec(part);
      const title = heading ? heading[1].trim() : "";
      return {
        kind: heading ? kindOf(title) : "other",
        title,
        html: heading ? part.slice(heading[0].length).trim() : part,
      };
    });
}

const entries = readChangelog().map(({ version, date, html }) => ({
  version,
  date,
  sections: sectionsOf(html),
}));
writeJson(out, entries);
console.log(`changelog: ${entries.length} versions → ${out}`);
