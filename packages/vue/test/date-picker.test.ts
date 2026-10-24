import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import { SoneDatePicker, type SoneCalendarValue } from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

describe("SoneDatePicker", () => {
  it("renders an outline button with the formatted date on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SoneDatePicker, {
            modelValue: "2026-05-04",
            locale: "en-US",
            ariaLabel: "Due date",
          }),
      }),
    );
    expect(html).toContain(
      '<sone-date-picker class="date-picker" data-slot="date-picker" data-mode="single">',
    );
    expect(html).toContain('aria-label="Due date: May 4, 2026"');
    expect(html).toContain('aria-haspopup="dialog" aria-expanded="false"');
    expect(html).toContain(">May 4, 2026</span>");
    const empty = await renderToString(
      createSSRApp({ render: () => h(SoneDatePicker, { locale: "en-US" }) }),
    );
    expect(empty).toContain("data-empty");
    expect(empty).toContain(">Pick a date</span>");
  });

  it("opens the calendar on the picked day, picks and gives focus back", async () => {
    const value = ref<SoneCalendarValue>("2026-05-04");
    const wrapper = mount(
      () =>
        h("div", [
          h("label", { for: "due" }, "Due date"),
          h(SoneDatePicker, {
            triggerId: "due",
            modelValue: value.value,
            "onUpdate:modelValue": (v: SoneCalendarValue) => (value.value = v),
            locale: "en-US",
          }),
        ]),
      { attachTo: document.body },
    );
    await flush();
    const trigger = wrapper.find<HTMLButtonElement>("#due");
    const valueId = wrapper.find(".date-picker-value").attributes("id");
    const labelId = wrapper.find("label").attributes("id");
    expect(trigger.attributes("aria-labelledby")).toBe(`${labelId} ${valueId}`);
    await trigger.trigger("click");
    await flush();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Choose a date");
    expect(dialog.querySelector(".calendar-caption")!.textContent).toBe(
      "May 2026",
    );
    expect(document.activeElement?.getAttribute("data-iso")).toBe("2026-05-04");
    (dialog.querySelector('[data-iso="2026-05-20"]') as HTMLElement).click();
    await flush();
    expect(value.value).toBe("2026-05-20");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
    expect(trigger.text()).toBe("May 20, 2026");
    wrapper.unmount();
  });

  it("keeps a range open until both ends are picked", async () => {
    const value = ref<SoneCalendarValue>(null);
    const wrapper = mount(
      () =>
        h(SoneDatePicker, {
          mode: "range",
          modelValue: value.value,
          "onUpdate:modelValue": (v: SoneCalendarValue) => (value.value = v),
          locale: "en-US",
          today: "2026-05-01",
        }),
      { attachTo: document.body },
    );
    await wrapper.find("button").trigger("click");
    await flush();
    const day = (iso: string) =>
      document.querySelector<HTMLElement>(`[data-iso="${iso}"]`)!;
    day("2026-05-04").click();
    await flush();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    day("2026-05-08").click();
    await flush();
    expect(value.value).toEqual({ start: "2026-05-04", end: "2026-05-08" });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(wrapper.find(".date-picker-value").text()).toMatch(
      /^May 4\s*–\s*8, 2026$/,
    );
    wrapper.unmount();
  });

  it("stays shut while disabled", async () => {
    const wrapper = mount(() => h(SoneDatePicker, { disabled: true }), {
      attachTo: document.body,
    });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    await wrapper.find("button").trigger("click");
    await flush();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    wrapper.unmount();
  });
});
