import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneDonutChart } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const SEGMENTS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 0 },
  { key: "edge", label: "Edge", value: 125 },
];

describe("SoneDonutChart", () => {
  it("renders the ring, the centre, the legend and the hidden table like Angular", async () => {
    const out = await ssr(() =>
      h(SoneDonutChart, { segments: SEGMENTS, ariaLabel: "Browsers" }),
    );
    expect(out).toContain(
      '<sone-donut-chart data-slot="donut-chart"><div class="donut-chart-figure" data-slot="donut-chart-figure" style="width:200px;">',
    );
    expect(out).toContain(
      '<svg class="donut-chart-svg" viewBox="0 0 100 100" role="group" aria-label="Browsers">',
    );
    expect(out).toMatch(
      /<path class="donut-chart-segment" data-slot="donut-chart-segment" role="img" aria-label="Chrome: 275 \(46%\)" tabindex="0" d="M[^"]+" style="--_color:var\(--chart-1\);"><\/path>/,
    );
    expect(out.match(/class="donut-chart-segment"/g)).toHaveLength(3);
    expect(out).toContain(
      '<span class="donut-chart-value">600</span><span class="donut-chart-label">Total</span>',
    );
    expect(out).toContain(
      '<thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead>',
    );
    expect(out).toContain(
      '<tr><th scope="row">Firefox</th><td>0</td><td>0%</td></tr>',
    );
  });

  it("writes the focused segment in the centre and moves around the ring", async () => {
    const wrapper = mount(SoneDonutChart, {
      attachTo: document.body,
      props: { segments: SEGMENTS, label: "Visitors" },
    });
    const segs = () => wrapper.findAll('[data-slot="donut-chart-segment"]');
    expect(wrapper.find(".donut-chart-label").text()).toBe("Visitors");
    await segs()[0].trigger("focus");
    expect(wrapper.find(".donut-chart-value").text()).toBe("275");
    expect(segs()[1].attributes("data-dimmed")).toBe("");
    await segs()[0].trigger("keydown", { key: "ArrowUp" });
    expect(segs()[2].attributes("tabindex")).toBe("0");
    expect(wrapper.find(".donut-chart-label").text()).toBe("Edge");
    await segs()[2].trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".donut-chart-value").text()).toBe("600");
    wrapper.unmount();
  });

  it("drops the centre for a pie and the legend on request", async () => {
    const out = await ssr(() =>
      h(SoneDonutChart, { segments: SEGMENTS, thickness: 1, legend: false }),
    );
    expect(out).not.toContain("donut-chart-center");
    expect(out).not.toContain("chart-legend");
  });
});
