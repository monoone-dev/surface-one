// @vitest-environment node
// Core re-exports these packages/angular files as they are (src/angular.ts), and the
// Vue and React packages bundle them: none may import an Angular module, and the only
// Angular entry points they may name are the icon TYPE (mapped to src/angular-icon.ts)
// and the Angular-free format and graph layout entry points (aliased to their sources).
// The markdown renderer also imports marked and DOMPurify, which the packages declare as
// optional peers.
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const packages = join(here, "../..");
const ANGULAR_FORMAT = "@surface-one/angular/format";
const ANGULAR_GRAPH_LAYOUT = "@surface-one/angular/graph-layout";
/** The Angular-free entry points every build aliases to their sources. */
const ALIASED = new Map([
  [ANGULAR_FORMAT, "angular/format/index.ts"],
  [ANGULAR_GRAPH_LAYOUT, "angular/graph-layout/index.ts"],
]);
/** The npm packages the shared markdown renderer runs on (optional peers of every package). */
const THIRD_PARTY = new Set(["marked", "dompurify"]);
/** What the live markdown editor runs on (optional peers too, loaded on demand). */
const CODEMIRROR = /^@(codemirror|lezer)\//;
const IMPORT = /^\s*(import|export)\s+(type\s+)?[^;]*?\sfrom\s+"([^"]+)"/gms;

function reExported(): string[] {
  const source = readFileSync(join(here, "../src/angular.ts"), "utf8");
  return [...source.matchAll(/from "(\.\.\/\.\.\/angular\/[^"]+)"/g)].map(
    ([, spec]) => join(here, "../src", `${spec}.ts`),
  );
}

/** Every file reached from `entry` through relative imports, with its imports. */
function graph(entry: string, seen = new Map<string, string[][]>()) {
  if (seen.has(entry)) return seen;
  const imports = [...readFileSync(entry, "utf8").matchAll(IMPORT)].map(
    ([, , type, spec]) => [type ? "type" : "value", spec],
  );
  seen.set(entry, imports);
  for (const [, spec] of imports) {
    if (spec.startsWith(".")) graph(join(dirname(entry), `${spec}.ts`), seen);
    // The Angular-free format and graph layout entry points, aliased to their sources.
    const aliased = ALIASED.get(spec);
    if (aliased) graph(join(packages, aliased), seen);
  }
  return seen;
}

describe("the Angular files core shares", () => {
  const files = reExported();

  it("are the chart, bar chart, line chart, donut chart, format, processing stage, agent, flow, graph layout and model, floating-position, list-navigation, html-to-markdown and markdown helpers (render, commands, indent, images, surface, editor core, floating dock), the icons, the field wiring, the progress label, the tag rules, the command filter, the tree keys, the row menu panel, the timeline layout, the transcript turns and window, the accordion state, the pagination range, the data table state, the calendar grid, the date picker label, the combobox options, the filter chip tones, the section heading level, the rating star, the disabled button click and the textarea autosize and counter", () => {
    expect(files.map((f) => relative(packages, f)).sort()).toEqual([
      "angular/accordion/accordion-state.ts",
      "angular/button/button-disabled.ts",
      "angular/calendar/calendar-grid.ts",
      "angular/chart-utils/bar-chart.ts",
      "angular/chart-utils/chart.ts",
      "angular/chart-utils/donut-chart.ts",
      "angular/chart-utils/line-chart.ts",
      "angular/chart-utils/scale.ts",
      "angular/combobox/combobox-options.ts",
      "angular/core/command-filter.ts",
      "angular/core/floating-position.ts",
      "angular/core/html-to-markdown.ts",
      "angular/core/list-navigation.ts",
      "angular/core/row-menu-panel.ts",
      "angular/core/tree-navigation.ts",
      "angular/data-table/data-table-state.ts",
      "angular/date-picker/date-picker-label.ts",
      "angular/filter-chips/filter-chips-tone.ts",
      "angular/flow/flow.geometry.ts",
      "angular/flow/flow.types.ts",
      "angular/format/agent.ts",
      "angular/format/format.ts",
      "angular/format/processing-stage.ts",
      "angular/format/speaker.ts",
      "angular/graph-layout/index.ts",
      "angular/graph/graph-model.ts",
      "angular/graph/graph.types.ts",
      "angular/icon/icons.ts",
      "angular/input/field-control.ts",
      "angular/markdown/floating-dock.ts",
      "angular/markdown/markdown-commands.ts",
      "angular/markdown/markdown-editor-core.ts",
      "angular/markdown/markdown-image.ts",
      "angular/markdown/markdown-indent.ts",
      "angular/markdown/markdown-render.ts",
      "angular/markdown/markdown-surface.ts",
      "angular/pagination/pagination-range.ts",
      "angular/progress/progress-label.ts",
      "angular/rating/rating-star.ts",
      "angular/section-heading/section-heading-level.ts",
      "angular/tag-input/tags.ts",
      "angular/textarea/textarea-autosize.ts",
      "angular/timeline/timeline-layout.ts",
      "angular/timeline/timeline.types.ts",
      "angular/transcript/transcript-window.ts",
      "angular/transcript/transcript.types.ts",
    ]);
  });

  it("import nothing from Angular", () => {
    const offending: string[] = [];
    for (const file of files) {
      for (const [from, imports] of graph(file)) {
        for (const [kind, spec] of imports) {
          if (spec.startsWith(".") || ALIASED.has(spec)) continue;
          if (THIRD_PARTY.has(spec)) continue;
          const iconType =
            kind === "type" && spec === "@surface-one/angular/icon";
          if (!iconType)
            offending.push(`${relative(packages, from)} → ${spec}`);
        }
      }
    }
    expect(offending).toEqual([]);
  });

  it("include the live editor (src/live-markdown.ts), which imports only CodeMirror", () => {
    const offending: string[] = [];
    for (const [from, imports] of graph(
      join(here, "../src/live-markdown.ts"),
    )) {
      for (const [, spec] of imports) {
        if (spec.startsWith(".") || CODEMIRROR.test(spec)) continue;
        offending.push(`${relative(packages, from)} → ${spec}`);
      }
    }
    expect(offending).toEqual([]);
  });
});
