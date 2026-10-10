import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneIconComponent } from "@surface-one/angular/icon";

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
} from "./flow.geometry";
import { SoneFlowNodeTemplateDirective } from "./flow-slots.directive";
import { SONE_FLOW } from "./flow.token";
import {
  SONE_FLOW_TONES,
  type SoneFlowBackground,
  type SoneFlowConnection,
  type SoneFlowDirection,
  type SoneFlowEdge,
  type SoneFlowEdgeType,
  type SoneFlowLabels,
  type SoneFlowNode,
  type SoneFlowPoint,
  type SoneFlowSide,
  type SoneFlowTool,
  type SoneFlowViewport,
} from "./flow.types";

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

const DEFAULT_LABELS: SoneFlowLabels = {
  canvas: $localize`:Accessible name of a flow canvas:Flow diagram`,
  node: $localize`:Role description of a node on a flow canvas:node`,
  instructions: $localize`:Keyboard help of a flow canvas:Tab moves between nodes. Arrow keys move the focused node, C starts a connection from it and Enter on another node finishes it, Delete removes the selection, plus and minus zoom.`,
  connectsTo: (targets) =>
    $localize`:A node's outgoing connections:connects to ${targets}:targets:`,
  status: {
    running: $localize`:Status of a flow node:running`,
    success: $localize`:Status of a flow node:succeeded`,
    error: $localize`:Status of a flow node:failed`,
    warning: $localize`:Status of a flow node:needs attention`,
  },
  connectFrom: (node, port) =>
    $localize`:Handle that starts a connection:Connect from ${node}:node: ${port}:port:`,
  connectTo: (node, port) =>
    $localize`:Handle that ends a connection:Connect to ${node}:node: ${port}:port:`,
  connecting: (node) =>
    $localize`:Announcement when a keyboard connection starts:Connecting from ${node}:node:. Move to another node and press Enter, or Escape to cancel.`,
  connected: (from, to) =>
    $localize`:Announcement after two nodes are connected:Connected ${from}:from: to ${to}:to:.`,
  cancelled: $localize`:Announcement when a connection is cancelled:Connection cancelled.`,
  deleted: (count) =>
    count === 1
      ? $localize`:Announcement after deleting from a flow:Deleted 1 item.`
      : $localize`:Announcement after deleting from a flow:Deleted ${count}:count: items.`,
  moved: (node, x, y) =>
    $localize`:Announcement after moving a node with the keyboard:${node}:node: moved to ${x}:x:, ${y}:y:.`,
};

const SELECTED = $localize`:Appended to a selected flow node's name:selected`;

let nextFlowId = 0;

/**
 * A node canvas for diagrams and workflows. Nodes sit at `x`/`y` in canvas units,
 * edges join their ports with a bezier, step or straight path; the canvas pans
 * (drag the background, or scroll with `panOnScroll`), zooms (Ctrl / ⌘ + wheel,
 * a pinch, the controls) and fits its content. `nodes`, `edges`, `viewport` and
 * the selection are two-way: dragging a node, drawing a connection or deleting
 * writes them back.
 *
 * Children: `<sone-flow-controls>`, `<sone-flow-minimap>`, `[soneFlowPanel]`
 * overlays and a `<sone-dock>` sit on top of the canvas.
 */
@Component({
  selector: "sone-flow",
  imports: [NgTemplateOutlet, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./flow.component.html",
  providers: [
    { provide: SONE_FLOW, useExisting: forwardRef(() => SoneFlowComponent) },
  ],
  host: {
    "data-slot": "flow",
    role: "group",
    "[attr.aria-label]": "text().canvas",
    "[attr.data-tool]": "tool()",
    "[attr.data-direction]": "direction()",
    "[attr.data-interactive]": "interactive() ? '' : null",
    "[attr.data-connecting]": "pending() ? '' : null",
  },
})
export class SoneFlowComponent {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly nodes = model<readonly SoneFlowNode[]>([]);
  readonly edges = model<readonly SoneFlowEdge[]>([]);
  readonly viewport = model<SoneFlowViewport>({ x: 0, y: 0, zoom: 1 });
  readonly selectedNodes = model<readonly string[]>([]);
  readonly selectedEdges = model<readonly string[]>([]);
  /** `false` locks the canvas: no dragging, connecting or deleting (panning and zooming stay). */
  readonly interactive = model(true);

  readonly direction = input<SoneFlowDirection>("horizontal");
  /** The path of edges that set no `type`. */
  readonly edgeType = input<SoneFlowEdgeType>("bezier");
  readonly background = input<SoneFlowBackground>("dots");
  readonly gridSize = input(20, { transform: numberAttribute });
  /** Snap dragged nodes to the grid. */
  readonly snapToGrid = input(false, { transform: booleanAttribute });
  /** Dragging the background pans in both tools; `pan` also stops nodes from moving. */
  readonly tool = input<SoneFlowTool>("select");
  readonly minZoom = input(SONE_FLOW_MIN_ZOOM, { transform: numberAttribute });
  readonly maxZoom = input(SONE_FLOW_MAX_ZOOM, { transform: numberAttribute });
  /** Fit the nodes into view once they are first measured. */
  readonly fitView = input(true, { transform: booleanAttribute });
  /** A plain wheel pans the canvas (otherwise it scrolls the page; Ctrl / ⌘ + wheel always zooms). */
  readonly panOnScroll = input(false, { transform: booleanAttribute });
  readonly connectable = input(true, { transform: booleanAttribute });
  readonly deletable = input(true, { transform: booleanAttribute });
  /** Add the edge on `(connect)` (`false`: only emit it, the owner adds it). */
  readonly autoConnect = input(true, { transform: booleanAttribute });
  readonly isValidConnection = input<
    ((c: SoneFlowConnection) => boolean) | null
  >(null);
  /** The canvas's accessible name (default "Flow diagram"). */
  readonly ariaLabel = input<string | null>(null);
  readonly labels = input<Partial<SoneFlowLabels>>({});

  readonly connect = output<SoneFlowConnection>();
  readonly nodeClick = output<SoneFlowNode>();
  readonly nodeDoubleClick = output<SoneFlowNode>();
  readonly nodeDragEnd = output<SoneFlowNode>();
  readonly edgeClick = output<SoneFlowEdge>();
  /** A click on the empty canvas, at that point in canvas units. */
  readonly canvasClick = output<SoneFlowPoint>();
  readonly nodesDelete = output<readonly SoneFlowNode[]>();
  readonly edgesDelete = output<readonly SoneFlowEdge[]>();

  protected readonly nodeTemplate = contentChild(SoneFlowNodeTemplateDirective);
  protected readonly pane = viewChild.required<ElementRef<HTMLElement>>("pane");
  private readonly nodeEls = viewChildren<ElementRef<HTMLElement>>("nodeEl");

  readonly uid = `sone-flow-${nextFlowId++}`;
  protected readonly hintId = `${this.uid}-hint`;
  protected readonly tones = SONE_FLOW_TONES;

  readonly text = computed<SoneFlowLabels>(() => {
    const merged = { ...DEFAULT_LABELS, ...this.labels() };
    const name = this.ariaLabel();
    return name ? { ...merged, canvas: name } : merged;
  });

  /** Measured node sizes, by id (the shape's default until measured). */
  private readonly measured = signal<ReadonlyMap<string, SoneFlowSize>>(
    new Map(),
  );
  /** The pane's size in px (0 × 0 on the server). */
  readonly paneSize = signal<SoneFlowSize>({ width: 0, height: 0 });
  readonly pending = signal<PendingConnection | null>(null);
  protected readonly announcement = signal("");
  private gesture: Gesture | null = null;
  private fitted = false;

  readonly zoom = computed(() => this.viewport().zoom);

  readonly rendered = computed<readonly SoneFlowRenderedNode[]>(() => {
    const sizes = this.measured();
    const direction = this.direction();
    const selected = new Set(this.selectedNodes());
    const byId = new Map(this.nodes().map((n) => [n.id, n] as const));
    const outgoing = new Map<string, string[]>();
    for (const e of this.edges()) {
      const target = byId.get(e.target);
      if (!target) continue;
      const list = outgoing.get(e.source) ?? [];
      list.push(e.label ? `${target.label} (${e.label})` : target.label);
      outgoing.set(e.source, list);
    }
    const t = this.text();
    return this.nodes().map((node) => {
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
      if (isSelected) parts.push(SELECTED);
      return {
        node,
        rect: { x: node.x, y: node.y, ...size },
        ports: placePorts(node, direction),
        selected: isSelected,
        name: parts.join(", "),
      };
    });
  });

  private readonly renderedById = computed(
    () => new Map(this.rendered().map((r) => [r.node.id, r] as const)),
  );

  readonly renderedEdges = computed<readonly SoneFlowRenderedEdge[]>(() => {
    const byId = this.renderedById();
    const selected = new Set(this.selectedEdges());
    const out: SoneFlowRenderedEdge[] = [];
    for (const edge of this.edges()) {
      const s = byId.get(edge.source);
      const t = byId.get(edge.target);
      if (!s || !t) continue;
      const sp = this.findPort(s, edge.sourcePort, "source");
      const tp = this.findPort(t, edge.targetPort, "target");
      if (!sp || !tp) continue;
      out.push({
        edge,
        selected: selected.has(edge.id),
        path: edgePath(
          edge.type ?? this.edgeType(),
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
  protected readonly pendingPath = computed<string | null>(() => {
    const p = this.pending();
    if (!p) return null;
    const r = this.renderedById().get(p.node);
    const port = r && this.findPort(r, p.port, p.kind);
    if (!r || !port) return null;
    const from = portPoint(r.node, r.rect, port);
    const opposite: Record<SoneFlowSide, SoneFlowSide> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    const path =
      p.kind === "source"
        ? edgePath(this.edgeType(), from, port.side, p.to, opposite[port.side])
        : edgePath(this.edgeType(), p.to, opposite[port.side], from, port.side);
    return path.d;
  });

  /** The box around every node, in canvas units. */
  readonly bounds = computed(() =>
    flowBounds(this.rendered().map((r) => r.rect)),
  );

  protected readonly viewportTransform = computed(() => {
    const v = this.viewport();
    return `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
  });

  /** The background pattern's tile, in screen px. */
  protected readonly pattern = computed(() => {
    const v = this.viewport();
    const size = this.gridSize() * v.zoom;
    return {
      size,
      x: ((v.x % size) + size) % size,
      y: ((v.y % size) + size) % size,
      dot: Math.max(0.6, Math.min(1.4, v.zoom)),
    };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const pane = this.pane().nativeElement;
      const paneObserver = new ResizeObserver(() => {
        this.paneSize.set({
          width: pane.clientWidth,
          height: pane.clientHeight,
        });
        this.maybeFit();
      });
      paneObserver.observe(pane);
      this.nodeObserver = new ResizeObserver((entries) => {
        const next = new Map(this.measured());
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset["node"];
          // offsetWidth / offsetHeight: the layout size, unaffected by the zoom transform.
          if (id)
            next.set(id, { width: el.offsetWidth, height: el.offsetHeight });
        }
        this.measured.set(next);
        this.maybeFit();
      });
      for (const el of this.nodeEls())
        this.nodeObserver.observe(el.nativeElement);
      destroyRef.onDestroy(() => {
        paneObserver.disconnect();
        this.nodeObserver?.disconnect();
      });
    });
    effect(() => {
      const els = this.nodeEls();
      const observer = this.nodeObserver;
      if (!observer) return;
      for (const el of els) observer.observe(el.nativeElement);
    });
    // Forget the sizes of removed nodes.
    effect(() => {
      const ids = new Set(this.nodes().map((n) => n.id));
      const sizes = untracked(this.measured);
      if ([...sizes.keys()].some((id) => !ids.has(id))) {
        this.measured.set(new Map([...sizes].filter(([id]) => ids.has(id))));
      }
    });
  }

  private nodeObserver: ResizeObserver | null = null;

  private maybeFit(): void {
    if (this.fitted || !this.fitView()) return;
    const pane = this.paneSize();
    if (!pane.width || !pane.height || !this.nodes().length) return;
    if (this.measured().size < this.nodes().length) return;
    this.fitted = true;
    this.fit();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Shows every node (or the given ones), centred. */
  fit(ids?: readonly string[]): void {
    const pick = ids ? new Set(ids) : null;
    const rects = this.rendered()
      .filter((r) => !pick || pick.has(r.node.id))
      .map((r) => r.rect);
    const bounds = flowBounds(rects);
    const pane = this.paneSize();
    if (!bounds || !pane.width) return;
    this.viewport.set(
      fitViewport(
        bounds,
        pane,
        FIT_PADDING,
        this.minZoom(),
        Math.min(this.maxZoom(), 1.25),
      ),
    );
  }

  zoomIn(): void {
    this.zoomTo(this.zoom() * SONE_FLOW_ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomTo(this.zoom() / SONE_FLOW_ZOOM_STEP);
  }

  /** Zooms around the pane's centre (or `at`, in pane px). */
  zoomTo(zoom: number, at?: SoneFlowPoint): void {
    const pane = this.paneSize();
    const z = clampZoom(zoom, this.minZoom(), this.maxZoom());
    this.viewport.set(
      zoomAround(
        this.viewport(),
        z,
        at ?? { x: pane.width / 2, y: pane.height / 2 },
      ),
    );
  }

  /** Centres the view on a point in canvas units, keeping the zoom. */
  centerOn(point: SoneFlowPoint): void {
    const pane = this.paneSize();
    const z = this.zoom();
    this.viewport.set({
      x: pane.width / 2 - point.x * z,
      y: pane.height / 2 - point.y * z,
      zoom: z,
    });
  }

  /** A point on the screen (a pointer event's client x / y) in canvas units — to drop a node there. */
  screenToFlow(clientX: number, clientY: number): SoneFlowPoint {
    const box = this.pane().nativeElement.getBoundingClientRect();
    const v = this.viewport();
    return {
      x: (clientX - box.left - v.x) / v.zoom,
      y: (clientY - box.top - v.y) / v.zoom,
    };
  }

  /** The centre of the visible area in canvas units — where a new node is placed from a toolbar. */
  visibleCenter(): SoneFlowPoint {
    const pane = this.paneSize();
    const v = this.viewport();
    return {
      x: (pane.width / 2 - v.x) / v.zoom,
      y: (pane.height / 2 - v.y) / v.zoom,
    };
  }

  /** Focuses a node (and scrolls it into view when it is outside the pane). */
  focusNode(id: string): void {
    const el = this.nodeEls().find(
      (e) => e.nativeElement.dataset["node"] === id,
    );
    el?.nativeElement.focus({ preventScroll: true });
    this.revealNode(id);
  }

  /** Removes the selected nodes (with their edges) and the selected edges. */
  deleteSelection(): void {
    if (!this.interactive() || !this.deletable()) return;
    const nodeIds = new Set(
      this.nodes()
        .filter(
          (n) => this.selectedNodes().includes(n.id) && n.deletable !== false,
        )
        .map((n) => n.id),
    );
    const edgeIds = new Set(this.selectedEdges());
    const removedNodes = this.nodes().filter((n) => nodeIds.has(n.id));
    const removedEdges = this.edges().filter(
      (e) =>
        (edgeIds.has(e.id) && e.deletable !== false) ||
        nodeIds.has(e.source) ||
        nodeIds.has(e.target),
    );
    if (!removedNodes.length && !removedEdges.length) return;
    const goneEdges = new Set(removedEdges.map((e) => e.id));
    this.nodes.set(this.nodes().filter((n) => !nodeIds.has(n.id)));
    this.edges.set(this.edges().filter((e) => !goneEdges.has(e.id)));
    this.selectedNodes.set([]);
    this.selectedEdges.set([]);
    if (removedNodes.length) this.nodesDelete.emit(removedNodes);
    if (removedEdges.length) this.edgesDelete.emit(removedEdges);
    this.announce(
      this.text().deleted(removedNodes.length + removedEdges.length),
    );
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  protected portName(
    r: SoneFlowRenderedNode,
    port: SoneFlowPlacedPort,
  ): string {
    const label = port.label ?? "";
    return port.kind === "source"
      ? this.text().connectFrom(r.node.label, label).trim()
      : this.text().connectTo(r.node.label, label).trim();
  }

  protected canConnectTo(port: SoneFlowPlacedPort, node: string): boolean {
    const p = this.pending();
    return !!p && p.node !== node && p.kind !== port.kind;
  }

  // ── Pointer ────────────────────────────────────────────────────────────────

  protected onPointerDown(e: PointerEvent): void {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as Element;
    const handle = target.closest<HTMLElement>("[data-flow-handle]");
    const nodeEl = target.closest<HTMLElement>("[data-flow-node]");
    const edgeEl = target.closest<HTMLElement>("[data-flow-edge]");
    const pending = this.pending();
    const start = { x: e.clientX, y: e.clientY };

    if (pending && pending.mode !== "drag") {
      e.preventDefault();
      if (handle || nodeEl) this.finishAt(handle, nodeEl);
      else this.cancelConnection();
      return;
    }

    if (e.button === 0 && handle && this.canDraw()) {
      e.preventDefault();
      const kind = handle.dataset["kind"] === "target" ? "target" : "source";
      this.pending.set({
        node: handle.dataset["node"] ?? "",
        port: handle.dataset["port"] ?? "",
        kind,
        to: this.screenToFlow(e.clientX, e.clientY),
        mode: "drag",
      });
      this.capture(e, {
        kind: "connect",
        pointer: e.pointerId,
        start,
        moved: false,
      });
      return;
    }

    if (e.button === 0 && edgeEl && !nodeEl) {
      const edge = this.edges().find((x) => x.id === edgeEl.dataset["edge"]);
      if (edge) {
        this.selectEdge(edge.id, e.shiftKey || e.metaKey || e.ctrlKey);
        this.pane().nativeElement.focus({ preventScroll: true });
        this.edgeClick.emit(edge);
      }
      return;
    }

    if (e.button === 0 && nodeEl && this.tool() === "select") {
      const id = nodeEl.dataset["node"] ?? "";
      const inner = target.closest(NO_DRAG);
      if (inner && inner !== nodeEl && nodeEl.contains(inner)) return;
      const additive = e.shiftKey || e.metaKey || e.ctrlKey;
      if (!this.selectedNodes().includes(id) || additive)
        this.selectNode(id, additive);
      const node = this.nodes().find((n) => n.id === id);
      if (!node || !this.interactive() || node.draggable === false) {
        this.gesture = null;
        return;
      }
      const moving = this.selectedNodes().includes(id)
        ? this.selectedNodes()
        : [id];
      const origins = new Map(
        this.nodes()
          .filter((n) => moving.includes(n.id) && n.draggable !== false)
          .map((n) => [n.id, { x: n.x, y: n.y }] as const),
      );
      this.capture(e, {
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
    this.capture(e, {
      kind: "pan",
      pointer: e.pointerId,
      start,
      from: this.viewport(),
      moved: false,
    });
  }

  protected onPointerMove(e: PointerEvent): void {
    const pending = this.pending();
    if (pending && pending.mode !== "keyboard") {
      this.pending.set({
        ...pending,
        to: this.screenToFlow(e.clientX, e.clientY),
      });
    }
    const g = this.gesture;
    if (!g || e.pointerId !== g.pointer) return;
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    g.moved = true;
    if (g.kind === "pan") {
      this.viewport.set({
        x: g.from.x + dx,
        y: g.from.y + dy,
        zoom: g.from.zoom,
      });
    } else if (g.kind === "drag") {
      const z = this.zoom();
      const snap = this.snapToGrid() ? this.gridSize() : 0;
      const at = (v: number) =>
        snap ? Math.round(v / snap) * snap : Math.round(v);
      this.nodes.set(
        this.nodes().map((n) => {
          const o = g.origins.get(n.id);
          return o ? { ...n, x: at(o.x + dx / z), y: at(o.y + dy / z) } : n;
        }),
      );
    }
  }

  protected onPointerUp(e: PointerEvent): void {
    const g = this.gesture;
    if (!g || e.pointerId !== g.pointer) return;
    // The release point counts as the last move (a quick flick may send none).
    if (e.type === "pointerup") this.onPointerMove(e);
    this.gesture = null;
    const pane = this.pane().nativeElement;
    if (pane.hasPointerCapture(e.pointerId))
      pane.releasePointerCapture(e.pointerId);

    if (g.kind === "connect") {
      const pending = this.pending();
      if (!pending) return;
      if (!g.moved) {
        // A click on a handle: pick the other end with a second click.
        this.pending.set({ ...pending, mode: "click" });
        const r = this.renderedById().get(pending.node);
        if (r) this.announce(this.text().connecting(r.node.label));
        return;
      }
      const hit = this.document.elementFromPoint(e.clientX, e.clientY);
      this.finishAt(
        hit?.closest<HTMLElement>("[data-flow-handle]") ?? null,
        hit?.closest<HTMLElement>("[data-flow-node]") ?? null,
      );
      return;
    }
    if (g.kind === "drag") {
      const node = this.nodes().find((n) => n.id === g.node);
      if (!node) return;
      if (g.moved) this.nodeDragEnd.emit(node);
      else this.nodeClick.emit(node);
      return;
    }
    if (!g.moved && e.type === "pointerup") {
      this.selectedNodes.set([]);
      this.selectedEdges.set([]);
      this.canvasClick.emit(this.screenToFlow(e.clientX, e.clientY));
    }
  }

  protected onDoubleClick(e: MouseEvent): void {
    const nodeEl = (e.target as Element).closest<HTMLElement>(
      "[data-flow-node]",
    );
    const node =
      nodeEl && this.nodes().find((n) => n.id === nodeEl.dataset["node"]);
    if (node) this.nodeDoubleClick.emit(node);
  }

  protected onWheel(e: WheelEvent): void {
    const box = this.pane().nativeElement.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // A pinch arrives as ctrl + wheel with small deltas; a mouse wheel with ±100.
      const factor = Math.exp(
        -e.deltaY * (Math.abs(e.deltaY) < 50 ? 0.01 : 0.002),
      );
      this.zoomTo(this.zoom() * factor, {
        x: e.clientX - box.left,
        y: e.clientY - box.top,
      });
    } else if (this.panOnScroll()) {
      e.preventDefault();
      const v = this.viewport();
      this.viewport.set({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY });
    }
  }

  private capture(e: PointerEvent, gesture: Gesture): void {
    this.gesture = gesture;
    this.pane().nativeElement.setPointerCapture?.(e.pointerId);
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  protected onPaneKeydown(e: KeyboardEvent): void {
    if (e.defaultPrevented) return;
    const typing = (e.target as Element).closest(
      "input, select, textarea, [contenteditable]",
    );
    if (typing) return;
    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        this.zoomIn();
        break;
      case "-":
      case "_":
        e.preventDefault();
        this.zoomOut();
        break;
      case "Delete":
      case "Backspace":
        if (this.selectedNodes().length || this.selectedEdges().length) {
          e.preventDefault();
          this.deleteSelection();
        }
        break;
      case "Escape":
        if (this.pending()) this.cancelConnection();
        else {
          this.selectedNodes.set([]);
          this.selectedEdges.set([]);
        }
        break;
    }
  }

  protected onNodeKeydown(e: KeyboardEvent, r: SoneFlowRenderedNode): void {
    if (e.target !== e.currentTarget) return;
    const id = r.node.id;
    const pending = this.pending();
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (pending) {
        this.finishOn(id);
        return;
      }
      this.selectNode(id, e.shiftKey);
      this.nodeClick.emit(r.node);
      return;
    }
    if (
      (e.key === "c" || e.key === "C") &&
      !e.metaKey &&
      !e.ctrlKey &&
      this.canDraw()
    ) {
      const out = r.ports.find((p) => p.kind === "source");
      if (!out) return;
      e.preventDefault();
      this.pending.set({
        node: id,
        port: out.id,
        kind: "source",
        to: {
          x: r.rect.x + r.rect.width + 60,
          y: r.rect.y + r.rect.height / 2,
        },
        mode: "keyboard",
      });
      this.announce(this.text().connecting(r.node.label));
      return;
    }
    const step = (e.shiftKey ? 5 : 1) * this.gridSize();
    const delta: Record<string, SoneFlowPoint> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const d = delta[e.key];
    if (d && this.interactive() && r.node.draggable !== false) {
      e.preventDefault();
      const moving = r.selected ? this.selectedNodes() : [id];
      this.nodes.set(
        this.nodes().map((n) =>
          moving.includes(n.id) && n.draggable !== false
            ? { ...n, x: n.x + d.x, y: n.y + d.y }
            : n,
        ),
      );
      const moved = this.nodes().find((n) => n.id === id);
      if (moved) {
        this.announce(this.text().moved(moved.label, moved.x, moved.y));
        this.revealNode(id);
        this.nodeDragEnd.emit(moved);
      }
    }
  }

  protected onNodeFocus(id: string): void {
    this.revealNode(id);
  }

  // ── Selection and connections ──────────────────────────────────────────────

  selectNode(id: string, additive = false): void {
    const current = this.selectedNodes();
    this.selectedNodes.set(
      additive
        ? current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id]
        : [id],
    );
    if (!additive) this.selectedEdges.set([]);
  }

  selectEdge(id: string, additive = false): void {
    const current = this.selectedEdges();
    this.selectedEdges.set(
      additive
        ? current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id]
        : [id],
    );
    if (!additive) this.selectedNodes.set([]);
  }

  cancelConnection(): void {
    if (!this.pending()) return;
    this.pending.set(null);
    this.announce(this.text().cancelled);
  }

  private canDraw(): boolean {
    return this.interactive() && this.connectable() && this.tool() === "select";
  }

  private finishAt(
    handle: HTMLElement | null,
    nodeEl: HTMLElement | null,
  ): void {
    const pending = this.pending();
    if (!pending) return;
    if (handle) {
      const kind = handle.dataset["kind"] === "target" ? "target" : "source";
      this.complete(
        pending,
        handle.dataset["node"] ?? "",
        handle.dataset["port"] ?? "",
        kind,
      );
    } else if (nodeEl) {
      this.finishOn(nodeEl.dataset["node"] ?? "");
    } else {
      this.cancelConnection();
    }
  }

  /** Ends the pending connection on a node: its first port of the other kind. */
  private finishOn(id: string): void {
    const pending = this.pending();
    const r = this.renderedById().get(id);
    if (!pending || !r) return;
    const want = pending.kind === "source" ? "target" : "source";
    const port = r.ports.find((p) => p.kind === want);
    if (!port) {
      this.cancelConnection();
      return;
    }
    this.complete(pending, id, port.id, want);
  }

  private complete(
    from: PendingConnection,
    node: string,
    port: string,
    kind: "source" | "target",
  ): void {
    this.pending.set(null);
    if (node === from.node || kind === from.kind) {
      this.announce(this.text().cancelled);
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
    const valid = this.isValidConnection();
    const exists = this.edges().some(
      (e) =>
        e.source === c.source &&
        e.target === c.target &&
        this.portOf(e.source, e.sourcePort, "source") === c.sourcePort &&
        this.portOf(e.target, e.targetPort, "target") === c.targetPort,
    );
    if (exists || (valid && !valid(c))) {
      this.announce(this.text().cancelled);
      return;
    }
    if (this.autoConnect()) {
      this.edges.set([
        ...this.edges(),
        {
          id: `${c.source}:${c.sourcePort}->${c.target}:${c.targetPort}`,
          source: c.source,
          sourcePort: c.sourcePort,
          target: c.target,
          targetPort: c.targetPort,
        },
      ]);
    }
    this.connect.emit(c);
    const byId = this.renderedById();
    this.announce(
      this.text().connected(
        byId.get(c.source)?.node.label ?? c.source,
        byId.get(c.target)?.node.label ?? c.target,
      ),
    );
  }

  private findPort(
    r: SoneFlowRenderedNode,
    id: string | undefined,
    kind: "source" | "target",
  ): SoneFlowPlacedPort | undefined {
    return id === undefined
      ? r.ports.find((p) => p.kind === kind)
      : r.ports.find((p) => p.kind === kind && p.id === id);
  }

  private portOf(
    node: string,
    id: string | undefined,
    kind: "source" | "target",
  ): string | undefined {
    const r = this.renderedById().get(node);
    return r && this.findPort(r, id, kind)?.id;
  }

  /** Pans just enough to bring a node inside the pane. */
  private revealNode(id: string): void {
    const r = this.renderedById().get(id);
    const pane = this.paneSize();
    if (!r || !pane.width) return;
    const v = this.viewport();
    const margin = 24;
    const left = r.rect.x * v.zoom + v.x;
    const top = r.rect.y * v.zoom + v.y;
    const right = left + r.rect.width * v.zoom;
    const bottom = top + r.rect.height * v.zoom;
    let dx = 0;
    let dy = 0;
    if (left < margin) dx = margin - left;
    else if (right > pane.width - margin) dx = pane.width - margin - right;
    if (top < margin) dy = margin - top;
    else if (bottom > pane.height - margin) dy = pane.height - margin - bottom;
    if (dx || dy) this.viewport.set({ ...v, x: v.x + dx, y: v.y + dy });
  }

  private announce(text: string): void {
    // Re-set even the same text, so it is spoken again.
    this.announcement.set("");
    queueMicrotask(() => this.announcement.set(text));
  }
}
