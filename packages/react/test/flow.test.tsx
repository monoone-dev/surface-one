import { act, fireEvent, render } from "@testing-library/react";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SoneFlow,
  SoneFlowControls,
  SoneFlowMinimap,
  SoneFlowPanel,
  edgePath,
  placePorts,
  type SoneFlowApi,
  type SoneFlowConnection,
  type SoneFlowEdge,
  type SoneFlowNode,
} from "../src/components/flow";

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

const node = (container: HTMLElement, id: string): HTMLElement =>
  container.querySelector<HTMLElement>(`[data-node="${id}"][data-flow-node]`)!;

describe("SoneFlow", () => {
  it("renders nodes, edge paths and handles on the server", () => {
    const html = renderToString(
      <SoneFlow nodes={NODES} edges={EDGES} aria-label="Pipeline">
        <SoneFlowControls showZoom />
        <SoneFlowMinimap />
        <SoneFlowPanel position="top-right">Legend</SoneFlowPanel>
      </SoneFlow>,
    );
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

  it("renders renderNode instead of the default body", () => {
    const { container } = render(
      <SoneFlow
        defaultNodes={NODES.slice(0, 1)}
        renderNode={({ node: n, selected }) => (
          <strong className="custom">{`${n.label}:${selected}`}</strong>
        )}
      />,
    );
    const a = node(container, "a");
    expect(a.getAttribute("data-custom")).toBe("");
    expect(a.querySelector(".custom")?.textContent).toBe("Start:false");
    expect(a.querySelector(".flow-node-label")).toBeNull();
  });

  it("deletes a selected node and its edges with Delete", () => {
    let nodes: readonly SoneFlowNode[] = NODES;
    let edges: readonly SoneFlowEdge[] = EDGES;
    const deleted: string[] = [];
    function Host() {
      const [n, setN] = useState<readonly SoneFlowNode[]>(NODES);
      const [e, setE] = useState<readonly SoneFlowEdge[]>(EDGES);
      return (
        <SoneFlow
          nodes={n}
          edges={e}
          onNodesChange={(v) => setN((nodes = v))}
          onEdgesChange={(v) => setE((edges = v))}
          onNodesDelete={(v) => deleted.push(...v.map((x) => x.id))}
        />
      );
    }
    const { container } = render(<Host />);
    fireEvent.keyDown(node(container, "b"), { key: "Enter" });
    expect(node(container, "b").getAttribute("data-selected")).toBe("");
    fireEvent.keyDown(node(container, "b"), { key: "Delete" });
    expect(nodes.map((n) => n.id)).toEqual(["a", "c"]);
    expect(edges).toEqual([]);
    expect(deleted).toEqual(["b"]);
    expect(node(container, "b")).toBeNull();
  });

  it("connects two nodes with C, then Enter on the other node", async () => {
    let edges: readonly SoneFlowEdge[] = [];
    const connections: SoneFlowConnection[] = [];
    function Host() {
      const [e, setE] = useState<readonly SoneFlowEdge[]>([]);
      return (
        <SoneFlow
          nodes={NODES}
          edges={e}
          onEdgesChange={(v) => setE((edges = v))}
          onConnect={(c) => connections.push(c)}
        />
      );
    }
    const { container } = render(<Host />);
    const flow = container.querySelector("sone-flow")!;
    fireEvent.keyDown(node(container, "a"), { key: "c" });
    expect(flow.getAttribute("data-connecting")).toBe("");
    fireEvent.keyDown(node(container, "c"), { key: "Enter" });
    const c = { source: "a", sourcePort: "out", target: "c", targetPort: "in" };
    expect(connections).toEqual([c]);
    expect(edges).toEqual([{ id: "a:out->c:in", ...c }]);
    expect(flow.getAttribute("data-connecting")).toBeNull();
    expect(container.querySelectorAll(".flow-edge")).toHaveLength(1);
    // The live region speaks the result.
    await act(async () => {});
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Connected Start to Done.",
    );
  });

  it("moves a node with the arrow keys", () => {
    let nodes: readonly SoneFlowNode[] = NODES;
    function Host() {
      const [n, setN] = useState<readonly SoneFlowNode[]>(NODES);
      return (
        <SoneFlow
          nodes={n}
          gridSize={10}
          onNodesChange={(v) => setN((nodes = v))}
        />
      );
    }
    const { container } = render(<Host />);
    fireEvent.keyDown(node(container, "a"), { key: "ArrowRight" });
    expect(nodes[0]).toMatchObject({ x: 10, y: 0 });
    fireEvent.keyDown(node(container, "a"), {
      key: "ArrowDown",
      shiftKey: true,
    });
    expect(nodes[0]).toMatchObject({ x: 10, y: 50 });
  });

  it("works uncontrolled and reports changes", () => {
    const changes: (readonly SoneFlowNode[])[] = [];
    const { container } = render(
      <SoneFlow defaultNodes={NODES} onNodesChange={(v) => changes.push(v)} />,
    );
    fireEvent.keyDown(node(container, "c"), { key: "ArrowLeft" });
    expect(changes.at(-1)?.[2]).toMatchObject({ x: 580 });
    expect(node(container, "c").style.transform).toBe("translate(580px, 0px)");
  });

  it("selects a node on pointer down and clears it on a canvas click", () => {
    const selections: (readonly string[])[] = [];
    const { container } = render(
      <SoneFlow
        defaultNodes={NODES}
        onSelectedNodesChange={(v) => selections.push(v)}
      />,
    );
    fireEvent.pointerDown(node(container, "b"), { button: 0, pointerId: 1 });
    fireEvent.pointerUp(node(container, "b"), { button: 0, pointerId: 1 });
    expect(selections.at(-1)).toEqual(["b"]);
    expect(node(container, "b").getAttribute("aria-label")).toContain(
      "selected",
    );
    const pane = container.querySelector<HTMLElement>(".flow-pane")!;
    fireEvent.pointerDown(pane, { button: 0, pointerId: 2 });
    fireEvent.pointerUp(pane, { button: 0, pointerId: 2 });
    expect(selections.at(-1)).toEqual([]);
  });

  it("zooms with the controls and the keyboard, and locks the canvas", () => {
    const ref = createRef<SoneFlowApi>();
    const zooms: number[] = [];
    const { container, getByRole } = render(
      <SoneFlow
        ref={ref}
        defaultNodes={NODES}
        onViewportChange={(v) => zooms.push(v.zoom)}
      >
        <SoneFlowControls showZoom />
      </SoneFlow>,
    );
    fireEvent.click(getByRole("button", { name: "Zoom in" }));
    expect(zooms.at(-1)).toBeCloseTo(1.2);
    expect(getByRole("button", { name: "Reset zoom, 120%" })).toBeTruthy();
    const pane = container.querySelector<HTMLElement>(".flow-pane")!;
    fireEvent.keyDown(pane, { key: "-" });
    expect(zooms.at(-1)).toBeCloseTo(1);
    act(() => ref.current!.zoomTo(10));
    expect(zooms.at(-1)).toBe(2);
    expect(
      (getByRole("button", { name: "Zoom in" }) as HTMLButtonElement).disabled,
    ).toBe(true);

    const lock = getByRole("button", { name: "Lock canvas" });
    expect(lock.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(lock);
    expect(lock.getAttribute("aria-pressed")).toBe("true");
    const flow = container.querySelector("sone-flow")!;
    expect(flow.hasAttribute("data-interactive")).toBe(false);
  });
});

describe("flow geometry", () => {
  it("places inputs at the start and outputs at the end of the direction", () => {
    const n: SoneFlowNode = {
      id: "n",
      x: 0,
      y: 0,
      label: "N",
      outputs: ["a", "b"],
    };
    expect(placePorts(n, "horizontal")).toEqual([
      { id: "in", label: null, kind: "target", side: "left", offset: 0.5 },
      { id: "a", label: null, kind: "source", side: "right", offset: 1 / 3 },
      { id: "b", label: null, kind: "source", side: "right", offset: 2 / 3 },
    ]);
    expect(placePorts(n, "vertical").map((p) => p.side)).toEqual([
      "top",
      "bottom",
      "bottom",
    ]);
    expect(
      placePorts({ ...n, shape: "note", outputs: undefined }, "horizontal"),
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
