export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function easeOutCubic(t: number): number {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

/** An axis-aligned box; `emptyBounds()` starts inverted so the first `growBounds` sets it. */
export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function emptyBounds(): Bounds {
  return { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
}

/** Grows `b` to cover the disc at (x, y) with radius `r` (0 for a point). */
export function growBounds(b: Bounds, x: number, y: number, r = 0): void {
  b.minX = Math.min(b.minX, x - r);
  b.maxX = Math.max(b.maxX, x + r);
  b.minY = Math.min(b.minY, y - r);
  b.maxY = Math.max(b.maxY, y + r);
}

/**
 * A small deterministic offset that separates two coincident points `i` and `j`,
 * so a force or an overlap push never divides by a zero distance.
 */
export function jitter(i: number, j: number): [number, number] {
  return [((i * 31 + j) % 7) - 3 + 0.5, ((i * 17 + j) % 5) - 2 + 0.5];
}
