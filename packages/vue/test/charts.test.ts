import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";

import { SoneBarList, SoneSparkline, provideSoneMessages } from "../src/index";

const ITEMS = [
  { key: "a", label: "Alpha", value: 30 },
  { key: "b", label: "Beta", value: 10, tone: "success" as const },
  { key: "c", label: "Gamma", value: 0, valueLabel: "none", title: "Gamma!" },
];

describe("SoneBarList", () => {
  it("renders a labelled list scaled to the largest value", () => {
    const w = mount(SoneBarList, {
      props: { items: ITEMS, ariaLabel: "By model" },
    });
    expect(w.find("ul").attributes("aria-label")).toBe("By model");
    const rows = w.findAll("li");
    expect(rows.map((r) => r.attributes("style"))).toEqual([
      "--_color: var(--accent);",
      "--_color: var(--success);",
      "--_color: var(--accent);",
    ]);
    expect(rows.map((r) => r.find(".bar-list-value").text())).toEqual([
      "30",
      "10",
      "none",
    ]);
    const fills = w.findAll(".bar-list-fill");
    // A zero row draws no fill at all, not a minimum-width sliver.
    expect(fills).toHaveLength(2);
    expect(fills[0]!.attributes("style")).toContain("width: 100%");
    expect(fills[1]!.attributes("style")).toContain("width: 33.3");
    expect(rows[2]!.find(".bar-list-label").attributes("title")).toBe("Gamma!");
    expect(w.find(".bar-list-track").attributes("aria-hidden")).toBe("true");
  });

  it("scales to the total or a fixed max and formats values", () => {
    const total = mount(SoneBarList, {
      props: { items: ITEMS, scale: "total", valueFormat: (n) => `${n} t` },
    });
    expect(total.find(".bar-list-fill").attributes("style")).toContain(
      "width: 75%",
    );
    expect(total.find(".bar-list-value").text()).toBe("30 t");
    const fixed = mount(SoneBarList, { props: { items: ITEMS, max: 60 } });
    expect(fixed.find(".bar-list-fill").attributes("style")).toContain(
      "width: 50%",
    );
  });

  it("renders the label scoped slot in place of the text", () => {
    const w = mount(SoneBarList, {
      props: { items: ITEMS },
      slots: {
        label: ({ item }: { item: { label: string } }) =>
          h("b", { class: "custom" }, item.label.toUpperCase()),
      },
    });
    expect(w.findAll(".custom").map((b) => b.text())).toEqual([
      "ALPHA",
      "BETA",
      "GAMMA",
    ]);
  });
});

describe("SoneSparkline", () => {
  it("is decorative by default and draws one stretched svg with one path", () => {
    const w = mount(SoneSparkline, { props: { values: [0, 2, 4] } });
    const host = w.find("sone-sparkline");
    expect(host.attributes("aria-hidden")).toBe("true");
    expect(host.attributes("role")).toBeUndefined();
    expect(host.attributes("style")).toBe("--_color: var(--accent);");
    const svg = w.find("svg");
    expect(svg.attributes("preserveAspectRatio")).toBe("none");
    expect(w.findAll("path")).toHaveLength(1);
    // max defaults to niceCeiling(values, 4) = 5, so 4 sits at 80 %.
    expect(w.find("path").attributes("d")).toBe("M0 100L50 60L100 20");
    expect(w.find("path").attributes("vector-effect")).toBe(
      "non-scaling-stroke",
    );
    expect(w.html()).not.toMatch(/<defs|\sid=/);
  });

  it("draws an area under the line, bars as one path and heat as cells", () => {
    const area = mount(SoneSparkline, {
      props: { values: [1, 3], type: "area" },
    });
    expect(area.findAll("path").map((p) => p.classes()[0])).toEqual([
      "sparkline-area",
      "sparkline-line",
    ]);
    const bar = mount(SoneSparkline, {
      props: { values: [1, 3], type: "bar" },
    });
    expect(bar.findAll("path")).toHaveLength(1);
    const heat = mount(SoneSparkline, {
      props: { values: [0, 1, 5], type: "heat", max: 5 },
    });
    expect(heat.findAll("rect").map((r) => r.attributes("data-level"))).toEqual(
      ["0", "1", "5"],
    );
  });

  it("becomes a named image when not decorative", () => {
    const w = mount(SoneSparkline, {
      props: { values: [1, 4, 2], decorative: false },
    });
    const host = w.find("sone-sparkline");
    expect(host.attributes("role")).toBe("img");
    expect(host.attributes("aria-hidden")).toBeUndefined();
    expect(host.attributes("aria-label")).toBe("3 values, peak 4, total 7");
    const own = mount(SoneSparkline, {
      props: { values: [1], decorative: false, summary: "Busy week" },
    });
    expect(own.find("sone-sparkline").attributes("aria-label")).toBe(
      "Busy week",
    );
    const pl = mount(SoneSparkline, {
      props: { values: [1, 4], decorative: false },
      global: {
        plugins: [
          {
            install: (app) =>
              provideSoneMessages(app, {
                sparklineSummary: (n, peak, total) =>
                  `${n} wartości, szczyt ${peak}, razem ${total}`,
              }),
          },
        ],
      },
    });
    expect(pl.find("sone-sparkline").attributes("aria-label")).toBe(
      "2 wartości, szczyt 4, razem 5",
    );
  });
});
