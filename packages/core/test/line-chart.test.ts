// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  chartAreaPath,
  chartLinePath,
  chartTime,
  chartXLabel,
  chartY,
  lineChartAxis,
  lineChartColumns,
  lineChartModel,
  lineChartPaths,
  lineChartTickIndexes,
  lineChartTip,
  lineChartValues,
  lineChartXPositions,
  niceTicks,
  stackValues,
} from "../src";
import * as chart from "../src/chart";

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
  { month: "Apr", desktop: 73, mobile: 190 },
];
const SERIES = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile", tone: "chart-4" },
];

describe("the line chart model", () => {
  it("is in the chart-only entry React Native imports", () => {
    expect(chart.lineChartModel).toBe(lineChartModel);
    expect(chart.niceTicks).toBe(niceTicks);
  });

  it("steps an axis in round numbers", () => {
    expect(niceTicks(0, 37)).toEqual([0, 10, 20, 30, 40]);
    expect(niceTicks(0, 305)).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks(-12, 8)).toEqual([-15, -10, -5, 0, 5, 10]);
    expect(niceTicks(0, 0)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(niceTicks(0, 1, 2)).toEqual([0, 0.5, 1]);
  });

  it("reads the values and stacks them", () => {
    const values = lineChartValues(DATA, SERIES);
    expect(values).toEqual([
      [186, 305, 237, 73],
      [80, 200, null, 190],
    ]);
    expect(stackValues(values)).toEqual({
      lower: [
        [0, 0, 0, 0],
        [186, 305, 237, 73],
      ],
      upper: [
        [186, 305, 237, 73],
        [266, 505, 237, 263],
      ],
    });
  });

  it("builds the value axis from zero, stacked or not, or from yMin / yMax", () => {
    const values = lineChartValues(DATA, SERIES);
    expect(lineChartAxis(values)).toEqual({
      min: 0,
      max: 400,
      ticks: [0, 100, 200, 300, 400],
    });
    expect(lineChartAxis(values, { stacked: true }).max).toBe(600);
    expect(lineChartAxis([[-5, 5]])).toEqual({
      min: -5,
      max: 5,
      ticks: [-5, -2.5, 0, 2.5, 5],
    });
    expect(lineChartAxis(values, { yMin: 50, yMax: 350 })).toEqual({
      min: 50,
      max: 350,
      ticks: [100, 200, 300],
    });
    expect(lineChartAxis([[]])).toMatchObject({ min: 0, max: 1 });
  });

  it("lays out categories evenly and times by their date", () => {
    expect(lineChartXPositions(["a", "b", "c"])).toEqual([0, 50, 100]);
    expect(lineChartXPositions(["only"])).toEqual([50]);
    expect(
      lineChartXPositions(["2026-01-01", "2026-01-02", "2026-01-05"], "time"),
    ).toEqual([0, 25, 100]);
    expect(lineChartXPositions(["a", "2026-01-02"], "time")).toEqual([0, 100]);
    expect(chartTime("2026-03-04")).toBe(new Date(2026, 2, 4).getTime());
    expect(chartTime(new Date(5))).toBe(5);
    expect(Number.isNaN(chartTime("soon"))).toBe(true);
  });

  it("maps values into the box, clamped", () => {
    const axis = { min: 0, max: 200, ticks: [] };
    expect(chartY(0, axis)).toBe(100);
    expect(chartY(50, axis)).toBe(75);
    expect(chartY(500, axis)).toBe(0);
  });

  it("draws straight and monotone paths, and closed areas", () => {
    expect(
      chartLinePath([
        [0, 100],
        [50, 0],
        [100, 50],
      ]),
    ).toBe("M0 100L50 0L100 50");
    const smooth = chartLinePath(
      [
        [0, 100],
        [50, 0],
        [100, 50],
      ],
      "smooth",
    );
    expect(smooth.startsWith("M0 100C")).toBe(true);
    // Monotone: the peak's tangent is flat, so no control point rises above it.
    const ys = [...smooth.matchAll(/-?\d+(\.\d+)?/g)]
      .map((m) => Number(m[0]))
      .filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBe(0);
    expect(chartLinePath([[10, 20]])).toBe("M10 20L10 20");
    expect(chartLinePath([])).toBe("");
    expect(
      chartAreaPath(
        [
          [0, 10],
          [100, 20],
        ],
        [
          [0, 100],
          [100, 100],
        ],
      ),
    ).toBe("M0 10L100 20L100 100L0 100Z");
    expect(chartAreaPath([[0, 10]], [])).toBe("");
  });

  it("breaks a line at a missing value and stacks areas on the series below", () => {
    const values = lineChartValues(DATA, SERIES);
    const axis = { min: 0, max: 400, ticks: [] };
    const xs = [0, 25, 50, 75];
    const [desktop, mobile] = lineChartPaths(SERIES, values, xs, axis, {
      area: true,
    });
    expect(desktop.tone).toBe("chart-1");
    expect(mobile.tone).toBe("chart-4");
    expect(desktop.line).toBe("M0 53.5L25 23.75L50 40.75L75 81.75");
    expect(mobile.line).toBe("M0 80L25 50M75 52.5L75 52.5");
    expect(desktop.area).toBe(
      "M0 53.5L25 23.75L50 40.75L75 81.75L75 100L50 100L25 100L0 100Z",
    );
    expect(mobile.points[2]).toEqual({ x: 50, y: null, value: null });

    const stacked = lineChartPaths(SERIES, values, xs, axis, {
      area: true,
      stacked: true,
    });
    // The missing value adds nothing: the top series rests on the one below.
    expect(stacked[1].points[2]).toEqual({ x: 50, y: 40.75, value: null });
    expect(stacked[1].area.endsWith("L0 53.5Z")).toBe(true);
  });

  it("splits the plot into hit columns and picks the labelled ticks", () => {
    expect(lineChartColumns([0, 50, 100])).toEqual([
      { left: 0, width: 25 },
      { left: 25, width: 50 },
      { left: 75, width: 25 },
    ]);
    expect(lineChartTickIndexes(10, 4)).toEqual([0, 3, 6, 9]);
    expect(lineChartTickIndexes(3, 6)).toEqual([0, 1, 2]);
    expect(lineChartTip(5)).toEqual({ at: 5, align: "start" });
    expect(lineChartTip(50).align).toBe("center");
    expect(lineChartTip(95).align).toBe("end");
  });

  it("labels x values as text, dates or numbers", () => {
    expect(chartXLabel("Jan", "category", "en")).toBe("Jan");
    expect(chartXLabel("2026-03-04", "time", "en")).toBe("Mar 4");
    expect(chartXLabel(new Date(2026, 2, 4), "category", "de")).toBe("4. März");
    expect(chartXLabel(7, "category", "en")).toBe("7");
  });

  it("models the whole chart: columns with summaries, ticks and the axis width", () => {
    const model = lineChartModel({
      data: DATA,
      series: SERIES,
      xKey: "month",
      locale: "en",
      valueFormat: (n) => String(n),
    });
    expect(model.columns[2]).toMatchObject({
      key: "2",
      x: 66.67,
      label: "Mar",
      summary: "Mar: Desktop 237, Mobile –",
    });
    expect(model.yTicks.map((t) => [t.label, t.pct])).toEqual([
      ["0", 0],
      ["100", 25],
      ["200", 50],
      ["300", 75],
      ["400", 100],
    ]);
    expect(model.xTicks.map((t) => [t.label, t.align])).toEqual([
      ["Jan", "start"],
      ["Feb", "center"],
      ["Mar", "center"],
      ["Apr", "end"],
    ]);
    expect(model.widestY).toBe("100");
  });
});
