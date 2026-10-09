const TAU = Math.PI * 2;

export function traceDisc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  square: boolean,
): void {
  if (square) {
    const s = r * 0.9;
    ctx.rect(x - s, y - s, s * 2, s * 2);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, TAU);
  }
}

export function traceLayerEdge(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  sameColumn: boolean,
  bulgeDir: number,
  bulgeMax: number,
): void {
  ctx.moveTo(ax, ay);
  if (sameColumn) {
    const bulge = Math.min(bulgeMax, Math.abs(by - ay) * 0.42 + 14) * bulgeDir;
    ctx.bezierCurveTo(ax + bulge, ay, bx + bulge, by, bx, by);
  } else {
    const mx = (ax + bx) / 2;
    ctx.bezierCurveTo(mx, ay, mx, by, bx, by);
  }
}

export function traceHull(
  ctx: CanvasRenderingContext2D,
  points: readonly [number, number][],
  pad: number,
): void {
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const pts = area < 0 ? points.slice().reverse() : points;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const from = Math.atan2(cur[1] - prev[1], cur[0] - prev[0]) - Math.PI / 2;
    const to = Math.atan2(next[1] - cur[1], next[0] - cur[0]) - Math.PI / 2;
    ctx.arc(cur[0], cur[1], pad, from, to);
  }
  ctx.closePath();
}
