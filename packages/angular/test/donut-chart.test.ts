import { ChangeDetectionStrategy, Component } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneDonutChartComponent } from "@surface-one/angular/donut-chart";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneDonutChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-donut-chart
      [segments]="segments"
      label="Visitors"
      ariaLabel="Visitors by browser"
    />
  `,
})
class DonutHost {
  readonly segments = [
    { key: "chrome", label: "Chrome", value: 275 },
    { key: "safari", label: "Safari", value: 200 },
    { key: "firefox", label: "Firefox", value: 0 },
    { key: "edge", label: "Edge", value: 125 },
  ];
}

describe("sone-donut-chart", () => {
  it("draws a segment per part, the total in the centre, the legend and the table", async () => {
    await render(DonutHost);
    expect($("sone-donut-chart").getAttribute("data-slot")).toBe("donut-chart");
    const segs = $$('[data-slot="donut-chart-segment"]');
    expect(segs.map((s) => s.getAttribute("aria-label"))).toEqual([
      "Chrome: 275 (46%)",
      "Safari: 200 (33%)",
      "Edge: 125 (21%)",
    ]);
    expect(segs.map((s) => s.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
    expect($("svg[role=group]").getAttribute("aria-label")).toBe(
      "Visitors by browser",
    );
    expect($(".donut-chart-value").textContent!.trim()).toBe("600");
    expect($(".donut-chart-label").textContent!.trim()).toBe("Visitors");
    expect(
      $$('[data-slot="chart-legend-item"]').map((i) => i.textContent!.trim()),
    ).toEqual(["Chrome275", "Safari200", "Firefox0", "Edge125"]);
    expect(
      $$("table.sr-only tbody tr").map((tr) => tr.textContent!.trim()),
    ).toEqual(["Chrome27546%", "Safari20033%", "Firefox00%", "Edge12521%"]);
  });

  it("moves around the ring and shows the focused part in the centre", async () => {
    const fixture = await render(DonutHost);
    const segs = $$<SVGPathElement>('[data-slot="donut-chart-segment"]');
    segs[0].dispatchEvent(new FocusEvent("focus"));
    await settle(fixture);
    expect($(".donut-chart-value").textContent!.trim()).toBe("275");
    expect($(".donut-chart-label").textContent!.trim()).toBe("Chrome");
    expect(segs[1].hasAttribute("data-dimmed")).toBe(true);
    key(segs[0], "ArrowLeft");
    await settle(fixture);
    expect(segs[2].getAttribute("tabindex")).toBe("0");
    expect($(".donut-chart-label").textContent!.trim()).toBe("Edge");
    key(segs[2], "Escape");
    await settle(fixture);
    expect($(".donut-chart-value").textContent!.trim()).toBe("600");
  });
});
