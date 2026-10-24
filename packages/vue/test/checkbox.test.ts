import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneCheckbox } from "../src/index";

describe("SoneCheckbox", () => {
  it("renders the native checkbox the Angular directive marks up, on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => [
          h(SoneCheckbox, { id: "terms", modelValue: true }),
          h(SoneCheckbox, { indeterminate: true }),
        ],
      }),
    );
    expect(html).toContain(
      '<input type="checkbox" data-slot="checkbox" checked id="terms">',
    );
    // The mixed state is a DOM property only: nothing on the server.
    expect(html).not.toContain("indeterminate");
  });

  it("is a v-model and v-model:indeterminate pair; a click clears the mixed state", async () => {
    const checked = ref(false);
    const mixed = ref(true);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(SoneCheckbox, {
            "aria-label": "All files",
            modelValue: checked.value,
            "onUpdate:modelValue": (v: boolean) => (checked.value = v),
            indeterminate: mixed.value,
            "onUpdate:indeterminate": (v: boolean) => (mixed.value = v),
          }),
      }),
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("All files");
    expect(input.indeterminate).toBe(true);
    await wrapper.find("input").setValue(true);
    expect(checked.value).toBe(true);
    expect(mixed.value).toBe(false);
    expect(input.indeterminate).toBe(false);
    mixed.value = true;
    await wrapper.vm.$nextTick();
    expect(input.indeterminate).toBe(true);
  });

  it("follows the owner's value and passes disabled through", async () => {
    const wrapper = mount(SoneCheckbox, {
      props: { modelValue: false },
      attrs: { disabled: true, name: "backup" },
    });
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.checked).toBe(false);
    expect(input.disabled).toBe(true);
    expect(input.name).toBe("backup");
    await wrapper.setProps({ modelValue: true });
    expect(input.checked).toBe(true);
  });
});
