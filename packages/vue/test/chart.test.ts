// @vitest-environment node
// The chart maths lives twice: packages/angular/core/chart.ts (the `core` entry point,
// which has no test runner of its own) and its Vue copy. This file tests the Angular
// one and keeps the copy identical. A daylight-saving zone makes the day-series test
// fail for a millisecond walk (`today - k * 86_400_000`).
process.env["TZ"] = "Europe/Warsaw";

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  fillDaySeries,
  localIsoDate,
  niceCeiling,
  scaleToPercent,
  sparklineGeometry,
} from "../../angular/core/chart";

const body = (path: string): string =>
  readFileSync(new URL(path, import.meta.url), "utf8")
    .split("\n")
    .slice(2)
    .join("\n");

describe("chart maths", () => {
  it("keeps the Vue copy identical to packages/angular/core/chart.ts", () => {
    expect(body("../src/utils/chart.ts")).toBe(
      body("../../angular/core/chart.ts"),
    );
  });

  it("rounds the axis top up to a nice 1 / 2 / 2.5 / 5 × 10ⁿ step, with a floor", () => {
    expect(niceCeiling([])).toBe(5); // floor 4 → 5
    expect(niceCeiling([1, 3])).toBe(5);
    expect(niceCeiling([5])).toBe(5);
    expect(niceCeiling([6])).toBe(10);
    expect(niceCeiling([11])).toBe(20);
    expect(niceCeiling([21])).toBe(25);
    expect(niceCeiling([37])).toBe(50);
    expect(niceCeiling([180])).toBe(200);
    expect(niceCeiling([2500])).toBe(2500);
    expect(niceCeiling([0.3], 0)).toBe(0.5);
    expect(niceCeiling([0.1], 0)).toBe(0.1);
    expect(niceCeiling([12], 100)).toBe(100);
  });

  it("never returns 0 and ignores NaN and Infinity", () => {
    expect(niceCeiling([], 0)).toBe(1);
    expect(niceCeiling([0, -3], 0)).toBe(1);
    expect(niceCeiling([NaN, Infinity, 7])).toBe(10);
  });

  it("does not overflow the stack on a long series", () => {
    expect(niceCeiling(Array.from({ length: 300_000 }, (_, i) => i % 90))).toBe(
      100,
    );
  });

  it("scales to a clamped percentage", () => {
    expect(scaleToPercent(5, 20)).toBe(25);
    expect(scaleToPercent(30, 20)).toBe(100);
    expect(scaleToPercent(-1, 20)).toBe(0);
    expect(scaleToPercent(5, 0)).toBe(0);
    expect(scaleToPercent(NaN, 10)).toBe(0);
  });

  it("formats the LOCAL calendar date", () => {
    expect(localIsoDate(new Date(2026, 0, 2, 23, 59))).toBe("2026-01-02");
  });

  it("gap-fills by local calendar date across a daylight-saving change", () => {
    // 2026-03-29 is 23 hours long in Europe/Warsaw; 00:30 the next day minus 24 h
    // lands on the 28th.
    const today = new Date(2026, 2, 30, 0, 30);
    type Row = { date: string; count: number };
    const rows: Row[] = [
      { date: "2026-03-29", count: 4 },
      { date: "2026-03-01", count: 9 },
    ];
    const series = fillDaySeries(rows, 4, {
      today,
      empty: (date): Row => ({ date, count: 0 }),
    });
    expect(series).toEqual([
      { date: "2026-03-27", count: 0 },
      { date: "2026-03-28", count: 0 },
      { date: "2026-03-29", count: 4 },
      { date: "2026-03-30", count: 0 },
    ]);
    // The same walk in milliseconds repeats the 28th and never reaches the 29th.
    const msWalk = Array.from({ length: 4 }, (_, i) =>
      localIsoDate(new Date(today.getTime() - (3 - i) * 86_400_000)),
    );
    expect(msWalk).not.toEqual(series.map((r) => r.date));
  });

  it("returns nothing for a non-positive or invalid length", () => {
    const empty = (date: string) => ({ date });
    expect(fillDaySeries([], 0, { empty })).toEqual([]);
    expect(fillDaySeries([], -2, { empty })).toEqual([]);
    expect(fillDaySeries([], NaN, { empty })).toEqual([]);
    expect(fillDaySeries([], 2.9, { empty })).toHaveLength(2);
  });

  it("draws a sparkline in a 100 × 100 box", () => {
    expect(sparklineGeometry([], "line", 0, 10)).toEqual({
      line: "",
      area: "",
      bars: "",
      cells: [],
    });
    expect(sparklineGeometry([0, 5, 10], "line", 0, 10).line).toBe(
      "M0 100L50 50L100 0",
    );
    // One value is a flat line across; out-of-range values are clamped.
    expect(sparklineGeometry([3], "line", 0, 6).line).toBe("M0 50L100 50");
    expect(sparklineGeometry([-4, 99], "line", 0, 10).line).toBe(
      "M0 100L100 0",
    );
    expect(sparklineGeometry([0, 10], "area", 0, 10).area).toBe(
      "M0 100L100 0L100 100L0 100Z",
    );
    // Two bars in two 50-wide slots with a 20 % gap; zero keeps a 4 % stub.
    expect(sparklineGeometry([0, 10], "bar", 0, 10).bars).toBe(
      "M5 100V96H45V100ZM55 100V0H95V100Z",
    );
    expect(
      sparklineGeometry([0, 1, 5, 10], "heat", 0, 10).cells.map((c) => c.level),
    ).toEqual([0, 1, 3, 5]);
    // A degenerate range (max ≤ min) does not divide by zero.
    expect(sparklineGeometry([2, 2], "line", 2, 2).line).toBe("M0 100L100 100");
  });
});
