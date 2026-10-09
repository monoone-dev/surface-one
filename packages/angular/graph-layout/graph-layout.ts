import { emptyBounds, growBounds, jitter, type Bounds } from "./scene-math";

/** A node to place: `size` drives its radius, `layer` its column in `layoutLayers`. */
export interface GraphLayoutNode {
  key: string;
  size: number;
  layer: number;
}

/** An undirected link between two node keys; parallel links are merged and their weights summed. */
export interface GraphLayoutEdge {
  a: string;
  b: string;
  weight: number;
}

/** The radius range a node's `size` is mapped onto (square-root scale). */
export interface GraphLayoutSizing {
  minR: number;
  maxR: number;
}

export interface GraphLayoutColumn {
  layer: number;
  x: number;
  top: number;
  bottom: number;
  count: number;
}

/** A community found by `layoutClusters`; `anchor` is its largest node, `-1` for the unlinked block. */
export interface GraphLayoutCluster {
  anchor: number;
  count: number;
  hull: [number, number][];
  cx: number;
  top: number;
}

/** Positions indexed like the input nodes, in world units centred on the origin. */
export interface GraphLayout {
  x: Float64Array;
  y: Float64Array;
  r: Float64Array;
  labelX: Float64Array;
  side: Int8Array;
  group: Int32Array;
  columns: GraphLayoutColumn[];
  clusters: GraphLayoutCluster[];
}

export type GraphLayoutKind = "force" | "clusters" | "layers";

/** Everything a layout needs, as plain data — it can be posted to a Web Worker as is. */
export interface GraphLayoutRequest {
  kind: GraphLayoutKind;
  nodes: readonly GraphLayoutNode[];
  edges: readonly GraphLayoutEdge[];
  sizing: GraphLayoutSizing;
}

/** Maps every key to its position in `items`. */
export function keyIndex(
  items: readonly { readonly key: string }[],
): Map<string, number> {
  const index = new Map<string, number>();
  for (let i = 0; i < items.length; i++) {
    index.set(items[i].key, i);
  }
  return index;
}

/** The node indices an edge joins, or `null` for an unknown endpoint or a self-loop. */
export function linkEnds(
  index: ReadonlyMap<string, number>,
  a: string,
  b: string,
): [number, number] | null {
  const ia = index.get(a);
  const ib = index.get(b);
  return ia === undefined || ib === undefined || ia === ib ? null : [ia, ib];
}

interface Link {
  a: number;
  b: number;
  w: number;
}

const ROW_PITCH = 22;
const ROWS_PER_STRAND = 64;
const STRAND_GAP = 18;
const LAYER_GAP_MIN = 280;
const LAYER_GAP_MAX = 640;
const LAYER_ASPECT = 1.4;
const SWEEPS = 24;

const IDEAL_EDGE = 78;
const NODE_GAP = 16;
const CLUSTER_GAP = 72;
const CLUSTER_ASPECT = 1.6;
const EXACT_REPULSION_MAX = 380;
const HULL_MIN = 3;
const UNLINKED_CELL = 24;
const WIDE_SQUASH = 1.35;

function emptyLayout(n: number): GraphLayout {
  return {
    x: new Float64Array(n),
    y: new Float64Array(n),
    r: new Float64Array(n),
    labelX: new Float64Array(n),
    side: new Int8Array(n),
    group: new Int32Array(n).fill(-1),
    columns: [],
    clusters: [],
  };
}

function sizeOf(node: GraphLayoutNode): number {
  return Number.isFinite(node.size) ? Math.max(0, node.size) : 0;
}

function fillRadii(
  nodes: readonly GraphLayoutNode[],
  sizing: GraphLayoutSizing,
  out: Float64Array,
): void {
  let max = 1;
  for (const nd of nodes) {
    max = Math.max(max, sizeOf(nd));
  }
  const sqMax = Math.sqrt(max);
  for (let i = 0; i < nodes.length; i++) {
    out[i] =
      sizing.minR +
      (Math.sqrt(sizeOf(nodes[i])) / sqMax) * (sizing.maxR - sizing.minR);
  }
}

function resolveLinks(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
): Link[] {
  const n = nodes.length;
  const index = keyIndex(nodes);
  const merged = new Map<number, Link>();
  for (const e of edges) {
    const ends = linkEnds(index, e.a, e.b);
    if (!ends) {
      continue;
    }
    const lo = Math.min(ends[0], ends[1]);
    const hi = Math.max(ends[0], ends[1]);
    const w = Number.isFinite(e.weight) && e.weight > 0 ? e.weight : 0;
    const id = lo * n + hi;
    const hit = merged.get(id);
    if (hit) {
      hit.w += w;
    } else {
      merged.set(id, { a: lo, b: hi, w: 0.5 + w });
    }
  }
  return [...merged.values()];
}

function countInversions(seq: Int32Array): number {
  const n = seq.length;
  if (n < 2) {
    return 0;
  }
  let src = seq.slice();
  let dst = new Int32Array(n);
  let total = 0;
  for (let width = 1; width < n; width *= 2) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n);
      const hi = Math.min(lo + 2 * width, n);
      let i = lo;
      let j = mid;
      let k = lo;
      while (i < mid && j < hi) {
        if (src[i] <= src[j]) {
          dst[k++] = src[i++];
        } else {
          dst[k++] = src[j++];
          total += mid - i;
        }
      }
      while (i < mid) {
        dst[k++] = src[i++];
      }
      while (j < hi) {
        dst[k++] = src[j++];
      }
    }
    const swap = src;
    src = dst;
    dst = swap;
  }
  return total;
}

function crossingsOf(
  links: readonly Link[],
  slotOf: Int32Array,
  rank: Int32Array,
  slots: number,
): number {
  const buckets = new Map<number, [number, number][]>();
  for (const l of links) {
    const sa = slotOf[l.a];
    const sb = slotOf[l.b];
    if (sa === sb) {
      continue;
    }
    const pair: [number, number] =
      sa < sb ? [rank[l.a], rank[l.b]] : [rank[l.b], rank[l.a]];
    const id = Math.min(sa, sb) * slots + Math.max(sa, sb);
    const bucket = buckets.get(id);
    if (bucket) {
      bucket.push(pair);
    } else {
      buckets.set(id, [pair]);
    }
  }
  let total = 0;
  for (const bucket of buckets.values()) {
    bucket.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const seq = new Int32Array(bucket.length);
    for (let i = 0; i < bucket.length; i++) {
      seq[i] = bucket[i][1];
    }
    total += countInversions(seq);
  }
  return total;
}

interface LayerSlots {
  /** The distinct layers, ascending; a slot is an index into it. */
  present: number[];
  slotOf: Int32Array;
  /** The node indices of each slot, in input order. */
  members: number[][];
}

function layerSlots(nodes: readonly GraphLayoutNode[]): LayerSlots {
  const present = [...new Set(nodes.map((nd) => nd.layer))].sort(
    (a, b) => a - b,
  );
  const slotIndex = new Map(present.map((l, i) => [l, i]));
  const slotOf = new Int32Array(nodes.length);
  const members: number[][] = present.map(() => []);
  for (let i = 0; i < nodes.length; i++) {
    slotOf[i] = slotIndex.get(nodes[i].layer) as number;
    members[slotOf[i]].push(i);
  }
  return { present, slotOf, members };
}

/** Counts the edge crossings between adjacent columns when every column is ordered by `y`. */
export function countLayerCrossings(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  y: ArrayLike<number>,
): number {
  const n = nodes.length;
  const { present, slotOf, members: columns } = layerSlots(nodes);
  const rank = new Int32Array(n);
  for (const col of columns) {
    col.sort((a, b) => y[a] - y[b] || a - b);
    col.forEach((i, k) => (rank[i] = k));
  }
  return crossingsOf(resolveLinks(nodes, edges), slotOf, rank, present.length);
}

/**
 * One column per distinct `layer`, left to right; each column is ordered by weighted
 * barycentre sweeps that keep the order with the fewest crossings, and a crowded
 * column wraps into parallel strands.
 */
export function layoutLayers(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  sizing: GraphLayoutSizing,
): GraphLayout {
  const n = nodes.length;
  const out = emptyLayout(n);
  if (n === 0) {
    return out;
  }
  fillRadii(nodes, sizing, out.r);

  const { present, slotOf, members: order } = layerSlots(nodes);
  const slots = present.length;

  const links = resolveLinks(nodes, edges);
  const adj: { j: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const l of links) {
    adj[l.a].push({ j: l.b, w: l.w });
    adj[l.b].push({ j: l.a, w: l.w });
  }

  const linkedCount = new Int32Array(slots);
  for (let s = 0; s < slots; s++) {
    order[s].sort(
      (a, b) =>
        Number(adj[b].length > 0) - Number(adj[a].length > 0) ||
        sizeOf(nodes[b]) - sizeOf(nodes[a]) ||
        (nodes[a].key < nodes[b].key ? -1 : 1),
    );
    linkedCount[s] = order[s].filter((i) => adj[i].length > 0).length;
  }

  const strands = order.map((col) =>
    Math.max(1, Math.ceil(col.length / ROWS_PER_STRAND)),
  );
  const rank = new Int32Array(n);
  const place = (s: number): void => {
    const col = order[s];
    const step = ROW_PITCH / strands[s];
    for (let k = 0; k < col.length; k++) {
      rank[col[k]] = k;
      out.y[col[k]] = (k - (col.length - 1) / 2) * step;
    }
  };
  for (let s = 0; s < slots; s++) {
    place(s);
  }

  let best = order.map((col) => col.slice());
  let bestCrossings = crossingsOf(links, slotOf, rank, slots);
  for (let sweep = 0; sweep < SWEEPS && bestCrossings > 0; sweep++) {
    for (let step = 0; step < slots; step++) {
      const s = sweep % 2 === 0 ? step : slots - 1 - step;
      const col = order[s];
      const head = col.slice(0, linkedCount[s]);
      const bary = new Map<number, number>();
      for (const i of head) {
        let sum = 0;
        let wsum = 0;
        for (const { j, w } of adj[i]) {
          sum += out.y[j] * w;
          wsum += w;
        }
        bary.set(i, 0.8 * (sum / wsum) + 0.2 * out.y[i]);
      }
      head.sort(
        (a, b) =>
          (bary.get(a) as number) - (bary.get(b) as number) ||
          rank[a] - rank[b],
      );
      for (let k = 0; k < head.length; k++) {
        col[k] = head[k];
      }
      place(s);
    }
    const crossings = crossingsOf(links, slotOf, rank, slots);
    if (crossings < bestCrossings) {
      bestCrossings = crossings;
      best = order.map((col) => col.slice());
    }
  }
  for (let s = 0; s < slots; s++) {
    order[s] = best[s];
    place(s);
  }

  let tallest = ROW_PITCH;
  for (let s = 0; s < slots; s++) {
    tallest = Math.max(
      tallest,
      ((order[s].length - 1) * ROW_PITCH) / strands[s],
    );
  }
  const gap =
    slots > 1
      ? Math.min(
          LAYER_GAP_MAX,
          Math.max(LAYER_GAP_MIN, (tallest * LAYER_ASPECT) / (slots - 1)),
        )
      : 0;

  for (let s = 0; s < slots; s++) {
    const col = order[s];
    const cx = (s - (slots - 1) / 2) * gap;
    const k = strands[s];
    const side = s === 0 && slots > 1 ? -1 : 1;
    const half = ((k - 1) / 2) * STRAND_GAP;
    let top = Infinity;
    let bottom = -Infinity;
    for (let idx = 0; idx < col.length; idx++) {
      const i = col[idx];
      out.x[i] = cx + ((idx % k) - (k - 1) / 2) * STRAND_GAP;
      out.side[i] = side;
      out.group[i] = s;
      out.labelX[i] = cx + side * half;
      top = Math.min(top, out.y[i] - out.r[i]);
      bottom = Math.max(bottom, out.y[i] + out.r[i]);
    }
    out.columns.push({
      layer: present[s],
      x: cx,
      top,
      bottom,
      count: col.length,
    });
  }
  return out;
}

function detectCommunities(n: number, links: readonly Link[]): Int32Array {
  const membership = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    membership[i] = i;
  }
  let count = n;
  let level: Link[] = links.map((l) => ({ ...l }));
  for (let pass = 0; pass < 4; pass++) {
    const adj: { j: number; w: number }[][] = Array.from(
      { length: count },
      () => [],
    );
    const degree = new Float64Array(count);
    let total = 0;
    for (const l of level) {
      if (l.a === l.b) {
        degree[l.a] += 2 * l.w;
      } else {
        adj[l.a].push({ j: l.b, w: l.w });
        adj[l.b].push({ j: l.a, w: l.w });
        degree[l.a] += l.w;
        degree[l.b] += l.w;
      }
      total += 2 * l.w;
    }
    if (total <= 0) {
      break;
    }
    const community = new Int32Array(count);
    const mass = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      community[i] = i;
      mass[i] = degree[i];
    }
    let improved = false;
    for (let round = 0; round < 16; round++) {
      let moved = 0;
      for (let i = 0; i < count; i++) {
        const home = community[i];
        const toward = new Map<number, number>();
        for (const { j, w } of adj[i]) {
          toward.set(community[j], (toward.get(community[j]) ?? 0) + w);
        }
        mass[home] -= degree[i];
        let pick = home;
        let gain = (toward.get(home) ?? 0) - (mass[home] * degree[i]) / total;
        for (const [c, w] of toward) {
          const g = w - (mass[c] * degree[i]) / total;
          if (g > gain + 1e-9) {
            gain = g;
            pick = c;
          }
        }
        mass[pick] += degree[i];
        if (pick !== home) {
          community[i] = pick;
          moved++;
        }
      }
      if (moved === 0) {
        break;
      }
      improved = true;
    }
    if (!improved) {
      break;
    }
    const renumber = new Map<number, number>();
    for (let i = 0; i < count; i++) {
      if (!renumber.has(community[i])) {
        renumber.set(community[i], renumber.size);
      }
    }
    for (let i = 0; i < n; i++) {
      membership[i] = renumber.get(community[membership[i]]) as number;
    }
    if (renumber.size === count) {
      break;
    }
    const folded = new Map<number, Link>();
    for (const l of level) {
      const a = renumber.get(community[l.a]) as number;
      const b = renumber.get(community[l.b]) as number;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const id = lo * renumber.size + hi;
      const hit = folded.get(id);
      if (hit) {
        hit.w += l.w;
      } else {
        folded.set(id, { a: lo, b: hi, w: l.w });
      }
    }
    level = [...folded.values()];
    count = renumber.size;
  }
  return membership;
}

function settleCommunity(
  members: readonly number[],
  links: readonly Link[],
  r: Float64Array,
  x: Float64Array,
  y: Float64Array,
  wide: boolean,
): void {
  const m = members.length;
  const local = new Map<number, number>();
  members.forEach((g, l) => local.set(g, l));
  const pairs: Link[] = [];
  const degree = new Int32Array(m);
  for (const l of links) {
    const a = local.get(l.a);
    const b = local.get(l.b);
    if (a === undefined || b === undefined) {
      continue;
    }
    pairs.push({ a, b, w: l.w });
    degree[a]++;
    degree[b]++;
  }

  const lx = new Float64Array(m);
  const ly = new Float64Array(m);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const seed = IDEAL_EDGE * Math.sqrt(m) * 0.5;
  for (let i = 0; i < m; i++) {
    const rr = seed * Math.sqrt((i + 0.5) / m);
    lx[i] = rr * Math.cos(i * golden);
    ly[i] = rr * Math.sin(i * golden);
  }

  const k = IDEAL_EDGE;
  const k2 = k * k;
  const iters = Math.min(260, Math.max(80, Math.round(2600 / Math.sqrt(m))));
  let temp = k * 1.6;
  const cool = temp / (iters + 1);
  const fx = new Float64Array(m);
  const fy = new Float64Array(m);
  const exact = m <= EXACT_REPULSION_MAX;
  const cell = k * 2.4;
  const reach2 = cell * cell;

  const repel = (i: number, j: number): void => {
    let dx = lx[i] - lx[j];
    let dy = ly[i] - ly[j];
    let d2 = dx * dx + dy * dy;
    if (!exact && d2 > reach2) {
      return;
    }
    if (d2 < 0.01) {
      [dx, dy] = jitter(i, j);
      d2 = dx * dx + dy * dy;
    }
    const dist = Math.sqrt(d2);
    const force = k2 / dist;
    const ux = (dx / dist) * force;
    const uy = (dy / dist) * force;
    fx[i] += ux;
    fy[i] += uy;
    fx[j] -= ux;
    fy[j] -= uy;
  };

  for (let iter = 0; iter < iters; iter++) {
    fx.fill(0);
    fy.fill(0);
    if (exact) {
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          repel(i, j);
        }
      }
    } else {
      const grid = new Map<number, number[]>();
      const gx = new Int32Array(m);
      const gy = new Int32Array(m);
      for (let i = 0; i < m; i++) {
        gx[i] = Math.floor(lx[i] / cell);
        gy[i] = Math.floor(ly[i] / cell);
        const id = gx[i] * 73856093 + gy[i] * 19349663;
        const bucket = grid.get(id);
        if (bucket) {
          bucket.push(i);
        } else {
          grid.set(id, [i]);
        }
      }
      for (let i = 0; i < m; i++) {
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const bucket = grid.get(
              (gx[i] + ox) * 73856093 + (gy[i] + oy) * 19349663,
            );
            if (!bucket) {
              continue;
            }
            for (const j of bucket) {
              if (j > i) {
                repel(i, j);
              }
            }
          }
        }
      }
    }
    for (const p of pairs) {
      const dx = lx[p.a] - lx[p.b];
      const dy = ly[p.a] - ly[p.b];
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const hub = Math.sqrt(Math.min(degree[p.a] || 1, degree[p.b] || 1));
      const force = ((dist * dist) / k / hub) * (0.6 + 0.4 * Math.min(2, p.w));
      const ux = (dx / dist) * force;
      const uy = (dy / dist) * force;
      fx[p.a] -= ux;
      fy[p.a] -= uy;
      fx[p.b] += ux;
      fy[p.b] += uy;
    }
    const pull = exact ? 0.03 : 0.012;
    for (let i = 0; i < m; i++) {
      const len = Math.sqrt(fx[i] * fx[i] + fy[i] * fy[i]) || 1;
      const step = Math.min(len, temp);
      lx[i] += (fx[i] / len) * step;
      ly[i] += (fy[i] / len) * step;
      lx[i] -= lx[i] * pull;
      ly[i] -= ly[i] * pull * (wide ? WIDE_SQUASH : 1);
    }
    temp = Math.max(0, temp - cool);
  }

  if (wide && m > 2) {
    let mx = 0;
    let my = 0;
    for (let i = 0; i < m; i++) {
      mx += lx[i];
      my += ly[i];
    }
    mx /= m;
    my /= m;
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (let i = 0; i < m; i++) {
      xx += (lx[i] - mx) * (lx[i] - mx);
      xy += (lx[i] - mx) * (ly[i] - my);
      yy += (ly[i] - my) * (ly[i] - my);
    }
    const turn = -0.5 * Math.atan2(2 * xy, xx - yy);
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    for (let i = 0; i < m; i++) {
      const px = lx[i] - mx;
      const py = ly[i] - my;
      lx[i] = px * cos - py * sin;
      ly[i] = px * sin + py * cos;
    }
  }

  if (exact) {
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          let dx = lx[i] - lx[j];
          let dy = ly[i] - ly[j];
          let dist = Math.sqrt(dx * dx + dy * dy);
          const need = r[members[i]] + r[members[j]] + NODE_GAP;
          if (dist >= need) {
            continue;
          }
          if (dist < 0.01) {
            [dx, dy] = jitter(i, j);
            dist = Math.sqrt(dx * dx + dy * dy);
          }
          const push = (need - dist) / 2 / dist;
          lx[i] += dx * push;
          ly[i] += dy * push;
          lx[j] -= dx * push;
          ly[j] -= dy * push;
          moved = true;
        }
      }
      if (!moved) {
        break;
      }
    }
  }

  const box = emptyBounds();
  for (let i = 0; i < m; i++) {
    growBounds(box, lx[i], ly[i]);
  }
  const mx = (box.minX + box.maxX) / 2;
  const my = (box.minY + box.maxY) / 2;
  for (let i = 0; i < m; i++) {
    x[members[i]] = lx[i] - mx;
    y[members[i]] = ly[i] - my;
  }
}

function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) {
    return points.slice();
  }
  const pts = points.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (
    o: [number, number],
    a: [number, number],
    b: [number, number],
  ): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

interface Disc {
  members: number[];
  radius: number;
  cx: number;
  cy: number;
}

function packDiscs(discs: Disc[], affinity: Map<number, number>): void {
  const placed: number[] = [];
  const pairId = (a: number, b: number): number =>
    Math.min(a, b) * discs.length + Math.max(a, b);
  const fits = (c: number, px: number, py: number): boolean => {
    for (const p of placed) {
      const need = discs[c].radius + discs[p].radius + CLUSTER_GAP;
      const dx = px - discs[p].cx;
      const dy = py - discs[p].cy;
      if (dx * dx + dy * dy < need * need - 0.5) {
        return false;
      }
    }
    return true;
  };
  for (let c = 0; c < discs.length; c++) {
    if (placed.length === 0) {
      placed.push(c);
      continue;
    }
    let tx = 0;
    let ty = 0;
    let pull = 0;
    for (const p of placed) {
      const w = affinity.get(pairId(c, p)) ?? 0;
      tx += discs[p].cx * w;
      ty += discs[p].cy * w;
      pull += w;
    }
    if (pull > 0) {
      tx /= pull;
      ty /= pull;
    }
    const anchors = placed
      .slice()
      .sort(
        (p, q) =>
          Math.hypot(discs[p].cx - tx, discs[p].cy - ty) -
            discs[p].radius -
            (Math.hypot(discs[q].cx - tx, discs[q].cy - ty) -
              discs[q].radius) || p - q,
      );
    let bestCost = Infinity;
    let bx = 0;
    let by = 0;
    const scan = (list: readonly number[]): void => {
      for (const p of list) {
        const reach = discs[p].radius + discs[c].radius + CLUSTER_GAP;
        for (let step = 0; step < 24; step++) {
          const ang = (step / 24) * Math.PI * 2;
          const px = discs[p].cx + Math.cos(ang) * reach;
          const py = discs[p].cy + Math.sin(ang) * reach;
          const cost =
            Math.hypot(px - tx, (py - ty) * CLUSTER_ASPECT) +
            0.2 * Math.hypot(px, py * CLUSTER_ASPECT);
          if (cost < bestCost && fits(c, px, py)) {
            bestCost = cost;
            bx = px;
            by = py;
          }
        }
      }
    };
    scan(anchors.slice(0, 12));
    if (bestCost === Infinity) {
      scan(anchors);
    }
    discs[c].cx = bx;
    discs[c].cy = by;
    placed.push(c);
  }
}

/**
 * Detects communities (Louvain-style modularity passes), settles each one with a
 * force simulation and packs them as discs; communities of three or more get a
 * hull, unlinked nodes a grid block of their own.
 */
export function layoutClusters(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  sizing: GraphLayoutSizing,
): GraphLayout {
  return layoutFree(nodes, edges, sizing, true);
}

/** One deterministic force-directed map, rotated so it is wider than tall. */
export function layoutForce(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  sizing: GraphLayoutSizing,
): GraphLayout {
  return layoutFree(nodes, edges, sizing, false);
}

/** Runs the layout a request names — the one call a Web Worker needs. */
export function runGraphLayout(request: GraphLayoutRequest): GraphLayout {
  const run =
    request.kind === "layers"
      ? layoutLayers
      : request.kind === "clusters"
        ? layoutClusters
        : layoutForce;
  return run(request.nodes, request.edges, request.sizing);
}

function layoutFree(
  nodes: readonly GraphLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  sizing: GraphLayoutSizing,
  split: boolean,
): GraphLayout {
  const n = nodes.length;
  const out = emptyLayout(n);
  if (n === 0) {
    return out;
  }
  fillRadii(nodes, sizing, out.r);
  const links = resolveLinks(nodes, edges);
  const linked = new Uint8Array(n);
  for (const l of links) {
    linked[l.a] = 1;
    linked[l.b] = 1;
  }

  const membership = split ? detectCommunities(n, links) : new Int32Array(n);
  const groups = new Map<number, number[]>();
  const unlinked: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!linked[i]) {
      unlinked.push(i);
      continue;
    }
    const g = groups.get(membership[i]);
    if (g) {
      g.push(i);
    } else {
      groups.set(membership[i], [i]);
    }
  }

  const discs: Disc[] = [...groups.values()]
    .sort((a, b) => b.length - a.length || a[0] - b[0])
    .map((members) => ({ members, radius: 0, cx: 0, cy: 0 }));
  const discOf = new Int32Array(n).fill(-1);
  discs.forEach((d, di) => {
    for (const i of d.members) {
      discOf[i] = di;
      out.group[i] = di;
    }
    settleCommunity(d.members, links, out.r, out.x, out.y, !split);
    let radius = 0;
    for (const i of d.members) {
      radius = Math.max(radius, Math.hypot(out.x[i], out.y[i]) + out.r[i]);
    }
    d.radius = radius;
  });

  const affinity = new Map<number, number>();
  for (const l of links) {
    const da = discOf[l.a];
    const db = discOf[l.b];
    if (da === db) {
      continue;
    }
    const id = Math.min(da, db) * discs.length + Math.max(da, db);
    affinity.set(id, (affinity.get(id) ?? 0) + l.w);
  }
  packDiscs(discs, affinity);

  const box: Bounds =
    discs.length === 0 ? { minX: 0, maxX: 0, minY: 0, maxY: 0 } : emptyBounds();
  for (const d of discs) {
    for (const i of d.members) {
      out.x[i] += d.cx;
      out.y[i] += d.cy;
      growBounds(box, out.x[i], out.y[i], out.r[i]);
    }
  }
  let { minX, maxX, minY, maxY } = box;

  if (unlinked.length > 0) {
    const span = Math.max(UNLINKED_CELL * 8, maxX - minX);
    const cols = Math.max(
      1,
      Math.min(
        unlinked.length,
        Math.floor(span / UNLINKED_CELL),
        Math.ceil(Math.sqrt(unlinked.length * 6)),
      ),
    );
    const rows = Math.ceil(unlinked.length / cols);
    const blockTop = discs.length === 0 ? 0 : maxY + CLUSTER_GAP;
    const mid = (minX + maxX) / 2;
    for (let k = 0; k < unlinked.length; k++) {
      const i = unlinked[k];
      out.x[i] = mid + ((k % cols) - (cols - 1) / 2) * UNLINKED_CELL;
      out.y[i] = blockTop + Math.floor(k / cols) * UNLINKED_CELL;
    }
    minX = Math.min(minX, mid - (cols / 2) * UNLINKED_CELL);
    maxX = Math.max(maxX, mid + (cols / 2) * UNLINKED_CELL);
    maxY = Math.max(maxY, blockTop + (rows - 1) * UNLINKED_CELL);
    if (discs.length === 0) {
      minY = Math.min(minY, blockTop);
    }
  }

  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;
  for (let i = 0; i < n; i++) {
    out.x[i] -= ox;
    out.y[i] -= oy;
    out.labelX[i] = out.x[i];
  }

  for (const d of split ? discs : []) {
    if (d.members.length < HULL_MIN) {
      continue;
    }
    let anchor = d.members[0];
    let top = Infinity;
    let sx = 0;
    for (const i of d.members) {
      if (sizeOf(nodes[i]) > sizeOf(nodes[anchor])) {
        anchor = i;
      }
      top = Math.min(top, out.y[i] - out.r[i]);
      sx += out.x[i];
    }
    out.clusters.push({
      anchor,
      count: d.members.length,
      hull: convexHull(
        d.members.map((i): [number, number] => [out.x[i], out.y[i]]),
      ),
      cx: sx / d.members.length,
      top,
    });
  }
  if (split && unlinked.length > 1) {
    let top = Infinity;
    let sx = 0;
    for (const i of unlinked) {
      top = Math.min(top, out.y[i] - out.r[i]);
      sx += out.x[i];
    }
    out.clusters.push({
      anchor: -1,
      count: unlinked.length,
      hull: [],
      cx: sx / unlinked.length,
      top,
    });
  }
  return out;
}
