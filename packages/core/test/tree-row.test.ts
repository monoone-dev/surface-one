// @vitest-environment node
// The Vue and React tree rows draw core's glyph data; it must stay the SVG the Angular
// template draws.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { TREE_ROW_CARET_PATH, TREE_ROW_ICONS } from "../src";

const html = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../angular/tree-row/tree-row.component.html",
  ),
  "utf8",
);

/** The template's shapes as `tag attr=value …`, in order. */
const shapes = (source: string): string[] =>
  [...source.matchAll(/<(path|rect|circle)\s([^>]*?)\/>/g)].map(
    ([, tag, attrs]) =>
      `${tag} ${[...attrs!.matchAll(/([\w-]+)="([^"]*)"/g)]
        .map(([, k, v]) => `${k}=${v}`)
        .join(" ")}`,
  );

describe("the tree row glyphs", () => {
  it("are the shapes of the Angular template, icon by icon", () => {
    const fromCore = [
      `path d=${TREE_ROW_CARET_PATH} stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round fill=none`,
      ...(
        [
          "space",
          "meeting",
          "note",
          "task",
          "dashboard",
          "locked",
          "folder",
        ] as const
      ).flatMap((icon) =>
        TREE_ROW_ICONS[icon].map(
          (s) =>
            `${s.tag} ${Object.entries(s.attrs)
              .map(([k, v]) => `${k}=${v}`)
              .join(" ")}`,
        ),
      ),
    ];
    const norm = (s: string) => s.split(" ").sort().join(" ");
    expect(fromCore.map(norm)).toEqual(shapes(html).map(norm));
  });
});
