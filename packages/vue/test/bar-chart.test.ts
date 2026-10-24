import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneBarChart, type SoneBarChartDatum } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const DATA: SoneBarChartDatum[] = [
  { key: "a", value: 2, label: "Mon" },
  { key: "b", value: 0, label: "Tue" },
  { key: "c", value: 4, label: "Wed" },
];

const TEN: SoneBarChartDatum[] = Array.from({ length: 10 }, (_, i) => ({
  key: String(i),
  value: i + 1,
}));

describe("SoneBarChart", () => {
  it("renders the bars, the axis and the hidden data table like Angular", async () => {
    const out = await ssr(() =>
      h(SoneBarChart, {
        data: DATA,
        ariaLabel: "Meetings",
        tick: (d: SoneBarChartDatum) => d.label ?? null,
      }),
    );
    expect(out).toContain(
      '<sone-bar-chart data-slot="bar-chart" data-zero="baseline" style="--_color:var(--accent);">',
    );
    expect(out).toContain(
      '<div class="bar-chart-plot" data-slot="bar-chart-plot" style="height:132px;">',
    );
    expect(out).toContain(
      '<div class="bar-chart-bars" role="group" aria-label="Meetings">',
    );
    expect(out).toContain(
      '<div class="bar-chart-col" data-slot="bar-chart-bar" role="img" aria-label="Mon: 2" tabindex="-1"><span class="bar-chart-bar" style="height:40%;"></span></div>',
    );
    expect(out).toContain(
      'aria-label="Tue: 0" tabindex="-1" data-empty><span class="bar-chart-bar bar-chart-bar--zero"></span>',
    );
    expect(out).toContain('aria-label="Wed: 4" tabindex="0"');
    expect(out).toContain(
      '<span class="bar-chart-tick"><span class="bar-chart-tick-text">Mon</span></span>',
    );
    expect(out).toContain(
      '<table class="sr-only"><caption>Meetings</caption><thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead>',
    );
    expect(out).toContain('<tr><th scope="row">Wed</th><td>4</td></tr>');
  });

  it("draws nothing for a zero with zero=gap and has no axis without tick", async () => {
    const out = await ssr(() =>
      h(SoneBarChart, { data: DATA, zero: "gap", tone: "chart-2" }),
    );
    expect(out).toContain('data-zero="gap"');
    expect(out).toContain(
      'aria-label="Tue: 0" tabindex="-1" data-empty></div>',
    );
    expect(out).not.toContain("bar-chart-axis");
    expect(out).not.toContain("<caption>");
  });

  it("uses yMax, the tooltip and the value format", async () => {
    const out = await ssr(() =>
      h(SoneBarChart, {
        data: DATA,
        yMax: 8,
        tooltip: (d: SoneBarChartDatum) => `${d.label} · ${d.value} meetings`,
        valueFormat: (n: number) => `${n}x`,
        categoryHeader: "Day",
        valueHeader: "Meetings",
      }),
    );
    expect(out).toContain('aria-label="Mon · 2 meetings"');
    expect(out).toContain('style="height:25%;"');
    expect(out).toContain("<td>2x</td>");
    expect(out).toContain(
      '<th scope="col">Day</th><th scope="col">Meetings</th>',
    );
  });

  it("moves the roving focus with the arrow keys, shows the tooltip and hides it on Escape", async () => {
    const wrapper = mount(SoneBarChart, {
      props: { data: DATA },
      attachTo: document.body,
    });
    const cols = () => wrapper.findAll(".bar-chart-col");
    expect(cols()[2].attributes("tabindex")).toBe("0");
    cols()[2].element.dispatchEvent(new FocusEvent("focus"));
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".bar-chart-tooltip").text()).toBe("Wed: 4");
    expect(wrapper.find(".bar-chart-tooltip").attributes("data-align")).toBe(
      "center",
    );

    await wrapper
      .find(".bar-chart-bars")
      .trigger("keydown", { key: "ArrowLeft" });
    expect(cols()[1].attributes("tabindex")).toBe("0");
    expect(cols()[2].attributes("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(cols()[1].element);
    expect(wrapper.find(".bar-chart-tooltip").text()).toBe("Tue: 0");
    expect(cols()[1].attributes("data-shown")).toBe("");

    await wrapper.find(".bar-chart-bars").trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(cols()[0].element);

    await wrapper.find(".bar-chart-bars").trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".bar-chart-tooltip").exists()).toBe(false);
    wrapper.unmount();
  });

  it("shows the hovered bar's tooltip and hides it when the pointer leaves", async () => {
    const wrapper = mount(SoneBarChart, { props: { data: DATA } });
    await wrapper.findAll(".bar-chart-col")[0].trigger("pointerenter");
    const tip = wrapper.find(".bar-chart-tooltip");
    expect(tip.text()).toBe("Mon: 2");
    expect(tip.attributes("data-align")).toBe("center");
    expect(tip.attributes("style")).toContain("bottom: 40%");
    await wrapper.find(".bar-chart-plot").trigger("pointerleave");
    expect(wrapper.find(".bar-chart-tooltip").exists()).toBe(false);
  });
});

describe("SoneBarChart tooltip placement", () => {
  it("anchors the tooltip to the start or end edge of the outer bars", async () => {
    const wrapper = mount(SoneBarChart, { props: { data: TEN } });
    const cols = wrapper.findAll(".bar-chart-col");
    await cols[0].trigger("pointerenter");
    let tip = wrapper.find(".bar-chart-tooltip");
    expect(tip.attributes("data-align")).toBe("start");
    expect(tip.attributes("style")).toContain("left: 0%");
    await cols[9].trigger("pointerenter");
    tip = wrapper.find(".bar-chart-tooltip");
    expect(tip.attributes("data-align")).toBe("end");
    expect(tip.attributes("style")).toContain("left: 100%");
    await cols[4].trigger("pointerenter");
    expect(wrapper.find(".bar-chart-tooltip").attributes("data-align")).toBe(
      "center",
    );
  });
});
