// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  donutArcs,
  donutChartModel,
  donutSectorPath,
  donutSegmentSummary,
  donutTotal,
} from "../src";
import * as chart from "../src/chart";

const BROWSERS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 0 },
  { key: "edge", label: "Edge", value: 125, tone: "chart-6" },
];

describe("the donut chart model", () => {
  it("is in the chart-only entry React Native imports", () => {
    expect(chart.donutChartModel).toBe(donutChartModel);
  });

  it("totals the positive values", () => {
    expect(donutTotal(BROWSERS)).toBe(600);
    expect(donutTotal([{ key: "a", label: "A", value: -4 }])).toBe(0);
    expect(donutTotal([{ key: "a", label: "A", value: Number.NaN }])).toBe(0);
  });

  it("draws ring sectors, a full ring and a pie wedge", () => {
    expect(donutSectorPath(0, 90, 35, 50)).toBe(
      "M50 0A50 50 0 0 1 100 50L85 50A35 35 0 0 0 50 15Z",
    );
    expect(donutSectorPath(0, 270, 35, 50)).toContain("A50 50 0 1 1");
    expect(donutSectorPath(0, 90, 0, 50)).toBe(
      "M50 0A50 50 0 0 1 100 50L50 50Z",
    );
    const ring = donutSectorPath(0, 360, 35, 50);
    expect(ring.match(/M/g)).toHaveLength(2);
    expect(ring).toContain("A35 35 0 1 0");
    expect(donutSectorPath(10, 10, 35, 50)).toBe("");
  });

  it("lays the segments clockwise with their shares and a gap between them", () => {
    const arcs = donutArcs(BROWSERS, { padAngle: 0 });
    expect(arcs.map((a) => [a.key, a.tone, a.share, a.start, a.end])).toEqual([
      ["chrome", "chart-1", 275 / 600, 0, 165],
      ["safari", "chart-2", 200 / 600, 165, 285],
      ["firefox", "chart-3", 0, 285, 285],
      ["edge", "chart-6", 125 / 600, 285, 360],
    ]);
    expect(arcs[2].path).toBe("");
    expect(arcs[0].path.startsWith("M50 0A50 50")).toBe(true);
    // A 2° pad trims 1° off each side of a segment.
    const padded = donutArcs(BROWSERS, { padAngle: 2 });
    expect(padded[0].path).not.toBe(arcs[0].path);
    expect(padded[0].start).toBe(0);
    // One segment is a full ring, with no pad.
    expect(
      donutArcs([{ key: "a", label: "A", value: 3 }])[0].path.match(/M/g),
    ).toHaveLength(2);
    // The thickness sets the hole: 1 is a pie.
    expect(
      donutArcs(BROWSERS, { thickness: 1, padAngle: 0 })[0].path,
    ).toContain("L50 50Z");
  });

  it("names, formats and filters the segments", () => {
    const model = donutChartModel({
      segments: BROWSERS,
      locale: "en",
      valueFormat: (n) => `${n} visits`,
    });
    expect(model.total).toBe(600);
    expect(model.totalText).toBe("600 visits");
    expect(model.slices).toHaveLength(4);
    expect(model.drawn.map((s) => s.key)).toEqual(["chrome", "safari", "edge"]);
    expect(model.drawn[0]).toMatchObject({
      valueText: "275 visits",
      percent: "46%",
      summary: "Chrome: 275 visits (46%)",
    });
    expect(donutSegmentSummary("A", "1", "5%")).toBe("A: 1 (5%)");
  });
});
