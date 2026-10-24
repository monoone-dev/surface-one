"use client";

import {
  createElement,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  GRAPH_ZOOM_STEP,
  SONE_GRAPH_SIZING,
  SONE_GRAPH_TONES,
  graphCards,
  graphClusterLabel,
  graphLayoutRequest,
  graphPickAnnouncement,
  graphScene,
  graphToneOf,
  prepareGraph,
  runGraphLayoutWith,
  type GraphSceneAnchor,
  type SoneGraphCardModel,
  type SoneGraphCluster,
  type SoneGraphData,
  type SoneGraphLabels,
  type SoneGraphLaidOut,
  type SoneGraphLayout,
  type SoneGraphLayoutStrategy,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
  type SoneGraphSizing,
  type SoneGraphTones,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { definePart } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneGraphCanvas, type SoneGraphCanvasHandle } from "./graph-canvas";
import { SoneGraphCard } from "./graph-card";
import { SoneGraphControls } from "./graph-controls";
import type { SoneGraphCardContext } from "./types";

/** `[soneGraphLegend]` — content for the controls' info panel (a legend, counts). */
export const SoneGraphLegend = definePart({
  name: "SoneGraphLegend",
  tag: "span",
  slot: "graph-legend",
});

/** What a `SoneGraph` ref exposes. */
export interface SoneGraphHandle {
  /** Zooms about the centre by `factor` (1.25 is one step in). */
  zoomBy(factor: number): void;
  /** Glides back to the view that fits every node. */
  fit(): void;
}

export interface SoneGraphProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly data?: SoneGraphData | null;
  readonly layout?: SoneGraphLayout;
  /** Extra or overriding tones: tone name → custom property, or a `"--a, --b"` fallback chain. */
  readonly tones?: SoneGraphTones;
  /** The radius range node sizes are mapped onto. */
  readonly sizing?: SoneGraphSizing;
  /** Column titles of the `layers` layout, by `layer`. */
  readonly layerLabels?: Readonly<Record<number, string>>;
  /** The title of a `clusters` community; return `""` for none (default: "<largest node> · n"). */
  readonly clusterLabel?: ((cluster: SoneGraphCluster) => string) | null;
  /** The meta line of a node's card, its list entry and its announcement (default: "3 links"). */
  readonly describe?:
    ((node: SoneGraphNode, info: SoneGraphNodeInfo) => string) | null;
  /** The canvas's accessible name; defaults to the node and link counts. */
  readonly label?: string | null;
  /** The counts in the controls panel; `""` hides them. */
  readonly summary?: string | null;
  readonly labels?: Partial<SoneGraphLabels>;
  /** Computes the layout elsewhere (a Web Worker); `null` lays out on the main thread. */
  readonly layoutStrategy?: SoneGraphLayoutStrategy | null;
  /** Shows the List button in the controls. */
  readonly listToggle?: boolean;
  /** The selected node id (controlled); `defaultSelected` when uncontrolled. */
  readonly selected?: string | null;
  readonly defaultSelected?: string | null;
  readonly onSelectedChange?: (id: string | null) => void;
  /** Renders the nodes as a list of buttons under the canvas. */
  readonly showList?: boolean;
  readonly defaultShowList?: boolean;
  readonly onShowListChange?: (value: boolean) => void;
  readonly onNodeOpen?: (id: string) => void;
  readonly onNodeHover?: (id: string | null) => void;
  /** Zoom in percent of the fitted view. */
  readonly onZoomChange?: (percent: number) => void;
  /** The controls' info panel: a `SoneGraphLegend`. */
  readonly children?: ReactNode;
  /** Replaces the body of the node card (title + meta); its position and Open action stay. */
  readonly renderCard?: (context: SoneGraphCardContext) => ReactNode;
  readonly ref?: Ref<SoneGraphHandle | null>;
}

const NO_TONES: SoneGraphTones = {};
const NO_LAYER_LABELS: Readonly<Record<number, string>> = {};
const NO_LABELS: Partial<SoneGraphLabels> = {};

/**
 * `<sone-graph>` — an interactive network diagram on a Canvas 2D: `force`, `clusters`
 * (communities with hulls) or `layers` (one column per `layer`) layouts; drag to pan,
 * wheel to zoom at the cursor, click to select and highlight the neighbourhood,
 * double-click or Enter to open; full keyboard support with spoken selections, an
 * optional node list, and colours read from the theme tokens. `children` fill the
 * controls' info panel (a `SoneGraphLegend`); `renderCard` replaces the body of the node
 * card. The layout runs only after hydration, so the server renders the frame.
 */
export function SoneGraph({
  data = null,
  layout = "force",
  tones = NO_TONES,
  sizing = SONE_GRAPH_SIZING,
  layerLabels = NO_LAYER_LABELS,
  clusterLabel: clusterLabelProp = null,
  describe: describeProp = null,
  label = null,
  summary = null,
  labels = NO_LABELS,
  layoutStrategy = null,
  listToggle = true,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  showList: showListProp,
  defaultShowList = false,
  onShowListChange,
  onNodeOpen,
  onNodeHover,
  onZoomChange,
  children,
  renderCard,
  ref,
  ...rest
}: SoneGraphProps): ReactElement {
  const m = useSoneMessages();
  const hintId = `sone-graph-${useId()}-hint`;
  const [selected, setSelected] = useControllable(
    selectedProp,
    defaultSelected,
    onSelectedChange,
  );
  const [showList, setShowList] = useControllable(
    showListProp,
    defaultShowList,
    onShowListChange,
  );
  const canvas = useRef<SoneGraphCanvasHandle | null>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [anchor, setAnchor] = useState<GraphSceneAnchor | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [browser, setBrowser] = useState(false);
  const [laidOut, setLaidOut] = useState<SoneGraphLaidOut | null>(null);
  const layoutSeq = useRef(0);

  const text: SoneGraphLabels = {
    roleDescription: m.graphRoleDescription,
    controls: m.graphControls,
    fit: m.graphFit,
    fitLabel: m.graphFitLabel,
    zoomIn: m.graphZoomIn,
    zoomOut: m.graphZoomOut,
    list: m.graphList,
    listLabel: m.graphListLabel,
    open: m.graphOpen,
    selectionCleared: m.graphSelectionCleared,
    instructions: m.graphInstructions,
    empty: m.graphEmpty,
    ...labels,
  };
  const describe =
    describeProp ??
    ((_node: SoneGraphNode, info: SoneGraphNodeInfo) =>
      m.graphLinks(info.degree));
  const clusterLabel = useMemo(
    () =>
      clusterLabelProp ??
      ((cluster: SoneGraphCluster) =>
        graphClusterLabel(cluster, m.graphUnlinked)),
    [clusterLabelProp, m],
  );
  const allTones = useMemo<SoneGraphTones>(
    () => ({ ...SONE_GRAPH_TONES, ...tones }),
    [tones],
  );

  const prepared = useMemo(() => prepareGraph(data), [data]);
  const request = useMemo(
    () => (browser ? graphLayoutRequest(prepared, layout, sizing) : null),
    [browser, prepared, layout, sizing],
  );
  const scene = useMemo(
    () => graphScene(laidOut, layerLabels, clusterLabel),
    [laidOut, layerLabels, clusterLabel],
  );

  useEffect(() => setBrowser(true), []);
  useEffect(() => {
    if (!request) return;
    const seq = ++layoutSeq.current;
    runGraphLayoutWith(request, layoutStrategy, (result) => {
      if (seq === layoutSeq.current) {
        setLaidOut({ prepared, request, layout: result });
      }
    });
  }, [request, prepared, layoutStrategy]);

  const state =
    prepared.nodes.length === 0
      ? "empty"
      : request && laidOut?.request === request
        ? "ready"
        : "pending";
  const selectedKey =
    selected !== null && prepared.index.has(selected) ? selected : null;
  const summaryText =
    summary ??
    `${m.graphNodes(prepared.nodes.length)} · ${m.graphLinks(prepared.edges.length)}`;
  const ariaLabel =
    label ??
    (prepared.nodes.length === 0 ? text.empty : m.graphLabel(summaryText));
  const cards = graphCards(prepared, selectedKey, anchor, describe, allTones);

  const zoomBy = (factor: number): void => canvas.current?.zoomBy(factor);
  const fit = (): void => canvas.current?.fit();
  useImperativeHandle(
    ref,
    () => ({
      zoomBy: (factor) => canvas.current?.zoomBy(factor),
      fit: () => canvas.current?.fit(),
    }),
    [],
  );

  const onPick = (id: string | null): void => {
    setSelected(id);
    setAnnouncement(
      graphPickAnnouncement(prepared, id, describe, text.selectionCleared),
    );
  };

  const card = (c: SoneGraphCardModel): ReactElement => (
    <SoneGraphCard
      key={c.pinned ? "pinned" : "hover"}
      pinned={c.pinned}
      anchor={c.anchor}
      heading={c.heading}
      meta={c.meta}
      tone={c.tone}
      square={c.square}
      openLabel={c.pinned ? text.open : null}
      onOpen={() => onNodeOpen?.(c.id)}
    >
      {renderCard?.({
        node: c.node,
        pinned: c.pinned,
        description: c.meta,
        tone: c.tone,
      })}
    </SoneGraphCard>
  );

  return createElement(
    "sone-graph",
    {
      "data-slot": "graph",
      "data-state": state,
      "data-layout": layout,
      ...rest,
    },
    <div className="g-frame" data-slot="graph-frame">
      <SoneGraphCanvas
        ref={canvas}
        className="g-canvas"
        role="application"
        aria-roledescription={text.roleDescription}
        aria-label={ariaLabel}
        aria-describedby={hintId}
        scene={scene}
        tones={allTones}
        selectedKey={selectedKey}
        onNodePick={onPick}
        onNodeOpen={(id) => onNodeOpen?.(id)}
        onNodeHover={(id) => onNodeHover?.(id)}
        onZoomChange={(pct) => {
          setZoomPct(pct);
          onZoomChange?.(pct);
        }}
        onAnchor={setAnchor}
      />
      <SoneGraphControls
        label={text.controls}
        zoomPct={zoomPct}
        list={listToggle ? showList : null}
        labels={text}
        onZoomIn={() => zoomBy(GRAPH_ZOOM_STEP)}
        onZoomOut={() => zoomBy(1 / GRAPH_ZOOM_STEP)}
        onFit={fit}
        onListChange={setShowList}
      >
        {children}
        {summaryText ? (
          <span data-slot="graph-summary">{summaryText}</span>
        ) : null}
      </SoneGraphControls>
      {cards.hover ? card(cards.hover) : null}
      {cards.pinned ? card(cards.pinned) : null}
    </div>,
    <span className="sr-only" id={hintId}>
      {text.instructions}
    </span>,
    <span className="sr-only" aria-live="polite">
      {announcement}
    </span>,
    showList ? (
      <ul className="g-list" data-slot="graph-list" aria-label={text.listLabel}>
        {prepared.nodes.map((node, i) => {
          const on = selectedKey === node.id;
          return (
            <li key={node.id} className="g-list-item">
              <SoneButton
                variant="ghost"
                size="sm"
                type="button"
                className="g-list-node"
                aria-pressed={on}
                onClick={() => onPick(on ? null : node.id)}
              >
                <span
                  className={
                    node.shape === "square" ? "g-swatch is-square" : "g-swatch"
                  }
                  style={{ background: graphToneOf(allTones, node) }}
                  aria-hidden="true"
                />
                <span className="g-list-label">{node.label}</span>
                <span className="g-list-meta">
                  {describe(node, { degree: prepared.degree[i] })}
                </span>
              </SoneButton>
              {on ? (
                <SoneButton
                  variant="outline"
                  size="xs"
                  type="button"
                  onClick={() => onNodeOpen?.(node.id)}
                >
                  {text.open}
                </SoneButton>
              ) : null}
            </li>
          );
        })}
      </ul>
    ) : null,
  );
}
