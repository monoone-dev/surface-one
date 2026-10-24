import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneRadio, SoneRadioGroup } from "../src/index";

const group = (props: Record<string, unknown>) =>
  h(SoneRadioGroup, props, () => [
    h(SoneRadio, { value: "a", "aria-label": "A" }),
    h(SoneRadio, { value: "b", "aria-label": "B" }),
    h(SoneRadio, { value: "c", "aria-label": "C", disabled: true }),
  ]);

describe("SoneRadioGroup", () => {
  it("renders the radiogroup and its native radios on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          group({ modelValue: "b", name: "plan", "aria-label": "Plan" }),
      }),
    );
    expect(html).toContain(
      '<div class="radio-group" data-slot="radio-group" role="radiogroup" data-orientation="vertical" aria-label="Plan">',
    );
    expect(html).toContain(
      '<input type="radio" data-slot="radio" name="plan" value="b" checked aria-label="B">',
    );
    expect(html).toContain('value="c" disabled aria-label="C"');
  });

  it("shares a unique name and is a v-model", async () => {
    const value = ref<string | null>(null);
    const wrapper = mount(
      defineComponent({
        render: () =>
          group({
            as: "fieldset",
            required: true,
            modelValue: value.value,
            "onUpdate:modelValue": (v: string) => (value.value = v),
          }),
      }),
    );
    const radios = wrapper.findAll("input");
    const name = radios[0]!.attributes("name");
    expect(name).toMatch(/^sone-radio-group-/);
    expect(radios.every((r) => r.attributes("name") === name)).toBe(true);
    expect(wrapper.find("fieldset").attributes("aria-required")).toBe("true");
    expect((radios[0]!.element as HTMLInputElement).required).toBe(true);
    await radios[1]!.setValue(true);
    expect(value.value).toBe("b");
    value.value = "a";
    await wrapper.vm.$nextTick();
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(false);
  });

  it("disables every radio of a disabled group", () => {
    const wrapper = mount(() => group({ disabled: true }));
    expect(
      wrapper
        .findAll("input")
        .every((r) => (r.element as HTMLInputElement).disabled),
    ).toBe(true);
    expect(
      wrapper.find('[role="radiogroup"]').attributes("aria-disabled"),
    ).toBe("true");
  });
});
