import { expect, test } from "@playwright/test";

import {
  computeFloatingPosition,
  floatingBoundary,
  type FloatingRect,
} from "../packages/angular/core/floating-position";
import {
  createTypeaheadBuffer,
  listNavigationIndex,
  normalizeSearchText,
  typeaheadIndex,
} from "../packages/angular/core/list-navigation";

/**
 * Pure helpers from `@surface-one/angular/core`, imported straight from source —
 * no browser page is opened. They run with the rest of `npm run test:a11y`.
 */

const VIEWPORT = { width: 1200, height: 800 };
const rect = (left: number, top: number, w: number, h: number) => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});

test.describe("computeFloatingPosition", () => {
  test("places below, start-aligned, with the default offset", () => {
    const p = computeFloatingPosition(
      rect(100, 100, 80, 30),
      { width: 200, height: 150 },
      VIEWPORT,
    );
    expect(p).toMatchObject({ x: 100, y: 134, side: "bottom" });
    expect(p.maxHeight).toBe(800 - 8 - 130 - 4);
  });

  test("flips above when below is too small and above has more room", () => {
    const p = computeFloatingPosition(
      rect(100, 700, 80, 30),
      { width: 200, height: 150 },
      VIEWPORT,
    );
    expect(p.side).toBe("top");
    expect(p.y).toBe(700 - 4 - 150);
  });

  test("does not flip when flip is off", () => {
    const p = computeFloatingPosition(
      rect(100, 700, 80, 30),
      { width: 200, height: 150 },
      VIEWPORT,
      { flip: false },
    );
    expect(p.side).toBe("bottom");
    expect(p.maxHeight).toBe(800 - 8 - 730 - 4);
  });

  test("end and center alignment", () => {
    const anchor = rect(400, 100, 100, 30);
    const size = { width: 200, height: 100 };
    expect(
      computeFloatingPosition(anchor, size, VIEWPORT, { align: "end" }).x,
    ).toBe(300);
    expect(
      computeFloatingPosition(anchor, size, VIEWPORT, { align: "center" }).x,
    ).toBe(350);
  });

  test("clamps into the viewport margin", () => {
    const p = computeFloatingPosition(
      rect(1150, 100, 40, 30),
      { width: 200, height: 100 },
      VIEWPORT,
    );
    expect(p.x).toBe(1200 - 8 - 200);
  });

  test("side right flips left at the viewport edge", () => {
    const p = computeFloatingPosition(
      rect(1000, 100, 100, 30),
      { width: 200, height: 100 },
      VIEWPORT,
      { side: "right" },
    );
    expect(p.side).toBe("left");
    expect(p.x).toBe(1000 - 4 - 200);
  });

  test("accepts a DOMRect-like boundary", () => {
    const boundary = floatingBoundary(VIEWPORT, 8, rect(0, 200, 1200, 300));
    expect(boundary).toEqual({ top: 200, left: 8, right: 1192, bottom: 500 });
    const p = computeFloatingPosition(
      rect(100, 300, 80, 30),
      { width: 200, height: 400 },
      { ...boundary, width: 1184, height: 300 },
    );
    expect(p.maxHeight).toBe(500 - 330 - 4);
  });

  /** The placement `sone-row-menu` used before it moved onto the shared helper. */
  function legacyRowMenu(
    a: FloatingRect,
    w: number,
    h: number,
    b: { top: number; bottom: number; vw: number },
    side: "bottom" | "top" | "right",
    align: "start" | "end",
  ) {
    const M = 8;
    const GAP = 4;
    if (side === "right") {
      const top = Math.max(b.top, Math.min(a.top, b.bottom - h));
      return {
        left: Math.round(Math.min(a.right + GAP, b.vw - w - M)),
        top: Math.round(top),
        maxHeight: Math.floor(b.bottom - top),
      };
    }
    const below = Math.max(0, b.bottom - a.bottom - GAP);
    const above = Math.max(0, a.top - b.top - GAP);
    const flipAbove = side === "top" || (h > below && above > below);
    const availableHeight = Math.floor(flipAbove ? above : below);
    const left = Math.max(
      M,
      Math.min(align === "start" ? a.left : a.right - w, b.vw - w - M),
    );
    const top = flipAbove
      ? a.top - Math.min(h, availableHeight) - GAP
      : a.bottom + GAP;
    return {
      left: Math.round(left),
      top: Math.round(Math.max(b.top, top)),
      maxHeight: availableHeight,
    };
  }

  test("matches the legacy row-menu placement for anchors inside the boundary", () => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 2000; i++) {
      const vw = 400 + Math.floor(rand() * 1200);
      const vh = 300 + Math.floor(rand() * 900);
      const bTop = 8 + Math.floor(rand() * 100);
      const bBottom = vh - 8 - Math.floor(rand() * 100);
      const aw = 16 + Math.floor(rand() * 40);
      const ah = 16 + Math.floor(rand() * 20);
      const ax = 8 + Math.floor(rand() * (vw - aw - 16));
      const ay = bTop + Math.floor(rand() * Math.max(1, bBottom - bTop - ah));
      const w = 120 + Math.floor(rand() * Math.min(260, vw - 140));
      const h = 40 + Math.floor(rand() * 500);
      const side = (["bottom", "top", "right"] as const)[i % 3];
      const align = rand() < 0.5 ? "start" : "end";
      const a = rect(ax, ay, aw, ah);
      const legacy = legacyRowMenu(
        a,
        w,
        h,
        { top: bTop, bottom: bBottom, vw },
        side,
        align,
      );
      const p = computeFloatingPosition(
        a,
        { width: w, height: h },
        { left: 8, right: vw - 8, top: bTop, bottom: bBottom },
        {
          side,
          align: side === "right" ? "start" : align,
          offset: 4,
          flip: side === "bottom",
        },
      );
      expect({
        left: Math.round(p.x),
        top: Math.round(p.y),
        maxHeight: p.maxHeight,
      }).toEqual(legacy);
    }
  });
});

test.describe("list navigation", () => {
  test("arrows wrap, Home/End jump, Page keys step", () => {
    expect(listNavigationIndex("ArrowDown", -1, 5)).toBe(0);
    expect(listNavigationIndex("ArrowUp", -1, 5)).toBe(4);
    expect(listNavigationIndex("ArrowDown", 4, 5)).toBe(0);
    expect(listNavigationIndex("ArrowUp", 0, 5)).toBe(4);
    expect(listNavigationIndex("ArrowDown", 4, 5, { wrap: false })).toBe(4);
    expect(listNavigationIndex("Home", 3, 5)).toBe(0);
    expect(listNavigationIndex("End", 0, 5)).toBe(4);
    expect(listNavigationIndex("PageDown", 0, 30)).toBe(10);
    expect(listNavigationIndex("PageUp", 3, 30)).toBe(0);
    expect(listNavigationIndex("Enter", 0, 5)).toBeNull();
    expect(listNavigationIndex("ArrowDown", 0, 0)).toBeNull();
  });

  test("normalizes case and diacritics", () => {
    expect(normalizeSearchText("  Łódź  Café ")).toBe("lodz cafe");
    expect(normalizeSearchText("ŻÓŁW")).toBe("zolw");
  });

  test("typeahead cycles a repeated letter and matches a prefix", () => {
    const labels = ["Apple", "Banana", "Avocado", "Ćwikła"];
    expect(typeaheadIndex(labels, 0, "a")).toBe(2);
    expect(typeaheadIndex(labels, 2, "a")).toBe(0);
    expect(typeaheadIndex(labels, 0, "av")).toBe(2);
    expect(typeaheadIndex(labels, 0, "cw")).toBe(3);
    expect(typeaheadIndex(labels, 0, "z")).toBe(-1);
  });

  test("the typeahead buffer resets after a pause", () => {
    let t = 0;
    const push = createTypeaheadBuffer(500, () => t);
    expect(push("a")).toBe("a");
    t = 100;
    expect(push("b")).toBe("ab");
    t = 1000;
    expect(push("c")).toBe("c");
  });
});
