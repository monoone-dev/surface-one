// Kept in step with packages/angular/flow/flow.types.ts — change both together.

import type { ShellIcon } from "../icon";

export type SoneFlowTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "chart-7"
  | "chart-8";

export const SONE_FLOW_TONES: readonly SoneFlowTone[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
];

/** A node's outline: a card, a rounded start / end pill, a circle, a decision diamond or a sticky note. */
export type SoneFlowShape = "card" | "pill" | "circle" | "diamond" | "note";

export type SoneFlowNodeStatus = "running" | "success" | "error" | "warning";

export type SoneFlowSide = "top" | "right" | "bottom" | "left";

/** Inputs sit on the left and outputs on the right, or on the top and the bottom. */
export type SoneFlowDirection = "horizontal" | "vertical";

export type SoneFlowEdgeType = "bezier" | "step" | "straight";

export type SoneFlowBackground = "dots" | "lines" | "cross" | "none";

/** What dragging the empty canvas does: pan it (`pan`) or, with `select`, the same unless a node is hit. */
export type SoneFlowTool = "select" | "pan";

export type SoneFlowPanelPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** A connection point. A bare string is its id; `label` is spoken (and shown by the canvas). */
export interface SoneFlowPort {
  readonly id: string;
  readonly label?: string;
  /** The side of the node it sits on; by default inputs start and outputs end the direction. */
  readonly side?: SoneFlowSide;
}

export interface SoneFlowNode<D = unknown> {
  readonly id: string;
  /** Top-left corner, in canvas units. */
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly description?: string;
  readonly icon?: ShellIcon;
  readonly tone?: SoneFlowTone;
  readonly shape?: SoneFlowShape;
  readonly status?: SoneFlowNodeStatus;
  /** Default `["in"]` (a note: none). */
  readonly inputs?: readonly (string | SoneFlowPort)[];
  /** Default `["out"]` (a note: none). */
  readonly outputs?: readonly (string | SoneFlowPort)[];
  /** A fixed width in canvas units; the shape's default otherwise. */
  readonly width?: number;
  readonly draggable?: boolean;
  readonly deletable?: boolean;
  readonly data?: D;
}

export interface SoneFlowEdge {
  readonly id: string;
  readonly source: string;
  /** Default: the source's first output. */
  readonly sourcePort?: string;
  readonly target: string;
  /** Default: the target's first input. */
  readonly targetPort?: string;
  readonly label?: string;
  readonly type?: SoneFlowEdgeType;
  readonly tone?: SoneFlowTone;
  /** Dashes that run along the edge (still under reduced motion). */
  readonly animated?: boolean;
  readonly dashed?: boolean;
  /** An arrowhead at the target; default `true`. */
  readonly arrow?: boolean;
  readonly deletable?: boolean;
}

export interface SoneFlowViewport {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

export interface SoneFlowPoint {
  readonly x: number;
  readonly y: number;
}

/** What `(connect)` emits — and what `isValidConnection` is asked about. */
export interface SoneFlowConnection {
  readonly source: string;
  readonly sourcePort: string;
  readonly target: string;
  readonly targetPort: string;
}

/** The strings the canvas says. Override any of them through `[labels]`. */
export interface SoneFlowLabels {
  readonly canvas: string;
  readonly node: string;
  readonly instructions: string;
  readonly connectsTo: (targets: string) => string;
  readonly status: Readonly<Record<SoneFlowNodeStatus, string>>;
  readonly connectFrom: (node: string, port: string) => string;
  readonly connectTo: (node: string, port: string) => string;
  readonly connecting: (node: string) => string;
  readonly connected: (from: string, to: string) => string;
  readonly cancelled: string;
  readonly deleted: (count: number) => string;
  readonly moved: (node: string, x: number, y: number) => string;
}
