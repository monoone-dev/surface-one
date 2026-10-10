import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
  type SlotsType,
  type VNode,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
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

/** What the `#node` slot receives. */
export interface SoneFlowNodeContext<D = unknown> {
  readonly node: SoneFlowNode<D>;
  readonly selected: boolean;
}

/**
 * The methods a template ref of `<SoneFlow>` exposes:
 * `const flow = useTemplateRef<SoneFlowApi>("flow")`.
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
  readonly viewport: Readonly<Ref<SoneFlowViewport>>;
  readonly zoom: ComputedRef<number>;
  /** The pane's size in px (0 × 0 on the server). */
  readonly paneSize: Readonly<Ref<SoneFlowSize>>;
  readonly rendered: ComputedRef<readonly SoneFlowRenderedNode[]>;
  readonly interactive: Readonly<Ref<boolean>>;
  setInteractive(value: boolean): void;
  minZoom(): number;
  maxZoom(): number;
}

export const SONE_FLOW: InjectionKey<SoneFlowContext> = Symbol("SoneFlow");

/** The `<SoneFlow>` a child sits in (throws outside one). */
export function useSoneFlow(): SoneFlowContext {
  const flow = inject(SONE_FLOW, null);
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

/**
 * `<sone-flow>` — a node canvas for diagrams and workflows. Nodes sit at `x`/`y` in
 * canvas units, edges join their ports with a bezier, step or straight path; the
 * canvas pans (drag the background, or scroll with `panOnScroll`), zooms (Ctrl / ⌘ +
 * wheel, a pinch, the controls) and fits its content. `v-model:nodes`, `:edges`,
 * `:viewport` and the selection are two-way: dragging a node, drawing a connection
 * or deleting writes them back. The `#node="{ node, selected }"` slot draws the body
 * of every node instead of the default icon, label and description.
 *
 * Children: `<SoneFlowControls>`, `<SoneFlowMinimap>`, `<SoneFlowPanel>` overlays and
 * a `<SoneDock>` sit on top of the canvas.
 */
export const SoneFlow = defineComponent({
  name: "SoneFlow",
  props: {
    nodes: {
      type: Array as PropType<readonly SoneFlowNode[]>,
      default: () => [],
    },
    edges: {
      type: Array as PropType<readonly SoneFlowEdge[]>,
      default: () => [],
    },
    viewport: {
      type: Object as PropType<SoneFlowViewport>,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
    selectedNodes: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    selectedEdges: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    /** `false` locks the canvas: no dragging, connecting or deleting (panning and zooming stay). */
    interactive: { type: Boolean, default: true },
    direction: {
      type: String as PropType<SoneFlowDirection>,
      default: "horizontal",
    },
    /** The path of edges that set no `type`. */
    edgeType: { type: String as PropType<SoneFlowEdgeType>, default: "bezier" },
    background: {
      type: String as PropType<SoneFlowBackground>,
      default: "dots",
    },
    gridSize: { type: Number, default: 20 },
    /** Snap dragged nodes to the grid. */
    snapToGrid: { type: Boolean, default: false },
    /** Dragging the background pans in both tools; `pan` also stops nodes from moving. */
    tool: { type: String as PropType<SoneFlowTool>, default: "select" },
    minZoom: { type: Number, default: SONE_FLOW_MIN_ZOOM },
    maxZoom: { type: Number, default: SONE_FLOW_MAX_ZOOM },
    /** Fit the nodes into view once they are first measured. */
    fitView: { type: Boolean, default: true },
    /** A plain wheel pans the canvas (otherwise it scrolls the page; Ctrl / ⌘ + wheel always zooms). */
    panOnScroll: { type: Boolean, default: false },
    connectable: { type: Boolean, default: true },
    deletable: { type: Boolean, default: true },
    /** Add the edge on `connect` (`false`: only emit it, the owner adds it). */
    autoConnect: { type: Boolean, default: true },
    isValidConnection: {
      type: Function as PropType<((c: SoneFlowConnection) => boolean) | null>,
      default: null,
    },
    /** The canvas's accessible name (default "Flow diagram"). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    labels: {
      type: Object as PropType<Partial<SoneFlowLabels>>,
      default: () => ({}),
    },
  },
  emits: {
    "update:nodes": (_v: readonly SoneFlowNode[]) => true,
    "update:edges": (_v: readonly SoneFlowEdge[]) => true,
    "update:viewport": (_v: SoneFlowViewport) => true,
    "update:selectedNodes": (_v: readonly string[]) => true,
    "update:selectedEdges": (_v: readonly string[]) => true,
    "update:interactive": (_v: boolean) => true,
    connect: (_c: SoneFlowConnection) => true,
    nodeClick: (_n: SoneFlowNode) => true,
    nodeDoubleClick: (_n: SoneFlowNode) => true,
    nodeDragEnd: (_n: SoneFlowNode) => true,
    edgeClick: (_e: SoneFlowEdge) => true,
    /** A click on the empty canvas, at that point in canvas units. */
    canvasClick: (_p: SoneFlowPoint) => true,
    nodesDelete: (_n: readonly SoneFlowNode[]) => true,
    edgesDelete: (_e: readonly SoneFlowEdge[]) => true,
  },
  slots: Object as SlotsType<{
    default?: () => VNode[];
    node?: (ctx: SoneFlowNodeContext) => VNode[];
  }>,
  setup(props, { emit, slots, expose }) {
    const messages = useSoneMessages();

    const nodes = useModel(
      () => props.nodes,
      (v) => emit("update:nodes", v),
    );
    const edges = useModel(
      () => props.edges,
      (v) => emit("update:edges", v),
    );
    const viewport = useModel(
      () => props.viewport,
      (v) => emit("update:viewport", v),
    );
    const selectedNodes = useModel(
      () => props.selectedNodes,
      (v) => emit("update:selectedNodes", v),
    );
    const selectedEdges = useModel(
      () => props.selectedEdges,
      (v) => emit("update:selectedEdges", v),
    );
    const interactive = useModel(
      () => props.interactive,
      (v) => emit("update:interactive", v),
    );

    const uid = `sone-flow-${useId()}`;
    const hintId = `${uid}-hint`;

    const text = computed<SoneFlowLabels>(() => {
      const m = messages.value;
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
        ...props.labels,
      };
      return props.ariaLabel ? { ...merged, canvas: props.ariaLabel } : merged;
    });

    const pane = ref<HTMLElement | null>(null);
    /** Measured node sizes, by id (the shape's default until measured). */
    const measured = shallowRef<ReadonlyMap<string, SoneFlowSize>>(new Map());
    const paneSize = shallowRef<SoneFlowSize>({ width: 0, height: 0 });
    const pending = shallowRef<PendingConnection | null>(null);
    const announcement = ref("");
    let gesture: Gesture | null = null;
    let fitted = false;

    const zoom = computed(() => viewport.value.zoom);

    const rendered = computed<readonly SoneFlowRenderedNode[]>(() => {
      const sizes = measured.value;
      const direction = props.direction;
      const selected = new Set(selectedNodes.value);
      const byId = new Map(nodes.value.map((n) => [n.id, n] as const));
      const outgoing = new Map<string, string[]>();
      for (const e of edges.value) {
        const target = byId.get(e.target);
        if (!target) continue;
        const list = outgoing.get(e.source) ?? [];
        list.push(e.label ? `${target.label} (${e.label})` : target.label);
        outgoing.set(e.source, list);
      }
      const t = text.value;
      const selectedWord = messages.value.flowSelected;
      return nodes.value.map((node) => {
        const fallback = SONE_FLOW_SHAPE_SIZE[nodeShape(node)];
        const size = sizes.get(node.id) ?? {
          width: node.width ?? fallback.width,
          height: fallback.height,
        };
        const isSelected = selected.has(node.id);
        const parts = [node.label];
        if (node.description) parts.push(node.description);
        if (node.status) parts.push(t.status[node.status]);
        const to = outgoing.get(node.id);
        if (to?.length) parts.push(t.connectsTo(to.join(", ")));
        if (isSelected) parts.push(selectedWord);
        return {
          node,
          rect: { x: node.x, y: node.y, ...size },
          ports: placePorts(node, direction),
          selected: isSelected,
          name: parts.join(", "),
        };
      });
    });

    const renderedById = computed(
      () => new Map(rendered.value.map((r) => [r.node.id, r] as const)),
    );

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
      const r = renderedById.value.get(node);
      return r && findPort(r, id, kind)?.id;
    };

    const renderedEdges = computed<readonly SoneFlowRenderedEdge[]>(() => {
      const byId = renderedById.value;
      const selected = new Set(selectedEdges.value);
      const out: SoneFlowRenderedEdge[] = [];
      for (const edge of edges.value) {
        const s = byId.get(edge.source);
        const t = byId.get(edge.target);
        if (!s || !t) continue;
        const sp = findPort(s, edge.sourcePort, "source");
        const tp = findPort(t, edge.targetPort, "target");
        if (!sp || !tp) continue;
        out.push({
          edge,
          selected: selected.has(edge.id),
          path: edgePath(
            edge.type ?? props.edgeType,
            portPoint(s.node, s.rect, sp),
            sp.side,
            portPoint(t.node, t.rect, tp),
            tp.side,
          ),
        });
      }
      return out;
    });

    /** The connection being drawn, as a path to the pointer. */
    const pendingPath = computed<string | null>(() => {
      const p = pending.value;
      if (!p) return null;
      const r = renderedById.value.get(p.node);
      const port = r && findPort(r, p.port, p.kind);
      if (!r || !port) return null;
      const from = portPoint(r.node, r.rect, port);
      const path =
        p.kind === "source"
          ? edgePath(props.edgeType, from, port.side, p.to, OPPOSITE[port.side])
          : edgePath(
              props.edgeType,
              p.to,
              OPPOSITE[port.side],
              from,
              port.side,
            );
      return path.d;
    });

    /** The background pattern's tile, in screen px. */
    const pattern = computed(() => {
      const v = viewport.value;
      const size = props.gridSize * v.zoom;
      return {
        size,
        x: ((v.x % size) + size) % size,
        y: ((v.y % size) + size) % size,
        dot: Math.max(0.6, Math.min(1.4, v.zoom)),
      };
    });

    // ── Measurement (browser only) ─────────────────────────────────────────────

    let paneObserver: ResizeObserver | null = null;
    let nodeObserver: ResizeObserver | null = null;

    const nodeElements = (): HTMLElement[] =>
      pane.value
        ? Array.from(
            pane.value.querySelectorAll<HTMLElement>(
              ":scope > .flow-viewport > [data-flow-node]",
            ),
          )
        : [];

    const maybeFit = (): void => {
      if (fitted || !props.fitView) return;
      const size = paneSize.value;
      if (!size.width || !size.height || !nodes.value.length) return;
      if (measured.value.size < nodes.value.length) return;
      fitted = true;
      fit();
    };

    onMounted(() => {
      const el = pane.value;
      if (!el || typeof ResizeObserver === "undefined") return;
      paneObserver = new ResizeObserver(() => {
        paneSize.value = { width: el.clientWidth, height: el.clientHeight };
        maybeFit();
      });
      paneObserver.observe(el);
      nodeObserver = new ResizeObserver((entries) => {
        const next = new Map(measured.value);
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          const id = node.dataset["node"];
          // offsetWidth / offsetHeight: the layout size, unaffected by the zoom transform.
          if (id)
            next.set(id, {
              width: node.offsetWidth,
              height: node.offsetHeight,
            });
        }
        measured.value = next;
        maybeFit();
      });
      for (const node of nodeElements()) nodeObserver.observe(node);
    });
    // New nodes: observing an element twice is a no-op.
    onUpdated(() => {
      if (nodeObserver)
        for (const node of nodeElements()) nodeObserver.observe(node);
    });
    onBeforeUnmount(() => {
      paneObserver?.disconnect();
      nodeObserver?.disconnect();
    });

    // Forget the sizes of removed nodes.
    watch(nodes, (list) => {
      const ids = new Set(list.map((n) => n.id));
      const sizes = measured.value;
      if ([...sizes.keys()].some((id) => !ids.has(id))) {
        measured.value = new Map([...sizes].filter(([id]) => ids.has(id)));
      }
    });

    // ── Public API ─────────────────────────────────────────────────────────────

    function fit(ids?: readonly string[]): void {
      const pick = ids ? new Set(ids) : null;
      const rects = rendered.value
        .filter((r) => !pick || pick.has(r.node.id))
        .map((r) => r.rect);
      const bounds = flowBounds(rects);
      const size = paneSize.value;
      if (!bounds || !size.width) return;
      viewport.set(
        fitViewport(
          bounds,
          size,
          FIT_PADDING,
          props.minZoom,
          Math.min(props.maxZoom, 1.25),
        ),
      );
    }

    function zoomTo(z: number, at?: SoneFlowPoint): void {
      const size = paneSize.value;
      const clamped = clampZoom(z, props.minZoom, props.maxZoom);
      viewport.set(
        zoomAround(
          viewport.value,
          clamped,
          at ?? { x: size.width / 2, y: size.height / 2 },
        ),
      );
    }

    const zoomIn = (): void => zoomTo(zoom.value * SONE_FLOW_ZOOM_STEP);
    const zoomOut = (): void => zoomTo(zoom.value / SONE_FLOW_ZOOM_STEP);

    function centerOn(point: SoneFlowPoint): void {
      const size = paneSize.value;
      const z = zoom.value;
      viewport.set({
        x: size.width / 2 - point.x * z,
        y: size.height / 2 - point.y * z,
        zoom: z,
      });
    }

    function screenToFlow(clientX: number, clientY: number): SoneFlowPoint {
      const box = pane.value?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const v = viewport.value;
      return {
        x: (clientX - box.left - v.x) / v.zoom,
        y: (clientY - box.top - v.y) / v.zoom,
      };
    }

    function visibleCenter(): SoneFlowPoint {
      const size = paneSize.value;
      const v = viewport.value;
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
      if (!interactive.value || !props.deletable) return;
      const nodeIds = new Set(
        nodes.value
          .filter(
            (n) => selectedNodes.value.includes(n.id) && n.deletable !== false,
          )
          .map((n) => n.id),
      );
      const edgeIds = new Set(selectedEdges.value);
      const removedNodes = nodes.value.filter((n) => nodeIds.has(n.id));
      const removedEdges = edges.value.filter(
        (e) =>
          (edgeIds.has(e.id) && e.deletable !== false) ||
          nodeIds.has(e.source) ||
          nodeIds.has(e.target),
      );
      if (!removedNodes.length && !removedEdges.length) return;
      const goneEdges = new Set(removedEdges.map((e) => e.id));
      nodes.set(nodes.value.filter((n) => !nodeIds.has(n.id)));
      edges.set(edges.value.filter((e) => !goneEdges.has(e.id)));
      selectedNodes.set([]);
      selectedEdges.set([]);
      if (removedNodes.length) emit("nodesDelete", removedNodes);
      if (removedEdges.length) emit("edgesDelete", removedEdges);
      announce(text.value.deleted(removedNodes.length + removedEdges.length));
    }

    function selectNode(id: string, additive = false): void {
      const current = selectedNodes.value;
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
      const current = selectedEdges.value;
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
      if (!pending.value) return;
      pending.value = null;
      announce(text.value.cancelled);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    const portName = (
      r: SoneFlowRenderedNode,
      port: SoneFlowPlacedPort,
    ): string => {
      const label = port.label ?? "";
      return port.kind === "source"
        ? text.value.connectFrom(r.node.label, label).trim()
        : text.value.connectTo(r.node.label, label).trim();
    };

    const canConnectTo = (port: SoneFlowPlacedPort, node: string): boolean => {
      const p = pending.value;
      return !!p && p.node !== node && p.kind !== port.kind;
    };

    const canDraw = (): boolean =>
      interactive.value && props.connectable && props.tool === "select";

    function announce(message: string): void {
      // Re-set even the same text, so it is spoken again.
      announcement.value = "";
      queueMicrotask(() => (announcement.value = message));
    }

    /** Pans just enough to bring a node inside the pane. */
    function revealNode(id: string): void {
      const r = renderedById.value.get(id);
      const size = paneSize.value;
      if (!r || !size.width) return;
      const v = viewport.value;
      const margin = 24;
      const left = r.rect.x * v.zoom + v.x;
      const top = r.rect.y * v.zoom + v.y;
      const right = left + r.rect.width * v.zoom;
      const bottom = top + r.rect.height * v.zoom;
      let dx = 0;
      let dy = 0;
      if (left < margin) dx = margin - left;
      else if (right > size.width - margin) dx = size.width - margin - right;
      if (top < margin) dy = margin - top;
      else if (bottom > size.height - margin)
        dy = size.height - margin - bottom;
      if (dx || dy) viewport.set({ ...v, x: v.x + dx, y: v.y + dy });
    }

    function complete(
      from: PendingConnection,
      node: string,
      port: string,
      kind: "source" | "target",
    ): void {
      pending.value = null;
      if (node === from.node || kind === from.kind) {
        announce(text.value.cancelled);
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
      const valid = props.isValidConnection;
      const exists = edges.value.some(
        (e) =>
          e.source === c.source &&
          e.target === c.target &&
          portOf(e.source, e.sourcePort, "source") === c.sourcePort &&
          portOf(e.target, e.targetPort, "target") === c.targetPort,
      );
      if (exists || (valid && !valid(c))) {
        announce(text.value.cancelled);
        return;
      }
      if (props.autoConnect) {
        edges.set([
          ...edges.value,
          {
            id: `${c.source}:${c.sourcePort}->${c.target}:${c.targetPort}`,
            source: c.source,
            sourcePort: c.sourcePort,
            target: c.target,
            targetPort: c.targetPort,
          },
        ]);
      }
      emit("connect", c);
      const byId = renderedById.value;
      announce(
        text.value.connected(
          byId.get(c.source)?.node.label ?? c.source,
          byId.get(c.target)?.node.label ?? c.target,
        ),
      );
    }

    /** Ends the pending connection on a node: its first port of the other kind. */
    function finishOn(id: string): void {
      const p = pending.value;
      const r = renderedById.value.get(id);
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
      const p = pending.value;
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

    function capture(e: PointerEvent, next: Gesture): void {
      gesture = next;
      pane.value?.setPointerCapture?.(e.pointerId);
    }

    function onPointerDown(e: PointerEvent): void {
      if (e.button !== 0 && e.button !== 1) return;
      const target = e.target as Element;
      const handle = target.closest<HTMLElement>("[data-flow-handle]");
      const nodeEl = target.closest<HTMLElement>("[data-flow-node]");
      const edgeEl = target.closest<HTMLElement>("[data-flow-edge]");
      const p = pending.value;
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
        pending.value = {
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
        const edge = edges.value.find((x) => x.id === edgeEl.dataset["edge"]);
        if (edge) {
          selectEdge(edge.id, e.shiftKey || e.metaKey || e.ctrlKey);
          pane.value?.focus({ preventScroll: true });
          emit("edgeClick", edge);
        }
        return;
      }

      if (e.button === 0 && nodeEl && props.tool === "select") {
        const id = nodeEl.dataset["node"] ?? "";
        const inner = target.closest(NO_DRAG);
        if (inner && inner !== nodeEl && nodeEl.contains(inner)) return;
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        if (!selectedNodes.value.includes(id) || additive)
          selectNode(id, additive);
        const node = nodes.value.find((n) => n.id === id);
        if (!node || !interactive.value || node.draggable === false) {
          gesture = null;
          return;
        }
        const moving = selectedNodes.value.includes(id)
          ? selectedNodes.value
          : [id];
        const origins = new Map(
          nodes.value
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
        from: viewport.value,
        moved: false,
      });
    }

    function onPointerMove(e: PointerEvent): void {
      const p = pending.value;
      if (p && p.mode !== "keyboard") {
        pending.value = { ...p, to: screenToFlow(e.clientX, e.clientY) };
      }
      const g = gesture;
      if (!g || e.pointerId !== g.pointer) return;
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      g.moved = true;
      if (g.kind === "pan") {
        viewport.set({ x: g.from.x + dx, y: g.from.y + dy, zoom: g.from.zoom });
      } else if (g.kind === "drag") {
        const z = zoom.value;
        const snap = props.snapToGrid ? props.gridSize : 0;
        const at = (v: number) =>
          snap ? Math.round(v / snap) * snap : Math.round(v);
        nodes.set(
          nodes.value.map((n) => {
            const o = g.origins.get(n.id);
            return o ? { ...n, x: at(o.x + dx / z), y: at(o.y + dy / z) } : n;
          }),
        );
      }
    }

    function onPointerUp(e: PointerEvent): void {
      const g = gesture;
      if (!g || e.pointerId !== g.pointer) return;
      // The release point counts as the last move (a quick flick may send none).
      if (e.type === "pointerup") onPointerMove(e);
      gesture = null;
      const el = pane.value;
      if (el?.hasPointerCapture?.(e.pointerId))
        el.releasePointerCapture(e.pointerId);

      if (g.kind === "connect") {
        const p = pending.value;
        if (!p) return;
        if (!g.moved) {
          // A click on a handle: pick the other end with a second click.
          pending.value = { ...p, mode: "click" };
          const r = renderedById.value.get(p.node);
          if (r) announce(text.value.connecting(r.node.label));
          return;
        }
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        finishAt(
          hit?.closest<HTMLElement>("[data-flow-handle]") ?? null,
          hit?.closest<HTMLElement>("[data-flow-node]") ?? null,
        );
        return;
      }
      if (g.kind === "drag") {
        const node = nodes.value.find((n) => n.id === g.node);
        if (!node) return;
        if (g.moved) emit("nodeDragEnd", node);
        else emit("nodeClick", node);
        return;
      }
      if (!g.moved && e.type === "pointerup") {
        selectedNodes.set([]);
        selectedEdges.set([]);
        emit("canvasClick", screenToFlow(e.clientX, e.clientY));
      }
    }

    function onDoubleClick(e: MouseEvent): void {
      const nodeEl = (e.target as Element).closest<HTMLElement>(
        "[data-flow-node]",
      );
      const node =
        nodeEl && nodes.value.find((n) => n.id === nodeEl.dataset["node"]);
      if (node) emit("nodeDoubleClick", node);
    }

    function onWheel(e: WheelEvent): void {
      const box = pane.value?.getBoundingClientRect() ?? { left: 0, top: 0 };
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // A pinch arrives as ctrl + wheel with small deltas; a mouse wheel with ±100.
        const factor = Math.exp(
          -e.deltaY * (Math.abs(e.deltaY) < 50 ? 0.01 : 0.002),
        );
        zoomTo(zoom.value * factor, {
          x: e.clientX - box.left,
          y: e.clientY - box.top,
        });
      } else if (props.panOnScroll) {
        e.preventDefault();
        const v = viewport.value;
        viewport.set({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY });
      }
    }

    // ── Keyboard ───────────────────────────────────────────────────────────────

    function onPaneKeydown(e: KeyboardEvent): void {
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
          if (selectedNodes.value.length || selectedEdges.value.length) {
            e.preventDefault();
            deleteSelection();
          }
          break;
        case "Escape":
          if (pending.value) cancelConnection();
          else {
            selectedNodes.set([]);
            selectedEdges.set([]);
          }
          break;
      }
    }

    function onNodeKeydown(e: KeyboardEvent, r: SoneFlowRenderedNode): void {
      if (e.target !== e.currentTarget) return;
      const id = r.node.id;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (pending.value) {
          finishOn(id);
          return;
        }
        selectNode(id, e.shiftKey);
        emit("nodeClick", r.node);
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
        pending.value = {
          node: id,
          port: out.id,
          kind: "source",
          to: {
            x: r.rect.x + r.rect.width + 60,
            y: r.rect.y + r.rect.height / 2,
          },
          mode: "keyboard",
        };
        announce(text.value.connecting(r.node.label));
        return;
      }
      const step = (e.shiftKey ? 5 : 1) * props.gridSize;
      const delta: Record<string, SoneFlowPoint> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      };
      const d = delta[e.key];
      if (d && interactive.value && r.node.draggable !== false) {
        e.preventDefault();
        const moving = r.selected ? selectedNodes.value : [id];
        nodes.set(
          nodes.value.map((n) =>
            moving.includes(n.id) && n.draggable !== false
              ? { ...n, x: n.x + d.x, y: n.y + d.y }
              : n,
          ),
        );
        const moved = nodes.value.find((n) => n.id === id);
        if (moved) {
          announce(text.value.moved(moved.label, moved.x, moved.y));
          revealNode(id);
          emit("nodeDragEnd", moved);
        }
      }
    }

    // ── Context and exposed API ────────────────────────────────────────────────

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
    provide(SONE_FLOW, {
      ...api,
      viewport,
      zoom,
      paneSize,
      rendered,
      interactive,
      setInteractive: (value) => interactive.set(value),
      minZoom: () => props.minZoom,
      maxZoom: () => props.maxZoom,
    });
    expose(api);

    // ── Render ─────────────────────────────────────────────────────────────────

    const renderBackground = () => {
      const p = pattern.value;
      let mark: VNode;
      switch (props.background) {
        case "dots":
          mark = h("circle", {
            class: "flow-background-dot",
            cx: p.size / 2,
            cy: p.size / 2,
            r: p.dot,
          });
          break;
        case "lines":
          mark = h("path", {
            class: "flow-background-line",
            d: `M ${p.size} 0 L 0 0 0 ${p.size}`,
          });
          break;
        default:
          mark = h("path", {
            class: "flow-background-line",
            d: `M ${p.size / 2 - 3} ${p.size / 2} h 6 M ${p.size / 2} ${p.size / 2 - 3} v 6`,
          });
      }
      return h("svg", { class: "flow-background", "aria-hidden": "true" }, [
        h("defs", [
          h(
            "pattern",
            {
              id: `${uid}-grid`,
              patternUnits: "userSpaceOnUse",
              x: p.x,
              y: p.y,
              width: p.size,
              height: p.size,
            },
            [mark],
          ),
        ]),
        h("rect", {
          width: "100%",
          height: "100%",
          fill: `url(#${uid}-grid)`,
        }),
      ]);
    };

    const renderEdges = () =>
      h("svg", { key: "edges", class: "flow-edges", "aria-hidden": "true" }, [
        h(
          "defs",
          { key: "defs" },
          SONE_FLOW_TONES.map((tone) =>
            h(
              "marker",
              {
                key: tone,
                class: "flow-marker",
                "data-tone": tone,
                id: `${uid}-arrow-${tone}`,
                viewBox: "0 0 10 10",
                refX: "8",
                refY: "5",
                markerWidth: "7",
                markerHeight: "7",
                markerUnits: "userSpaceOnUse",
                orient: "auto-start-reverse",
              },
              [h("path", { d: "M 0 0 L 10 5 L 0 10 z" })],
            ),
          ),
        ),
        ...renderedEdges.value.map((e) => {
          const tone = e.selected ? "accent" : (e.edge.tone ?? "neutral");
          return h(
            "g",
            {
              key: e.edge.id,
              class: "flow-edge",
              "data-flow-edge": "",
              "data-edge": e.edge.id,
              "data-tone": tone,
              "data-selected": flag(e.selected),
              "data-animated": flag(!!e.edge.animated),
              "data-dashed": flag(!!e.edge.dashed),
            },
            [
              h("path", { class: "flow-edge-hit", d: e.path.d }),
              h("path", {
                class: "flow-edge-path",
                d: e.path.d,
                "marker-end":
                  e.edge.arrow === false
                    ? undefined
                    : `url(#${uid}-arrow-${tone})`,
              }),
            ],
          );
        }),
        pendingPath.value
          ? h("path", {
              key: "pending",
              class: "flow-edge-path flow-edge-pending",
              d: pendingPath.value,
            })
          : null,
      ]);

    const renderEdgeLabels = () =>
      renderedEdges.value
        .filter((e) => e.edge.label)
        .map((e) =>
          h(
            "div",
            {
              key: `label-${e.edge.id}`,
              class: "flow-edge-label",
              "data-flow-edge": "",
              "aria-hidden": "true",
              "data-edge": e.edge.id,
              "data-tone": e.edge.tone ?? "neutral",
              "data-selected": flag(e.selected),
              style: { left: `${e.path.labelX}px`, top: `${e.path.labelY}px` },
            },
            e.edge.label,
          ),
        );

    const renderDefaultBody = (r: SoneFlowRenderedNode) => {
      const node = r.node;
      return [
        node.icon
          ? h(
              "span",
              { key: "media", class: "flow-node-media", "aria-hidden": "true" },
              [h(SoneIcon, { icon: node.icon })],
            )
          : null,
        h("span", { key: "body", class: "flow-node-body" }, [
          h("span", { class: "flow-node-label" }, node.label),
          node.description
            ? h("span", { class: "flow-node-description" }, node.description)
            : null,
        ]),
        node.status
          ? h(
              "span",
              {
                key: "status",
                class: "flow-node-status",
                "aria-hidden": "true",
              },
              [
                node.status === "running"
                  ? h("span", { class: "flow-node-spinner" })
                  : h(SoneIcon, { icon: STATUS_ICON[node.status] }),
              ],
            )
          : null,
      ];
    };

    const renderNode = (r: SoneFlowRenderedNode) => {
      const custom = slots.node;
      return h(
        "div",
        {
          key: r.node.id,
          class: "flow-node",
          "data-flow-node": "",
          role: "group",
          tabindex: "0",
          "data-node": r.node.id,
          "data-shape": r.node.shape ?? "card",
          "data-tone": r.node.tone ?? "neutral",
          "data-status": r.node.status ?? undefined,
          "data-selected": flag(r.selected),
          "data-custom": flag(!!custom),
          "aria-roledescription": text.value.node,
          "aria-label": r.name,
          "aria-describedby": hintId,
          style: {
            transform: `translate(${r.node.x}px, ${r.node.y}px)`,
            width: r.node.width != null ? `${r.node.width}px` : undefined,
          },
          onKeydown: (e: KeyboardEvent) => onNodeKeydown(e, r),
          onFocus: () => revealNode(r.node.id),
        },
        [
          ...(custom
            ? custom({ node: r.node, selected: r.selected })
            : renderDefaultBody(r)),
          ...r.ports.map((port) =>
            h(
              "button",
              {
                key: port.kind + port.id,
                class: "flow-handle",
                "data-flow-handle": "",
                type: "button",
                tabindex: "-1",
                "data-node": r.node.id,
                "data-port": port.id,
                "data-kind": port.kind,
                "data-side": port.side,
                "data-connectable": flag(canConnectTo(port, r.node.id)),
                "aria-label": portName(r, port),
                style: { "--flow-port-offset": String(port.offset) },
              },
              port.label
                ? [
                    h(
                      "span",
                      { class: "flow-handle-label", "aria-hidden": "true" },
                      port.label,
                    ),
                  ]
                : undefined,
            ),
          ),
        ],
      );
    };

    return () => {
      const v = viewport.value;
      return h(
        "sone-flow",
        {
          "data-slot": "flow",
          role: "group",
          "aria-label": text.value.canvas,
          "data-tool": props.tool,
          "data-direction": props.direction,
          "data-interactive": flag(interactive.value),
          "data-connecting": flag(!!pending.value),
        },
        [
          h(
            "div",
            {
              ref: pane,
              class: "flow-pane",
              "data-slot": "flow-pane",
              tabindex: "-1",
              onPointerdown: onPointerDown,
              onPointermove: onPointerMove,
              onPointerup: onPointerUp,
              onPointercancel: onPointerUp,
              onDblclick: onDoubleClick,
              onWheel,
              onKeydown: onPaneKeydown,
            },
            [
              props.background !== "none" ? renderBackground() : null,
              h(
                "div",
                {
                  class: "flow-viewport",
                  "data-slot": "flow-viewport",
                  style: {
                    transform: `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`,
                  },
                },
                [
                  renderEdges(),
                  ...renderEdgeLabels(),
                  ...rendered.value.map(renderNode),
                ],
              ),
            ],
          ),
          slots.default?.(),
          h("span", { class: "sr-only", id: hintId }, text.value.instructions),
          h(
            "span",
            { class: "sr-only", "aria-live": "polite" },
            announcement.value,
          ),
        ],
      );
    };
  },
});

/** `[soneFlowPanel]` — pins its content (a legend, a run button) to a corner or edge of the canvas. */
export const SoneFlowPanel = definePart({
  name: "SoneFlowPanel",
  tag: "div",
  className: "flow-panel",
  slot: "flow-panel",
  props: {
    position: {
      type: String as PropType<SoneFlowPanelPosition>,
      default: "top-left",
    },
  },
  attrs: (p) => ({ "data-position": p.position || "top-left" }),
});
