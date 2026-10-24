import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneAreaChartComponent } from "@surface-one/angular/area-chart";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
];

@Component({
  imports: [SoneAreaChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-area-chart
      [data]="data"
      [series]="series"
      xKey="month"
      ariaLabel="Visitors"
      [stacked]="stacked()"
    />
  `,
})
class AreaChartHost {
  readonly data = DATA;
  readonly series = [
    { key: "desktop", label: "Desktop" },
    { key: "mobile", label: "Mobile" },
  ];
  readonly stacked = signal(false);
}

describe("sone-area-chart", () => {
  it("is a line chart with areas down to zero and no dots", async () => {
    await render(AreaChartHost);
    expect($("sone-area-chart").getAttribute("data-slot")).toBe("area-chart");
    expect($("sone-area-chart sone-line-chart").hasAttribute("data-area")).toBe(
      true,
    );
    const areas = $$<SVGPathElement>(".line-chart-area");
    expect(areas).toHaveLength(2);
    expect(areas[0].getAttribute("d")).toBe(
      "M0 53.5L50 23.75L100 40.75L100 100L50 100L0 100Z",
    );
    expect($$(".line-chart-dot")).toHaveLength(0);
    expect(
      $$('[data-slot="line-chart-point"]')[0].getAttribute("aria-label"),
    ).toBe("Jan: Desktop 186, Mobile 80");
    expect($("table.sr-only caption").textContent!.trim()).toBe("Visitors");
  });

  it("stacks the series, each filling down to the one below", async () => {
    const fixture = await render(AreaChartHost);
    fixture.componentInstance.stacked.set(true);
    await settle(fixture);
    expect($("sone-area-chart").hasAttribute("data-stacked")).toBe(true);
    expect($$(".line-chart-y-tick").map((t) => t.textContent!.trim())).toEqual([
      "0",
      "200",
      "400",
      "600",
    ]);
    const [, mobile] = $$<SVGPathElement>(".line-chart-area");
    // The top series' area closes along the desktop line.
    expect(mobile.getAttribute("d")!.endsWith("L0 69Z")).toBe(true);
  });
});
