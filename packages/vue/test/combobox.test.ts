import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneCombobox,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "../src/index";

const OPTIONS: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  {
    label: "Vue",
    options: [
      { value: "nuxt", label: "Nuxt.js" },
      { value: "vitepress", label: "VitePress", disabled: true },
    ],
  },
  { value: "astro", label: "Astro" },
];

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

function setup(props: Record<string, unknown> = {}) {
  const value = ref<SoneComboboxValue>(
    (props["modelValue"] as SoneComboboxValue) ?? null,
  );
  const wrapper = mount(
    () =>
      h(SoneCombobox, {
        options: OPTIONS,
        ariaLabel: "Framework",
        ...props,
        modelValue: value.value,
        "onUpdate:modelValue": (v: SoneComboboxValue) => (value.value = v),
      }),
    { attachTo: document.body },
  );
  const input = wrapper.find<HTMLInputElement>("input");
  const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
  const options = () =>
    [...document.querySelectorAll<HTMLElement>('[role="option"]')].map((o) =>
      o.textContent!.trim(),
    );
  const active = () =>
    document
      .getElementById(input.attributes("aria-activedescendant") ?? "")
      ?.textContent?.trim();
  return { wrapper, value, input, listbox, options, active };
}

describe("SoneCombobox", () => {
  it("renders a closed combobox input on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SoneCombobox, {
            options: OPTIONS,
            modelValue: "nuxt",
            ariaLabel: "Framework",
          }),
      }),
    );
    expect(html).toContain(
      '<sone-combobox class="combobox" data-slot="combobox">',
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('value="Nuxt.js"');
    expect(html).not.toContain('role="listbox"');
  });

  it("opens on typing, filters, moves the highlight and picks with Enter", async () => {
    const { wrapper, value, input, listbox, options, active } = setup();
    await input.setValue("js");
    await flush();
    expect(input.attributes("aria-expanded")).toBe("true");
    expect(input.attributes("aria-controls")).toBe(listbox()!.id);
    expect(options()).toEqual(["Next.js", "Nuxt.js"]);
    expect(document.querySelector('[role="group"]')!.textContent).toContain(
      "Vue",
    );
    expect(active()).toBe("Next.js");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(active()).toBe("Nuxt.js");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(active()).toBe("Next.js");
    await input.trigger("keydown", { key: "End" });
    expect(active()).toBe("Nuxt.js");
    await input.trigger("keydown", { key: "Enter" });
    await flush();
    expect(value.value).toBe("nuxt");
    expect(listbox()).toBeNull();
    expect(input.element.value).toBe("Nuxt.js");
    wrapper.unmount();
  });

  it("skips disabled options, shows the empty state and closes on Escape", async () => {
    const { wrapper, input, listbox, active } = setup();
    await input.trigger("keydown", { key: "ArrowDown" });
    await flush();
    expect(listbox()).not.toBeNull();
    expect(active()).toBe("Next.js");
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(active()).toBe("Astro");
    await input.trigger("keydown", { key: "ArrowUp" });
    // VitePress is disabled.
    expect(active()).toBe("Nuxt.js");
    await input.setValue("zzz");
    await flush();
    expect(listbox()).toBeNull();
    expect(document.querySelector('[role="status"]')!.textContent).toBe(
      "No results found.",
    );
    await input.trigger("keydown", { key: "Escape" });
    await flush();
    expect(input.attributes("aria-expanded")).toBe("false");
    expect(input.element.value).toBe("");
    wrapper.unmount();
  });

  it("picks several options as chips in multiple mode, Backspace removes the last", async () => {
    const { wrapper, value, input, options } = setup({
      multiple: true,
      modelValue: ["astro"],
    });
    expect(wrapper.findAll(".combobox-chip").map((c) => c.text())).toEqual([
      "Astro",
    ]);
    await input.trigger("click");
    await flush();
    expect(
      document
        .querySelector('[role="listbox"]')!
        .getAttribute("aria-multiselectable"),
    ).toBe("true");
    expect(options()).toContain("Astro");
    [...document.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((o) => o.textContent!.includes("Next.js"))!
      .click();
    await flush();
    expect(value.value).toEqual(["astro", "next"]);
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    await wrapper
      .find('.combobox-chip-remove[aria-label="Remove Astro"]')
      .trigger("click");
    expect(value.value).toEqual(["next"]);
    await input.trigger("keydown", { key: "Backspace" });
    expect(value.value).toEqual([]);
    wrapper.unmount();
  });

  it("names its listbox from the field label and clears", async () => {
    const value = ref<SoneComboboxValue>("next");
    const wrapper = mount(
      () =>
        h("div", [
          h("label", { for: "fw" }, "Framework"),
          h(SoneCombobox, {
            inputId: "fw",
            options: OPTIONS,
            clearable: true,
            modelValue: value.value,
            "onUpdate:modelValue": (v: SoneComboboxValue) => (value.value = v),
          }),
        ]),
      { attachTo: document.body },
    );
    await flush();
    await wrapper.find("input").trigger("click");
    await flush();
    const labelId = wrapper.find("label").attributes("id");
    expect(
      document
        .querySelector('[role="listbox"]')!
        .getAttribute("aria-labelledby"),
    ).toBe(labelId);
    await wrapper.find(".combobox-clear").trigger("click");
    expect(value.value).toBeNull();
    wrapper.unmount();
  });
});
