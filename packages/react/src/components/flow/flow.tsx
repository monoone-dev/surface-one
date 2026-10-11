"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { definePart, flag } from "../../utils/part";
import { SoneIcon } from "../icon";
import {
  SONE_FLOW_MAX_ZOOM,
  SONE_FLOW_MIN_ZOOM,
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
  type SoneFlowEdgePath,
  type SoneFlowPlacedPort,
  type SoneFlowRect,
  type SoneFlowSize,
} from "./geometry";
import {
  SONE_FLOW_TONES,
  type SoneFlowBackground,
  type SoneFlowConnection,
  type SoneFlowDirection,
  type SoneFlowEdge,
  type SoneFlowEdgeType,
  type SoneFlowLabels,
  type SoneFlowNode,
  type SoneFlowPanelPosition,
  type SoneFlowPoint,
  type SoneFlowSide,
  type SoneFlowTool,
  type SoneFlowViewport,
} from "./types";

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

/** What `renderNode` receives. */
export interface SoneFlowNodeContext<D = unknown> {
  readonly node: SoneFlowNode<D>;
  readonly selected: boolean;
}

/**
 * The methods the `ref` of `<SoneFlow>` exposes:
 * `const flow = useRef<SoneFlowApi>(null)`.
 */
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

/** The canvas, for the controls, the minimap and other children (the Angular `SONE_FLOW`). */
export interface SoneFlowContext extends SoneFlowApi {
  readonly viewport: SoneFlowViewport;
  readonly zoom: number;
  /** The pane's size in px (0 × 0 on the server). */
  readonly paneSize: SoneFlowSize;
  readonly rendered: readonly SoneFlowRenderedNode[];
  readonly interactive: boolean;
  setInteractive(value: boolean): void;
  minZoom(): number;
  maxZoom(): number;
}

export const SONE_FLOW = createContext<SoneFlowContext | null>(null);

/** The `<SoneFlow>` a child sits in (throws outside one). */
export function useSoneFlow(): SoneFlowContext {
  const flow = useContext(SONE_FLOW);
  if (!flow) throw new Error("This part must sit inside a <SoneFlow>.");
  return flow;
}

/** A connection being drawn: from a port, to the pointer. */
interface PendingConnection {
  readonly node: string;
  readonly port: string;
  readonly kind: "source" | "target";
  readonly to: SoneFlowPoint;
  /** `drag`: until the pointer is released; `click` / `keyboard`: until a second pick. */
  readonly mode: "drag" | "click" | "keyboard";
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

const STATUS_ICON = {
  success: "circle-check",
  error: "circle-x",
  warning: "alert-circle",
} as const;

const NO_NODES: readonly SoneFlowNode[] = [];
const NO_EDGES: readonly SoneFlowEdge[] = [];
const NO_IDS: readonly string[] = [];
const ORIGIN: SoneFlowViewport = { x: 0, y: 0, zoom: 1 };
const NO_LABELS: Partial<SoneFlowLabels> = {};

/** A two-way value whose latest write handlers read back at once (the Vue `useModel`). */
interface Model<T> {
  readonly value: T;
  readonly ref: { current: T };
  set(next: T): void;
}

function useModel<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((value: T) => void) | undefined,
): Model<T> {
  const [current, setCurrent] = useControllable(value, defaultValue, onChange);
  const ref = useRef(current);
  ref.current = current;
  const set = useCallback(
    (next: T) => {
      ref.current = next;
      setCurrent(next);
    },
    [setCurrent],
  );
  return { value: current, ref, set };
}

/** A state its handlers read back at once. */
function useLatest<T>(initial: T): [T, { current: T }, (next: T) => void] {
  const [state, setState] = useState(initial);
  const ref = useRef(state);
  const set = useCallback((next: T) => {
    ref.current = next;
    setState(next);
  }, []);
  return [state, ref, set];
}

/** A node's box: its measured size, else its width or the shape's default. */
function rectOf(
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

export interface SoneFlowProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** The nodes (controlled); with `onNodesChange` they follow drags, moves and deletes. */
  readonly nodes?: readonly SoneFlowNode[];
  readonly defaultNodes?: readonly SoneFlowNode[];
  readonly onNodesChange?: (nodes: readonly SoneFlowNode[]) => void;
  readonly edges?: readonly SoneFlowEdge[];
  readonly defaultEdges?: readonly SoneFlowEdge[];
  readonly onEdgesChange?: (edges: readonly SoneFlowEdge[]) => void;
  readonly viewport?: SoneFlowViewport;
  readonly defaultViewport?: SoneFlowViewport;
  readonly onViewportChange?: (viewport: SoneFlowViewport) => void;
  readonly selectedNodes?: readonly string[];
  readonly defaultSelectedNodes?: readonly string[];
  readonly onSelectedNodesChange?: (ids: readonly string[]) => void;
  readonly selectedEdges?: readonly string[];
  readonly defaultSelectedEdges?: readonly string[];
  readonly onSelectedEdgesChange?: (ids: readonly string[]) => void;
  /** `false` locks the canvas: no dragging, connecting or deleting (panning and zooming stay). */
  readonly interactive?: boolean;
  readonly defaultInteractive?: boolean;
  readonly onInteractiveChange?: (interactive: boolean) => void;
  readonly direction?: SoneFlowDirection;
  /** The path of edges that set no `type`. */
  readonly edgeType?: SoneFlowEdgeType;
  readonly background?: SoneFlowBackground;
  readonly gridSize?: number;
  /** Snap dragged nodes to the grid. */
  readonly snapToGrid?: boolean;
  /** Dragging the background pans in both tools; `pan` also stops nodes from moving. */
  readonly tool?: SoneFlowTool;
  readonly minZoom?: number;
  readonly maxZoom?: number;
  /** Fit the nodes into view once they are first measured. */
  readonly fitView?: boolean;
  /** A plain wheel pans the canvas (otherwise it scrolls the page; Ctrl / ⌘ + wheel always zooms). */
  readonly panOnScroll?: boolean;
  readonly connectable?: boolean;
  readonly deletable?: boolean;
  /** Add the edge on `onConnect` (`false`: only report it, the owner adds it). */
  readonly autoConnect?: boolean;
  readonly isValidConnection?: ((c: SoneFlowConnection) => boolean) | null;
  /** The canvas's accessible name (default "Flow diagram"). */
  readonly "aria-label"?: string;
  readonly labels?: Partial<SoneFlowLabels>;
  /** Draws the body of every node instead of the default icon, label and description (the Vue `#node` slot). */
  readonly renderNode?: (ctx: SoneFlowNodeContext) => ReactNode;
  readonly onConnect?: (connection: SoneFlowConnection) => void;
  readonly onNodeClick?: (node: SoneFlowNode) => void;
  readonly onNodeDoubleClick?: (node: SoneFlowNode) => void;
  readonly onNodeDragEnd?: (node: SoneFlowNode) => void;
  readonly onEdgeClick?: (edge: SoneFlowEdge) => void;
  /** A click on the empty canvas, at that point in canvas units. */
  readonly onCanvasClick?: (point: SoneFlowPoint) => void;
  readonly onNodesDelete?: (nodes: readonly SoneFlowNode[]) => void;
  readonly onEdgesDelete?: (edges: readonly SoneFlowEdge[]) => void;
  /** `<SoneFlowControls>`, `<SoneFlowMinimap>`, `<SoneFlowPanel>` overlays, a `<SoneDock>`. */
  readonly children?: ReactNode;
  /** The imperative API: fit, zoom, focus a node, delete the selection… */
  readonly ref?: Ref<SoneFlowApi | null>;
}

/**
 * `<sone-flow>` — a node canvas for diagrams and workflows. Nodes sit at `x`/`y` in
 * canvas units, edges join their ports with a bezier, step or straight path; the
 * canvas pans (drag the background, or scroll with `panOnScroll`), zooms (Ctrl / ⌘ +
 * wheel, a pinch, the controls) and fits its content. `nodes`, `edges`, `viewport`
 * and the selection work controlled (`nodes` + `onNodesChange`) or uncontrolled
 * (`defaultNodes`): dragging a node, drawing a connection or deleting writes them back.
 * `renderNode={({ node, selected }) => …}` draws the body of every node instead of the
 * default icon, label and description.
 *
 * Children: `<SoneFlowControls>`, `<SoneFlowMinimap>`, `<SoneFlowPanel>` overlays and
 * a `<SoneDock>` sit on top of the canvas.
 */
export function SoneFlow({
  nodes: nodesProp,
  defaultNodes = NO_NODES,
  onNodesChange,
  edges: edgesProp,
  defaultEdges = NO_EDGES,
  onEdgesChange,
  viewport: viewportProp,
  defaultViewport = ORIGIN,
  onViewportChange,
  selectedNodes: selectedNodesProp,
  defaultSelectedNodes = NO_IDS,
  onSelectedNodesChange,
  selectedEdges: selectedEdgesProp,
  defaultSelectedEdges = NO_IDS,
  onSelectedEdgesChange,
  interactive: interactiveProp,
  defaultInteractive = true,
  onInteractiveChange,
  direction = "horizontal",
  edgeType = "bezier",
  background = "dots",
  gridSize = 20,
  snapToGrid = false,
  tool = "select",
  minZoom = SONE_FLOW_MIN_ZOOM,
  maxZoom = SONE_FLOW_MAX_ZOOM,
  fitView = true,
  panOnScroll = false,
  connectable = true,
  deletable = true,
  autoConnect = true,
  isValidConnection = null,
  "aria-label": ariaLabel,
  labels = NO_LABELS,
  renderNode: customNode,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragEnd,
  onEdgeClick,
  onCanvasClick,
  onNodesDelete,
  onEdgesDelete,
  children,
  ref,
  ...rest
}: SoneFlowProps) {
  const messages = useSoneMessages();

  const nodes = useModel(nodesProp, defaultNodes, onNodesChange);
  const edges = useModel(edgesProp, defaultEdges, onEdgesChange);
  const viewport = useModel(viewportProp, defaultViewport, onViewportChange);
  const selectedNodes = useModel(
    selectedNodesProp,
    defaultSelectedNodes,
    onSelectedNodesChange,
  );
  const selectedEdges = useModel(
    selectedEdgesProp,
    defaultSelectedEdges,
    onSelectedEdgesChange,
  );
  const interactive = useModel(
    interactiveProp,
    defaultInteractive,
    onInteractiveChange,
  );

  const uid = `sone-flow-${useId().replace(/[^\w-]/g, "")}`;
  const hintId = `${uid}-hint`;

  const m = messages;
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
  const text: SoneFlowLabels = ariaLabel
    ? { ...merged, canvas: ariaLabel }
    : merged;

  const pane = useRef<HTMLDivElement | null>(null);
  /** Measured node sizes, by id (the shape's default until measured). */
  const [measured, measuredRef, setMeasured] = useLatest<
    ReadonlyMap<string, SoneFlowSize>
  >(new Map());
  const [paneSize, paneSizeRef, setPaneSize] = useLatest<SoneFlowSize>({
    width: 0,
    height: 0,
  });
  const [pending, pendingRef, setPending] = useLatest<PendingConnection | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const gesture = useRef<Gesture | null>(null);
  const fitted = useRef(false);

  const zoom = viewport.value.zoom;

  const selectedNodeSet = new Set(selectedNodes.value);
  const byIdNode = new Map(nodes.value.map((n) => [n.id, n] as const));
  const outgoing = new Map<string, string[]>();
  for (const e of edges.value) {
    const target = byIdNode.get(e.target);
    if (!target) continue;
    const list = outgoing.get(e.source) ?? [];
    list.push(e.label ? `${target.label} (${e.label})` : target.label);
    outgoing.set(e.source, list);
  }
  const rendered: readonly SoneFlowRenderedNode[] = nodes.value.map((node) => {
    const isSelected = selectedNodeSet.has(node.id);
    const parts = [node.label];
    if (node.description) parts.push(node.description);
    if (node.status) parts.push(text.status[node.status]);
    const to = outgoing.get(node.id);
    if (to?.length) parts.push(text.connectsTo(to.join(", ")));
    if (isSelected) parts.push(m.flowSelected);
    return {
      node,
      rect: rectOf(node, measured),
      ports: placePorts(node, direction),
      selected: isSelected,
      name: parts.join(", "),
    };
  });
  const renderedById = new Map(rendered.map((r) => [r.node.id, r] as const));

  const findPort = (
    r: SoneFlowRenderedNode,
    id: string | undefined,
    kind: "source" | "target",
  ): SoneFlowPlacedPort | undefined =>
    id === undefined
      ? r.ports.find((p) => p.kind === kind)
      : r.ports.find((p) => p.kind === kind && p.id === id);

  const portOf = (
    node: string,
    id: string | undefined,
    kind: "source" | "target",
  ): string | undefined => {
    const r = renderedById.get(node);
    return r && findPort(r, id, kind)?.id;
  };

  const selectedEdgeSet = new Set(selectedEdges.value);
  const renderedEdges: SoneFlowRenderedEdge[] = [];
  for (const edge of edges.value) {
    const s = renderedById.get(edge.source);
    const t = renderedById.get(edge.target);
    if (!s || !t) continue;
    const sp = findPort(s, edge.sourcePort, "source");
    const tp = findPort(t, edge.targetPort, "target");
    if (!sp || !tp) continue;
    renderedEdges.push({
      edge,
      selected: selectedEdgeSet.has(edge.id),
      path: edgePath(
        edge.type ?? edgeType,
        portPoint(s.node, s.rect, sp),
        sp.side,
        portPoint(t.node, t.rect, tp),
        tp.side,
      ),
    });
  }

  /** The connection being drawn, as a path to the pointer. */
  const pendingPath = ((): string | null => {
    const p = pending;
    if (!p) return null;
    const r = renderedById.get(p.node);
    const port = r && findPort(r, p.port, p.kind);
    if (!r || !port) return null;
    const from = portPoint(r.node, r.rect, port);
    const path =
      p.kind === "source"
        ? edgePath(edgeType, from, port.side, p.to, OPPOSITE[port.side])
        : edgePath(edgeType, p.to, OPPOSITE[port.side], from, port.side);
    return path.d;
  })();

  // ── Measurement (browser only) ───────────────────────────────────────────────

  const nodeObserver = useRef<ResizeObserver | null>(null);

  const nodeElements = (): HTMLElement[] =>
    pane.current
      ? Array.from(
          pane.current.querySelectorAll<HTMLElement>(
            ":scope > .flow-viewport > [data-flow-node]",
          ),
        )
      : [];

  const maybeFit = (): void => {
    if (fitted.current || !fitView) return;
    const size = paneSizeRef.current;
    const list = nodes.ref.current;
    if (!size.width || !size.height || !list.length) return;
    if (measuredRef.current.size < list.length) return;
    fitted.current = true;
    fit();
  };
  const maybeFitRef = useRef(maybeFit);
  maybeFitRef.current = maybeFit;

  useEffect(() => {
    const el = pane.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const paneObserver = new ResizeObserver(() => {
      setPaneSize({ width: el.clientWidth, height: el.clientHeight });
      maybeFitRef.current();
    });
    paneObserver.observe(el);
    const observer = new ResizeObserver((entries) => {
      const next = new Map(measuredRef.current);
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        const id = node.dataset["node"];
        // offsetWidth / offsetHeight: the layout size, unaffected by the zoom transform.
        if (id)
          next.set(id, { width: node.offsetWidth, height: node.offsetHeight });
      }
      setMeasured(next);
      maybeFitRef.current();
    });
    nodeObserver.current = observer;
    return () => {
      paneObserver.disconnect();
      observer.disconnect();
      nodeObserver.current = null;
    };
  }, [measuredRef, setMeasured, setPaneSize]);
  // New nodes: observing an element twice is a no-op.
  useEffect(() => {
    const observer = nodeObserver.current;
    if (observer) for (const node of nodeElements()) observer.observe(node);
  });

  // Forget the sizes of removed nodes.
  useEffect(() => {
    const ids = new Set(nodes.value.map((n) => n.id));
    const sizes = measuredRef.current;
    if ([...sizes.keys()].some((id) => !ids.has(id))) {
      setMeasured(new Map([...sizes].filter(([id]) => ids.has(id))));
    }
  }, [nodes.value, measuredRef, setMeasured]);

  // ── Public API ───────────────────────────────────────────────────────────────

  function fit(ids?: readonly string[]): void {
    const pick = ids ? new Set(ids) : null;
    const sizes = measuredRef.current;
    const rects = nodes.ref.current
      .filter((n) => !pick || pick.has(n.id))
      .map((n) => rectOf(n, sizes));
    const bounds = flowBounds(rects);
    const size = paneSizeRef.current;
    if (!bounds || !size.width) return;
    viewport.set(
      fitViewport(bounds, size, FIT_PADDING, minZoom, Math.min(maxZoom, 1.25)),
    );
  }

  function zoomTo(z: number, at?: SoneFlowPoint): void {
    const size = paneSizeRef.current;
    const clamped = clampZoom(z, minZoom, maxZoom);
    viewport.set(
      zoomAround(
        viewport.ref.current,
        clamped,
        at ?? { x: size.width / 2, y: size.height / 2 },
      ),
    );
  }

  const zoomIn = (): void =>
    zoomTo(viewport.ref.current.zoom * SONE_FLOW_ZOOM_STEP);
  const zoomOut = (): void =>
    zoomTo(viewport.ref.current.zoom / SONE_FLOW_ZOOM_STEP);

  function centerOn(point: SoneFlowPoint): void {
    const size = paneSizeRef.current;
    const z = viewport.ref.current.zoom;
    viewport.set({
      x: size.width / 2 - point.x * z,
      y: size.height / 2 - point.y * z,
      zoom: z,
    });
  }

  function screenToFlow(clientX: number, clientY: number): SoneFlowPoint {
    const box = pane.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const v = viewport.ref.current;
    return {
      x: (clientX - box.left - v.x) / v.zoom,
      y: (clientY - box.top - v.y) / v.zoom,
    };
  }

  function visibleCenter(): SoneFlowPoint {
    const size = paneSizeRef.current;
    const v = viewport.ref.current;
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
    if (!interactive.ref.current || !deletable) return;
    const list = nodes.ref.current;
    const selected = selectedNodes.ref.current;
    const nodeIds = new Set(
      list
        .filter((n) => selected.includes(n.id) && n.deletable !== false)
        .map((n) => n.id),
    );
    const edgeIds = new Set(selectedEdges.ref.current);
    const removedNodes = list.filter((n) => nodeIds.has(n.id));
    const removedEdges = edges.ref.current.filter(
      (e) =>
        (edgeIds.has(e.id) && e.deletable !== false) ||
        nodeIds.has(e.source) ||
        nodeIds.has(e.target),
    );
    if (!removedNodes.length && !removedEdges.length) return;
    const goneEdges = new Set(removedEdges.map((e) => e.id));
    nodes.set(list.filter((n) => !nodeIds.has(n.id)));
    edges.set(edges.ref.current.filter((e) => !goneEdges.has(e.id)));
    selectedNodes.set([]);
    selectedEdges.set([]);
    if (removedNodes.length) onNodesDelete?.(removedNodes);
    if (removedEdges.length) onEdgesDelete?.(removedEdges);
    announce(text.deleted(removedNodes.length + removedEdges.length));
  }

  function selectNode(id: string, additive = false): void {
    const current = selectedNodes.ref.current;
    selectedNodes.set(
      additive
        ? current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id]
        : [id],
    );
    if (!additive) selectedEdges.set([]);
  }

  function selectEdge(id: string, additive = false): void {
    const current = selectedEdges.ref.current;
    selectedEdges.set(
      additive
        ? current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id]
        : [id],
    );
    if (!additive) selectedNodes.set([]);
  }

  function cancelConnection(): void {
    if (!pendingRef.current) return;
    setPending(null);
    announce(text.cancelled);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const portName = (
    r: SoneFlowRenderedNode,
    port: SoneFlowPlacedPort,
  ): string => {
    const label = port.label ?? "";
    return port.kind === "source"
      ? text.connectFrom(r.node.label, label).trim()
      : text.connectTo(r.node.label, label).trim();
  };

  const canConnectTo = (port: SoneFlowPlacedPort, node: string): boolean => {
    const p = pending;
    return !!p && p.node !== node && p.kind !== port.kind;
  };

  const canDraw = (): boolean =>
    interactive.ref.current && connectable && tool === "select";

  function announce(message: string): void {
    // Re-set even the same text, so it is spoken again.
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  }

  /** Pans just enough to bring a node inside the pane. */
  function revealNode(id: string): void {
    const node = nodes.ref.current.find((n) => n.id === id);
    const size = paneSizeRef.current;
    if (!node || !size.width) return;
    const rect = rectOf(node, measuredRef.current);
    const v = viewport.ref.current;
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
    if (dx || dy) viewport.set({ ...v, x: v.x + dx, y: v.y + dy });
  }

  function complete(
    from: PendingConnection,
    node: string,
    port: string,
    kind: "source" | "target",
  ): void {
    setPending(null);
    if (node === from.node || kind === from.kind) {
      announce(text.cancelled);
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
    const exists = edges.ref.current.some(
      (e) =>
        e.source === c.source &&
        e.target === c.target &&
        portOf(e.source, e.sourcePort, "source") === c.sourcePort &&
        portOf(e.target, e.targetPort, "target") === c.targetPort,
    );
    if (exists || (isValidConnection && !isValidConnection(c))) {
      announce(text.cancelled);
      return;
    }
    if (autoConnect) {
      edges.set([
        ...edges.ref.current,
        {
          id: `${c.source}:${c.sourcePort}->${c.target}:${c.targetPort}`,
          source: c.source,
          sourcePort: c.sourcePort,
          target: c.target,
          targetPort: c.targetPort,
        },
      ]);
    }
    onConnect?.(c);
    announce(
      text.connected(
        renderedById.get(c.source)?.node.label ?? c.source,
        renderedById.get(c.target)?.node.label ?? c.target,
      ),
    );
  }

  /** Ends the pending connection on a node: its first port of the other kind. */
  function finishOn(id: string): void {
    const p = pendingRef.current;
    const r = renderedById.get(id);
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
    const p = pendingRef.current;
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

  // ── Pointer ──────────────────────────────────────────────────────────────────

  function capture(e: PointerEvent, next: Gesture): void {
    gesture.current = next;
    pane.current?.setPointerCapture?.(e.pointerId);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>): void {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as Element;
    const handle = target.closest<HTMLElement>("[data-flow-handle]");
    const nodeEl = target.closest<HTMLElement>("[data-flow-node]");
    const edgeEl = target.closest<HTMLElement>("[data-flow-edge]");
    const p = pendingRef.current;
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
      setPending({
        node: handle.dataset["node"] ?? "",
        port: handle.dataset["port"] ?? "",
        kind,
        to: screenToFlow(e.clientX, e.clientY),
        mode: "drag",
      });
      capture(e, {
        kind: "connect",
        pointer: e.pointerId,
        start,
        moved: false,
      });
      return;
    }

    if (e.button === 0 && edgeEl && !nodeEl) {
      const edge = edges.ref.current.find(
        (x) => x.id === edgeEl.dataset["edge"],
      );
      if (edge) {
        selectEdge(edge.id, e.shiftKey || e.metaKey || e.ctrlKey);
        pane.current?.focus({ preventScroll: true });
        onEdgeClick?.(edge);
      }
      return;
    }

    if (e.button === 0 && nodeEl && tool === "select") {
      const id = nodeEl.dataset["node"] ?? "";
      const inner = target.closest(NO_DRAG);
      if (inner && inner !== nodeEl && nodeEl.contains(inner)) return;
      const additive = e.shiftKey || e.metaKey || e.ctrlKey;
      if (!selectedNodes.ref.current.includes(id) || additive)
        selectNode(id, additive);
      const list = nodes.ref.current;
      const node = list.find((n) => n.id === id);
      if (!node || !interactive.ref.current || node.draggable === false) {
        gesture.current = null;
        return;
      }
      const selected = selectedNodes.ref.current;
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
      from: viewport.ref.current,
      moved: false,
    });
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>): void {
    const p = pendingRef.current;
    if (p && p.mode !== "keyboard") {
      setPending({ ...p, to: screenToFlow(e.clientX, e.clientY) });
    }
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointer) return;
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    g.moved = true;
    if (g.kind === "pan") {
      viewport.set({ x: g.from.x + dx, y: g.from.y + dy, zoom: g.from.zoom });
    } else if (g.kind === "drag") {
      const z = viewport.ref.current.zoom;
      const snap = snapToGrid ? gridSize : 0;
      const at = (v: number) =>
        snap ? Math.round(v / snap) * snap : Math.round(v);
      nodes.set(
        nodes.ref.current.map((n) => {
          const o = g.origins.get(n.id);
          return o ? { ...n, x: at(o.x + dx / z), y: at(o.y + dy / z) } : n;
        }),
      );
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>): void {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointer) return;
    // The release point counts as the last move (a quick flick may send none).
    if (e.type === "pointerup") onPointerMove(e);
    gesture.current = null;
    const el = pane.current;
    if (el?.hasPointerCapture?.(e.pointerId))
      el.releasePointerCapture(e.pointerId);

    if (g.kind === "connect") {
      const p = pendingRef.current;
      if (!p) return;
      if (!g.moved) {
        // A click on a handle: pick the other end with a second click.
        setPending({ ...p, mode: "click" });
        const r = renderedById.get(p.node);
        if (r) announce(text.connecting(r.node.label));
        return;
      }
      const hit = document.elementFromPoint?.(e.clientX, e.clientY);
      finishAt(
        hit?.closest<HTMLElement>("[data-flow-handle]") ?? null,
        hit?.closest<HTMLElement>("[data-flow-node]") ?? null,
      );
      return;
    }
    if (g.kind === "drag") {
      const node = nodes.ref.current.find((n) => n.id === g.node);
      if (!node) return;
      if (g.moved) onNodeDragEnd?.(node);
      else onNodeClick?.(node);
      return;
    }
    if (!g.moved && e.type === "pointerup") {
      selectedNodes.set([]);
      selectedEdges.set([]);
      onCanvasClick?.(screenToFlow(e.clientX, e.clientY));
    }
  }

  function onDoubleClick(e: MouseEvent<HTMLDivElement>): void {
    const nodeEl = (e.target as Element).closest<HTMLElement>(
      "[data-flow-node]",
    );
    const node =
      nodeEl && nodes.ref.current.find((n) => n.id === nodeEl.dataset["node"]);
    if (node) onNodeDoubleClick?.(node);
  }

  function onWheel(e: WheelEvent): void {
    const box = pane.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // A pinch arrives as ctrl + wheel with small deltas; a mouse wheel with ±100.
      const factor = Math.exp(
        -e.deltaY * (Math.abs(e.deltaY) < 50 ? 0.01 : 0.002),
      );
      zoomTo(viewport.ref.current.zoom * factor, {
        x: e.clientX - box.left,
        y: e.clientY - box.top,
      });
    } else if (panOnScroll) {
      e.preventDefault();
      const v = viewport.ref.current;
      viewport.set({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY });
    }
  }
  // React's wheel listener is passive: preventDefault needs a native one.
  const wheelRef = useRef(onWheel);
  wheelRef.current = onWheel;
  useEffect(() => {
    const el = pane.current;
    if (!el) return;
    const listener = (e: WheelEvent) => wheelRef.current(e);
    el.addEventListener("wheel", listener, { passive: false });
    return () => el.removeEventListener("wheel", listener);
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  function onPaneKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.isDefaultPrevented()) return;
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
        if (
          selectedNodes.ref.current.length ||
          selectedEdges.ref.current.length
        ) {
          e.preventDefault();
          deleteSelection();
        }
        break;
      case "Escape":
        if (pendingRef.current) cancelConnection();
        else {
          selectedNodes.set([]);
          selectedEdges.set([]);
        }
        break;
    }
  }

  function onNodeKeyDown(
    e: KeyboardEvent<HTMLDivElement>,
    r: SoneFlowRenderedNode,
  ): void {
    if (e.target !== e.currentTarget) return;
    const id = r.node.id;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (pendingRef.current) {
        finishOn(id);
        return;
      }
      selectNode(id, e.shiftKey);
      onNodeClick?.(r.node);
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
      setPending({
        node: id,
        port: out.id,
        kind: "source",
        to: {
          x: r.rect.x + r.rect.width + 60,
          y: r.rect.y + r.rect.height / 2,
        },
        mode: "keyboard",
      });
      announce(text.connecting(r.node.label));
      return;
    }
    const step = (e.shiftKey ? 5 : 1) * gridSize;
    const delta: Record<string, SoneFlowPoint> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const d = delta[e.key];
    if (d && interactive.ref.current && r.node.draggable !== false) {
      e.preventDefault();
      const moving = r.selected ? selectedNodes.ref.current : [id];
      nodes.set(
        nodes.ref.current.map((n) =>
          moving.includes(n.id) && n.draggable !== false
            ? { ...n, x: n.x + d.x, y: n.y + d.y }
            : n,
        ),
      );
      const moved = nodes.ref.current.find((n) => n.id === id);
      if (moved) {
        announce(text.moved(moved.label, moved.x, moved.y));
        revealNode(id);
        onNodeDragEnd?.(moved);
      }
    }
  }

  // ── Context and exposed API ──────────────────────────────────────────────────

  const api: SoneFlowApi = {
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
  };
  useImperativeHandle(ref, () => api);
  const context: SoneFlowContext = {
    ...api,
    viewport: viewport.value,
    zoom,
    paneSize,
    rendered,
    interactive: interactive.value,
    setInteractive: (value) => interactive.set(value),
    minZoom: () => minZoom,
    maxZoom: () => maxZoom,
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderBackground = () => {
    const v = viewport.value;
    const size = gridSize * v.zoom;
    const p = {
      size,
      x: ((v.x % size) + size) % size,
      y: ((v.y % size) + size) % size,
      dot: Math.max(0.6, Math.min(1.4, v.zoom)),
    };
    const mark =
      background === "dots" ? (
        <circle
          className="flow-background-dot"
          cx={p.size / 2}
          cy={p.size / 2}
          r={p.dot}
        />
      ) : background === "lines" ? (
        <path
          className="flow-background-line"
          d={`M ${p.size} 0 L 0 0 0 ${p.size}`}
        />
      ) : (
        <path
          className="flow-background-line"
          d={`M ${p.size / 2 - 3} ${p.size / 2} h 6 M ${p.size / 2} ${p.size / 2 - 3} v 6`}
        />
      );
    return (
      <svg className="flow-background" aria-hidden="true">
        <defs>
          <pattern
            id={`${uid}-grid`}
            patternUnits="userSpaceOnUse"
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size}
          >
            {mark}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-grid)`} />
      </svg>
    );
  };

  const renderEdges = () => (
    <svg key="edges" className="flow-edges" aria-hidden="true">
      <defs key="defs">
        {SONE_FLOW_TONES.map((tone) => (
          <marker
            key={tone}
            className="flow-marker"
            data-tone={tone}
            id={`${uid}-arrow-${tone}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        ))}
      </defs>
      {renderedEdges.map((e) => {
        const tone = e.selected ? "accent" : (e.edge.tone ?? "neutral");
        return (
          <g
            key={e.edge.id}
            className="flow-edge"
            data-flow-edge=""
            data-edge={e.edge.id}
            data-tone={tone}
            data-selected={flag(e.selected)}
            data-animated={flag(!!e.edge.animated)}
            data-dashed={flag(!!e.edge.dashed)}
          >
            <path className="flow-edge-hit" d={e.path.d} />
            <path
              className="flow-edge-path"
              d={e.path.d}
              markerEnd={
                e.edge.arrow === false
                  ? undefined
                  : `url(#${uid}-arrow-${tone})`
              }
            />
          </g>
        );
      })}
      {pendingPath ? (
        <path
          key="pending"
          className="flow-edge-path flow-edge-pending"
          d={pendingPath}
        />
      ) : null}
    </svg>
  );

  const renderEdgeLabels = () =>
    renderedEdges
      .filter((e) => e.edge.label)
      .map((e) => (
        <div
          key={`label-${e.edge.id}`}
          className="flow-edge-label"
          data-flow-edge=""
          aria-hidden="true"
          data-edge={e.edge.id}
          data-tone={e.edge.tone ?? "neutral"}
          data-selected={flag(e.selected)}
          style={{ left: `${e.path.labelX}px`, top: `${e.path.labelY}px` }}
        >
          {e.edge.label}
        </div>
      ));

  const renderDefaultBody = (r: SoneFlowRenderedNode) => {
    const node = r.node;
    return (
      <>
        {node.icon ? (
          <span className="flow-node-media" aria-hidden="true">
            <SoneIcon icon={node.icon} />
          </span>
        ) : null}
        <span className="flow-node-body">
          <span className="flow-node-label">{node.label}</span>
          {node.description ? (
            <span className="flow-node-description">{node.description}</span>
          ) : null}
        </span>
        {node.status ? (
          <span className="flow-node-status" aria-hidden="true">
            {node.status === "running" ? (
              <span className="flow-node-spinner" />
            ) : (
              <SoneIcon icon={STATUS_ICON[node.status]} />
            )}
          </span>
        ) : null}
      </>
    );
  };

  const renderNodeEl = (r: SoneFlowRenderedNode) => (
    <div
      key={r.node.id}
      className="flow-node"
      data-flow-node=""
      role="group"
      tabIndex={0}
      data-node={r.node.id}
      data-shape={r.node.shape ?? "card"}
      data-tone={r.node.tone ?? "neutral"}
      data-status={r.node.status ?? undefined}
      data-selected={flag(r.selected)}
      data-custom={flag(!!customNode)}
      aria-roledescription={text.node}
      aria-label={r.name}
      aria-describedby={hintId}
      style={{
        transform: `translate(${r.node.x}px, ${r.node.y}px)`,
        width: r.node.width != null ? `${r.node.width}px` : undefined,
      }}
      onKeyDown={(e) => onNodeKeyDown(e, r)}
      onFocus={(e) => {
        if (e.target === e.currentTarget) revealNode(r.node.id);
      }}
    >
      {customNode
        ? customNode({ node: r.node, selected: r.selected })
        : renderDefaultBody(r)}
      {r.ports.map((port) => (
        <button
          key={port.kind + port.id}
          className="flow-handle"
          data-flow-handle=""
          type="button"
          tabIndex={-1}
          data-node={r.node.id}
          data-port={port.id}
          data-kind={port.kind}
          data-side={port.side}
          data-connectable={flag(canConnectTo(port, r.node.id))}
          aria-label={portName(r, port)}
          style={{ "--flow-port-offset": String(port.offset) } as CSSProperties}
        >
          {port.label ? (
            <span className="flow-handle-label" aria-hidden="true">
              {port.label}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );

  const v = viewport.value;
  return (
    <SONE_FLOW.Provider value={context}>
      {createElement(
        "sone-flow",
        {
          "data-slot": "flow",
          role: "group",
          "aria-label": text.canvas,
          "data-tool": tool,
          "data-direction": direction,
          "data-interactive": flag(interactive.value),
          "data-connecting": flag(!!pending),
          ...rest,
        },
        <div
          ref={pane}
          className="flow-pane"
          data-slot="flow-pane"
          tabIndex={-1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
          onKeyDown={onPaneKeyDown}
        >
          {background !== "none" ? renderBackground() : null}
          <div
            className="flow-viewport"
            data-slot="flow-viewport"
            style={{
              transform: `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`,
            }}
          >
            {renderEdges()}
            {renderEdgeLabels()}
            {rendered.map(renderNodeEl)}
          </div>
        </div>,
        children,
        <span className="sr-only" id={hintId}>
          {text.instructions}
        </span>,
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>,
      )}
    </SONE_FLOW.Provider>
  );
}

export interface SoneFlowPanelOwnProps {
  readonly position?: SoneFlowPanelPosition;
}

/** `[soneFlowPanel]` — pins its content (a legend, a run button) to a corner or edge of the canvas. */
export const SoneFlowPanel = definePart<"div", SoneFlowPanelOwnProps>({
  name: "SoneFlowPanel",
  tag: "div",
  className: "flow-panel",
  slot: "flow-panel",
  props: ["position"],
  attrs: (p) => ({ "data-position": p.position || "top-left" }),
});
