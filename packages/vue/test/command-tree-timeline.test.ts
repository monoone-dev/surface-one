import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneCommand,
  SoneCommandEmpty,
  SoneCommandGroup,
  SoneCommandInput,
  SoneCommandItem,
  SoneCommandList,
  SoneCommandSeparator,
  SoneTimeline,
  SoneTree,
  SoneTreeItem,
  SoneTreeRow,
  type TimelineData,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const ssr = (render: () => unknown): Promise<string> =>
  renderToString(createSSRApp({ render }));

const palette =
  (onSelect: (v: string) => void = () => undefined) =>
  () =>
    h(SoneCommand, null, () => [
      h(SoneCommandInput, { "aria-label": "Search" }),
      h(SoneCommandList, { id: "list" }, () => [
        h(SoneCommandEmpty, null, () => "No results."),
        h(SoneCommandGroup, { heading: "Notes" }, () => [
          h(SoneCommandItem, { id: "a", onSelect }, () => "Café roadmap"),
          h(SoneCommandItem, { id: "b", onSelect }, () => "Weekly sync"),
        ]),
        h(SoneCommandSeparator),
        h(SoneCommandGroup, { heading: "Actions" }, () => [
          h(
            SoneCommandItem,
            { id: "c", value: "New note", keywords: ["create"], onSelect },
            () => "New note",
          ),
          h(
            SoneCommandItem,
            { id: "d", disabled: true, onSelect },
            () => "Export",
          ),
        ]),
      ]),
    ]);

describe("SoneCommand", () => {
  it("renders the Angular markup on the server", async () => {
    const out = await ssr(palette());
    expect(out).toContain('<sone-command class="command" data-slot="command">');
    expect(out).toContain(
      'class="command-input" data-slot="command-input" role="combobox" type="text" autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list" aria-expanded="true"',
    );
    expect(out).toContain(
      '<div class="command-list" data-slot="command-list" role="listbox" id="list">',
    );
    expect(out).toContain(
      '<div class="command-empty" data-slot="command-empty" role="presentation" hidden>No results.</div>',
    );
    expect(out).toMatch(
      /<div class="command-group" data-slot="command-group" role="group" aria-labelledby="(sone-command-group-[^"]+)"><div class="command-group-heading" data-slot="command-group-heading" id="\1" aria-hidden="true">Notes<\/div>/,
    );
    expect(out).toContain(
      '<div class="menu-item command-item" data-slot="command-item" role="option" id="a" aria-selected="false">Café roadmap</div>',
    );
    expect(out).toContain(
      '<div class="menu-item command-item" data-slot="command-item" role="option" id="d" aria-selected="false" aria-disabled="true" data-disabled>Export</div>',
    );
  });

  it("filters accent-insensitively, hides empty groups and shows the empty message", async () => {
    const w = mount(palette(), { attachTo: document.body });
    await nextTick();
    const input = w.find("input");
    expect(input.attributes("aria-activedescendant")).toBe("a");
    expect(w.find("#a").attributes("data-selected")).toBe("");
    await input.setValue("cafe");
    expect(w.find("#a").attributes("hidden")).toBeUndefined();
    expect(w.find("#b").attributes("hidden")).toBe("");
    const groups = w.findAll('[data-slot="command-group"]');
    expect(groups[1]!.attributes("hidden")).toBe("");
    expect(w.find('[data-slot="command-separator"]').attributes("hidden")).toBe(
      "",
    );
    await input.setValue("create");
    expect(w.find("#c").attributes("hidden")).toBeUndefined();
    expect(input.attributes("aria-activedescendant")).toBe("c");
    await input.setValue("zzz");
    expect(w.find('[data-slot="command-empty"]').attributes("hidden")).toBe(
      undefined,
    );
    expect(w.find('[data-slot="command-list"]').attributes("role")).toBe(
      undefined,
    );
    expect(input.attributes("aria-expanded")).toBe("false");
    w.unmount();
  });

  it("moves the highlight with the arrow keys past disabled options and selects with Enter", async () => {
    const picked: string[] = [];
    const w = mount(
      palette((v) => picked.push(v)),
      { attachTo: document.body },
    );
    await nextTick();
    const input = w.find("input");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toBe("b");
    await input.trigger("keydown", { key: "End" });
    expect(input.attributes("aria-activedescendant")).toBe("c");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toBe("c");
    await input.trigger("keydown", { key: "Enter" });
    await w.find("#d").trigger("click");
    await w.find("#a").trigger("click");
    expect(picked).toEqual(["New note", "Café roadmap"]);
    w.unmount();
  });
});

const ROWS = [
  { id: "product", label: "Product", depth: 0, expandable: true },
  { id: "design", label: "Design", depth: 1, expandable: false },
  { id: "research", label: "Research", depth: 0, expandable: true },
];

const TreeHost = defineComponent({
  setup() {
    const expanded = ref(new Set(["product"]));
    const selected = ref("design");
    const log = ref<string[]>([]);
    return () =>
      h(SoneTree, { "aria-label": "Workspace" }, () => [
        ...ROWS.filter(
          (r) => r.depth === 0 || expanded.value.has("product"),
        ).map((r) =>
          h(SoneTreeRow, {
            key: r.id,
            id: r.id,
            label: r.label,
            depth: r.depth,
            expandable: r.expandable,
            expanded: expanded.value.has(r.id),
            selected: selected.value === r.id,
            onActivate: () => {
              selected.value = r.id;
              log.value.push(`activate ${r.id}`);
            },
            onToggleExpand: () => {
              const next = new Set(expanded.value);
              if (next.has(r.id)) next.delete(r.id);
              else next.add(r.id);
              expanded.value = next;
              log.value.push(`toggle ${r.id}`);
            },
          }),
        ),
        h(SoneTreeItem, { id: "all" }, () => "View all"),
        h("output", null, log.value.join(",")),
      ]);
  },
});

describe("SoneTree and SoneTreeRow", () => {
  it("renders the Angular markup, the selected row the Tab stop on the server", async () => {
    const out = await ssr(() => h(TreeHost));
    expect(out).toContain(
      '<div role="tree" data-slot="tree" aria-label="Workspace">',
    );
    expect(out).toContain(
      '<sone-tree-row class="is-selected" data-slot="sidebar-menu-item" data-sidebar="menu-item" data-depth="1" style="--tree-row-depth:1;" role="treeitem" aria-level="2" aria-selected="true" tabindex="0" id="design">',
    );
    expect(out).toContain(
      '<button type="button" class="caret is-open" tabindex="-1" aria-expanded="true" aria-label="Collapse Product">',
    );
    expect(out).toContain(
      '<span class="row-label" title="Design">Design</span>',
    );
    expect(out).toContain(
      '<div role="treeitem" data-slot="tree-item" aria-level="1" aria-selected="false" tabindex="-1" id="all">View all</div>',
    );
  });

  it("is a pair of buttons outside a tree", async () => {
    const out = await ssr(() => h(SoneTreeRow, { label: "Notes", count: 3 }));
    expect(out).toContain(
      '<sone-tree-row data-slot="sidebar-menu-item" data-sidebar="menu-item" data-depth="0" style="--tree-row-depth:0;">',
    );
    expect(out).toContain(
      '<button type="button" class="row-main" aria-pressed="false">',
    );
    expect(out).toContain(
      '<span class="row-count" data-slot="sidebar-menu-badge" data-sidebar="menu-badge">3</span>',
    );
    expect(out).not.toContain("treeitem");
  });

  it("moves focus with the APG tree keys and keeps one Tab stop", async () => {
    const w = mount(TreeHost, { attachTo: document.body });
    await nextTick();
    const row = (id: string) => document.getElementById(id)!;
    const tabStops = () =>
      [...document.querySelectorAll('[tabindex="0"]')].map((e) => e.id);
    expect(tabStops()).toEqual(["design"]);
    row("design").focus();
    await w.find("#design").trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement?.id).toBe("product");
    await nextTick();
    expect(tabStops()).toEqual(["product"]);
    // ← on an expanded row collapses it; → expands it again.
    await w.find("#product").trigger("keydown", { key: "ArrowLeft" });
    expect(document.getElementById("design")).toBeNull();
    await w.find("#product").trigger("keydown", { key: "ArrowRight" });
    await w.find("#product").trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.id).toBe("design");
    await w.find("#design").trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement?.id).toBe("product");
    await w.find("#product").trigger("keydown", { key: "End" });
    expect(document.activeElement?.id).toBe("all");
    await w.find("#all").trigger("keydown", { key: "r" });
    expect(document.activeElement?.id).toBe("research");
    await w.find("#research").trigger("keydown", { key: "Enter" });
    expect(w.find("output").text()).toBe(
      "toggle product,toggle product,activate research",
    );
    w.unmount();
  });
});

const DATA: TimelineData = {
  blocks: [
    { lane: "Ada", startS: 0, endS: 60 },
    { lane: "others-1", startS: 60, endS: 120 },
  ],
  chapters: [
    { label: "Intro", startS: 0, endS: 30 },
    { label: "Plan", startS: 30, endS: 120 },
  ],
};

describe("SoneTimeline", () => {
  it("renders the Angular markup and states", async () => {
    const out = await ssr(() =>
      h(SoneTimeline, { data: DATA, total: 120, currentTime: 45 }),
    );
    expect(out).toContain(
      '<sone-timeline data-slot="timeline" data-state="ready"><div class="tl card">',
    );
    expect(out).toContain(
      '<div class="tl-axis" role="slider" tabindex="0" aria-label="Seek timeline" aria-valuemin="0" aria-valuemax="120" aria-valuenow="45">',
    );
    expect(out).toContain('aria-label="Pin this moment at 0:45"');
    expect(out).toContain('<sone-timeline-legend data-slot="timeline-legend">');
    expect(out).toContain(
      '<sone-timeline-chapters data-slot="timeline-chapters" role="list" aria-label="Chapters">',
    );
    expect(out).toContain('aria-label="Chapter Plan, starts 0:30"');
    expect(out).toContain('<span class="tl-tip-time">0:00–1:00</span>');
    expect(await ssr(() => h(SoneTimeline, { loading: true }))).toContain(
      'data-state="loading"',
    );
    const empty = await ssr(() =>
      h(SoneTimeline, { labels: { retry: "Again" } }),
    );
    expect(empty).toContain('data-state="unavailable"');
    expect(empty).toContain(">Again</button>");
  });

  it("seeks with the keys and chapters, and renames a lane", async () => {
    const w = mount(SoneTimeline, {
      props: {
        data: DATA,
        total: 120,
        currentTime: 45,
        suggestions: [{ lane: "others-1", label: "Mia" }],
      },
      attachTo: document.body,
    });
    const axis = w.find(".tl-axis");
    await axis.trigger("keydown", { key: "ArrowRight" });
    await axis.trigger("keydown", { key: "Home" });
    await axis.trigger("keydown", { key: "End" });
    await w.findAll(".tl-chapter")[1]!.trigger("click");
    expect(w.emitted("seek")).toEqual([[50], [0], [120], [30]]);
    expect(w.findAll(".tl-block.is-active")).toHaveLength(1);
    await w.find(".legend-suggest").trigger("click");
    await w.find(".legend-rename").trigger("click");
    await nextTick();
    const field = w.find<HTMLInputElement>(".legend-edit");
    expect(document.activeElement).toBe(field.element);
    await field.setValue("Ada Park");
    await field.trigger("keydown", { key: "Enter" });
    expect(w.emitted("renameLane")).toEqual([
      [{ oldLabel: "others-1", newLabel: "Mia" }],
      [{ oldLabel: "Ada", newLabel: "Ada Park" }],
    ]);
    w.unmount();
  });
});
