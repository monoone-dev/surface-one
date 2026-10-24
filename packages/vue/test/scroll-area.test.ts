import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import { SoneScrollArea } from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SoneScrollArea", () => {
  it("renders the scroll area like Angular on the server", async () => {
    const out = await renderToString(
      createSSRApp({
        render: () =>
          h(SoneScrollArea, { fade: true, "aria-label": "Tags" }, () => "x"),
      }),
    );
    expect(out).toBe(
      '<div class="scroll-area" data-slot="scroll-area" data-orientation="vertical" data-fade aria-label="Tags">x</div>',
    );
  });

  it("is a named region and a keyboard stop while it overflows", async () => {
    const wrapper = mount(SoneScrollArea, {
      props: { orientation: "horizontal" },
      attrs: { "aria-label": "Tags" },
      slots: { default: () => "x" },
      attachTo: document.body,
    });
    const el = wrapper.element as HTMLElement;
    expect(el.getAttribute("role")).toBe("region");
    expect(el.hasAttribute("tabindex")).toBe(false);
    Object.defineProperty(el, "scrollWidth", { value: 300 });
    Object.defineProperty(el, "clientWidth", { value: 100 });
    (wrapper.vm as unknown as { update(): void }).update();
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.hasAttribute("data-overflow-end")).toBe(true);
    await wrapper.setProps({ orientation: "vertical" });
    await nextTick();
    expect(el.getAttribute("data-orientation")).toBe("vertical");
    expect(el.hasAttribute("tabindex")).toBe(false);
    wrapper.unmount();
  });
});
