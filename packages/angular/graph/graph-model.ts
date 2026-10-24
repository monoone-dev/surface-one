// The model of `<sone-graph>`: the data cleaned into a layout request, the laid-out
// scene, the node cards and their placement, the spoken selection. Angular-free — the
// Vue and React twins share it through @surface-one/core (the layout and the canvas
// engine are `@surface-one/angular/graph-layout`, Angular-free as well).
import {
  EMPTY_GRAPH_SCENE,
  clamp,
  clipLabel,
  keyIndex,
  linkEnds,
  runGraphLayout,
  toneCss,
  type GraphLayout,
  type GraphLayoutRequest,
  type GraphScene,
  type GraphSceneAnchor,
  type GraphSceneEdge,
} from "@surface-one/angular/graph-layout";

import type {
  SoneGraphCluster,
  SoneGraphData,
  SoneGraphLayout,
  SoneGraphLayoutStrategy,
  SoneGraphNode,
  SoneGraphNodeInfo,
  SoneGraphSizing,
  SoneGraphTones,
} from "./graph.types";

/** The default radius range node sizes are mapped onto. */
export const SONE_GRAPH_SIZING: SoneGraphSizing = { minR: 3.5, maxR: 10 };

/** A `clusters` community gets a title from this many nodes on. */
export const SONE_GRAPH_CLUSTER_LABEL_MIN = 5;

/** The data with duplicate nodes and dangling links dropped, weights scaled, degrees counted. */
export interface SoneGraphPrepared {
  readonly nodes: SoneGraphNode[];
  /** Node id → its index in `nodes`. */
  readonly index: Map<string, number>;
  readonly edges: GraphSceneEdge[];
  /** Links drawn to or from each node, by index. */
  readonly degree: Int32Array;
}

/** A finished layout and what it was computed for. */
export interface SoneGraphLaidOut {
  readonly prepared: SoneGraphPrepared;
  readonly request: GraphLayoutRequest;
  readonly layout: GraphLayout;
}

/** A node card: where it floats, what it says and how its swatch looks. */
export interface SoneGraphCardModel {
  readonly id: string;
  readonly node: SoneGraphNode;
  readonly anchor: GraphSceneAnchor | null;
  readonly heading: string;
  /** The `describe(node)` text. */
  readonly meta: string;
  /** The custom property chain of the node's tone, as a CSS colour. */
  readonly tone: string;
  readonly square: boolean;
  readonly pinned: boolean;
}

/** Where a node card sits: above the node, below it near the top edge, or docked when pinned. */
export interface SoneGraphCardPlacement {
  /** CSS pixels from the frame's left edge, `null` when docked. */
  readonly left: number | null;
  /** CSS pixels from the frame's top edge, `null` when docked. */
  readonly top: number | null;
  readonly below: boolean;
}

const CARD_HALF_WIDTH = 132;
const CARD_TOP_CLEARANCE = 112;
const CARD_GAP = 10;

function finiteWeight(w: number | undefined): number {
  return w !== undefined && Number.isFinite(w) && w > 0 ? w : 0;
}

/** Cleans `data` for the layout: the first node of each id, links between known nodes. */
export function prepareGraph(
  data: SoneGraphData | null | undefined,
): SoneGraphPrepared {
  const nodes: SoneGraphNode[] = [];
  const seen = new Set<string>();
  for (const n of data?.nodes ?? []) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      nodes.push(n);
    }
  }
  const index = keyIndex(nodes.map((n) => ({ key: n.id })));
  const kept = (data?.edges ?? []).filter(
    (e) => linkEnds(index, e.source, e.target) !== null,
  );
  const heaviest = kept.reduce(
    (m, e) => Math.max(m, finiteWeight(e.weight)),
    1,
  );
  const degree = new Int32Array(nodes.length);
  const edges = kept.map((e): GraphSceneEdge => {
    degree[index.get(e.source) as number]++;
    degree[index.get(e.target) as number]++;
    return {
      a: e.source,
      b: e.target,
      weight: finiteWeight(e.weight) / heaviest,
      dashed: e.dashed ?? false,
    };
  });
  return { nodes, index, edges, degree };
}

/** What the layout of `prepared` is asked to compute. */
export function graphLayoutRequest(
  prepared: SoneGraphPrepared,
  kind: SoneGraphLayout,
  sizing: SoneGraphSizing,
): GraphLayoutRequest {
  return {
    kind,
    nodes: prepared.nodes.map((n) => ({
      key: n.id,
      size: n.size ?? 0,
      layer: n.layer ?? 0,
    })),
    edges: prepared.edges.map((e) => ({ a: e.a, b: e.b, weight: e.weight })),
    sizing,
  };
}

/**
 * Lays `request` out with `strategy` (a Web Worker, say) or on this thread, and hands
 * the result to `settle`. A strategy that fails falls back to the main thread; the
 * caller drops results for outdated requests.
 */
export function runGraphLayoutWith(
  request: GraphLayoutRequest,
  strategy: SoneGraphLayoutStrategy | null | undefined,
  settle: (layout: GraphLayout) => void,
): void {
  const result = strategy ? strategy(request) : runGraphLayout(request);
  if (typeof (result as Partial<Promise<GraphLayout>>).then === "function") {
    (result as Promise<GraphLayout>).then(settle, () =>
      settle(runGraphLayout(request)),
    );
  } else {
    settle(result as GraphLayout);
  }
}

/** The scene the canvas draws for a finished layout, with column and cluster titles. */
export function graphScene(
  done: SoneGraphLaidOut | null,
  layerLabels: Readonly<Record<number, string>>,
  clusterLabel: (cluster: SoneGraphCluster) => string,
): GraphScene {
  if (!done) return EMPTY_GRAPH_SCENE;
  const { prepared, request, layout } = done;
  const nodes = prepared.nodes;
  return {
    layered: request.kind === "layers",
    nodes: nodes.map((n, i) => ({
      key: n.id,
      label: n.label,
      tone: n.tone ?? "default",
      shape: n.shape ?? "circle",
      x: layout.x[i],
      y: layout.y[i],
      r: layout.r[i],
      side: layout.side[i],
      labelX: layout.labelX[i],
      column: request.nodes[i].layer,
      group: layout.group[i],
    })),
    edges: prepared.edges,
    columns: layout.columns.map((c) => ({
      label: layerLabels[c.layer] ?? "",
      count: c.count,
      x: c.x,
      top: c.top,
    })),
    clusters: layout.clusters.map((c) => ({
      label: clusterLabel({
        anchor: c.anchor < 0 ? null : nodes[c.anchor],
        count: c.count,
      }),
      cx: c.cx,
      top: c.top,
      hull: c.hull,
    })),
  };
}

/**
 * The default cluster title: `unlinked(count)` for the unlinked block, "<largest node> · n"
 * for a community of five or more, nothing for a smaller one.
 */
export function graphClusterLabel(
  cluster: SoneGraphCluster,
  unlinked: (count: number) => string,
): string {
  if (!cluster.anchor) return unlinked(cluster.count);
  return cluster.count >= SONE_GRAPH_CLUSTER_LABEL_MIN
    ? `${clipLabel(cluster.anchor.label, 24)} · ${cluster.count}`
    : "";
}

/** The CSS colour of a node's tone (unknown tones → `default`). */
export function graphToneOf(
  tones: SoneGraphTones,
  node: SoneGraphNode,
): string {
  return toneCss(tones[node.tone ?? "default"] ?? tones["default"] ?? "");
}

/** The card of node `id`, or `null` when there is no such node. */
export function graphCard(
  prepared: SoneGraphPrepared,
  id: string,
  anchor: GraphSceneAnchor | null,
  pinned: boolean,
  describe: (node: SoneGraphNode, info: SoneGraphNodeInfo) => string,
  tones: SoneGraphTones,
): SoneGraphCardModel | null {
  const at = prepared.index.get(id);
  if (at === undefined) return null;
  const node = prepared.nodes[at];
  return {
    id,
    node,
    anchor,
    heading: node.label,
    meta: describe(node, { degree: prepared.degree[at] }),
    tone: graphToneOf(tones, node),
    square: node.shape === "square",
    pinned,
  };
}

/**
 * The hover card (a node under the pointer that is not the selected one) and the pinned
 * card (the selected node, anchored while it is the one the canvas reports).
 */
export function graphCards(
  prepared: SoneGraphPrepared,
  selected: string | null,
  anchor: GraphSceneAnchor | null,
  describe: (node: SoneGraphNode, info: SoneGraphNodeInfo) => string,
  tones: SoneGraphTones,
): { hover: SoneGraphCardModel | null; pinned: SoneGraphCardModel | null } {
  const hover =
    anchor?.hovered && anchor.key !== selected
      ? graphCard(prepared, anchor.key, anchor, false, describe, tones)
      : null;
  const pinned =
    selected === null
      ? null
      : graphCard(
          prepared,
          selected,
          anchor?.key === selected ? anchor : null,
          true,
          describe,
          tones,
        );
  return { hover, pinned };
}

/** A floating card sits above its node (below it near the top edge), kept inside the frame. */
export function graphCardPlacement(
  anchor: GraphSceneAnchor | null,
  pinned: boolean,
): SoneGraphCardPlacement {
  const a = pinned ? null : anchor;
  const below = (a?.y ?? Infinity) < CARD_TOP_CLEARANCE;
  if (!a) return { left: null, top: null, below };
  return {
    left: clamp(
      a.x,
      CARD_HALF_WIDTH,
      Math.max(CARD_HALF_WIDTH, a.width - CARD_HALF_WIDTH),
    ),
    top: below ? a.y + a.r + CARD_GAP : a.y - a.r - CARD_GAP,
    below,
  };
}

/** The live-region text after a pick: "<label> — <describe>." or `cleared`. */
export function graphPickAnnouncement(
  prepared: SoneGraphPrepared,
  id: string | null,
  describe: (node: SoneGraphNode, info: SoneGraphNodeInfo) => string,
  cleared: string,
): string {
  const at = id === null ? undefined : prepared.index.get(id);
  if (at === undefined) return cleared;
  const node = prepared.nodes[at];
  return `${node.label} — ${describe(node, { degree: prepared.degree[at] })}.`;
}
