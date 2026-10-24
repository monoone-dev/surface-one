import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneAccordion,
  SoneAccordionContent,
  SoneAccordionIcon,
  SoneAccordionItem,
  SoneAccordionTrigger,
  type AccordionValue,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const items = (disabled = "") => [
  h(SoneAccordionItem, { value: "a" }, () => [
    h(SoneAccordionTrigger, null, () => "First"),
    h(SoneAccordionContent, null, () => "One"),
  ]),
  h(SoneAccordionItem, { value: "b", disabled: disabled === "b" }, () => [
    h(SoneAccordionTrigger, { level: 4 }, () => "Second"),
    h(SoneAccordionContent, null, () => "Two"),
  ]),
  h(SoneAccordionItem, { value: "c" }, () => [
    h(SoneAccordionTrigger, null, {
      default: () => "Third",
      icon: () => h(SoneAccordionIcon, null, () => "+"),
    }),
    h(SoneAccordionContent, null, () => "Three"),
  ]),
];

describe("SoneAccordion", () => {
  it("renders the WAI-ARIA accordion markup on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(SoneAccordion, { modelValue: "a" }, () => items()),
      }),
    );
    expect(html).toContain(
      '<div class="accordion" data-slot="accordion" data-orientation="vertical">',
    );
    expect(html).toContain(
      '<sone-accordion-trigger class="accordion-header" data-slot="accordion-header" role="heading" aria-level="3" data-state="open">',
    );
    expect(html).toContain('aria-level="4"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="region"');
  });

  it("single: opens one item at a time, collapsible closes it, v-model follows", async () => {
    const value = ref<AccordionValue>(null);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            SoneAccordion,
            {
              modelValue: value.value,
              "onUpdate:modelValue": (v: AccordionValue) => (value.value = v),
              collapsible: true,
            },
            () => items(),
          ),
      }),
      { attachTo: document.body },
    );
    const triggers = wrapper.findAll("button.accordion-trigger");
    const contents = wrapper.findAll('[data-slot="accordion-content"]');
    expect(triggers[0]!.attributes("aria-controls")).toBe(
      contents[0]!.attributes("id"),
    );
    expect(contents[0]!.attributes("aria-labelledby")).toBe(
      triggers[0]!.attributes("id"),
    );
    expect(contents[0]!.attributes("hidden")).toBeDefined();
    await triggers[0]!.trigger("click");
    expect(value.value).toBe("a");
    expect(triggers[0]!.attributes("aria-expanded")).toBe("true");
    expect(contents[0]!.attributes("hidden")).toBeUndefined();
    await triggers[1]!.trigger("click");
    expect(value.value).toBe("b");
    expect(triggers[0]!.attributes("aria-expanded")).toBe("false");
    await triggers[1]!.trigger("click");
    expect(value.value).toBeNull();
    wrapper.unmount();
  });

  it("multiple: keeps several open; a disabled item stays shut", async () => {
    const wrapper = mount(SoneAccordion, {
      props: { type: "multiple" },
      slots: { default: () => items("b") },
    });
    const triggers = wrapper.findAll("button.accordion-trigger");
    await triggers[0]!.trigger("click");
    await triggers[2]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")!.at(-1)).toEqual([["a", "c"]]);
    expect(triggers[1]!.attributes("disabled")).toBeDefined();
    expect(
      wrapper
        .findAll('[data-slot="accordion-item"]')[1]!
        .attributes("data-disabled"),
    ).toBe("");
    // The #icon slot replaces the chevron.
    expect(
      triggers[2]!.find('[data-slot="accordion-trigger-icon"]').text(),
    ).toBe("+");
  });

  it("moves focus between the triggers with the arrow keys", async () => {
    const wrapper = mount(SoneAccordion, {
      slots: { default: () => items() },
      attachTo: document.body,
    });
    await nextTick();
    const triggers = wrapper.findAll("button.accordion-trigger");
    (triggers[0]!.element as HTMLElement).focus();
    await triggers[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[1]!.element);
    await triggers[1]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(triggers[2]!.element);
    await triggers[2]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[0]!.element);
    wrapper.unmount();
  });

  it("parts need their item", () => {
    expect(() => mount(SoneAccordionContent)).toThrow(
      /needs a SoneAccordionItem/,
    );
  });
});
