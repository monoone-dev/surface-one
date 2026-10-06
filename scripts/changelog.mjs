// Reads CHANGELOG.md (written by release-please) into one entry per version.
// Shared by scripts/build-changelog.mjs (docs page) and scripts/build-ai.mjs (MCP docs).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// `## [0.2.0](https://…/compare/v0.1.0...v0.2.0) (2026-10-06)` or `## 0.2.0 (2026-10-06)`
const VERSION_HEADING =
  /^##\s+\[?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?(?:\([^)]*\))?\s+\((\d{4}-\d{2}-\d{2})\)\s*$/;

const escape = (s) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const marked = new Marked({
  gfm: true,
  renderer: {
    // Commit subjects end up here: never pass raw HTML through.
    html: ({ text }) => escape(text),
  },
});

// The version title is an <h2>, so a note's own headings start at <h3>.
function shiftHeadings(tokens) {
  const headings = tokens.filter((t) => t.type === "heading");
  if (!headings.length) return;
  const top = Math.min(...headings.map((h) => h.depth));
  for (const h of headings) h.depth = Math.min(6, h.depth - top + 3);
}

/** @returns {{ version: string, date: string, markdown: string, html: string }[]} newest first */
export function readChangelog(file = join(root, "CHANGELOG.md")) {
  const lines = readFileSync(file, "utf8").split("\n");
  const entries = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(VERSION_HEADING);
    if (match) {
      current = { version: match[1], date: match[2], lines: [] };
      entries.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (!entries.length)
    throw new Error(`${file}: no "## x.y.z (YYYY-MM-DD)" sections`);
  return entries.map(({ version, date, lines }) => {
    const markdown = lines.join("\n").trim();
    const tokens = marked.lexer(markdown);
    shiftHeadings(tokens);
    return { version, date, markdown, html: marked.parser(tokens).trim() };
  });
}
