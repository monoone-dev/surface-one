import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneMark,
  SoneRail,
  SoneRailButton,
  SoneRailGroup,
  SoneTabStrip,
  type TabStripTab,
} from "../src/index";

const ssr = async (render: () => ReturnType<typeof h>) =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const TABS: TabStripTab[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta", status: "busy", note: "4 min" },
  { id: "c", label: "Gamma" },
];

describe("SoneRail", () => {
  it("renders the same nav and buttons as Angular", async () => {
    const out = await ssr(() =>
      h(SoneRail, { ariaLabel: "App" }, () =>
        h(SoneRailGroup, null, () => [
          h(SoneRailButton, { icon: "search", label: "Search", current: true }),
          h(SoneRailButton, { icon: "bell", label: "Inbox", badge: "busy" }),
        ]),
      ),
    );
    expect(out).toContain(
      '<sone-rail data-slot="rail"><nav class="rail" data-slot="rail-nav" aria-label="App"><div class="rail-group" data-slot="rail-group"><sone-rail-button data-slot="rail-button"><button type="button" class="rail-button" data-slot="rail-button-trigger" aria-label="Search" title="Search" aria-current="page">',
    );
    expect(out).toContain(
      '<span class="rail-badge" data-slot="rail-badge" data-badge="busy" aria-hidden="true"></span>',
    );
  });

  it("names the landmark with the message by default", async () => {
    expect(await ssr(() => h(SoneRail))).toContain('aria-label="Main"');
  });
});

describe("SoneTabStrip", () => {
  it("renders a tablist whose tabs point at their panels", async () => {
    const out = await ssr(() =>
      h(SoneTabStrip, {
        tabs: TABS,
        active: "b",
        closable: true,
        addable: true,
        panelIdPrefix: "doc",
      }),
    );
    expect(out).toContain(
      '<div class="tab-strip-tabs" data-slot="tab-strip-list" role="tablist" aria-label="Tabs">',
    );
    expect(out).toContain(
      'id="doc-tab-b" aria-selected="true" aria-controls="doc-b" tabindex="0"',
    );
    expect(out).toContain(
      'id="doc-tab-a" aria-selected="false" aria-controls="doc-a" tabindex="-1"',
    );
    expect(out).toContain('<span class="sr-only">, running</span>');
    expect(out).toContain('aria-label="Close Beta"');
    expect(out).toContain('aria-label="New tab"');
  });

  it("moves with the arrows, Home and End, and closes with Delete", async () => {
    const wrapper = mount(SoneTabStrip, {
      props: { tabs: TABS, active: "a", closable: true },
      attachTo: document.body,
    });
    const tabs = () => wrapper.findAll('[role="tab"]');
    await tabs()[0]!.trigger("keydown", { key: "ArrowLeft" });
    await tabs()[0]!.trigger("keydown", { key: "ArrowRight" });
    await tabs()[0]!.trigger("keydown", { key: "End" });
    await tabs()[0]!.trigger("keydown", { key: "Home" });
    expect(wrapper.emitted("update:active")).toEqual([
      ["c"],
      ["b"],
      ["c"],
      ["a"],
    ]);
    await tabs()[1]!.trigger("keydown", { key: "Delete" });
    await tabs()[2]!.trigger("keydown", { key: "w", metaKey: true });
    expect(wrapper.emitted("close")).toEqual([["b"], ["c"]]);
    await wrapper.find(".tab-strip-close").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
    wrapper.unmount();
  });

  it("ignores Delete when it is not closable", async () => {
    const wrapper = mount(SoneTabStrip, { props: { tabs: TABS, active: "a" } });
    await wrapper.find('[role="tab"]').trigger("keydown", { key: "Delete" });
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(wrapper.find(".tab-strip-close").exists()).toBe(false);
  });
});

describe("SoneMark", () => {
  it("is a decorative gradient tile, or an image with a label", async () => {
    expect(
      await ssr(() => h(SoneMark, { icon: "code", tone: "iris" })),
    ).toContain(
      '<sone-mark data-slot="mark" data-tone="iris" data-size="md" aria-hidden="true">',
    );
    const out = await ssr(() => h(SoneMark, { size: 36, label: "GitHub" }));
    expect(out).toContain('style="--mark-size:36px;"');
    expect(out).toContain('role="img" aria-label="GitHub"');
  });
});
