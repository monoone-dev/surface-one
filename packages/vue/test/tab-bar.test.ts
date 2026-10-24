import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneTabBar, type TabBarItem } from "../src/index";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", href: "/home" },
  { value: "search", label: "Search" },
  { value: "inbox", label: "Inbox", disabled: true },
];

describe("SoneTabBar", () => {
  it("renders the same nav as Angular", async () => {
    const out = (
      await renderToString(
        createSSRApp({
          render: () => h(SoneTabBar, { items: ITEMS, modelValue: "home" }),
        }),
      )
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(out).toContain(
      '<sone-tab-bar data-slot="tab-bar" data-floating data-labels="active"><nav class="tab-bar" data-slot="tab-bar-nav" aria-label="Tab bar"><ul class="tab-bar-list" role="list"><li class="tab-bar-cell"><a class="tab-bar-item" data-slot="tab-bar-item" href="/home" data-active aria-current="page"><span class="tab-bar-label">Home</span></a></li>',
    );
    expect(out).toContain(
      '<button type="button" class="tab-bar-item" data-slot="tab-bar-item"><span class="tab-bar-label sr-only">Search</span></button>',
    );
    expect(out).toContain("disabled");
  });

  it("updates v-model on a click, not for a disabled tab", async () => {
    const wrapper = mount(SoneTabBar, {
      props: { items: ITEMS, modelValue: "home", labels: "always" },
    });
    const tabs = wrapper.findAll(".tab-bar-item");
    await tabs[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([["search"]]);
    expect(tabs[1]!.attributes("aria-current")).toBe("true");
    await tabs[2]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.findAll(".sr-only")).toHaveLength(0);
  });
});
