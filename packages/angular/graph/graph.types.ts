import type {
  GraphLayout,
  GraphLayoutRequest,
  GraphSceneShape,
} from "@surface-one/angular/graph-layout";

export type SoneGraphLayout = "force" | "clusters" | "layers";

export interface SoneGraphNode {
  id: string;
  label: string;
  /** A key of the graph's `tones` map; unknown or absent → the `default` tone. */
  tone?: string;
  shape?: GraphSceneShape;
  /** Drives the radius (square-root scale between `sizing.minR` and `sizing.maxR`). */
  size?: number;
  /** The column in the `layers` layout (ascending, left to right). */
  layer?: number;
}

/** An undirected link. Weights above 1 are scaled to the heaviest edge; 0..1 is used as is. */
export interface SoneGraphEdge {
  source: string;
  target: string;
  weight?: number;
  dashed?: boolean;
}

export interface SoneGraphData {
  nodes: readonly SoneGraphNode[];
  edges: readonly SoneGraphEdge[];
}

export interface SoneGraphSizing {
  minR: number;
  maxR: number;
}

/** A community of the `clusters` layout; `anchor` is its largest node, `null` for the unlinked block. */
export interface SoneGraphCluster {
  anchor: SoneGraphNode | null;
  count: number;
}

/** Facts the graph knows about a node, handed to `describe`. */
export interface SoneGraphNodeInfo {
  /** Links drawn to or from the node. */
  degree: number;
}

/**
 * Computes a layout somewhere else — typically a Web Worker that calls
 * `runGraphLayout(request)` from `@surface-one/angular/graph-layout` — and resolves
 * with the result. A result for an outdated request is dropped.
 */
export type SoneGraphLayoutStrategy = (
  request: GraphLayoutRequest,
) => GraphLayout | Promise<GraphLayout>;

export interface SoneGraphLabels {
  /** `aria-roledescription` of the canvas. */
  roleDescription: string;
  /** Accessible name of the controls toolbar. */
  controls: string;
  fit: string;
  fitLabel: string;
  zoomIn: string;
  zoomOut: string;
  list: string;
  listLabel: string;
  open: string;
  selectionCleared: string;
  /** Keyboard help, read as the canvas description. */
  instructions: string;
  /** Accessible name of the canvas when there is nothing to draw. */
  empty: string;
}

/** Tone name → custom property, or a comma-separated fallback chain of them. */
export type SoneGraphTones = Readonly<Record<string, string>>;

/**
 * The built-in tones: the `--graph-*` kinds plus `chart-1` … `chart-8`, each chart
 * colour falling back to a `--graph-*` token where the theme defines no `--chart-*`.
 */
export const SONE_GRAPH_TONES: SoneGraphTones = {
  default: "--chart-1, --graph-entity",
  entity: "--graph-entity",
  person: "--graph-person",
  project: "--graph-project",
  meeting: "--graph-meeting",
  note: "--graph-note",
  document: "--graph-document",
  folder: "--graph-folder",
  space: "--graph-space",
  "chart-1": "--chart-1, --graph-entity",
  "chart-2": "--chart-2, --graph-meeting",
  "chart-3": "--chart-3, --graph-note",
  "chart-4": "--chart-4, --graph-document",
  "chart-5": "--chart-5, --graph-folder",
  "chart-6": "--chart-6, --graph-space",
  "chart-7": "--chart-7, --graph-project",
  "chart-8": "--chart-8, --graph-ink",
};
