/**
 * The page numbers a pagination shows, shared by every framework. Pure: no Angular, no
 * DOM globals (the Vue, React and React Native twins bundle it through @surface-one/core).
 */

/** A page number, or a gap of hidden pages before / after the current one. */
export type PaginationRangeItem = number | "ellipsis-start" | "ellipsis-end";

export interface PaginationRangeOptions {
  /** The current page, 1-based (clamped into `1 … pageCount`). */
  readonly page: number;
  /** How many pages there are (at least 1). */
  readonly pageCount: number;
  /** Pages shown on each side of the current one. Default `1`. */
  readonly siblings?: number;
  /** Pages always shown at each end. Default `1`. */
  readonly boundaries?: number;
}

const whole = (n: number, fallback: number, min: number): number =>
  Number.isFinite(n) ? Math.max(min, Math.floor(n)) : fallback;

/** How many pages `total` items fill at `pageSize` a page — at least 1. */
export function paginationPageCount(total: number, pageSize: number): number {
  const size = whole(pageSize, 10, 1);
  return Math.max(1, Math.ceil(whole(total, 0, 0) / size));
}

/** `page` as a whole number within `1 … pageCount`. */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(whole(pageCount, 1, 1), whole(page, 1, 1));
}

const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/**
 * The items to draw: the first and last `boundaries` pages, `siblings` pages around
 * the current one and an ellipsis for each gap. The list keeps the same length while
 * the current page moves (so the controls do not jump), and an ellipsis never stands
 * in for a single page: `[1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 10]`.
 */
export function paginationRange(
  options: PaginationRangeOptions,
): PaginationRangeItem[] {
  const pageCount = whole(options.pageCount, 1, 1);
  const page = clampPage(options.page, pageCount);
  const siblings = whole(options.siblings ?? 1, 1, 0);
  const boundaries = whole(options.boundaries ?? 1, 1, 0);
  // Both ends, the current page with its siblings, and two ellipses.
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (pageCount <= slots) return range(1, pageCount);

  const start = range(1, boundaries);
  const end = range(pageCount - boundaries + 1, pageCount);
  const left = Math.max(page - siblings, boundaries + 1);
  const right = Math.min(page + siblings, pageCount - boundaries);
  const gapBefore = left > boundaries + 2;
  const gapAfter = right < pageCount - boundaries - 1;
  // The pages beside the end that has no ellipsis: as many as the other side's
  // boundary, ellipsis and siblings take, so every layout has `slots` items.
  const run = siblings * 2 + 2;

  if (!gapBefore)
    return [...range(1, boundaries + run), "ellipsis-end", ...end];
  if (!gapAfter)
    return [
      ...start,
      "ellipsis-start",
      ...range(pageCount - boundaries - run + 1, pageCount),
    ];
  return [
    ...start,
    "ellipsis-start",
    ...range(left, right),
    "ellipsis-end",
    ...end,
  ];
}
