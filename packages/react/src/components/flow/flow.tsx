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
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import {
  SONE_FLOW_MAX_ZOOM,
  SONE_FLOW_MIN_ZOOM,
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
  type FlowController,
  type FlowEvents,
  type FlowPendingConnection,
  type FlowSettings,
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

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "@surface-one/core/react/controllable";
import { definePart, flag } from "../../utils/part";
import { SoneIcon } from "../icon";

// The drawn nodes and edges, the node context and the API are shared with Vue; the
// behaviour behind them is core's flow controller.
export type {
  SoneFlowApi,
  SoneFlowNodeContext,
  SoneFlowRenderedEdge,
  SoneFlowRenderedNode,
} from "@surface-one/core";

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
}: SoneFlowProps): ReactElement {
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

  const text: SoneFlowLabels = flowLabels(messages, labels, ariaLabel);

  const pane = useRef<HTMLDivElement | null>(null);
  /** Measured node sizes, by id (the shape's default until measured). */
  const [measured, measuredRef, setMeasured] = useLatest<
    ReadonlyMap<string, SoneFlowSize>
  >(new Map());
  const [paneSize, paneSizeRef, setPaneSize] = useLatest<SoneFlowSize>({
    width: 0,
    height: 0,
  });
  const [pending, pendingRef, setPending] =
    useLatest<FlowPendingConnection | null>(null);
  const [announcement, announcementRef, setAnnouncement] = useLatest("");

  // The latest props for the controller, which is created once.
  const settings: FlowSettings = {
    direction,
    edgeType,
    gridSize,
    snapToGrid,
    tool,
    minZoom,
    maxZoom,
    fitView,
    panOnScroll,
    connectable,
    deletable,
    autoConnect,
    isValidConnection,
    labels: text,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const events: FlowEvents = {
    connect: (c) => onConnect?.(c),
    nodeClick: (n) => onNodeClick?.(n),
    nodeDoubleClick: (n) => onNodeDoubleClick?.(n),
    nodeDragEnd: (n) => onNodeDragEnd?.(n),
    edgeClick: (e) => onEdgeClick?.(e),
    canvasClick: (p) => onCanvasClick?.(p),
    nodesDelete: (n) => onNodesDelete?.(n),
    edgesDelete: (e) => onEdgesDelete?.(e),
  };
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const selectedWordRef = useRef(messages.flowSelected);
  selectedWordRef.current = messages.flowSelected;

  const models = {
    nodes,
    edges,
    viewport,
    selectedNodes,
    selectedEdges,
    interactive,
  };
  const modelsRef = useRef(models);
  modelsRef.current = models;

  const [flow] = useState<FlowController>(() => {
    const live = () => modelsRef.current;
    const store: FlowStore = {
      get nodes() {
        return live().nodes.ref.current;
      },
      set nodes(v) {
        live().nodes.set(v);
      },
      get edges() {
        return live().edges.ref.current;
      },
      set edges(v) {
        live().edges.set(v);
      },
      get viewport() {
        return live().viewport.ref.current;
      },
      set viewport(v) {
        live().viewport.set(v);
      },
      get selectedNodes() {
        return live().selectedNodes.ref.current;
      },
      set selectedNodes(v) {
        live().selectedNodes.set(v);
      },
      get selectedEdges() {
        return live().selectedEdges.ref.current;
      },
      set selectedEdges(v) {
        live().selectedEdges.set(v);
      },
      get interactive() {
        return live().interactive.ref.current;
      },
      get pending() {
        return pendingRef.current;
      },
      set pending(v) {
        setPending(v);
      },
      get measured() {
        return measuredRef.current;
      },
      set measured(v) {
        setMeasured(v);
      },
      get paneSize() {
        return paneSizeRef.current;
      },
      set paneSize(v) {
        setPaneSize(v);
      },
      get announcement() {
        return announcementRef.current;
      },
      set announcement(v) {
        setAnnouncement(v);
      },
    };
    const on = (): FlowEvents => eventsRef.current;
    return createFlowController({
      store,
      pane: () => pane.current,
      selectedWord: () => selectedWordRef.current,
      settings: () => settingsRef.current,
      events: {
        connect: (c) => on().connect(c),
        nodeClick: (n) => on().nodeClick(n),
        nodeDoubleClick: (n) => on().nodeDoubleClick(n),
        nodeDragEnd: (n) => on().nodeDragEnd(n),
        edgeClick: (e) => on().edgeClick(e),
        canvasClick: (pt) => on().canvasClick(pt),
        nodesDelete: (n) => on().nodesDelete(n),
        edgesDelete: (e) => on().edgesDelete(e),
      },
    });
  });

  const zoom = viewport.value.zoom;
  const rendered: readonly SoneFlowRenderedNode[] = renderFlowNodes({
    nodes: nodes.value,
    edges: edges.value,
    selectedNodes: selectedNodes.value,
    measured,
    direction,
    labels: text,
    selectedWord: messages.flowSelected,
  });
  const renderedEdges = renderFlowEdges(
    rendered,
    edges.value,
    selectedEdges.value,
    edgeType,
  );
  const pendingPath = pendingFlowPath(pending, rendered, edgeType);

  // ── Measurement (browser only) ───────────────────────────────────────────────

  useEffect(() => {
    flow.mount();
    return flow.unmount;
  }, [flow]);
  // New nodes: observing an element twice is a no-op.
  useEffect(() => flow.observeNodes());
  // Forget the sizes of removed nodes.
  useEffect(() => flow.pruneMeasured(), [nodes.value, flow]);

  // React's wheel listener is passive: preventDefault needs a native one.
  useEffect(() => {
    const el = pane.current;
    if (!el) return;
    el.addEventListener("wheel", flow.wheel, { passive: false });
    return () => el.removeEventListener("wheel", flow.wheel);
  }, [flow]);

  // ── Context and exposed API ──────────────────────────────────────────────────

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
    const p = flowPattern(viewport.value, gridSize);
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
      onKeyDown={(e) => flow.nodeKeyDown(e, r)}
      onFocus={(e) => {
        if (e.target === e.currentTarget) flow.revealNode(r.node.id);
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
          data-connectable={flag(flowCanConnectTo(pending, port, r.node.id))}
          aria-label={flowPortName(text, r, port)}
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
          onPointerDown={flow.pointerDown}
          onPointerMove={flow.pointerMove}
          onPointerUp={flow.pointerUp}
          onPointerCancel={flow.pointerUp}
          onDoubleClick={flow.doubleClick}
          onKeyDown={flow.paneKeyDown}
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
