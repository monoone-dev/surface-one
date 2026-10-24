import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneSourceList, type SoneSourceListExposed } from "../src/index";

interface Source {
  id: string;
  title: string;
}

const SOURCES: Source[] = ["A", "B", "C", "D", "E"].map((t) => ({
  id: t.toLowerCase(),
  title: t,
}));
const byId = (s: Source): string => s.id;
const item = ({ item }: { item: Source }) => h("span", item.title);

// Without the SSR fragment anchors (`<!--[-->` … `<!--]-->`) the slots leave behind.
const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->/g,
    "",
  );

describe("SoneSourceList", () => {
  it("renders rows as a list with a label, a count and the Show all toggle", async () => {
    const out = await ssr(() =>
      h(
        SoneSourceList,
        {
          items: SOURCES,
          trackBy: byId,
          label: "Sources",
          showCount: true,
          limit: 2,
          size: "sm",
        },
        { item, icon: () => h("i", "*") },
      ),
    );
    expect(out).toBe(
      '<sone-source-list data-slot="source-list" data-variant="row" data-size="sm" data-columns="1">' +
        '<div class="source-list" data-slot="source-list-body">' +
        '<div class="source-list-head" data-slot="source-list-header"><i>*</i>' +
        '<span class="source-list-label" data-slot="source-list-label">Sources</span>' +
        '<span class="badge" data-slot="badge" data-variant="secondary">5</span></div>' +
        '<ul class="source-list-items" data-slot="source-list-items" role="list">' +
        '<li class="source-list-item" data-slot="source-list-item"><span>A</span></li>' +
        '<li class="source-list-item" data-slot="source-list-item"><span>B</span></li></ul>' +
        '<button class="btn source-list-toggle" data-slot="button" data-variant="link" data-size="xs" type="button" aria-expanded="false">Show all (5)</button>' +
        "</div></sone-source-list>",
    );
  });

  it("renders chips without list items and toggles +N more / Show less", async () => {
    const w = mount(SoneSourceList, {
      props: {
        items: SOURCES,
        trackBy: byId as (item: never) => string,
        variant: "chip",
        limit: 3,
        ariaLabel: "Answer sources",
      },
      slots: { item },
    });
    expect(
      w.find('[data-slot="source-list-body"]').attributes("aria-label"),
    ).toBe("Answer sources");
    expect(w.find("ul").exists()).toBe(false);
    expect(w.find('[data-slot="source-list-header"]').exists()).toBe(false);
    expect(w.findAll('[data-slot="source-list-items"] > span')).toHaveLength(3);
    const toggle = w.find("button");
    expect(toggle.attributes()).toMatchObject({ "data-size": "sm" });
    expect(toggle.attributes("aria-expanded")).toBeUndefined();
    expect(toggle.text()).toBe("+2 more");
    await toggle.trigger("click");
    expect(w.findAll('[data-slot="source-list-items"] > span')).toHaveLength(5);
    expect(w.find("button").text()).toBe("Show less");
    const exposed = w.vm as unknown as SoneSourceListExposed;
    expect(exposed.expanded).toBe(true);
    exposed.toggle();
    await w.vm.$nextTick();
    expect(w.findAll('[data-slot="source-list-items"] > span')).toHaveLength(3);
  });

  it("shows no toggle within the limit, and a list for chips when asked", async () => {
    const w = mount(SoneSourceList, {
      props: {
        items: SOURCES.slice(0, 2),
        trackBy: byId as (item: never) => string,
        variant: "chip",
        list: true,
        columns: 2,
        limit: 3,
      },
      slots: { item },
    });
    expect(w.find("button").exists()).toBe(false);
    expect(w.findAll("li")).toHaveLength(2);
    expect(w.attributes("data-columns")).toBe("2");
  });
});
