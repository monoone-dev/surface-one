// Kept in step with packages/angular/flow/flow.geometry.ts — change both together.

import type {
  SoneFlowDirection,
  SoneFlowEdgeType,
  SoneFlowNode,
  SoneFlowPoint,
  SoneFlowPort,
  SoneFlowShape,
  SoneFlowSide,
  SoneFlowViewport,
} from "./types";

// Pure geometry of the flow canvas: port placement, edge paths, bounds, fitting.
// No DOM — the same numbers on the server and in the browser.

export interface SoneFlowSize {
  readonly width: number;
  readonly height: number;
}

export interface SoneFlowRect extends SoneFlowPoint, SoneFlowSize {}

/** A port with its side and its offset along that side (0–1). */
export interface SoneFlowPlacedPort {
  readonly id: string;
  readonly label: string | null;
  readonly kind: "source" | "target";
  readonly side: SoneFlowSide;
  readonly offset: number;
}

export interface SoneFlowEdgePath {
  readonly d: string;
  /** Where the label goes: the middle of the path. */
  readonly labelX: number;
  readonly labelY: number;
}

/** The size a node is drawn at before it is measured (and on the server). */
export const SONE_FLOW_SHAPE_SIZE: Readonly<
  Record<SoneFlowShape, SoneFlowSize>
> = {
  card: { width: 208, height: 56 },
  pill: { width: 160, height: 44 },
  circle: { width: 72, height: 72 },
  diamond: { width: 112, height: 112 },
  note: { width: 180, height: 96 },
};

export const SONE_FLOW_MIN_ZOOM = 0.25;
export const SONE_FLOW_MAX_ZOOM = 2;
export const SONE_FLOW_ZOOM_STEP = 1.2;

const NORMAL: Readonly<Record<SoneFlowSide, SoneFlowPoint>> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const toPort = (p: string | SoneFlowPort): SoneFlowPort =>
  typeof p === "string" ? { id: p } : p;

export function nodeShape(node: SoneFlowNode): SoneFlowShape {
  return node.shape ?? "card";
}

export function nodeInputs(node: SoneFlowNode): readonly SoneFlowPort[] {
  return (node.inputs ?? (nodeShape(node) === "note" ? [] : ["in"])).map(
    toPort,
  );
}

export function nodeOutputs(node: SoneFlowNode): readonly SoneFlowPort[] {
  return (node.outputs ?? (nodeShape(node) === "note" ? [] : ["out"])).map(
    toPort,
  );
}

/**
 * Every port of a node with its side and offset. Inputs default to the start of
 * the direction, outputs to its end; a diamond spreads several outputs over its
 * corners instead of along one side.
 */
export function placePorts(
  node: SoneFlowNode,
  direction: SoneFlowDirection,
): readonly SoneFlowPlacedPort[] {
  const horizontal = direction === "horizontal";
  const start: SoneFlowSide = horizontal ? "left" : "top";
  const end: SoneFlowSide = horizontal ? "right" : "bottom";
  const corners: readonly SoneFlowSide[] = horizontal
    ? ["right", "bottom", "top"]
    : ["bottom", "right", "left"];
  const diamond = nodeShape(node) === "diamond";

  const raw = [
    ...nodeInputs(node).map((p) => ({
      port: p,
      kind: "target" as const,
      side: p.side ?? start,
    })),
    ...nodeOutputs(node).map((p, i, all) => ({
      port: p,
      kind: "source" as const,
      side: p.side ?? (diamond && all.length > 1 ? corners[i % 3] : end),
    })),
  ];
  const perSide = new Map<SoneFlowSide, number>();
  for (const r of raw) perSide.set(r.side, (perSide.get(r.side) ?? 0) + 1);
  const seen = new Map<SoneFlowSide, number>();
  return raw.map((r) => {
    const i = seen.get(r.side) ?? 0;
    seen.set(r.side, i + 1);
    const n = perSide.get(r.side) ?? 1;
    return {
      id: r.port.id,
      label: r.port.label ?? null,
      kind: r.kind,
      side: r.side,
      // A diamond's ports sit on its corners: always the middle of a side.
      offset: diamond ? 0.5 : (i + 1) / (n + 1),
    };
  });
}

/** A port's point on the canvas. */
export function portPoint(
  node: SoneFlowNode,
  size: SoneFlowSize,
  port: SoneFlowPlacedPort,
): SoneFlowPoint {
  switch (port.side) {
    case "top":
      return { x: node.x + size.width * port.offset, y: node.y };
    case "bottom":
      return {
        x: node.x + size.width * port.offset,
        y: node.y + size.height,
      };
    case "left":
      return { x: node.x, y: node.y + size.height * port.offset };
    case "right":
      return {
        x: node.x + size.width,
        y: node.y + size.height * port.offset,
      };
  }
}

const round = (n: number): number => Math.round(n * 10) / 10;

/** The path of an edge from `s` (leaving through `sSide`) to `t` (entering through `tSide`). */
export function edgePath(
  type: SoneFlowEdgeType,
  s: SoneFlowPoint,
  sSide: SoneFlowSide,
  t: SoneFlowPoint,
  tSide: SoneFlowSide,
): SoneFlowEdgePath {
  if (type === "straight") {
    return {
      d: `M ${round(s.x)} ${round(s.y)} L ${round(t.x)} ${round(t.y)}`,
      labelX: round((s.x + t.x) / 2),
      labelY: round((s.y + t.y) / 2),
    };
  }
  if (type === "step") return stepPath(s, sSide, t, tSide);
  return bezierPath(s, sSide, t, tSide);
}

function bezierPath(
  s: SoneFlowPoint,
  sSide: SoneFlowSide,
  t: SoneFlowPoint,
  tSide: SoneFlowSide,
): SoneFlowEdgePath {
  const offset = (
    side: SoneFlowSide,
    from: SoneFlowPoint,
    to: SoneFlowPoint,
  ) => {
    const n = NORMAL[side];
    // How far the other end lies in front of this one, along the side's normal.
    const ahead = (to.x - from.x) * n.x + (to.y - from.y) * n.y;
    return ahead >= 0 ? Math.max(ahead * 0.5, 24) : 24 + 6 * Math.sqrt(-ahead);
  };
  const ns = NORMAL[sSide];
  const nt = NORMAL[tSide];
  const os = offset(sSide, s, t);
  const ot = offset(tSide, t, s);
  const c1 = { x: s.x + ns.x * os, y: s.y + ns.y * os };
  const c2 = { x: t.x + nt.x * ot, y: t.y + nt.y * ot };
  return {
    d:
      `M ${round(s.x)} ${round(s.y)} ` +
      `C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(t.x)} ${round(t.y)}`,
    // The cubic at t = 0.5.
    labelX: round((s.x + 3 * c1.x + 3 * c2.x + t.x) / 8),
    labelY: round((s.y + 3 * c1.y + 3 * c2.y + t.y) / 8),
  };
}

const STEP_GAP = 24;
const STEP_RADIUS = 8;

function stepPath(
  s: SoneFlowPoint,
  sSide: SoneFlowSide,
  t: SoneFlowPoint,
  tSide: SoneFlowSide,
): SoneFlowEdgePath {
  const ns = NORMAL[sSide];
  const nt = NORMAL[tSide];
  const p1 = { x: s.x + ns.x * STEP_GAP, y: s.y + ns.y * STEP_GAP };
  const p2 = { x: t.x + nt.x * STEP_GAP, y: t.y + nt.y * STEP_GAP };
  const sH = ns.x !== 0;
  const tH = nt.x !== 0;
  let points: SoneFlowPoint[];

  if (sH && tH) {
    const forward = ns.x > 0 ? p2.x >= p1.x : p2.x <= p1.x;
    if (forward && ns.x === -nt.x) {
      const mx = (s.x + t.x) / 2;
      points = [s, { x: mx, y: s.y }, { x: mx, y: t.y }, t];
    } else {
      const my = Math.abs(s.y - t.y) < 1 ? s.y + 64 : (s.y + t.y) / 2;
      points = [s, p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2, t];
    }
  } else if (!sH && !tH) {
    const forward = ns.y > 0 ? p2.y >= p1.y : p2.y <= p1.y;
    if (forward && ns.y === -nt.y) {
      const my = (s.y + t.y) / 2;
      points = [s, { x: s.x, y: my }, { x: t.x, y: my }, t];
    } else {
      const mx = Math.abs(s.x - t.x) < 1 ? s.x + 64 : (s.x + t.x) / 2;
      points = [s, p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2, t];
    }
  } else if (sH) {
    points = [s, p1, { x: p2.x, y: p1.y }, p2, t];
  } else {
    points = [s, p1, { x: p1.x, y: p2.y }, p2, t];
  }
  points = dedupe(points);
  const mid = midpoint(points);
  return {
    d: roundedPolyline(points),
    labelX: round(mid.x),
    labelY: round(mid.y),
  };
}

function dedupe(points: SoneFlowPoint[]): SoneFlowPoint[] {
  const out: SoneFlowPoint[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last.x - p.x) > 0.5 || Math.abs(last.y - p.y) > 0.5)
      out.push(p);
  }
  // Drop the middle of three collinear points.
  return out.filter((p, i) => {
    const a = out[i - 1];
    const b = out[i + 1];
    if (!a || !b) return true;
    return !(
      (Math.abs(a.x - p.x) < 0.5 && Math.abs(p.x - b.x) < 0.5) ||
      (Math.abs(a.y - p.y) < 0.5 && Math.abs(p.y - b.y) < 0.5)
    );
  });
}

function roundedPolyline(points: readonly SoneFlowPoint[]): string {
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const p = points[i];
    const b = points[i + 1];
    const r = Math.min(
      STEP_RADIUS,
      Math.hypot(p.x - a.x, p.y - a.y) / 2,
      Math.hypot(b.x - p.x, b.y - p.y) / 2,
    );
    const inX = p.x - Math.sign(p.x - a.x) * r;
    const inY = p.y - Math.sign(p.y - a.y) * r;
    const outX = p.x + Math.sign(b.x - p.x) * r;
    const outY = p.y + Math.sign(b.y - p.y) * r;
    d += ` L ${round(inX)} ${round(inY)} Q ${round(p.x)} ${round(p.y)} ${round(outX)} ${round(outY)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${round(last.x)} ${round(last.y)}`;
}

function midpoint(points: readonly SoneFlowPoint[]): SoneFlowPoint {
  let total = 0;
  for (let i = 1; i < points.length; i++)
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  let left = total / 2;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (left <= len && len > 0) {
      const k = left / len;
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    left -= len;
  }
  return points[0];
}

/** The box around every node, or `null` for none. */
export function flowBounds(
  rects: readonly SoneFlowRect[],
): SoneFlowRect | null {
  if (!rects.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function clampZoom(zoom: number, min: number, max: number): number {
  return Math.min(Math.max(zoom, min), max);
}

/** The viewport that shows `bounds` whole and centred in a pane of `pane`, `padding` px from its edges. */
export function fitViewport(
  bounds: SoneFlowRect,
  pane: SoneFlowSize,
  padding: number,
  minZoom: number,
  maxZoom: number,
): SoneFlowViewport {
  const w = Math.max(pane.width - padding * 2, 1);
  const h = Math.max(pane.height - padding * 2, 1);
  const zoom = clampZoom(
    Math.min(w / Math.max(bounds.width, 1), h / Math.max(bounds.height, 1)),
    minZoom,
    maxZoom,
  );
  return {
    x: round((pane.width - bounds.width * zoom) / 2 - bounds.x * zoom),
    y: round((pane.height - bounds.height * zoom) / 2 - bounds.y * zoom),
    zoom: Math.round(zoom * 1000) / 1000,
  };
}

/** The viewport after zooming to `zoom` around the pane point `at` (it stays put). */
export function zoomAround(
  v: SoneFlowViewport,
  zoom: number,
  at: SoneFlowPoint,
): SoneFlowViewport {
  const k = zoom / v.zoom;
  return {
    x: at.x - (at.x - v.x) * k,
    y: at.y - (at.y - v.y) * k,
    zoom,
  };
}
