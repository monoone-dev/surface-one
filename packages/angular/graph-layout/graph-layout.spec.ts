// Pure layout tests, run in plain Node by `npm run test:graph-layout` (node:test).
// Importing the barrel also proves the entry point evaluates without Angular or a DOM.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countLayerCrossings,
  keyIndex,
  layoutClusters,
  layoutForce,
  layoutLayers,
  linkEnds,
  runGraphLayout,
  toneCss,
  type GraphLayoutEdge,
  type GraphLayoutNode,
} from "./index";

const SIZING = { minR: 3, maxR: 8.5 };

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function ivy(
  perLayer: number,
  linkCount: number,
  seed: number,
): { nodes: GraphLayoutNode[]; edges: GraphLayoutEdge[] } {
  const rnd = seeded(seed);
  const nodes: GraphLayoutNode[] = [];
  for (let layer = 0; layer < 4; layer++) {
    for (let i = 0; i < perLayer; i++) {
      nodes.push({ key: `${layer}:${i}`, size: 0, layer });
    }
  }
  const edges: GraphLayoutEdge[] = [];
  const topics = Math.max(2, Math.round(perLayer / 12));
  for (let k = 0; k < linkCount; k++) {
    const la = Math.floor(rnd() * 4);
    const lb = Math.min(3, la + (rnd() < 0.8 ? 1 : 0));
    const topic = Math.floor(rnd() * topics);
    const within = (): number =>
      (topic + topics * Math.floor(rnd() * (perLayer / topics))) % perLayer;
    const a = nodes[la * perLayer + within()];
    const b = nodes[lb * perLayer + within()];
    if (a === b) continue;
    a.size++;
    b.size++;
    edges.push({ a: a.key, b: b.key, weight: 0.2 + rnd() * 0.8 });
  }
  return { nodes, edges };
}

test("layers: one column per kind, left to right, evenly spaced, sized by weight", () => {
  const { nodes, edges } = ivy(30, 160, 7);
  const layout = layoutLayers(nodes, edges, SIZING);

  assert.deepEqual(
    layout.columns.map((c) => c.layer),
    [0, 1, 2, 3],
  );
  const xs = layout.columns.map((c) => c.x);
  assert.deepEqual(
    xs,
    [...xs].sort((a, b) => a - b),
  );
  const gapsBetweenColumns = xs.slice(1).map((x, i) => Math.round(x - xs[i]));
  assert.equal(new Set(gapsBetweenColumns).size, 1);
  assert.ok(gapsBetweenColumns[0] > 200);

  for (let layer = 0; layer < 4; layer++) {
    const members = nodes
      .map((n, i) => ({ n, i }))
      .filter((m) => m.n.layer === layer);
    assert.equal(new Set(members.map((m) => layout.x[m.i])).size, 1);
    const ys = members.map((m) => layout.y[m.i]).sort((a, b) => a - b);
    const gaps = new Set(ys.slice(1).map((y, k) => Math.round(y - ys[k])));
    assert.deepEqual([...gaps], [22]);
    assert.equal(layout.columns[layer].count, members.length);
  }

  const first = nodes.findIndex((n) => n.layer === 0);
  const last = nodes.findIndex((n) => n.layer === 3);
  assert.equal(layout.side[first], -1);
  assert.equal(layout.side[last], 1);

  const biggest = nodes.reduce(
    (m, n, i) => (n.size > nodes[m].size ? i : m),
    0,
  );
  assert.ok(Math.abs(layout.r[biggest] - SIZING.maxR) < 0.005);
  assert.ok(Math.min(...layout.r) >= SIZING.minR);
});

test("layers: barycenter ordering removes most of the crossings a degree-sorted column has", () => {
  const { nodes, edges } = ivy(40, 220, 11);
  const layout = layoutLayers(nodes, edges, SIZING);

  const naive = new Float64Array(nodes.length);
  for (let layer = 0; layer < 4; layer++) {
    nodes
      .map((n, i) => ({ n, i }))
      .filter((m) => m.n.layer === layer)
      .sort((p, q) => q.n.size - p.n.size || (p.n.key < q.n.key ? -1 : 1))
      .forEach((m, rank) => (naive[m.i] = rank));
  }
  const before = countLayerCrossings(nodes, edges, naive);
  const after = countLayerCrossings(nodes, edges, layout.y);
  assert.ok(before > 0);
  assert.ok(after < before * 0.5, `${after} < ${before} * 0.5`);
});

test("layers: a planar two-layer graph is drawn with zero crossings", () => {
  const nodes: GraphLayoutNode[] = [];
  const edges: GraphLayoutEdge[] = [];
  for (let i = 0; i < 12; i++) {
    nodes.push({ key: `a${i}`, size: 12 - i, layer: 0 });
    nodes.push({ key: `b${i}`, size: i + 1, layer: 1 });
    edges.push({ a: `a${i}`, b: `b${i}`, weight: 1 });
  }
  const layout = layoutLayers(nodes, edges, SIZING);
  assert.equal(countLayerCrossings(nodes, edges, layout.y), 0);
});

test("layers: a crowded kind wraps into strands instead of an unreadable strip", () => {
  const nodes: GraphLayoutNode[] = Array.from({ length: 500 }, (_v, i) => ({
    key: `n${i}`,
    size: 500 - i,
    layer: 2,
  }));
  const layout = layoutLayers(nodes, [], SIZING);
  assert.equal(new Set(layout.x).size, Math.ceil(500 / 64));
  const ys = [...layout.y].sort((a, b) => a - b);
  assert.ok(ys[ys.length - 1] - ys[0] < 64 * 22);
  assert.equal(new Set(layout.labelX).size, 1);
});

test("clusters: communities are separated, hulls enclose their members, nothing overlaps", () => {
  const nodes: GraphLayoutNode[] = [];
  const edges: GraphLayoutEdge[] = [];
  for (let c = 0; c < 4; c++) {
    for (let i = 0; i < 9; i++) {
      nodes.push({ key: `${c}-${i}`, size: i === 0 ? 8 : 1, layer: 0 });
      if (i > 0) edges.push({ a: `${c}-0`, b: `${c}-${i}`, weight: 1 });
    }
  }
  edges.push({ a: "0-1", b: "1-1", weight: 0.2 });
  nodes.push({ key: "solo-a", size: 0, layer: 0 });
  nodes.push({ key: "solo-b", size: 0, layer: 0 });

  const layout = layoutClusters(nodes, edges, SIZING);

  const hulled = layout.clusters.filter((c) => c.anchor >= 0);
  assert.equal(hulled.length, 4);
  assert.deepEqual(hulled.map((c) => nodes[c.anchor].key).sort(), [
    "0-0",
    "1-0",
    "2-0",
    "3-0",
  ]);
  assert.ok(hulled.every((c) => c.count === 9 && c.hull.length >= 3));
  assert.equal(new Set(layout.group.slice(0, 36)).size, 4);
  for (let c = 0; c < 4; c++) {
    assert.equal(new Set(layout.group.slice(c * 9, c * 9 + 9)).size, 1);
  }

  const unlinked = layout.clusters.find((c) => c.anchor < 0);
  assert.equal(unlinked?.count, 2);
  assert.equal(layout.group[36], -1);

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const gap = Math.hypot(
        layout.x[i] - layout.x[j],
        layout.y[i] - layout.y[j],
      );
      assert.ok(gap > layout.r[i] + layout.r[j]);
    }
  }

  const centres = hulled.map((c) => {
    const members = nodes
      .map((_n, i) => i)
      .filter((i) => layout.group[i] === layout.group[c.anchor]);
    const cx = members.reduce((s, i) => s + layout.x[i], 0) / members.length;
    const cy = members.reduce((s, i) => s + layout.y[i], 0) / members.length;
    const reach = Math.max(
      ...members.map((i) => Math.hypot(layout.x[i] - cx, layout.y[i] - cy)),
    );
    return { cx, cy, reach };
  });
  for (let a = 0; a < centres.length; a++) {
    for (let b = a + 1; b < centres.length; b++) {
      assert.ok(
        Math.hypot(
          centres[a].cx - centres[b].cx,
          centres[a].cy - centres[b].cy,
        ) >
          centres[a].reach + centres[b].reach,
      );
    }
  }
});

test("force: one connected map with no hulls, wider than tall, deterministic", () => {
  const { nodes, edges } = ivy(12, 70, 3);
  const flat = nodes.map((n) => ({ ...n, layer: 0 }));
  const a = layoutForce(flat, edges, SIZING);
  const b = layoutForce(flat, edges, SIZING);
  assert.deepEqual(a.clusters, []);
  assert.deepEqual([...a.x], [...b.x]);
  assert.deepEqual([...a.y], [...b.y]);
  const linked = flat.map((_n, i) => i).filter((i) => a.group[i] === 0);
  const spanX =
    Math.max(...linked.map((i) => a.x[i])) -
    Math.min(...linked.map((i) => a.x[i]));
  const spanY =
    Math.max(...linked.map((i) => a.y[i])) -
    Math.min(...linked.map((i) => a.y[i]));
  assert.ok(spanX > spanY);
});

test("runGraphLayout dispatches on the kind and matches the direct call", () => {
  const { nodes, edges } = ivy(10, 40, 5);
  for (const [kind, direct] of [
    ["force", layoutForce],
    ["clusters", layoutClusters],
    ["layers", layoutLayers],
  ] as const) {
    const viaRequest = runGraphLayout({ kind, nodes, edges, sizing: SIZING });
    const expected = direct(nodes, edges, SIZING);
    assert.deepEqual([...viaRequest.x], [...expected.x]);
    assert.deepEqual([...viaRequest.y], [...expected.y]);
  }
});

test("empty input, unknown endpoints and self-loops lay out without throwing", () => {
  for (const kind of ["force", "clusters", "layers"] as const) {
    assert.equal(
      runGraphLayout({ kind, nodes: [], edges: [], sizing: SIZING }).x.length,
      0,
    );
    const layout = runGraphLayout({
      kind,
      nodes: [
        { key: "a", size: 1, layer: 0 },
        { key: "b", size: Number.NaN, layer: 1 },
      ],
      edges: [
        { a: "a", b: "a", weight: 1 },
        { a: "a", b: "ghost", weight: 1 },
        { a: "a", b: "b", weight: Number.NaN },
      ],
      sizing: SIZING,
    });
    assert.ok([...layout.x, ...layout.y, ...layout.r].every(Number.isFinite));
  }
});

test("keyIndex / linkEnds drop unknown endpoints and self-loops", () => {
  const index = keyIndex([{ key: "a" }, { key: "b" }]);
  assert.deepEqual(linkEnds(index, "a", "b"), [0, 1]);
  assert.equal(linkEnds(index, "a", "a"), null);
  assert.equal(linkEnds(index, "a", "zz"), null);
});

test("toneCss turns a fallback chain into nested var()", () => {
  assert.equal(toneCss("--graph-note"), "var(--graph-note)");
  assert.equal(
    toneCss("--chart-3, --graph-note"),
    "var(--chart-3, var(--graph-note))",
  );
});

test("both layouts stay interactive at 2000 nodes / 4000 links", (t) => {
  const { nodes, edges } = ivy(500, 4000, 23);
  const t0 = performance.now();
  const layers = layoutLayers(nodes, edges, SIZING);
  const t1 = performance.now();
  const clusters = layoutClusters(nodes, edges, SIZING);
  const t2 = performance.now();
  t.diagnostic(
    `layers ${(t1 - t0).toFixed(0)} ms (budget 1500), clusters ${(t2 - t1).toFixed(0)} ms (budget 4000)`,
  );

  assert.equal(layers.x.length, 2000);
  assert.equal(clusters.x.length, 2000);
  assert.ok(
    [...layers.x, ...layers.y, ...clusters.x, ...clusters.y].every(
      Number.isFinite,
    ),
  );
  assert.ok(t1 - t0 < 1500, `layers took ${t1 - t0} ms`);
  assert.ok(t2 - t1 < 4000, `clusters took ${t2 - t1} ms`);
});
