export type GraphSceneShape = "circle" | "square";

/** A node placed in world units, ready to paint. */
export interface GraphSceneNode {
  key: string;
  label: string;
  tone: string;
  shape: GraphSceneShape;
  x: number;
  y: number;
  r: number;
  /** Which side of its column the label goes (`-1` left, `1` right, `0` free placement). */
  side: number;
  labelX: number;
  column: number;
  group: number;
}

/** `weight` is 0..1 (line weight and opacity band). */
export interface GraphSceneEdge {
  a: string;
  b: string;
  weight: number;
  dashed: boolean;
}

export interface GraphSceneColumn {
  label: string;
  count: number;
  x: number;
  top: number;
}

export interface GraphSceneCluster {
  label: string;
  cx: number;
  top: number;
  hull: [number, number][];
}

export interface GraphScene {
  layered: boolean;
  nodes: GraphSceneNode[];
  edges: GraphSceneEdge[];
  columns: GraphSceneColumn[];
  clusters: GraphSceneCluster[];
}

/** Where the hovered (or else the selected) node is on screen, in CSS pixels of the canvas. */
export interface GraphSceneAnchor {
  key: string;
  hovered: boolean;
  x: number;
  y: number;
  r: number;
  width: number;
  height: number;
}

export const EMPTY_GRAPH_SCENE: GraphScene = {
  layered: false,
  nodes: [],
  edges: [],
  columns: [],
  clusters: [],
};
