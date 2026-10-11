// Reads the /* … */ comments of a definitions module so the generated stylesheets keep them
// (Storybook's token catalogue shows them as notes and `---- banner ----` section titles).
// The modules are plain data, one `"--token": value` entry per key, so a line scanner is
// enough: a comment belongs to the key below it; one above a block key (`dark: {`) belongs to
// the block; one before `export default` is the file header.
import { readFileSync } from "node:fs";

const BLOCK = /^\s*(light|lightAccent|dark|darkAccent): \{/;
const KEY = /^\s*"((?:--)?[a-z0-9_-]+)":/;

export function readComments(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const out = { header: [], blocks: {} };
  let pending = [];
  let open = null;
  let block = null;
  let seenExport = false;
  const indent = (text) => {
    // Re-base a comment's lines on its first line's indentation.
    const [first, ...rest] = text.split("\n");
    const pad = first.match(/^\s*/)[0].length;
    return [
      first.trim(),
      ...rest.map((l) => l.slice(Math.min(pad, l.match(/^\s*/)[0].length))),
    ].join("\n");
  };
  for (const line of lines) {
    if (open !== null) {
      open += `\n${line}`;
      if (line.includes("*/")) {
        pending.push(indent(open));
        open = null;
      }
      continue;
    }
    if (/^\s*\/\*/.test(line)) {
      if (line.includes("*/")) pending.push(line.trim());
      else open = line;
      continue;
    }
    if (/^\s*\/\//.test(line) || !line.trim()) continue;
    if (!seenExport) {
      if (/^export default/.test(line)) {
        out.header = pending;
        pending = [];
        seenExport = true;
      }
      continue;
    }
    const b = line.match(BLOCK);
    if (b) {
      block = out.blocks[b[1]] = { before: pending, props: {}, trailing: [] };
      pending = [];
      continue;
    }
    const k = line.match(KEY);
    if (k && block) {
      if (pending.length) block.props[k[1]] = pending;
      pending = [];
      continue;
    }
    if (/^\s*\},?$/.test(line) && block && line.match(/^\s*/)[0].length === 2) {
      block.trailing = pending;
      pending = [];
      block = null;
    }
  }
  return out;
}
