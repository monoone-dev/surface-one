// The headless half of `<SoneFlow>` for Vue and React: what the canvas draws (nodes
// with their ports and spoken names, edge paths, the pending connection, the grid
// tile) and how it behaves (pan, zoom, fit, select, drag, connect, delete, keyboard,
// measurement). The geometry itself is packages/angular/flow/flow.geometry.ts.
// Each package keeps its state in its own refs / state behind a `FlowStore`, renders
// the markup and forwards the DOM events to the controller.
import {
  SONE_FLOW_SHAPE_SIZE,
  SONE_FLOW_ZOOM_STEP,
  clampZoom,
  edgePath,
  fitViewport,
  flowBounds,
  nodeShape,
  placePorts,
  portPoint,
  zoomAround,
  type SoneFlowConnection,
  type SoneFlowDirection,
  type SoneFlowEdge,
  type SoneFlowEdgePath,
  type SoneFlowEdgeType,
  type SoneFlowLabels,
  type SoneFlowNode,
  type SoneFlowPlacedPort,
  type SoneFlowPoint,
  type SoneFlowRect,
  type SoneFlowSide,
  type SoneFlowSize,
  type SoneFlowTool,
  type SoneFlowViewport,
} from "./angular";
import type { SoneMessages } from "./messages";

/** A node as drawn: its box, its ports and what a screen reader hears. */
export interface SoneFlowRenderedNode {
  readonly node: SoneFlowNode;
  readonly rect: SoneFlowRect;
  readonly ports: readonly SoneFlowPlacedPort[];
  readonly selected: boolean;
  readonly name: string;
}

export interface SoneFlowRenderedEdge {
  readonly edge: SoneFlowEdge;
  readonly path: SoneFlowEdgePath;
  readonly selected: boolean;
}

/** What a custom node body receives (the Vue `#node` slot, the React `renderNode`). */
export interface SoneFlowNodeContext<D = unknown> {
  readonly node: SoneFlowNode<D>;
  readonly selected: boolean;
}

/** The imperative API of `<SoneFlow>` (a template ref in Vue, the `ref` in React). */
export interface SoneFlowApi {
  /** Shows every node (or the given ones), centred. */
  fit(ids?: readonly string[]): void;
  zoomIn(): void;
  zoomOut(): void;
  /** Zooms around the pane's centre (or `at`, in pane px). */
  zoomTo(zoom: number, at?: SoneFlowPoint): void;
  /** Centres the view on a point in canvas units, keeping the zoom. */
  centerOn(point: SoneFlowPoint): void;
  /** A point on the screen (a pointer event's client x / y) in canvas units — to drop a node there. */
  screenToFlow(clientX: number, clientY: number): SoneFlowPoint;
  /** The centre of the visible area in canvas units — where a new node is placed from a toolbar. */
  visibleCenter(): SoneFlowPoint;
  /** Focuses a node (and scrolls it into view when it is outside the pane). */
  focusNode(id: string): void;
  /** Removes the selected nodes (with their edges) and the selected edges. */
  deleteSelection(): void;
  selectNode(id: string, additive?: boolean): void;
  selectEdge(id: string, additive?: boolean): void;
  cancelConnection(): void;
}

/** A connection being drawn: from a port, to the pointer. */
export interface FlowPendingConnection {
  readonly node: string;
  readonly port: string;
  readonly kind: "source" | "target";
  readonly to: SoneFlowPoint;
  /** `drag`: until the pointer is released; `click` / `keyboard`: until a second pick. */
  readonly mode: "drag" | "click" | "keyboard";
}

/** Where a framework keeps the canvas state; every read is the latest value. */
export interface FlowStore {
  nodes: readonly SoneFlowNode[];
  edges: readonly SoneFlowEdge[];
  viewport: SoneFlowViewport;
  selectedNodes: readonly string[];
  selectedEdges: readonly string[];
  readonly interactive: boolean;
  pending: FlowPendingConnection | null;
  /** Measured node sizes, by id (the shape's default until measured). */
  measured: ReadonlyMap<string, SoneFlowSize>;
  /** The pane's size in px (0 × 0 on the server). */
  paneSize: SoneFlowSize;
  /** The live region's text. */
  announcement: string;
}

/** The props the behaviour reads (on every event, so always the latest). */
export interface FlowSettings {
  readonly direction: SoneFlowDirection;
  readonly edgeType: SoneFlowEdgeType;
  readonly gridSize: number;
  readonly snapToGrid: boolean;
  readonly tool: SoneFlowTool;
  readonly minZoom: number;
  readonly maxZoom: number;
  readonly fitView: boolean;
  readonly panOnScroll: boolean;
  readonly connectable: boolean;
  readonly deletable: boolean;
  readonly autoConnect: boolean;
  readonly isValidConnection: ((c: SoneFlowConnection) => boolean) | null;
  readonly labels: SoneFlowLabels;
}

/** What the canvas reports (the Vue emits, the React `on*` props). */
export interface FlowEvents {
  connect(c: SoneFlowConnection): void;
  nodeClick(node: SoneFlowNode): void;
  nodeDoubleClick(node: SoneFlowNode): void;
  nodeDragEnd(node: SoneFlowNode): void;
  edgeClick(edge: SoneFlowEdge): void;
  canvasClick(point: SoneFlowPoint): void;
  nodesDelete(nodes: readonly SoneFlowNode[]): void;
  edgesDelete(edges: readonly SoneFlowEdge[]): void;
}

/** The fields of a DOM or React pointer event the canvas reads. */
export interface FlowPointerEvent {
  readonly type: string;
  readonly button: number;
  readonly pointerId: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly shiftKey: boolean;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly target: EventTarget | null;
  preventDefault(): void;
}

/** The fields of a DOM or React keyboard event the canvas reads. */
export interface FlowKeyEvent {
  readonly key: string;
  readonly shiftKey: boolean;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly target: EventTarget | null;
  readonly currentTarget: EventTarget | null;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

const DRAG_THRESHOLD = 3;
const FIT_PADDING = 48;
/** Controls inside a node template that keep their own pointer behaviour. */
const NO_DRAG =
  "button, a[href], input, select, textarea, label, [contenteditable], [data-flow-nodrag]";

const OPPOSITE: Record<SoneFlowSide, SoneFlowSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** The glyph of a finished node status (`running` draws a spinner). */
export const SONE_FLOW_STATUS_ICON = {
  success: "circle-check",
  error: "circle-x",
  warning: "alert-circle",
} as const;

/** The built-in strings of the canvas, over the messages, with the props on top. */
export function flowLabels(
  m: SoneMessages,
  labels: Partial<SoneFlowLabels>,
  ariaLabel: string | null | undefined,
): SoneFlowLabels {
  const merged: SoneFlowLabels = {
    canvas: m.flowCanvas,
    node: m.flowNode,
    instructions: m.flowInstructions,
    connectsTo: m.flowConnectsTo,
    status: {
      running: m.flowStatusRunning,
      success: m.flowStatusSuccess,
      error: m.flowStatusError,
      warning: m.flowStatusWarning,
    },
    connectFrom: m.flowConnectFrom,
    connectTo: m.flowConnectTo,
    connecting: m.flowConnecting,
    connected: m.flowConnected,
    cancelled: m.flowCancelled,
    deleted: m.flowDeleted,
    moved: m.flowMoved,
    ...labels,
  };
  return ariaLabel ? { ...merged, canvas: ariaLabel } : merged;
}

/** A node's box: its measured size, else its width or the shape's default. */
export function flowNodeRect(
  node: SoneFlowNode,
  sizes: ReadonlyMap<string, SoneFlowSize>,
): SoneFlowRect {
  const fallback = SONE_FLOW_SHAPE_SIZE[nodeShape(node)];
  const size = sizes.get(node.id) ?? {
    width: node.width ?? fallback.width,
    height: fallback.height,
  };
  return { x: node.x, y: node.y, ...size };
}

export interface FlowNodesInput {
  readonly nodes: readonly SoneFlowNode[];
  readonly edges: readonly SoneFlowEdge[];
  readonly selectedNodes: readonly string[];
  readonly measured: ReadonlyMap<string, SoneFlowSize>;
  readonly direction: SoneFlowDirection;
  readonly labels: SoneFlowLabels;
  /** The word read after a selected node ("selected"). */
  readonly selectedWord: string;
}

/** Every node as drawn, with the name a screen reader hears ("Fetch, running, connects to Parse"). */
export function renderFlowNodes(input: FlowNodesInput): SoneFlowRenderedNode[] {
  const selected = new Set(input.selectedNodes);
  const byId = new Map(input.nodes.map((n) => [n.id, n] as const));
  const outgoing = new Map<string, string[]>();
  for (const e of input.edges) {
    const target = byId.get(e.target);
    if (!target) continue;
    const list = outgoing.get(e.source) ?? [];
    list.push(e.label ? `${target.label} (${e.label})` : target.label);
    outgoing.set(e.source, list);
  }
  const t = input.labels;
  return input.nodes.map((node) => {
    const isSelected = selected.has(node.id);
    const parts = [node.label];
    if (node.description) parts.push(node.description);
    if (node.status) parts.push(t.status[node.status]);
    const to = outgoing.get(node.id);
    if (to?.length) parts.push(t.connectsTo(to.join(", ")));
    if (isSelected) parts.push(input.selectedWord);
    return {
      node,
      rect: flowNodeRect(node, input.measured),
      ports: placePorts(node, input.direction),
      selected: isSelected,
      name: parts.join(", "),
    };
  });
}

/** The port of `kind` with `id` (the first of that kind when `id` is not given). */
export function findFlowPort(
  r: SoneFlowRenderedNode,
  id: string | undefined,
  kind: "source" | "target",
): SoneFlowPlacedPort | undefined {
  return id === undefined
    ? r.ports.find((p) => p.kind === kind)
    : r.ports.find((p) => p.kind === kind && p.id === id);
}

const byNodeId = (
  rendered: readonly SoneFlowRenderedNode[],
): Map<string, SoneFlowRenderedNode> =>
  new Map(rendered.map((r) => [r.node.id, r] as const));

/** Every edge whose two ports exist, as a path. */
export function renderFlowEdges(
  rendered: readonly SoneFlowRenderedNode[],
  edges: readonly SoneFlowEdge[],
  selectedEdges: readonly string[],
  edgeType: SoneFlowEdgeType,
): SoneFlowRenderedEdge[] {
  const byId = byNodeId(rendered);
  const selected = new Set(selectedEdges);
  const out: SoneFlowRenderedEdge[] = [];
  for (const edge of edges) {
    const s = byId.get(edge.source);
    const t = byId.get(edge.target);
    if (!s || !t) continue;
    const sp = findFlowPort(s, edge.sourcePort, "source");
    const tp = findFlowPort(t, edge.targetPort, "target");
    if (!sp || !tp) continue;
    out.push({
      edge,
      selected: selected.has(edge.id),
      path: edgePath(
        edge.type ?? edgeType,
        portPoint(s.node, s.rect, sp),
        sp.side,
        portPoint(t.node, t.rect, tp),
        tp.side,
      ),
    });
  }
  return out;
}

/** The connection being drawn, as a path to the pointer. */
export function pendingFlowPath(
  pending: FlowPendingConnection | null,
  rendered: readonly SoneFlowRenderedNode[],
  edgeType: SoneFlowEdgeType,
): string | null {
  if (!pending) return null;
  const r = rendered.find((x) => x.node.id === pending.node);
  const port = r && findFlowPort(r, pending.port, pending.kind);
  if (!r || !port) return null;
  const from = portPoint(r.node, r.rect, port);
  const path =
    pending.kind === "source"
      ? edgePath(edgeType, from, port.side, pending.to, OPPOSITE[port.side])
      : edgePath(edgeType, pending.to, OPPOSITE[port.side], from, port.side);
  return path.d;
}

/** The background pattern's tile, in screen px. */
export function flowPattern(viewport: SoneFlowViewport, gridSize: number) {
  const size = gridSize * viewport.zoom;
  return {
    size,
    x: ((viewport.x % size) + size) % size,
    y: ((viewport.y % size) + size) % size,
    dot: Math.max(0.6, Math.min(1.4, viewport.zoom)),
  };
}

/** A port's accessible name: "Connect from Fetch out". */
export function flowPortName(
  labels: SoneFlowLabels,
  r: SoneFlowRenderedNode,
  port: SoneFlowPlacedPort,
): string {
  const label = port.label ?? "";
  return port.kind === "source"
    ? labels.connectFrom(r.node.label, label).trim()
    : labels.connectTo(r.node.label, label).trim();
}

/** Whether the pending connection may end on this port. */
export function flowCanConnectTo(
  pending: FlowPendingConnection | null,
  port: SoneFlowPlacedPort,
  node: string,
): boolean {
  return !!pending && pending.node !== node && pending.kind !== port.kind;
}

type Gesture =
  | {
      readonly kind: "pan";
      readonly pointer: number;
      readonly start: SoneFlowPoint;
      readonly from: SoneFlowViewport;
      moved: boolean;
    }
  | {
      readonly kind: "drag";
      readonly pointer: number;
      readonly start: SoneFlowPoint;
      readonly node: string;
      readonly origins: ReadonlyMap<string, SoneFlowPoint>;
      moved: boolean;
    }
  | {
      readonly kind: "connect";
      readonly pointer: number;
      readonly start: SoneFlowPoint;
      moved: boolean;
    };

export interface FlowControllerOptions {
  readonly store: FlowStore;
  readonly settings: () => FlowSettings;
  readonly events: FlowEvents;
  /** The `.flow-pane` element. */
  readonly pane: () => HTMLElement | null;
  /** The word read after a selected node ("selected"), for `rendered()`. */
  readonly selectedWord: () => string;
}

export interface FlowController extends SoneFlowApi {
  /** The nodes as drawn from the latest state. */
  rendered(): SoneFlowRenderedNode[];
  /** Pans just enough to bring a node inside the pane. */
  revealNode(id: string): void;
  pointerDown(e: FlowPointerEvent): void;
  pointerMove(e: FlowPointerEvent): void;
  /** pointerup and pointercancel. */
  pointerUp(e: FlowPointerEvent): void;
  doubleClick(e: { readonly target: EventTarget | null }): void;
  /** A native, non-passive wheel listener (it may prevent the page scroll). */
  wheel(e: WheelEvent): void;
  paneKeyDown(e: FlowKeyEvent): void;
  nodeKeyDown(e: FlowKeyEvent, r: SoneFlowRenderedNode): void;
  /** Starts measuring the pane and the nodes (browser only). */
  mount(): void;
  /** Measures nodes added since the last call (observing twice is a no-op). */
  observeNodes(): void;
  /** Forgets the sizes of removed nodes. */
  pruneMeasured(): void;
  unmount(): void;
}

/** The behaviour of `<SoneFlow>` over a framework's state. */
export function createFlowController(
  options: FlowControllerOptions,
): FlowController {
  const { store, events } = options;
  const s = options.settings;
  let gesture: Gesture | null = null;
  let fitted = false;
  let paneObserver: ResizeObserver | null = null;
  let nodeObserver: ResizeObserver | null = null;

  const rendered = (): SoneFlowRenderedNode[] =>
    renderFlowNodes({
      nodes: store.nodes,
      edges: store.edges,
      selectedNodes: store.selectedNodes,
      measured: store.measured,
      direction: s().direction,
      labels: s().labels,
      selectedWord: options.selectedWord(),
    });
  const renderedNode = (id: string): SoneFlowRenderedNode | undefined =>
    rendered().find((r) => r.node.id === id);

  const portOf = (
    node: string,
    id: string | undefined,
    kind: "source" | "target",
  ): string | undefined => {
    const r = renderedNode(node);
    return r && findFlowPort(r, id, kind)?.id;
  };

  const nodeElements = (): HTMLElement[] => {
    const pane = options.pane();
    return pane
      ? Array.from(
          pane.querySelectorAll<HTMLElement>(
            ":scope > .flow-viewport > [data-flow-node]",
          ),
        )
      : [];
  };

  function announce(message: string): void {
    // Re-set even the same text, so it is spoken again.
    store.announcement = "";
    queueMicrotask(() => (store.announcement = message));
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  function fit(ids?: readonly string[]): void {
    const pick = ids ? new Set(ids) : null;
    const sizes = store.measured;
    const rects = store.nodes
      .filter((n) => !pick || pick.has(n.id))
      .map((n) => flowNodeRect(n, sizes));
    const bounds = flowBounds(rects);
    const size = store.paneSize;
    if (!bounds || !size.width) return;
    const { minZoom, maxZoom } = s();
    store.viewport = fitViewport(
      bounds,
      size,
      FIT_PADDING,
      minZoom,
      Math.min(maxZoom, 1.25),
    );
  }

  function zoomTo(z: number, at?: SoneFlowPoint): void {
    const size = store.paneSize;
    const clamped = clampZoom(z, s().minZoom, s().maxZoom);
    store.viewport = zoomAround(
      store.viewport,
      clamped,
      at ?? { x: size.width / 2, y: size.height / 2 },
    );
  }

  const zoomIn = (): void => zoomTo(store.viewport.zoom * SONE_FLOW_ZOOM_STEP);
  const zoomOut = (): void => zoomTo(store.viewport.zoom / SONE_FLOW_ZOOM_STEP);

  function centerOn(point: SoneFlowPoint): void {
    const size = store.paneSize;
    const z = store.viewport.zoom;
    store.viewport = {
      x: size.width / 2 - point.x * z,
      y: size.height / 2 - point.y * z,
      zoom: z,
    };
  }

  function screenToFlow(clientX: number, clientY: number): SoneFlowPoint {
    const box = options.pane()?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
    };
    const v = store.viewport;
    return {
      x: (clientX - box.left - v.x) / v.zoom,
      y: (clientY - box.top - v.y) / v.zoom,
    };
  }

  function visibleCenter(): SoneFlowPoint {
    const size = store.paneSize;
    const v = store.viewport;
    return {
      x: (size.width / 2 - v.x) / v.zoom,
      y: (size.height / 2 - v.y) / v.zoom,
    };
  }

  function focusNode(id: string): void {
    const el = nodeElements().find((e) => e.dataset["node"] === id);
    el?.focus({ preventScroll: true });
    revealNode(id);
  }

  function deleteSelection(): void {
    if (!store.interactive || !s().deletable) return;
    const list = store.nodes;
    const selected = store.selectedNodes;
    const nodeIds = new Set(
      list
        .filter((n) => selected.includes(n.id) && n.deletable !== false)
        .map((n) => n.id),
    );
    const edgeIds = new Set(store.selectedEdges);
    const removedNodes = list.filter((n) => nodeIds.has(n.id));
    const removedEdges = store.edges.filter(
      (e) =>
        (edgeIds.has(e.id) && e.deletable !== false) ||
        nodeIds.has(e.source) ||
        nodeIds.has(e.target),
    );
    if (!removedNodes.length && !removedEdges.length) return;
    const goneEdges = new Set(removedEdges.map((e) => e.id));
    store.nodes = list.filter((n) => !nodeIds.has(n.id));
    store.edges = store.edges.filter((e) => !goneEdges.has(e.id));
    store.selectedNodes = [];
    store.selectedEdges = [];
    if (removedNodes.length) events.nodesDelete(removedNodes);
    if (removedEdges.length) events.edgesDelete(removedEdges);
    announce(s().labels.deleted(removedNodes.length + removedEdges.length));
  }

  const toggled = (
    current: readonly string[],
    id: string,
    additive: boolean,
  ): readonly string[] =>
    additive
      ? current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
      : [id];

  function selectNode(id: string, additive = false): void {
    store.selectedNodes = toggled(store.selectedNodes, id, additive);
    if (!additive) store.selectedEdges = [];
  }

  function selectEdge(id: string, additive = false): void {
    store.selectedEdges = toggled(store.selectedEdges, id, additive);
    if (!additive) store.selectedNodes = [];
  }

  function cancelConnection(): void {
    if (!store.pending) return;
    store.pending = null;
    announce(s().labels.cancelled);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const canDraw = (): boolean =>
    store.interactive && s().connectable && s().tool === "select";

  function revealNode(id: string): void {
    const node = store.nodes.find((n) => n.id === id);
    const size = store.paneSize;
    if (!node || !size.width) return;
    const rect = flowNodeRect(node, store.measured);
    const v = store.viewport;
    const margin = 24;
    const left = rect.x * v.zoom + v.x;
    const top = rect.y * v.zoom + v.y;
    const right = left + rect.width * v.zoom;
    const bottom = top + rect.height * v.zoom;
    let dx = 0;
    let dy = 0;
    if (left < margin) dx = margin - left;
    else if (right > size.width - margin) dx = size.width - margin - right;
    if (top < margin) dy = margin - top;
    else if (bottom > size.height - margin) dy = size.height - margin - bottom;
    if (dx || dy) store.viewport = { ...v, x: v.x + dx, y: v.y + dy };
  }

  function complete(
    from: FlowPendingConnection,
    node: string,
    port: string,
    kind: "source" | "target",
  ): void {
    store.pending = null;
    const labels = s().labels;
    if (node === from.node || kind === from.kind) {
      announce(labels.cancelled);
      return;
    }
    const c: SoneFlowConnection =
      from.kind === "source"
        ? {
            source: from.node,
            sourcePort: from.port,
            target: node,
            targetPort: port,
          }
        : {
            source: node,
            sourcePort: port,
            target: from.node,
            targetPort: from.port,
          };
    const valid = s().isValidConnection;
    const exists = store.edges.some(
      (e) =>
        e.source === c.source &&
        e.target === c.target &&
        portOf(e.source, e.sourcePort, "source") === c.sourcePort &&
        portOf(e.target, e.targetPort, "target") === c.targetPort,
    );
    if (exists || (valid && !valid(c))) {
      announce(labels.cancelled);
      return;
    }
    if (s().autoConnect) {
      store.edges = [
        ...store.edges,
        {
          id: `${c.source}:${c.sourcePort}->${c.target}:${c.targetPort}`,
          source: c.source,
          sourcePort: c.sourcePort,
          target: c.target,
          targetPort: c.targetPort,
        },
      ];
    }
    events.connect(c);
    const label = (id: string) =>
      store.nodes.find((n) => n.id === id)?.label ?? id;
    announce(labels.connected(label(c.source), label(c.target)));
  }

  /** Ends the pending connection on a node: its first port of the other kind. */
  function finishOn(id: string): void {
    const p = store.pending;
    const r = renderedNode(id);
    if (!p || !r) return;
    const want = p.kind === "source" ? "target" : "source";
    const port = r.ports.find((x) => x.kind === want);
    if (!port) {
      cancelConnection();
      return;
    }
    complete(p, id, port.id, want);
  }

  function finishAt(
    handle: HTMLElement | null,
    nodeEl: HTMLElement | null,
  ): void {
    const p = store.pending;
    if (!p) return;
    if (handle) {
      const kind = handle.dataset["kind"] === "target" ? "target" : "source";
      complete(
        p,
        handle.dataset["node"] ?? "",
        handle.dataset["port"] ?? "",
        kind,
      );
    } else if (nodeEl) {
      finishOn(nodeEl.dataset["node"] ?? "");
    } else {
      cancelConnection();
    }
  }

  // ── Pointer ────────────────────────────────────────────────────────────────

  function capture(e: FlowPointerEvent, next: Gesture): void {
    gesture = next;
    options.pane()?.setPointerCapture?.(e.pointerId);
  }

  function pointerDown(e: FlowPointerEvent): void {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as Element;
    const handle = target.closest<HTMLElement>("[data-flow-handle]");
    const nodeEl = target.closest<HTMLElement>("[data-flow-node]");
    const edgeEl = target.closest<HTMLElement>("[data-flow-edge]");
    const p = store.pending;
    const start = { x: e.clientX, y: e.clientY };

    if (p && p.mode !== "drag") {
      e.preventDefault();
      if (handle || nodeEl) finishAt(handle, nodeEl);
      else cancelConnection();
      return;
    }

    if (e.button === 0 && handle && canDraw()) {
      e.preventDefault();
      const kind = handle.dataset["kind"] === "target" ? "target" : "source";
      store.pending = {
        node: handle.dataset["node"] ?? "",
        port: handle.dataset["port"] ?? "",
        kind,
        to: screenToFlow(e.clientX, e.clientY),
        mode: "drag",
      };
      capture(e, {
        kind: "connect",
        pointer: e.pointerId,
        start,
        moved: false,
      });
      return;
    }

    if (e.button === 0 && edgeEl && !nodeEl) {
      const edge = store.edges.find((x) => x.id === edgeEl.dataset["edge"]);
      if (edge) {
        selectEdge(edge.id, e.shiftKey || e.metaKey || e.ctrlKey);
        options.pane()?.focus({ preventScroll: true });
        events.edgeClick(edge);
      }
      return;
    }

    if (e.button === 0 && nodeEl && s().tool === "select") {
      const id = nodeEl.dataset["node"] ?? "";
      const inner = target.closest(NO_DRAG);
      if (inner && inner !== nodeEl && nodeEl.contains(inner)) return;
      const additive = e.shiftKey || e.metaKey || e.ctrlKey;
      if (!store.selectedNodes.includes(id) || additive)
        selectNode(id, additive);
      const list = store.nodes;
      const node = list.find((n) => n.id === id);
      if (!node || !store.interactive || node.draggable === false) {
        gesture = null;
        return;
      }
      const selected = store.selectedNodes;
      const moving = selected.includes(id) ? selected : [id];
      const origins = new Map(
        list
          .filter((n) => moving.includes(n.id) && n.draggable !== false)
          .map((n) => [n.id, { x: n.x, y: n.y }] as const),
      );
      capture(e, {
        kind: "drag",
        pointer: e.pointerId,
        start,
        node: id,
        origins,
        moved: false,
      });
      return;
    }

    // The empty canvas (or any node with the pan tool): pan.
    capture(e, {
      kind: "pan",
      pointer: e.pointerId,
      start,
      from: store.viewport,
      moved: false,
    });
  }

  function pointerMove(e: FlowPointerEvent): void {
    const p = store.pending;
    if (p && p.mode !== "keyboard") {
      store.pending = { ...p, to: screenToFlow(e.clientX, e.clientY) };
    }
    const g = gesture;
    if (!g || e.pointerId !== g.pointer) return;
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    g.moved = true;
    if (g.kind === "pan") {
      store.viewport = {
        x: g.from.x + dx,
        y: g.from.y + dy,
        zoom: g.from.zoom,
      };
    } else if (g.kind === "drag") {
      const z = store.viewport.zoom;
      const snap = s().snapToGrid ? s().gridSize : 0;
      const at = (v: number) =>
        snap ? Math.round(v / snap) * snap : Math.round(v);
      store.nodes = store.nodes.map((n) => {
        const o = g.origins.get(n.id);
        return o ? { ...n, x: at(o.x + dx / z), y: at(o.y + dy / z) } : n;
      });
    }
  }

  function pointerUp(e: FlowPointerEvent): void {
    const g = gesture;
    if (!g || e.pointerId !== g.pointer) return;
    // The release point counts as the last move (a quick flick may send none).
    if (e.type === "pointerup") pointerMove(e);
    gesture = null;
    const el = options.pane();
    if (el?.hasPointerCapture?.(e.pointerId))
      el.releasePointerCapture(e.pointerId);

    if (g.kind === "connect") {
      const p = store.pending;
      if (!p) return;
      if (!g.moved) {
        // A click on a handle: pick the other end with a second click.
        store.pending = { ...p, mode: "click" };
        const node = store.nodes.find((n) => n.id === p.node);
        if (node) announce(s().labels.connecting(node.label));
        return;
      }
      const hit = el?.ownerDocument.elementFromPoint?.(e.clientX, e.clientY);
      finishAt(
        hit?.closest<HTMLElement>("[data-flow-handle]") ?? null,
        hit?.closest<HTMLElement>("[data-flow-node]") ?? null,
      );
      return;
    }
    if (g.kind === "drag") {
      const node = store.nodes.find((n) => n.id === g.node);
      if (!node) return;
      if (g.moved) events.nodeDragEnd(node);
      else events.nodeClick(node);
      return;
    }
    if (!g.moved && e.type === "pointerup") {
      store.selectedNodes = [];
      store.selectedEdges = [];
      events.canvasClick(screenToFlow(e.clientX, e.clientY));
    }
  }

  function doubleClick(e: { readonly target: EventTarget | null }): void {
    const nodeEl = (e.target as Element).closest<HTMLElement>(
      "[data-flow-node]",
    );
    const node =
      nodeEl && store.nodes.find((n) => n.id === nodeEl.dataset["node"]);
    if (node) events.nodeDoubleClick(node);
  }

  function wheel(e: WheelEvent): void {
    const box = options.pane()?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
    };
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // A pinch arrives as ctrl + wheel with small deltas; a mouse wheel with ±100.
      const factor = Math.exp(
        -e.deltaY * (Math.abs(e.deltaY) < 50 ? 0.01 : 0.002),
      );
      zoomTo(store.viewport.zoom * factor, {
        x: e.clientX - box.left,
        y: e.clientY - box.top,
      });
    } else if (s().panOnScroll) {
      e.preventDefault();
      const v = store.viewport;
      store.viewport = { ...v, x: v.x - e.deltaX, y: v.y - e.deltaY };
    }
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  function paneKeyDown(e: FlowKeyEvent): void {
    if (e.defaultPrevented) return;
    const typing = (e.target as Element).closest(
      "input, select, textarea, [contenteditable]",
    );
    if (typing) return;
    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        zoomIn();
        break;
      case "-":
      case "_":
        e.preventDefault();
        zoomOut();
        break;
      case "Delete":
      case "Backspace":
        if (store.selectedNodes.length || store.selectedEdges.length) {
          e.preventDefault();
          deleteSelection();
        }
        break;
      case "Escape":
        if (store.pending) cancelConnection();
        else {
          store.selectedNodes = [];
          store.selectedEdges = [];
        }
        break;
    }
  }

  function nodeKeyDown(e: FlowKeyEvent, r: SoneFlowRenderedNode): void {
    if (e.target !== e.currentTarget) return;
    const id = r.node.id;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (store.pending) {
        finishOn(id);
        return;
      }
      selectNode(id, e.shiftKey);
      events.nodeClick(r.node);
      return;
    }
    if (
      (e.key === "c" || e.key === "C") &&
      !e.metaKey &&
      !e.ctrlKey &&
      canDraw()
    ) {
      const out = r.ports.find((p) => p.kind === "source");
      if (!out) return;
      e.preventDefault();
      store.pending = {
        node: id,
        port: out.id,
        kind: "source",
        to: {
          x: r.rect.x + r.rect.width + 60,
          y: r.rect.y + r.rect.height / 2,
        },
        mode: "keyboard",
      };
      announce(s().labels.connecting(r.node.label));
      return;
    }
    const step = (e.shiftKey ? 5 : 1) * s().gridSize;
    const delta: Record<string, SoneFlowPoint> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const d = delta[e.key];
    if (d && store.interactive && r.node.draggable !== false) {
      e.preventDefault();
      const moving = r.selected ? store.selectedNodes : [id];
      store.nodes = store.nodes.map((n) =>
        moving.includes(n.id) && n.draggable !== false
          ? { ...n, x: n.x + d.x, y: n.y + d.y }
          : n,
      );
      const moved = store.nodes.find((n) => n.id === id);
      if (moved) {
        announce(s().labels.moved(moved.label, moved.x, moved.y));
        revealNode(id);
        events.nodeDragEnd(moved);
      }
    }
  }

  // ── Measurement (browser only) ─────────────────────────────────────────────

  const maybeFit = (): void => {
    if (fitted || !s().fitView) return;
    const size = store.paneSize;
    const list = store.nodes;
    if (!size.width || !size.height || !list.length) return;
    if (store.measured.size < list.length) return;
    fitted = true;
    fit();
  };

  function mount(): void {
    const el = options.pane();
    if (!el || typeof ResizeObserver === "undefined") return;
    paneObserver = new ResizeObserver(() => {
      store.paneSize = { width: el.clientWidth, height: el.clientHeight };
      maybeFit();
    });
    paneObserver.observe(el);
    nodeObserver = new ResizeObserver((entries) => {
      const next = new Map(store.measured);
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        const id = node.dataset["node"];
        // offsetWidth / offsetHeight: the layout size, unaffected by the zoom transform.
        if (id)
          next.set(id, { width: node.offsetWidth, height: node.offsetHeight });
      }
      store.measured = next;
      maybeFit();
    });
    observeNodes();
  }

  function observeNodes(): void {
    if (nodeObserver)
      for (const node of nodeElements()) nodeObserver.observe(node);
  }

  function pruneMeasured(): void {
    const ids = new Set(store.nodes.map((n) => n.id));
    const sizes = store.measured;
    if ([...sizes.keys()].some((id) => !ids.has(id))) {
      store.measured = new Map([...sizes].filter(([id]) => ids.has(id)));
    }
  }

  function unmount(): void {
    paneObserver?.disconnect();
    nodeObserver?.disconnect();
    paneObserver = null;
    nodeObserver = null;
  }

  return {
    fit,
    zoomIn,
    zoomOut,
    zoomTo,
    centerOn,
    screenToFlow,
    visibleCenter,
    focusNode,
    deleteSelection,
    selectNode,
    selectEdge,
    cancelConnection,
    rendered,
    revealNode,
    pointerDown,
    pointerMove,
    pointerUp,
    doubleClick,
    wheel,
    paneKeyDown,
    nodeKeyDown,
    mount,
    observeNodes,
    pruneMeasured,
    unmount,
  };
}
