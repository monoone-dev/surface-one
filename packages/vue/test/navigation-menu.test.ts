import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneNavigationMenu,
  SoneNavigationMenuContent,
  SoneNavigationMenuItem,
  SoneNavigationMenuLink,
  SoneNavigationMenuList,
  SoneNavigationMenuTrigger,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const tree = (value: { value: string | null }) => () =>
  h(
    SoneNavigationMenu,
    {
      "aria-label": "Main",
      value: value.value,
      "onUpdate:value": (v: string | null) => (value.value = v),
    },
    () =>
      h(SoneNavigationMenuList, null, () => [
        h(SoneNavigationMenuItem, { value: "start" }, () => [
          h(
            SoneNavigationMenuTrigger,
            { id: "start" },
            () => "Getting started",
          ),
          h(SoneNavigationMenuContent, null, () => [
            h(SoneNavigationMenuLink, { href: "#intro" }, () => "Introduction"),
            h(
              SoneNavigationMenuLink,
              { href: "#install" },
              () => "Installation",
            ),
          ]),
        ]),
        h(SoneNavigationMenuItem, null, () =>
          h(
            SoneNavigationMenuLink,
            { href: "#docs", id: "docs", active: true },
            () => "Docs",
          ),
        ),
      ]),
  );

describe("SoneNavigationMenu", () => {
  it("renders the same navigation as Angular, contents in the page but hidden", async () => {
    const out = (
      await renderToString(createSSRApp({ render: tree({ value: null }) }))
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(out).toContain(
      '<nav class="navigation-menu" data-slot="navigation-menu" aria-label="Main"><ul class="navigation-menu-list" data-slot="navigation-menu-list"><li class="navigation-menu-item" data-slot="navigation-menu-item">',
    );
    expect(out).toMatch(
      /<button type="button" id="start" class="navigation-menu-trigger" data-slot="navigation-menu-trigger" aria-expanded="false" aria-controls="(sone-navigation-menu-[^"]+-content)" data-state="closed">Getting started<\/button><div class="navigation-menu-content" data-slot="navigation-menu-content" id="\1" hidden data-state="closed">/,
    );
    expect(out).toContain(
      '<a class="navigation-menu-link" data-slot="navigation-menu-link" aria-current="page" data-active href="#docs" id="docs">Docs</a>',
    );
  });

  it("opens on click and ArrowDown, closes on Escape back on the trigger", async () => {
    const state = ref<string | null>(null);
    const wrapper = mount(
      defineComponent({
        setup: () => tree(state as unknown as { value: string | null }),
      }),
      { attachTo: document.body },
    );
    const trigger = wrapper.get("#start");
    await trigger.trigger("click");
    await flush();
    expect(state.value).toBe("start");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    await trigger.trigger("click");
    await flush();
    expect(state.value).toBeNull();
    (trigger.element as HTMLElement).focus();
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flush();
    expect(document.activeElement?.textContent).toBe("Introduction");
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flush();
    expect(state.value).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });
});
