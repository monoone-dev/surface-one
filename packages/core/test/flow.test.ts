import { describe, expect, it, vi } from "vitest";

import {
  SONE_DEFAULT_MESSAGES as m,
  createFlowController,
  flowLabels,
  pendingFlowPath,
  renderFlowEdges,
  renderFlowNodes,
  type FlowEvents,
  type FlowKeyEvent,
  type FlowSettings,
  type FlowStore,
  type SoneFlowEdge,
  type SoneFlowNode,
} from "../src";

const NODES: SoneFlowNode[] = [
  { id: "a", label: "Fetch", x: 0, y: 0, status: "running" },
  { id: "b", label: "Parse", x: 300, y: 0 },
];
const EDGES: SoneFlowEdge[] = [{ id: "a-b", source: "a", target: "b" }];

function setup(overrides: Partial<FlowSettings> = {}) {
  const store: FlowStore = {
    nodes: NODES,
    edges: EDGES,
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedNodes: [],
    selectedEdges: [],
    interactive: true,
    pending: null,
    measured: new Map(),
    paneSize: { width: 800, height: 600 },
    announcement: "",
  };
  const events = {
    connect: vi.fn(),
    nodeClick: vi.fn(),
    nodeDoubleClick: vi.fn(),
    nodeDragEnd: vi.fn(),
    edgeClick: vi.fn(),
    canvasClick: vi.fn(),
    nodesDelete: vi.fn(),
    edgesDelete: vi.fn(),
  } satisfies FlowEvents;
  const settings: FlowSettings = {
    direction: "horizontal",
    edgeType: "bezier",
    gridSize: 20,
    snapToGrid: false,
    tool: "select",
    minZoom: 0.25,
    maxZoom: 2,
    fitView: true,
    panOnScroll: false,
    connectable: true,
    deletable: true,
    autoConnect: true,
    isValidConnection: null,
    labels: flowLabels(m, {}, null),
    ...overrides,
  };
  const flow = createFlowController({
    store,
    events,
    settings: () => settings,
    pane: () => null,
    selectedWord: () => m.flowSelected,
  });
  return { store, events, flow };
}

const key = (
  k: string,
  target: EventTarget | null = null,
  extra: Partial<FlowKeyEvent> = {},
): FlowKeyEvent => ({
  key: k,
  shiftKey: false,
  metaKey: false,
  ctrlKey: false,
  target,
  currentTarget: target,
  defaultPrevented: false,
  preventDefault() {},
  ...extra,
});

describe("what the flow canvas draws", () => {
  it("names each node for a screen reader and draws the edges between ports", () => {
    const labels = flowLabels(m, {}, "Pipeline");
    expect(labels.canvas).toBe("Pipeline");
    const rendered = renderFlowNodes({
      nodes: NODES,
      edges: EDGES,
      selectedNodes: ["b"],
      measured: new Map(),
      direction: "horizontal",
      labels,
      selectedWord: m.flowSelected,
    });
    expect(rendered[0]!.name).toBe(
      `Fetch, ${m.flowStatusRunning}, ${m.flowConnectsTo("Parse")}`,
    );
    expect(rendered[1]!.name).toBe(`Parse, ${m.flowSelected}`);
    const edges = renderFlowEdges(rendered, EDGES, ["a-b"], "straight");
    expect(edges).toHaveLength(1);
    expect(edges[0]!.selected).toBe(true);
    expect(edges[0]!.path.d).toMatch(/^M /);
    expect(pendingFlowPath(null, rendered, "bezier")).toBeNull();
  });
});

describe("createFlowController", () => {
  it("zooms, fits and converts screen points", () => {
    const { store, flow } = setup();
    flow.zoomIn();
    expect(store.viewport.zoom).toBeCloseTo(1.2);
    flow.zoomTo(10);
    expect(store.viewport.zoom).toBe(2);
    flow.fit();
    expect(store.viewport.zoom).toBeLessThanOrEqual(1.25);
    flow.centerOn({ x: 0, y: 0 });
    expect(flow.visibleCenter()).toEqual({ x: 0, y: 0 });
  });

  it("connects from the keyboard (C, then Enter on another node) and announces it", async () => {
    const { store, events, flow } = setup();
    const [a, b] = flow.rendered();
    flow.nodeKeyDown(key("c"), a!);
    expect(store.pending?.mode).toBe("keyboard");
    flow.nodeKeyDown(key("Enter"), b!);
    // a → b exists already: the duplicate is refused.
    expect(events.connect).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(store.announcement).toBe(m.flowCancelled);

    flow.nodeKeyDown(key("c"), b!);
    flow.nodeKeyDown(key("Enter"), a!);
    expect(events.connect).toHaveBeenCalledWith({
      source: "b",
      sourcePort: "out",
      target: "a",
      targetPort: "in",
    });
    expect(store.edges).toHaveLength(2);
    await Promise.resolve();
    expect(store.announcement).toBe(m.flowConnected("Parse", "Fetch"));
  });

  it("moves a node with the arrows and deletes the selection", () => {
    const { store, events, flow } = setup();
    flow.nodeKeyDown(
      key("ArrowRight", null, { shiftKey: true }),
      flow.rendered()[0]!,
    );
    expect(store.nodes[0]!.x).toBe(100);
    expect(events.nodeDragEnd).toHaveBeenCalled();
    flow.selectNode("a");
    flow.paneKeyDown(key("Delete", document.body));
    expect(store.nodes.map((n) => n.id)).toEqual(["b"]);
    expect(store.edges).toEqual([]);
    expect(events.nodesDelete).toHaveBeenCalledWith([
      expect.objectContaining({ id: "a" }),
    ]);
    expect(events.edgesDelete).toHaveBeenCalledWith(EDGES);
  });

  it("toggles an additive selection and clears it with Escape", () => {
    const { store, flow } = setup();
    flow.selectNode("a");
    flow.selectNode("b", true);
    expect(store.selectedNodes).toEqual(["a", "b"]);
    flow.selectNode("a", true);
    expect(store.selectedNodes).toEqual(["b"]);
    flow.selectEdge("a-b");
    expect(store.selectedNodes).toEqual([]);
    flow.paneKeyDown(key("Escape", document.body));
    expect(store.selectedEdges).toEqual([]);
  });

  it("locks the canvas when it is not interactive", () => {
    const { store, flow } = setup();
    (store as { interactive: boolean }).interactive = false;
    flow.selectNode("a");
    flow.deleteSelection();
    expect(store.nodes).toHaveLength(2);
    flow.nodeKeyDown(key("c"), flow.rendered()[0]!);
    expect(store.pending).toBeNull();
  });
});
