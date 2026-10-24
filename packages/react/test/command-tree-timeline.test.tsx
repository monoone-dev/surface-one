import { act, fireEvent, render } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SoneCommand,
  SoneCommandEmpty,
  SoneCommandGroup,
  SoneCommandInput,
  SoneCommandItem,
  SoneCommandList,
  SoneCommandSeparator,
} from "../src/components/command";
import { SoneTimeline, type TimelineData } from "../src/components/timeline";
import { SoneTree, SoneTreeItem } from "../src/components/tree";
import { SoneTreeRow } from "../src/components/tree-row";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

function Palette({
  onSelect = () => undefined,
}: {
  onSelect?: (v: string) => void;
}) {
  return (
    <SoneCommand>
      <SoneCommandInput aria-label="Search" />
      <SoneCommandList id="list">
        <SoneCommandEmpty>No results.</SoneCommandEmpty>
        <SoneCommandGroup heading="Notes">
          <SoneCommandItem id="a" onSelect={onSelect}>
            Café roadmap
          </SoneCommandItem>
          <SoneCommandItem id="b" onSelect={onSelect}>
            Weekly sync
          </SoneCommandItem>
        </SoneCommandGroup>
        <SoneCommandSeparator />
        <SoneCommandGroup heading="Actions">
          <SoneCommandItem
            id="c"
            value="New note"
            keywords={["create"]}
            onSelect={onSelect}
          >
            New note
          </SoneCommandItem>
          <SoneCommandItem id="d" disabled onSelect={onSelect}>
            Export
          </SoneCommandItem>
        </SoneCommandGroup>
      </SoneCommandList>
    </SoneCommand>
  );
}

describe("SoneCommand", () => {
  it("renders the Angular markup on the server", () => {
    const out = html(<Palette />);
    expect(out).toContain('<sone-command class="command" data-slot="command">');
    expect(out).toContain(
      'class="command-input" data-slot="command-input" role="combobox" type="text" autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list" aria-expanded="true"',
    );
    expect(out).toContain(
      '<div class="command-list" data-slot="command-list" role="listbox" id="list">',
    );
    expect(out).toContain(
      '<div class="command-empty" data-slot="command-empty" role="presentation" hidden="">No results.</div>',
    );
    expect(out).toContain(
      'class="command-group-heading" data-slot="command-group-heading"',
    );
    expect(out).toContain(
      '<div class="menu-item command-item" data-slot="command-item" role="option" id="a" aria-selected="false">Café roadmap</div>',
    );
    expect(out).toContain(
      '<div class="menu-item command-item" data-slot="command-item" role="option" id="d" aria-selected="false" aria-disabled="true" data-disabled="">Export</div>',
    );
  });

  it("filters accent-insensitively, hides empty groups and shows the empty message", () => {
    const { container } = render(<Palette />);
    const input = container.querySelector("input")!;
    const $ = (s: string) => container.querySelector(s)!;
    expect(input.getAttribute("aria-activedescendant")).toBe("a");
    expect(input.getAttribute("aria-controls")).toBe("list");
    expect($("#a").hasAttribute("data-selected")).toBe(true);
    fireEvent.change(input, { target: { value: "cafe" } });
    expect($("#a").hasAttribute("hidden")).toBe(false);
    expect($("#b").hasAttribute("hidden")).toBe(true);
    const groups = container.querySelectorAll('[data-slot="command-group"]');
    expect(groups[1]!.hasAttribute("hidden")).toBe(true);
    expect($('[data-slot="command-separator"]').hasAttribute("hidden")).toBe(
      true,
    );
    fireEvent.change(input, { target: { value: "create" } });
    expect($("#c").hasAttribute("hidden")).toBe(false);
    expect(input.getAttribute("aria-activedescendant")).toBe("c");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect($('[data-slot="command-empty"]').hasAttribute("hidden")).toBe(false);
    expect($('[data-slot="command-list"]').hasAttribute("role")).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("moves the highlight with the arrow keys past disabled options and selects with Enter", () => {
    const picked: string[] = [];
    const { container } = render(<Palette onSelect={(v) => picked.push(v)} />);
    const input = container.querySelector("input")!;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe("b");
    fireEvent.keyDown(input, { key: "End" });
    expect(input.getAttribute("aria-activedescendant")).toBe("c");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe("c");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(container.querySelector("#d")!);
    fireEvent.click(container.querySelector("#a")!);
    expect(picked).toEqual(["New note", "Café roadmap"]);
  });
});

const ROWS = [
  { id: "product", label: "Product", depth: 0, expandable: true },
  { id: "design", label: "Design", depth: 1, expandable: false },
  { id: "research", label: "Research", depth: 0, expandable: true },
];

function TreeHost() {
  const [expanded, setExpanded] = useState(new Set(["product"]));
  const [selected, setSelected] = useState("design");
  const [log, setLog] = useState<string[]>([]);
  return (
    <SoneTree aria-label="Workspace">
      {ROWS.filter((r) => r.depth === 0 || expanded.has("product")).map((r) => (
        <SoneTreeRow
          key={r.id}
          id={r.id}
          label={r.label}
          depth={r.depth}
          expandable={r.expandable}
          expanded={expanded.has(r.id)}
          selected={selected === r.id}
          onActivate={() => {
            setSelected(r.id);
            setLog((l) => [...l, `activate ${r.id}`]);
          }}
          onToggleExpand={() => {
            setExpanded((open) => {
              const next = new Set(open);
              if (next.has(r.id)) next.delete(r.id);
              else next.add(r.id);
              return next;
            });
            setLog((l) => [...l, `toggle ${r.id}`]);
          }}
        />
      ))}
      <SoneTreeItem id="all">View all</SoneTreeItem>
      <output>{log.join(",")}</output>
    </SoneTree>
  );
}

describe("SoneTree and SoneTreeRow", () => {
  it("renders the Angular markup, the selected row the Tab stop on the server", () => {
    const out = html(<TreeHost />);
    expect(out).toContain(
      '<div aria-label="Workspace" role="tree" data-slot="tree">',
    );
    expect(out).toContain(
      '<sone-tree-row id="design" class="is-selected" data-slot="sidebar-menu-item" data-sidebar="menu-item" data-depth="1" style="--tree-row-depth:1" role="treeitem" aria-level="2" aria-selected="true" tabindex="0">',
    );
    expect(out).toContain(
      '<button type="button" class="caret is-open" tabindex="-1" aria-expanded="true" aria-label="Collapse Product">',
    );
    expect(out).toContain(
      '<div id="all" role="treeitem" data-slot="tree-item" aria-level="1" aria-selected="false" tabindex="-1">View all</div>',
    );
  });

  it("is a pair of buttons outside a tree", () => {
    const out = html(<SoneTreeRow label="Notes" count={3} />);
    expect(out).toContain(
      '<sone-tree-row data-slot="sidebar-menu-item" data-sidebar="menu-item" data-depth="0" style="--tree-row-depth:0">',
    );
    expect(out).toContain(
      '<button type="button" class="row-main" aria-pressed="false">',
    );
    expect(out).not.toContain("treeitem");
  });

  it("moves focus with the APG tree keys and keeps one Tab stop", () => {
    const { container } = render(<TreeHost />);
    const row = (id: string) => container.querySelector<HTMLElement>(`#${id}`)!;
    const tabStops = () =>
      [...container.querySelectorAll('[tabindex="0"]')].map((e) => e.id);
    expect(tabStops()).toEqual(["design"]);
    act(() => row("design").focus());
    fireEvent.keyDown(row("design"), { key: "ArrowUp" });
    expect(document.activeElement?.id).toBe("product");
    expect(tabStops()).toEqual(["product"]);
    fireEvent.keyDown(row("product"), { key: "ArrowLeft" });
    expect(container.querySelector("#design")).toBeNull();
    fireEvent.keyDown(row("product"), { key: "ArrowRight" });
    fireEvent.keyDown(row("product"), { key: "ArrowRight" });
    expect(document.activeElement?.id).toBe("design");
    fireEvent.keyDown(row("design"), { key: "ArrowLeft" });
    expect(document.activeElement?.id).toBe("product");
    fireEvent.keyDown(row("product"), { key: "End" });
    expect(document.activeElement?.id).toBe("all");
    fireEvent.keyDown(row("all"), { key: "r" });
    expect(document.activeElement?.id).toBe("research");
    fireEvent.keyDown(row("research"), { key: "Enter" });
    expect(container.querySelector("output")!.textContent).toBe(
      "toggle product,toggle product,activate research",
    );
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
  it("renders the Angular markup and states", () => {
    const out = html(<SoneTimeline data={DATA} total={120} currentTime={45} />);
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
    expect(html(<SoneTimeline loading />)).toContain('data-state="loading"');
    const empty = html(<SoneTimeline labels={{ retry: "Again" }} />);
    expect(empty).toContain('data-state="unavailable"');
    expect(empty).toContain(">Again</button>");
  });

  it("seeks with the keys and chapters, and renames a lane", () => {
    const seeks: number[] = [];
    const renames: string[] = [];
    const { container } = render(
      <SoneTimeline
        data={DATA}
        total={120}
        currentTime={45}
        suggestions={[{ lane: "others-1", label: "Mia" }]}
        onSeek={(s) => seeks.push(s)}
        onRenameLane={(r) => renames.push(`${r.oldLabel}→${r.newLabel}`)}
      />,
    );
    const axis = container.querySelector(".tl-axis")!;
    fireEvent.keyDown(axis, { key: "ArrowRight" });
    fireEvent.keyDown(axis, { key: "Home" });
    fireEvent.keyDown(axis, { key: "End" });
    fireEvent.click(container.querySelectorAll(".tl-chapter")[1]!);
    expect(seeks).toEqual([50, 0, 120, 30]);
    expect(container.querySelectorAll(".tl-block.is-active")).toHaveLength(1);
    fireEvent.click(container.querySelector(".legend-suggest")!);
    fireEvent.click(container.querySelector(".legend-rename")!);
    const field = container.querySelector<HTMLInputElement>(".legend-edit")!;
    expect(document.activeElement).toBe(field);
    fireEvent.change(field, { target: { value: "Ada Park" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(renames).toEqual(["others-1→Mia", "Ada→Ada Park"]);
  });
});
