import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneLineChart, type SoneLineChartSeries } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

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
  it("renders the axis, the paths, the points and the hidden table like Angular", async () => {
    const out = await ssr(() =>
      h(SoneLineChart, {
        data: DATA,
        series: SERIES,
        xKey: "month",
        ariaLabel: "Visitors",
      }),
    );
    expect(out).toContain('<sone-line-chart data-slot="line-chart">');
    expect(out).toContain(
      '<span class="line-chart-y-tick" style="bottom:25%;">100</span>',
    );
    expect(out).toContain(
      '<path class="line-chart-line" d="M0 53.5L50 23.75L100 40.75" style="--_color:var(--chart-1);"></path>',
    );
    expect(out).toContain(
      '<path class="line-chart-line" d="M0 80L50 50" style="--_color:var(--chart-4);"></path>',
    );
    expect(out).toContain(
      '<div class="line-chart-col" data-slot="line-chart-point" role="img" aria-label="Mar: Desktop 237, Mobile –" tabindex="0" style="left:75%;width:25%;"></div>',
    );
    expect(out).toContain(
      '<span class="line-chart-x-tick" data-align="start" style="left:0%;">Jan</span>',
    );
    expect(out).toContain('data-slot="chart-legend"');
    expect(out).toContain(
      '<table class="sr-only"><caption>Visitors</caption><thead><tr><th scope="col">Category</th><th scope="col">Desktop</th><th scope="col">Mobile</th></tr></thead>',
    );
    expect(out).toContain(
      '<tr><th scope="row">Mar</th><td>237</td><td>–</td></tr>',
    );
  });

  it("fills and stacks areas", async () => {
    const out = await ssr(() =>
      h(SoneLineChart, {
        data: DATA,
        series: SERIES,
        xKey: "month",
        area: true,
        stacked: true,
        curve: "smooth",
      }),
    );
    expect(out).toContain('<sone-line-chart data-slot="line-chart" data-area>');
    expect(out.match(/class="line-chart-area"/g)).toHaveLength(2);
    expect(out).toMatch(/class="line-chart-line" d="M0 [\d.]+C/);
  });

  it("moves a roving focus and shows the tooltip", async () => {
    const wrapper = mount(SoneLineChart, {
      attachTo: document.body,
      props: { data: DATA, series: SERIES, xKey: "month" },
    });
    const cols = () => wrapper.findAll('[data-slot="line-chart-point"]');
    await cols()[2].trigger("focus");
    expect(wrapper.find('[data-slot="line-chart-tooltip"]').text()).toContain(
      "Mar",
    );
    await cols()[2].trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cols()[1].element);
    expect(cols()[1].attributes("tabindex")).toBe("0");
    expect(wrapper.findAll(".line-chart-dot[data-shown]")).toHaveLength(2);
    await cols()[1].trigger("keydown", { key: "Escape" });
    expect(wrapper.find('[data-slot="line-chart-tooltip"]').exists()).toBe(
      false,
    );
    wrapper.unmount();
  });
});
