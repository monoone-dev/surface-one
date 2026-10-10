import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneDock,
  SoneDockItem,
  SoneDockSeparator,
  SoneFlow,
  SoneFlowControls,
  SoneFlowMinimap,
  SoneFlowPanel,
  edgePath,
  placePorts,
  type SoneFlowEdge,
  type SoneFlowNode,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const NODES: SoneFlowNode[] = [
  { id: "a", x: 0, y: 0, label: "Start", icon: "webhook", tone: "accent" },
  {
    id: "b",
    x: 300,
    y: 0,
    label: "Check",
    shape: "diamond",
    outputs: ["yes", "no"],
  },
  { id: "c", x: 600, y: 0, label: "Done", status: "success" },
];
const EDGES: SoneFlowEdge[] = [
  { id: "e1", source: "a", target: "b", label: "Go" },
  { id: "e2", source: "b", sourcePort: "yes", target: "c" },
];

describe("SoneFlow", () => {
  it("renders nodes, edge paths and handles on the server", async () => {
    const app = createSSRApp(() =>
      h(
        SoneFlow,
        { nodes: NODES, edges: EDGES, ariaLabel: "Pipeline" },
        {
          default: () => [
            h(SoneFlowControls, { showZoom: true }),
            h(SoneFlowMinimap),
            h(SoneFlowPanel, { position: "top-right" }, () => "Legend"),
          ],
        },
      ),
    );
    const html = await renderToString(app);
    expect(html).toContain(
      '<sone-flow data-slot="flow" role="group" aria-label="Pipeline"',
    );
    expect(html).toContain('data-node="a"');
    expect(html).toContain('aria-roledescription="node"');
    expect(html).toContain("Start, connects to Check (Go)");
    expect(html.match(/class="flow-edge-path"/g)?.length).toBe(2);
    expect(html).toMatch(
      /<path class="flow-edge-path" d="M [^"]+" marker-end="url\(#sone-flow-[^"]+-arrow-neutral\)"/,
    );
    expect(html).toContain('class="flow-edge-label"');
    // a: in + out, b: in + yes + no, c: in + out.
    expect(html.match(/data-flow-handle/g)?.length).toBe(7);
    expect(html).toContain('aria-label="Connect from Check"');
    expect(html).toContain('data-port="yes"');
    expect(html).toContain('data-slot="flow-controls"');
    expect(html).toContain("100%");
    expect(html).toContain('data-slot="flow-minimap"');
    expect(html).toContain('data-slot="flow-panel" data-position="top-right"');
    expect(html).toContain('data-icon="circle-check"');
  });

  it("renders the #node slot instead of the default body", () => {
    const w = mount(SoneFlow, {
      props: { nodes: NODES.slice(0, 1) },
      slots: {
        node: ({ node, selected }: { node: SoneFlowNode; selected: boolean }) =>
          h("strong", { class: "custom" }, `${node.label}:${selected}`),
      },
    });
    const node = w.find('[data-node="a"]');
    expect(node.attributes("data-custom")).toBe("");
    expect(node.find(".custom").text()).toBe("Start:false");
    expect(node.find(".flow-node-label").exists()).toBe(false);
  });

  it("deletes a selected node and its edges with Delete", async () => {
    const nodes = ref<readonly SoneFlowNode[]>(NODES);
    const edges = ref<readonly SoneFlowEdge[]>(EDGES);
    const deleted: string[] = [];
    const w = mount(() =>
      h(SoneFlow, {
        nodes: nodes.value,
        edges: edges.value,
        "onUpdate:nodes": (v: readonly SoneFlowNode[]) => (nodes.value = v),
        "onUpdate:edges": (v: readonly SoneFlowEdge[]) => (edges.value = v),
        onNodesDelete: (v: readonly SoneFlowNode[]) =>
          deleted.push(...v.map((n) => n.id)),
      }),
    );
    const b = w.find('[data-node="b"]');
    await b.trigger("keydown", { key: "Enter" });
    expect(w.find('[data-node="b"]').attributes("data-selected")).toBe("");
    await w.find('[data-node="b"]').trigger("keydown", { key: "Delete" });
    expect(nodes.value.map((n) => n.id)).toEqual(["a", "c"]);
    expect(edges.value).toEqual([]);
    expect(deleted).toEqual(["b"]);
    await nextTick();
    expect(w.find('[data-node="b"]').exists()).toBe(false);
  });

  it("connects two nodes with C, then Enter on the other node", async () => {
    const edges = ref<readonly SoneFlowEdge[]>([]);
    const connections: unknown[] = [];
    const w = mount(() =>
      h(SoneFlow, {
        nodes: NODES,
        edges: edges.value,
        "onUpdate:edges": (v: readonly SoneFlowEdge[]) => (edges.value = v),
        onConnect: (c: unknown) => connections.push(c),
      }),
    );
    await w.find('[data-node="a"]').trigger("keydown", { key: "c" });
    expect(w.find("sone-flow").attributes("data-connecting")).toBe("");
    await w.find('[data-node="c"]').trigger("keydown", { key: "Enter" });
    const c = { source: "a", sourcePort: "out", target: "c", targetPort: "in" };
    expect(connections).toEqual([c]);
    expect(edges.value).toEqual([{ id: "a:out->c:in", ...c }]);
    expect(w.find("sone-flow").attributes("data-connecting")).toBeUndefined();
    await nextTick();
    expect(w.findAll(".flow-edge")).toHaveLength(1);
  });

  it("moves a node with the arrow keys", async () => {
    const nodes = ref<readonly SoneFlowNode[]>(NODES);
    const w = mount(() =>
      h(SoneFlow, {
        nodes: nodes.value,
        gridSize: 10,
        "onUpdate:nodes": (v: readonly SoneFlowNode[]) => (nodes.value = v),
      }),
    );
    await w.find('[data-node="a"]').trigger("keydown", { key: "ArrowRight" });
    expect(nodes.value[0]).toMatchObject({ x: 10, y: 0 });
  });
});

describe("SoneDock", () => {
  it("is a toolbar with one Tab stop that the arrow keys move", async () => {
    const w = mount(
      () =>
        h(SoneDock, { position: "left" }, () => [
          h(SoneDockItem, { label: "Select", shortcut: "V", active: false }),
          h(SoneDockItem, { label: "Hand", active: true }),
          h(SoneDockSeparator),
          h(SoneDockItem, { label: "Undo", disabled: true }),
          h(SoneDockItem, { label: "Redo" }),
        ]),
      { attachTo: document.body },
    );
    await nextTick();
    const dock = w.find("sone-dock");
    expect(dock.attributes("role")).toBe("toolbar");
    expect(dock.attributes("aria-label")).toBe("Tools");
    expect(dock.attributes("aria-orientation")).toBe("vertical");
    expect(dock.attributes("data-floating")).toBe("");
    expect(
      w.find('[data-slot="dock-separator"]').attributes("aria-orientation"),
    ).toBe("horizontal");
    const items = () => w.findAll("button");
    expect(items()[0]!.attributes("aria-pressed")).toBe("false");
    expect(items()[0]!.attributes("aria-keyshortcuts")).toBe("V");
    expect(items()[0]!.attributes("data-tooltip")).toBe("Select (V)");
    expect(items()[3]!.attributes("aria-pressed")).toBeUndefined();
    // The active tool holds the Tab stop.
    expect(items().map((b) => b.attributes("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
      "-1",
    ]);

    (items()[1]!.element as HTMLElement).focus();
    await items()[1]!.trigger("keydown", { key: "ArrowDown" });
    // Skips the disabled Undo.
    expect(document.activeElement).toBe(items()[3]!.element);
    expect(items().map((b) => b.attributes("tabindex"))).toEqual([
      "-1",
      "-1",
      "-1",
      "0",
    ]);
    await items()[3]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[0]!.element);
    await items()[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(items()[3]!.element);
    w.unmount();
  });
});

describe("flow geometry", () => {
  it("places inputs at the start and outputs at the end of the direction", () => {
    const node: SoneFlowNode = {
      id: "n",
      x: 0,
      y: 0,
      label: "N",
      outputs: ["a", "b"],
    };
    expect(placePorts(node, "horizontal")).toEqual([
      { id: "in", label: null, kind: "target", side: "left", offset: 0.5 },
      { id: "a", label: null, kind: "source", side: "right", offset: 1 / 3 },
      { id: "b", label: null, kind: "source", side: "right", offset: 2 / 3 },
    ]);
    expect(placePorts(node, "vertical").map((p) => p.side)).toEqual([
      "top",
      "bottom",
      "bottom",
    ]);
    expect(
      placePorts({ ...node, shape: "note", outputs: undefined }, "horizontal"),
    ).toEqual([]);
  });

  it("draws straight, step and bezier paths with the label in the middle", () => {
    const s = { x: 0, y: 0 };
    const t = { x: 100, y: 0 };
    const straight = edgePath("straight", s, "right", t, "left");
    expect(straight.d).toBe("M 0 0 L 100 0");
    expect(straight).toMatchObject({ labelX: 50, labelY: 0 });
    const bezier = edgePath("bezier", s, "right", t, "left");
    expect(bezier.d.startsWith("M 0 0 C")).toBe(true);
    expect(bezier.d.endsWith("100 0")).toBe(true);
    expect(edgePath("step", s, "right", { x: 100, y: 80 }, "left").d).toMatch(
      /^M 0 0 /,
    );
  });
});
