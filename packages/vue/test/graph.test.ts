import { flushPromises, mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it, vi } from "vitest";

import {
  SoneGraph,
  SoneGraphCard,
  SoneGraphControls,
  SoneGraphLegend,
  runGraphLayout,
  type SoneGraphData,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const DATA: SoneGraphData = {
  nodes: [
    { id: "ada", label: "Ada", tone: "person" },
    { id: "kick", label: "Kickoff", tone: "meeting", shape: "square" },
    { id: "spec", label: "Spec" },
    { id: "ada", label: "Duplicate" },
  ],
  edges: [
    { source: "ada", target: "kick", weight: 2 },
    { source: "kick", target: "spec" },
    { source: "ada", target: "nobody" },
  ],
};

describe("SoneGraph", () => {
  it("renders the frame, the named canvas and the controls on the server, pending its layout", async () => {
    const out = await ssr(() =>
      h(SoneGraph, { data: DATA }, () =>
        h(SoneGraphLegend, () => "People · Meetings"),
      ),
    );
    expect(out).toMatch(
      /^<sone-graph data-slot="graph" data-state="pending" data-layout="force"><div class="g-frame" data-slot="graph-frame">/,
    );
    expect(out).toMatch(
      /<canvas data-slot="graph-canvas" tabindex="0" style="cursor:grab;" class="g-canvas" role="application" aria-roledescription="network diagram" aria-label="Graph of 3 nodes · 2 links" aria-describedby="sone-graph-[^"]+-hint"><\/canvas>/,
    );
    expect(out).toContain(
      '<sone-graph-controls data-slot="graph-controls" role="toolbar" aria-label="Graph controls"><div class="gc-panel gc-info" data-slot="graph-controls-info"><span data-slot="graph-legend">People · Meetings</span><span data-slot="graph-summary">3 nodes · 2 links</span></div>',
    );
    expect(out).toMatch(
      /aria-label="Show nodes as a list" aria-pressed="false"/,
    );
    expect(out).toMatch(/aria-label="Fit graph to view"[^>]*>Fit<\/button>/);
    expect(out).toContain(
      '<span class="gc-zoom" aria-hidden="true">100%</span>',
    );
    const hint = /aria-describedby="([^"]+)"/.exec(out)?.[1];
    expect(out).toContain(`<span class="sr-only" id="${hint}">Arrow keys move`);
    expect(out).toContain('<span class="sr-only" aria-live="polite"></span>');
    expect(out).not.toContain("g-list");
  });

  it("names an empty graph and hides the list toggle and the summary on request", async () => {
    const out = await ssr(() =>
      h(SoneGraph, { listToggle: false, summary: "" }),
    );
    expect(out).toContain('data-state="empty"');
    expect(out).toContain('aria-label="Graph — empty."');
    expect(out).not.toContain("aria-pressed");
    expect(out).not.toContain("graph-summary");
  });

  it("lays out once mounted, then picks, announces, pins a card and opens with the keyboard", async () => {
    const wrapper = mount(SoneGraph, {
      props: { data: DATA, layout: "layers" },
      attachTo: document.body,
    });
    await nextTick();
    expect(wrapper.attributes("data-state")).toBe("ready");
    expect(wrapper.attributes("data-layout")).toBe("layers");

    const canvas = wrapper.find("canvas");
    await canvas.trigger("keydown", { key: "Enter" });
    const picked = wrapper.emitted("update:selected")?.[0]?.[0] as string;
    expect(["ada", "kick", "spec"]).toContain(picked);
    const live = wrapper.find('[aria-live="polite"]');
    expect(live.text()).toMatch(/^(Ada|Kickoff|Spec) — \d links?\.$/);
    const card = wrapper.find('sone-graph-card[data-state="pinned"]');
    expect(card.exists()).toBe(true);
    expect(card.find('[data-slot="graph-card-meta"]').text()).toMatch(
      /links?$/,
    );

    await canvas.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("nodeOpen")?.[0]).toEqual([picked]);
    await card.find("button").trigger("click");
    expect(wrapper.emitted("nodeOpen")?.[1]).toEqual([picked]);

    await canvas.trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("update:selected")?.[1]).toEqual([null]);
    expect(live.text()).toBe("Selection cleared.");
    expect(wrapper.find("sone-graph-card").exists()).toBe(false);
    wrapper.unmount();
  });

  it("shows the node list, selects from it and opens the selected node", async () => {
    const wrapper = mount(SoneGraph, {
      props: {
        data: DATA,
        describe: (_n: unknown, info: { degree: number }) => `${info.degree}°`,
      },
    });
    await wrapper.find('[aria-label="Show nodes as a list"]').trigger("click");
    expect(wrapper.emitted("update:showList")?.[0]).toEqual([true]);
    const list = wrapper.find('ul[data-slot="graph-list"]');
    expect(list.attributes("aria-label")).toBe("Show nodes as a list");
    const nodes = list.findAll(".g-list-node");
    expect(nodes.map((b) => b.find(".g-list-label").text())).toEqual([
      "Ada",
      "Kickoff",
      "Spec",
    ]);
    expect(nodes[1].find(".g-list-meta").text()).toBe("2°");
    expect(nodes[1].find(".g-swatch").classes()).toContain("is-square");
    expect(nodes[1].find(".g-swatch").attributes("style")).toContain(
      "var(--graph-meeting)",
    );

    await nodes[1].trigger("click");
    expect(wrapper.emitted("update:selected")?.[0]).toEqual(["kick"]);
    expect(nodes[1].attributes("aria-pressed")).toBe("true");
    expect(wrapper.find('[aria-live="polite"]').text()).toBe("Kickoff — 2°.");
    const open = wrapper.find(".g-list-item .g-list-node + button");
    expect(open.text()).toBe("Open");
    await open.trigger("click");
    expect(wrapper.emitted("nodeOpen")?.[0]).toEqual(["kick"]);
    await nodes[1].trigger("click");
    expect(wrapper.emitted("update:selected")?.[1]).toEqual([null]);
  });

  it("drops a layout that resolves after a newer request, and falls back when a strategy fails", async () => {
    const strategy = vi.fn(() => Promise.reject(new Error("worker down")));
    const wrapper = mount(SoneGraph, {
      props: { data: DATA, layoutStrategy: strategy },
    });
    await nextTick();
    expect(wrapper.attributes("data-state")).toBe("pending");
    await flushPromises();
    expect(strategy).toHaveBeenCalledOnce();
    expect(wrapper.attributes("data-state")).toBe("ready");

    // A result for an outdated request is dropped: it would leave the graph pending.
    let late: () => void = () => {};
    const slow = vi.fn((req: Parameters<typeof runGraphLayout>[0]) =>
      slow.mock.calls.length === 1
        ? new Promise<ReturnType<typeof runGraphLayout>>((resolve) => {
            late = () => resolve(runGraphLayout(req));
          })
        : runGraphLayout(req),
    );
    await wrapper.setProps({ layoutStrategy: slow, layout: "clusters" });
    expect(wrapper.attributes("data-state")).toBe("pending");
    await wrapper.setProps({ layout: "layers" });
    expect(wrapper.attributes("data-state")).toBe("ready");
    late();
    await flushPromises();
    expect(wrapper.attributes("data-state")).toBe("ready");
  });

  it("fills the card slot with the node, its description and tone", async () => {
    const wrapper = mount(SoneGraph, {
      props: { data: DATA, selected: "spec" },
      slots: {
        card: (ctx: {
          node: { label: string };
          description: string;
          pinned: boolean;
        }) => h("b", `${ctx.node.label}: ${ctx.description} (${ctx.pinned})`),
      },
    });
    await nextTick();
    const card = wrapper.find("sone-graph-card");
    expect(card.find("b").text()).toBe("Spec: 1 link (true)");
    expect(card.find(".gcard-title").exists()).toBe(false);
    expect(card.find("button").text()).toBe("Open");
  });
});

describe("SoneGraphCard", () => {
  const anchor = (y: number) => ({
    key: "a",
    hovered: true,
    x: 40,
    y,
    r: 6,
    width: 600,
    height: 400,
  });

  it("floats above the node, kept inside the frame, or below it near the top edge", async () => {
    const above = mount(SoneGraphCard, {
      props: { heading: "Ada", meta: "2 links", anchor: anchor(200) },
    });
    expect(above.attributes("data-state")).toBe("floating");
    expect(above.attributes("style")).toBe("left: 132px; top: 184px;");
    expect(above.classes()).not.toContain("is-below");
    expect(above.attributes("data-node-x")).toBe("40");
    expect(above.find("button").exists()).toBe(false);

    const below = mount(SoneGraphCard, {
      props: { heading: "Ada", anchor: anchor(50) },
    });
    expect(below.classes()).toContain("is-below");
    expect(below.attributes("style")).toBe("left: 132px; top: 66px;");
    expect(below.find(".gcard-meta").exists()).toBe(false);
  });

  it("docks when pinned and offers the open action", async () => {
    const card = mount(SoneGraphCard, {
      props: {
        heading: "Ada",
        meta: "2 links",
        tone: "var(--graph-person)",
        square: true,
        pinned: true,
        openLabel: "Open",
        anchor: anchor(200),
      },
    });
    expect(card.attributes("data-state")).toBe("pinned");
    expect(card.attributes("style")).toBeUndefined();
    expect(card.find(".gcard-swatch").classes()).toContain("is-square");
    await card.find("button").trigger("click");
    expect(card.emitted("open")).toHaveLength(1);
  });
});

describe("SoneGraphControls", () => {
  it("is one tab stop whose arrow keys move between the buttons", async () => {
    const wrapper = mount(SoneGraphControls, {
      props: { label: "Graph controls", list: true, zoomPct: 125 },
      attachTo: document.body,
    });
    const buttons = () =>
      wrapper.findAll<HTMLButtonElement>(
        "[data-slot=graph-controls-actions] button",
      );
    expect(buttons().map((b) => b.element.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(buttons()[0].attributes("aria-pressed")).toBe("true");
    expect(wrapper.find(".gc-zoom").text()).toBe("125%");

    buttons()[0].element.focus();
    await buttons()[0].trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons()[1].element);
    expect(buttons().map((b) => b.element.tabIndex)).toEqual([-1, 0, -1, -1]);
    await buttons()[1].trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(buttons()[3].element);

    await buttons()[0].trigger("click");
    await buttons()[1].trigger("click");
    await buttons()[2].trigger("click");
    await buttons()[3].trigger("click");
    expect(wrapper.emitted("listChange")).toEqual([[false]]);
    expect(wrapper.emitted("fit")).toHaveLength(1);
    expect(wrapper.emitted("zoomOut")).toHaveLength(1);
    expect(wrapper.emitted("zoomIn")).toHaveLength(1);
    wrapper.unmount();
  });
});
