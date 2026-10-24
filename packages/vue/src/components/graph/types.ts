// The graph types and tones are packages/angular/graph/graph.types.ts itself, and the
// layout and canvas engine packages/angular/graph-layout, shared through the private
// core package (bundled into dist/_shared).
import type { SoneGraphNode } from "@surface-one/core";

export {
  GRAPH_ZOOM_STEP,
  SONE_GRAPH_SIZING,
  SONE_GRAPH_TONES,
  runGraphLayout,
  type GraphLayout,
  type GraphLayoutRequest,
  type GraphScene,
  type GraphSceneAnchor,
  type SoneGraphCluster,
  type SoneGraphData,
  type SoneGraphEdge,
  type SoneGraphLabels,
  type SoneGraphLayout,
  type SoneGraphLayoutStrategy,
  type SoneGraphNode,
  type SoneGraphNodeInfo,
  type SoneGraphSizing,
  type SoneGraphTones,
} from "@surface-one/core";

/** What the `card` slot of `<SoneGraph>` receives. */
export interface SoneGraphCardContext {
  readonly node: SoneGraphNode;
  readonly pinned: boolean;
  /** The `describe(node)` text. */
  readonly description: string;
  /** The custom property chain of the node's tone, as a CSS colour. */
  readonly tone: string;
}
