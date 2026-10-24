// @vitest-environment node
import { describe, expect, it } from "vitest";

import { clampPage, paginationPageCount, paginationRange } from "../src";

describe("the pagination range", () => {
  it("counts the pages and clamps a page into them", () => {
    expect(paginationPageCount(95, 10)).toBe(10);
    expect(paginationPageCount(100, 10)).toBe(10);
    expect(paginationPageCount(0, 10)).toBe(1);
    expect(paginationPageCount(5, 0)).toBe(5);
    expect(paginationPageCount(Number.NaN, 10)).toBe(1);
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(2.7, 5)).toBe(2);
    expect(clampPage(Number.NaN, 5)).toBe(1);
  });

  it("lists every page when they fit", () => {
    expect(paginationRange({ page: 3, pageCount: 7 })).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(paginationRange({ page: 1, pageCount: 1 })).toEqual([1]);
    expect(paginationRange({ page: 1, pageCount: 0 })).toEqual([1]);
  });

  it("keeps both ends and the siblings, with an ellipsis for each gap", () => {
    expect(paginationRange({ page: 1, pageCount: 10 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      "ellipsis-end",
      10,
    ]);
    expect(paginationRange({ page: 5, pageCount: 10 })).toEqual([
      1,
      "ellipsis-start",
      4,
      5,
      6,
      "ellipsis-end",
      10,
    ]);
    expect(paginationRange({ page: 10, pageCount: 10 })).toEqual([
      1,
      "ellipsis-start",
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it("keeps the same length while the page moves, and clamps the page", () => {
    for (let page = -2; page <= 25; page++)
      expect(paginationRange({ page, pageCount: 20 })).toHaveLength(7);
    expect(paginationRange({ page: 99, pageCount: 20 }).at(-1)).toBe(20);
  });

  it("widens with more siblings and boundaries", () => {
    expect(
      paginationRange({ page: 50, pageCount: 100, siblings: 2, boundaries: 2 }),
    ).toEqual([
      1,
      2,
      "ellipsis-start",
      48,
      49,
      50,
      51,
      52,
      "ellipsis-end",
      99,
      100,
    ]);
    expect(paginationRange({ page: 5, pageCount: 10, siblings: 0 })).toEqual([
      1,
      "ellipsis-start",
      5,
      "ellipsis-end",
      10,
    ]);
  });
});
