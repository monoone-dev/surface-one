import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneResizableGroup,
  SoneResizableHandle,
  SoneResizablePanel,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

function memory() {
  const items = new Map<string, string>();
  return {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
  };
}

function group(props: Record<string, unknown> = {}) {
  return () =>
    h(SoneResizableGroup, props, () => [
      h(
        SoneResizablePanel,
        { id: "nav", defaultSize: 25, minSize: 10, collapsible: true },
        () => "Nav",
      ),
      h(SoneResizableHandle, { withHandle: true }),
      h(SoneResizablePanel, { minSize: 20 }, () => "Content"),
    ]);
}

describe("SoneResizableGroup", () => {
  it("renders the panels and the splitter like Angular on the server", async () => {
    const out = await renderToString(createSSRApp({ render: group() }));
    expect(out).toContain(
      '<sone-resizable-group class="resizable-group" data-slot="resizable-group" data-direction="horizontal">',
    );
    expect(out).toContain('style="flex:25 1 0px;"');
    expect(out).toContain('role="separator"');
    expect(out).toContain('aria-label="Resize panels"');
    expect(out).toContain(
      '<div class="resizable-grip" data-slot="resizable-grip"></div>',
    );
  });

  it("moves with the keys, binds the sizes and saves them", async () => {
    const sizes = ref<number[]>([]);
    const storage = memory();
    const wrapper = mount(
      () =>
        group({
          sizes: sizes.value,
          "onUpdate:sizes": (v: number[]) => (sizes.value = v),
          autoSaveId: "mail",
          storage,
        })(),
      { attachTo: document.body },
    );
    await nextTick();
    await nextTick();
    const handle = wrapper.get('[data-slot="resizable-handle"]');
    expect(handle.attributes("aria-valuenow")).toBe("25");
    expect(handle.attributes("aria-controls")).toBe("nav");
    expect(handle.attributes("aria-orientation")).toBe("vertical");
    expect(
      (
        wrapper.findAll('[data-slot="resizable-panel"]')[1]
          .element as HTMLElement
      ).style.flex,
    ).toBe("75 1 0px");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(sizes.value).toEqual([35, 65]);
    expect(storage.getItem("sone-resizable:mail")).toBe("[35,65]");
    await handle.trigger("keydown", { key: "Enter" });
    expect(sizes.value).toEqual([0, 100]);
    expect(
      wrapper.get('[data-slot="resizable-panel"]').attributes("data-collapsed"),
    ).toBeDefined();
    wrapper.unmount();
  });

  it("reads stored sizes back", async () => {
    const storage = memory();
    storage.setItem("sone-resizable:mail", "[60,40]");
    const wrapper = mount(group({ autoSaveId: "mail", storage }), {
      attachTo: document.body,
    });
    await nextTick();
    await nextTick();
    expect(
      wrapper.get('[data-slot="resizable-handle"]').attributes("aria-valuenow"),
    ).toBe("60");
    wrapper.unmount();
  });
});
