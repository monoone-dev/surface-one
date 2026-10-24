// The tree row's glyphs as data: the Vue and React twins of `sone-tree-row` draw the very
// SVGs packages/angular/tree-row/tree-row.component.html does (test/tree-row.test.ts
// keeps them identical).

export type TreeRowIcon =
  "folder" | "locked" | "space" | "meeting" | "note" | "task" | "dashboard";

/** One SVG child: its tag and attributes, in the Angular template's order. */
export interface TreeRowShape {
  readonly tag: "path" | "rect" | "circle";
  readonly attrs: Readonly<Record<string, string>>;
}

const STROKE = { stroke: "currentColor", "stroke-width": "1.3" } as const;

const rect = (
  x: string,
  y: string,
  width: string,
  height: string,
  rx: string,
): TreeRowShape => ({
  tag: "rect",
  attrs: { x, y, width, height, rx, ...STROKE },
});

const path = (d: string, extra: Record<string, string> = {}): TreeRowShape => ({
  tag: "path",
  attrs: { d, ...STROKE, ...extra },
});

/** Every row icon's shapes (a 16×16 viewBox, drawn at 15px, `fill="none"`). */
export const TREE_ROW_ICONS: Readonly<
  Record<TreeRowIcon, readonly TreeRowShape[]>
> = {
  space: [
    rect("1.8", "1.8", "5.2", "5.2", "1.4"),
    rect("9", "1.8", "5.2", "5.2", "1.4"),
    rect("1.8", "9", "5.2", "5.2", "1.4"),
    rect("9", "9", "5.2", "5.2", "1.4"),
  ],
  meeting: [
    { tag: "circle", attrs: { cx: "8", cy: "8", r: "5.2", ...STROKE } },
    path("M8 5.2V8l1.9 1.3", { "stroke-linecap": "round" }),
  ],
  note: [
    path("M4 2.6h5.2L12.4 6v7.4H4z", { "stroke-linejoin": "round" }),
    path("M9 2.8V6h3.2", { "stroke-linejoin": "round" }),
  ],
  task: [
    rect("3", "3", "10", "10", "2.2"),
    path("m5.8 8.2 1.6 1.6 3-3.4", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ],
  dashboard: [
    rect("2.6", "2.6", "4.6", "4.6", "1.1"),
    rect("8.8", "2.6", "4.6", "7.2", "1.1"),
    rect("2.6", "8.8", "4.6", "4.6", "1.1"),
  ],
  locked: [
    rect("3.5", "7", "9", "6", "1.4"),
    path("M5.5 7V5.4a2.5 2.5 0 0 1 5 0V7", { "stroke-linecap": "round" }),
  ],
  folder: [
    path(
      "M1.75 4.25c0-.7.55-1.25 1.25-1.25h2.8c.4 0 .77.18 1 .5l.6.75h4.6c.7 0 1.25.55 1.25 1.25v5.5c0 .7-.55 1.25-1.25 1.25H3c-.7 0-1.25-.55-1.25-1.25z",
      { "stroke-linejoin": "round" },
    ),
  ],
};

/** The caret's chevron (a 24×24 viewBox, drawn at 16px). */
export const TREE_ROW_CARET_PATH = "m9 18 6-6-6-6";

/** The shapes of `icon`, the folder for an unknown one (the template's `@default`). */
export function treeRowIconShapes(icon: string): readonly TreeRowShape[] {
  return TREE_ROW_ICONS[icon as TreeRowIcon] ?? TREE_ROW_ICONS.folder;
}
