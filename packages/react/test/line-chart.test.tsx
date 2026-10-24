import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneLineChart, type SoneLineChartSeries } from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
];

const SERIES: SoneLineChartSeries[] = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile", tone: "chart-4" },
];

describe("SoneLineChart", () => {
  it("renders the axis, the paths, the points and the hidden table like Angular", () => {
    const out = html(
      <SoneLineChart
        data={DATA}
        series={SERIES}
        xKey="month"
        ariaLabel="Visitors"
      />,
    );
    expect(out).toContain('<sone-line-chart data-slot="line-chart">');
    expect(out).toContain(
      '<span class="line-chart-y-tick" style="bottom:25%">100</span>',
    );
    expect(out).toContain(
      '<path class="line-chart-line" d="M0 53.5L50 23.75L100 40.75" style="--_color:var(--chart-1)"></path>',
    );
    expect(out).toContain(
      '<path class="line-chart-line" d="M0 80L50 50" style="--_color:var(--chart-4)"></path>',
    );
    expect(out).toContain(
      '<div class="line-chart-col" data-slot="line-chart-point" role="img" aria-label="Mar: Desktop 237, Mobile –" tabindex="0" style="left:75%;width:25%"></div>',
    );
    expect(out).toContain(
      '<span class="line-chart-x-tick" data-align="start" style="left:0%">Jan</span>',
    );
    expect(out).toContain('data-slot="chart-legend"');
    expect(out).toContain(
      '<table class="sr-only"><caption>Visitors</caption><thead><tr><th scope="col">Category</th><th scope="col">Desktop</th><th scope="col">Mobile</th></tr></thead>',
    );
    expect(out).toContain(
      '<tr><th scope="row">Mar</th><td>237</td><td>–</td></tr>',
    );
  });

  it("fills and stacks areas", () => {
    const out = html(
      <SoneLineChart
        data={DATA}
        series={SERIES}
        xKey="month"
        area
        stacked
        curve="smooth"
      />,
    );
    expect(out).toContain('data-area=""');
    expect(out.match(/class="line-chart-area"/g)).toHaveLength(2);
    expect(out).toMatch(/class="line-chart-line" d="M0 [\d.]+C/);
  });

  it("moves a roving focus and shows the tooltip", () => {
    const { container } = render(
      <SoneLineChart data={DATA} series={SERIES} xKey="month" />,
    );
    const cols = () =>
      container.querySelectorAll<HTMLElement>('[data-slot="line-chart-point"]');
    fireEvent.focus(cols()[2]);
    expect(
      container.querySelector('[data-slot="line-chart-tooltip"]')!.textContent,
    ).toContain("Mar");
    fireEvent.keyDown(cols()[2], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cols()[1]);
    expect(cols()[1].getAttribute("tabindex")).toBe("0");
    expect(
      container.querySelectorAll(".line-chart-dot[data-shown]"),
    ).toHaveLength(2);
    fireEvent.keyDown(cols()[1], { key: "Escape" });
    expect(
      container.querySelector('[data-slot="line-chart-tooltip"]'),
    ).toBeNull();
  });
});
