import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneLineChartComponent,
  type SoneLineChartSeries,
} from "@surface-one/angular/line-chart";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
];

const SERIES: SoneLineChartSeries[] = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile", tone: "chart-4" },
];

@Component({
  imports: [SoneLineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-line-chart
      [data]="data"
      [series]="series"
      xKey="month"
      ariaLabel="Visitors"
      [curve]="curve()"
    />
  `,
})
class LineChartHost {
  readonly data = DATA;
  readonly series = SERIES;
  readonly curve = signal<"linear" | "smooth">("linear");
}

describe("sone-line-chart", () => {
  it("draws the axis, a path per series, the legend and the hidden table", async () => {
    await render(LineChartHost);
    expect($("sone-line-chart").getAttribute("data-slot")).toBe("line-chart");
    expect($$(".line-chart-y-tick").map((t) => t.textContent!.trim())).toEqual([
      "0",
      "100",
      "200",
      "300",
      "400",
    ]);
    const lines = $$<SVGPathElement>(".line-chart-line");
    expect(lines).toHaveLength(2);
    expect(lines[0].getAttribute("d")).toBe("M0 53.5L50 23.75L100 40.75");
    // The missing March value ends the mobile line at February.
    expect(lines[1].getAttribute("d")).toBe("M0 80L50 50");
    expect(lines[1].style.getPropertyValue("--_color")).toBe("var(--chart-4)");
    expect($$(".line-chart-area")).toHaveLength(0);
    expect($$(".line-chart-dot")).toHaveLength(5);
    expect($$(".line-chart-x-tick").map((t) => t.textContent!.trim())).toEqual([
      "Jan",
      "Feb",
      "Mar",
    ]);
    expect(
      $$('[data-slot="chart-legend-item"]').map((i) => i.textContent!.trim()),
    ).toEqual(["Desktop", "Mobile"]);
    expect($("table.sr-only caption").textContent!.trim()).toBe("Visitors");
    expect(
      $$("table.sr-only tbody tr").map((tr) => tr.textContent!.trim()),
    ).toEqual(["Jan18680", "Feb305200", "Mar237–"]);
  });

  it("is one Tab stop with a roving focus and a tooltip", async () => {
    const fixture = await render(LineChartHost);
    const cols = $$('[data-slot="line-chart-point"]');
    expect(cols.map((c) => c.getAttribute("aria-label"))).toEqual([
      "Jan: Desktop 186, Mobile 80",
      "Feb: Desktop 305, Mobile 200",
      "Mar: Desktop 237, Mobile –",
    ]);
    expect(cols.map((c) => c.getAttribute("tabindex"))).toEqual([
      "-1",
      "-1",
      "0",
    ]);
    expect($('[role="group"]').getAttribute("aria-label")).toBe("Visitors");

    cols[2].focus();
    await settle(fixture);
    expect($('[data-slot="line-chart-tooltip"]').textContent).toContain("Mar");
    key(cols[2], "Home");
    await settle(fixture);
    expect(document.activeElement).toBe(cols[0]);
    expect(cols[0].getAttribute("tabindex")).toBe("0");
    expect(
      $('[data-slot="line-chart-tooltip"]').getAttribute("data-align"),
    ).toBe("start");
    key(cols[0], "Escape");
    await settle(fixture);
    expect($('[data-slot="line-chart-tooltip"]')).toBeNull();
  });

  it("smooths the lines with a monotone curve", async () => {
    const fixture = await render(LineChartHost);
    fixture.componentInstance.curve.set("smooth");
    await settle(fixture);
    expect($$<SVGPathElement>(".line-chart-line")[0].getAttribute("d")).toMatch(
      /^M0 53\.5C/,
    );
  });
});
