import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";

import {
  SoneChartLegend,
  SoneStat,
  SoneStatGroup,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
  SoneSwatch,
} from "../src/index";

describe("SoneStat", () => {
  it("renders a dl with dt before dd and the group's columns", () => {
    const w = mount(() =>
      h(SoneStatGroup, { columns: 3, separated: true }, () =>
        h(SoneStat, { variant: "inset", labelPosition: "bottom" }, () => [
          h(SoneStatLabel, null, () => "Meetings"),
          h(SoneStatValue, null, () => "128"),
        ]),
      ),
    );
    const dl = w.find("dl");
    expect(dl.attributes("data-slot")).toBe("stat-group");
    expect(dl.attributes("data-columns")).toBe("3");
    expect(dl.attributes("data-separated")).toBe("");
    expect(dl.attributes("style")).toContain("--stat-columns: 3");
    const stat = w.find('[data-slot="stat"]');
    expect(stat.attributes("data-variant")).toBe("inset");
    expect(stat.attributes("data-label-position")).toBe("bottom");
    expect(stat.element.children[0]!.tagName).toBe("DT");
    expect(stat.element.children[1]!.tagName).toBe("DD");
  });

  it("speaks the trend's direction and colours it by sign", () => {
    const up = mount(SoneStatTrend, {
      props: { delta: 0.12 },
      slots: { default: () => "12%" },
    });
    expect(up.attributes("data-tone")).toBe("positive");
    expect(up.attributes("data-direction")).toBe("up");
    expect(up.find(".sr-only").text()).toBe("up");
    expect(up.find("svg").attributes("aria-hidden")).toBe("true");
    expect(up.text()).toContain("12%");

    const down = mount(SoneStatTrend, {
      props: { delta: -3, tone: "neutral" },
    });
    expect(down.attributes("data-tone")).toBe("neutral");
    expect(down.attributes("data-direction")).toBe("down");

    const none = mount(SoneStatTrend, { props: { delta: null } });
    expect(none.find("svg").exists()).toBe(false);
    expect(none.attributes("data-tone")).toBe("neutral");
  });
});

describe("SoneChartLegend", () => {
  const items = [
    { key: "a", label: "Alpha", tone: "graph-note", value: 1234.5 },
    { key: "b", label: "Beta", value: "4 GB" },
  ];

  it("renders swatches, labels and formatted values", () => {
    const w = mount(SoneChartLegend, { props: { items, locale: "de" } });
    const swatches = w.findAll('[data-slot="chart-swatch"]');
    expect(swatches[0]!.attributes("style")).toContain(
      "--swatch-color: var(--graph-note)",
    );
    // A missing tone falls back to the series' position.
    expect(swatches[1]!.attributes("style")).toContain("var(--chart-2)");
    expect(swatches[0]!.attributes("aria-hidden")).toBe("true");
    expect(w.text()).toContain("1.234,5");
    expect(w.find("button").exists()).toBe(false);
  });

  it("toggles a series with aria-pressed and v-model:hidden", async () => {
    const w = mount(SoneChartLegend, {
      props: { items, toggleable: true, hidden: ["b"] },
    });
    const [a, b] = w.findAll("button");
    expect(a!.attributes("aria-pressed")).toBe("true");
    expect(b!.attributes("aria-pressed")).toBe("false");
    await a!.trigger("click");
    expect(w.emitted("update:hidden")).toEqual([[["b", "a"]]]);
    expect(w.emitted("toggle")).toEqual([["a"]]);
    expect(a!.attributes("aria-pressed")).toBe("false");
  });

  it("passes any CSS colour through a swatch", () => {
    const w = mount(SoneSwatch, {
      props: { tone: "color-mix(in oklch, red 50%, blue)", shape: "line" },
    });
    expect(w.attributes("data-shape")).toBe("line");
    expect(w.attributes("style")).toContain(
      "color-mix(in oklch, red 50%, blue)",
    );
  });
});
