import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import { SonePageSiteHeader } from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SonePageSiteHeader", () => {
  it("renders the same header as Angular", async () => {
    const out = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(
              SonePageSiteHeader,
              { title: "Acme", href: "/home", sticky: true },
              {
                nav: () => h("nav", { "aria-label": "Main" }, "A"),
                menu: () => h("nav", "Menu"),
              },
            ),
        }),
      )
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(out).toContain(
      '<sone-page-site-header data-slot="page-site-header" data-sticky><header class="page-site-header" data-slot="page-site-header-bar"><div class="page-site-header-logo" data-slot="page-site-header-logo"><a class="page-site-header-title" href="/home">Acme</a></div><div class="page-site-header-nav" data-slot="page-site-header-nav"><nav aria-label="Main">A</nav></div>',
    );
    expect(out).toMatch(
      /<button class="btn page-site-header-toggle" data-slot="page-site-header-toggle" data-variant="ghost" data-size="icon" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Menu">/,
    );
  });

  it("opens the menu sheet and closes it on a link", async () => {
    const wrapper = mount(SonePageSiteHeader, {
      attachTo: document.body,
      props: { title: "Acme" },
      slots: { menu: () => h("a", { id: "menu-link", href: "#a" }, "A") },
    });
    await wrapper.find(".page-site-header-toggle").trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:open")).toEqual([[true]]);
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Menu");
    (document.getElementById("menu-link") as HTMLElement).click();
    await nextTick();
    expect(wrapper.emitted("update:open")!.at(-1)).toEqual([false]);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    wrapper.unmount();
  });
});
