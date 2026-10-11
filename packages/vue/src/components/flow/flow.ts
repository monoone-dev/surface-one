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

import {
  SONE_FLOW_MIN_ZOOM,
  SONE_FLOW_MAX_ZOOM,
  SONE_FLOW_STATUS_ICON as STATUS_ICON,
  SONE_FLOW_TONES,
  createFlowController,
  flowCanConnectTo,
  flowLabels,
  flowPattern,
  flowPortName,
  pendingFlowPath,
  renderFlowEdges,
  renderFlowNodes,
  type FlowPendingConnection,
  type FlowStore,
  type SoneFlowApi,
  type SoneFlowBackground,
  type SoneFlowConnection,
  type SoneFlowDirection,
  type SoneFlowEdge,
  type SoneFlowEdgeType,
  type SoneFlowLabels,
  type SoneFlowNode,
  type SoneFlowNodeContext,
  type SoneFlowPanelPosition,
  type SoneFlowPoint,
  type SoneFlowRenderedNode,
  type SoneFlowSize,
  type SoneFlowTool,
  type SoneFlowViewport,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { definePart, flag } from "../../utils/part";
import { SoneIcon } from "../icon";

// The drawn nodes and edges, the slot context and the API are shared with React; the
// behaviour behind them is core's flow controller.
export type {
  SoneFlowApi,
  SoneFlowNodeContext,
  SoneFlowRenderedEdge,
  SoneFlowRenderedNode,
} from "@surface-one/core";

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

    const text = computed<SoneFlowLabels>(() =>
      flowLabels(messages.value, props.labels, props.ariaLabel),
    );

    const pane = ref<HTMLElement | null>(null);
    const measured = shallowRef<ReadonlyMap<string, SoneFlowSize>>(new Map());
    const paneSize = shallowRef<SoneFlowSize>({ width: 0, height: 0 });
    const pending = shallowRef<FlowPendingConnection | null>(null);
    const announcement = ref("");

    const store: FlowStore = {
      get nodes() {
        return nodes.value;
      },
      set nodes(v) {
        nodes.set(v);
      },
      get edges() {
        return edges.value;
      },
      set edges(v) {
        edges.set(v);
      },
      get viewport() {
        return viewport.value;
      },
      set viewport(v) {
        viewport.set(v);
      },
      get selectedNodes() {
        return selectedNodes.value;
      },
      set selectedNodes(v) {
        selectedNodes.set(v);
      },
      get selectedEdges() {
        return selectedEdges.value;
      },
      set selectedEdges(v) {
        selectedEdges.set(v);
      },
      get interactive() {
        return interactive.value;
      },
      get pending() {
        return pending.value;
      },
      set pending(v) {
        pending.value = v;
      },
      get measured() {
        return measured.value;
      },
      set measured(v) {
        measured.value = v;
      },
      get paneSize() {
        return paneSize.value;
      },
      set paneSize(v) {
        paneSize.value = v;
      },
      get announcement() {
        return announcement.value;
      },
      set announcement(v) {
        announcement.value = v;
      },
    };

    const flow = createFlowController({
      store,
      pane: () => pane.value,
      selectedWord: () => messages.value.flowSelected,
      settings: () => ({ ...props, labels: text.value }),
      events: {
        connect: (c) => emit("connect", c),
        nodeClick: (n) => emit("nodeClick", n),
        nodeDoubleClick: (n) => emit("nodeDoubleClick", n),
        nodeDragEnd: (n) => emit("nodeDragEnd", n),
        edgeClick: (e) => emit("edgeClick", e),
        canvasClick: (p) => emit("canvasClick", p),
        nodesDelete: (n) => emit("nodesDelete", n),
        edgesDelete: (e) => emit("edgesDelete", e),
      },
    });

    const zoom = computed(() => viewport.value.zoom);

    const rendered = computed<readonly SoneFlowRenderedNode[]>(() =>
      renderFlowNodes({
        nodes: nodes.value,
        edges: edges.value,
        selectedNodes: selectedNodes.value,
        measured: measured.value,
        direction: props.direction,
        labels: text.value,
        selectedWord: messages.value.flowSelected,
      }),
    );
    const renderedEdges = computed(() =>
      renderFlowEdges(
        rendered.value,
        edges.value,
        selectedEdges.value,
        props.edgeType,
      ),
    );
    const pendingPath = computed(() =>
      pendingFlowPath(pending.value, rendered.value, props.edgeType),
    );
    const pattern = computed(() => flowPattern(viewport.value, props.gridSize));

    // Measurement (browser only). New nodes: observing an element twice is a no-op.
    onMounted(flow.mount);
    onUpdated(flow.observeNodes);
    onBeforeUnmount(flow.unmount);
    // Forget the sizes of removed nodes.
    watch(nodes, flow.pruneMeasured);

    // ── Context and exposed API ────────────────────────────────────────────────

    const api: SoneFlowApi = {
      fit: flow.fit,
      zoomIn: flow.zoomIn,
      zoomOut: flow.zoomOut,
      zoomTo: flow.zoomTo,
      centerOn: flow.centerOn,
      screenToFlow: flow.screenToFlow,
      visibleCenter: flow.visibleCenter,
      focusNode: flow.focusNode,
      deleteSelection: flow.deleteSelection,
      selectNode: flow.selectNode,
      selectEdge: flow.selectEdge,
      cancelConnection: flow.cancelConnection,
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
          onKeydown: (e: KeyboardEvent) => flow.nodeKeyDown(e, r),
          onFocus: () => flow.revealNode(r.node.id),
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
                "data-connectable": flag(
                  flowCanConnectTo(pending.value, port, r.node.id),
                ),
                "aria-label": flowPortName(text.value, r, port),
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
              onPointerdown: flow.pointerDown,
              onPointermove: flow.pointerMove,
              onPointerup: flow.pointerUp,
              onPointercancel: flow.pointerUp,
              onDblclick: flow.doubleClick,
              onWheel: flow.wheel,
              onKeydown: flow.paneKeyDown,
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
