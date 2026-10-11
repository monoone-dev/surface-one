// The resolved value of every token in every document state, computed from the sources
// (the generated SCSS compiled in memory + the plain token files, in css/index.css order),
// and its compact snapshot form: token → resolved value → the context indexes it holds in.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { contexts, resolveContexts } from "../scripts/cascade.mjs";
import { INDEX_IMPORTS } from "../scripts/generate.mjs";

const src = join(dirname(fileURLToPath(import.meta.url)), "../src");
export const SNAPSHOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "resolved.snapshot.json",
);

export function sourceCss() {
  return INDEX_IMPORTS.map((file) =>
    file === "themes.css"
      ? sass.compile(join(src, "themes/index.scss"), { style: "expanded" }).css
      : readFileSync(
          join(
            src,
            file === "fonts.css" || file === "base.css"
              ? file
              : `tokens/${file}`,
          ),
          "utf8",
        ),
  ).join("\n");
}

const UNSET = "<unset>";

/** contexts by index + { token: { value: "0-5,12" } } ("*" = the same in every context). */
export function encode(resolved) {
  const ids = contexts().map((c) => c.id);
  const props = [
    ...new Set(Object.values(resolved).flatMap(Object.keys)),
  ].sort();
  const tokens = {};
  for (const prop of props) {
    const byValue = new Map();
    ids.forEach((id, i) => {
      const v = resolved[id][prop] ?? UNSET;
      if (!byValue.has(v)) byValue.set(v, []);
      byValue.get(v).push(i);
    });
    const entry = {};
    for (const [value, idx] of byValue) {
      if (byValue.size === 1) {
        entry[value] = "*";
        break;
      }
      const ranges = [];
      let start = idx[0];
      let end = idx[0];
      for (const i of [...idx.slice(1), -1]) {
        if (i === end + 1) end = i;
        else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = end = i;
        }
      }
      entry[value] = ranges.join(",");
    }
    tokens[prop] = entry;
  }
  return { contexts: ids, tokens };
}

/** One token per line, so a changed value is a one-line diff. */
export function serialize(snapshot) {
  const lines = Object.entries(snapshot.tokens).map(
    ([p, e]) => `    ${JSON.stringify(p)}: ${JSON.stringify(e)}`,
  );
  return `{\n  "contexts": ${JSON.stringify(snapshot.contexts)},\n  "tokens": {\n${lines.join(",\n")}\n  }\n}\n`;
}

export function currentSnapshot() {
  return encode(resolveContexts(sourceCss()));
}
