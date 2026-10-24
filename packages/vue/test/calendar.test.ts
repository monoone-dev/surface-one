import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneCalendar, type SoneCalendarValue } from "../src/index";

describe("SoneCalendar", () => {
  it("renders the month grid on the server, with no date read there", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SoneCalendar, {
            modelValue: "2024-03-05",
            locale: "en-US",
            weekStartsOn: 1,
          }),
      }),
    );
    expect(html).toContain(
      '<sone-calendar class="calendar" data-slot="calendar" data-mode="single">',
    );
    expect(html).toContain('role="grid"');
    expect(html).toContain("March 2024");
    expect(html).toContain(
      '<th scope="col" class="calendar-weekday" data-slot="calendar-weekday" abbr="Monday">Mon</th>',
    );
    expect(html).toContain('aria-label="Tuesday, March 5, 2024"');
    expect(html).not.toContain('aria-current="date"');
    // Nothing to go by: an empty grid until mounted.
    const bare = await renderToString(
      createSSRApp({ render: () => h(SoneCalendar, { locale: "en-US" }) }),
    );
    expect(bare).toContain("<tbody></tbody>");
  });

  it("picks a date with v-model and moves the roving Tab stop with the keys", async () => {
    const value = ref<SoneCalendarValue>("2024-03-05");
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(SoneCalendar, {
            modelValue: value.value,
            "onUpdate:modelValue": (v: SoneCalendarValue) => (value.value = v),
            locale: "en-US",
            today: "2024-03-12",
          }),
      }),
      { attachTo: document.body },
    );
    const stop = () => wrapper.find('.calendar-day[tabindex="0"]');
    expect(stop().attributes("data-iso")).toBe("2024-03-05");
    expect(
      wrapper.find('[data-iso="2024-03-12"]').attributes("aria-current"),
    ).toBe("date");
    await wrapper.find('[data-iso="2024-03-08"]').trigger("click");
    expect(value.value).toBe("2024-03-08");
    expect(
      wrapper
        .find('[data-iso="2024-03-08"]')
        .element.parentElement!.getAttribute("aria-selected"),
    ).toBe("true");
    const grid = wrapper.find('[role="grid"]');
    await grid.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(stop().attributes("data-iso")).toBe("2024-03-15");
    expect(document.activeElement?.getAttribute("data-iso")).toBe("2024-03-15");
    await grid.trigger("keydown", { key: "PageDown" });
    expect(wrapper.find(".calendar-caption").text()).toBe("April 2024");
    expect(stop().attributes("data-iso")).toBe("2024-04-15");
    await grid.trigger("keydown", { key: "PageUp", shiftKey: true });
    expect(wrapper.find(".calendar-caption").text()).toBe("April 2023");
    wrapper.unmount();
  });

  it("closes a range, marks its band and toggles dates in multiple mode", async () => {
    const value = ref<SoneCalendarValue>(null);
    const wrapper = mount(() =>
      h(SoneCalendar, {
        mode: "range",
        modelValue: value.value,
        "onUpdate:modelValue": (v: SoneCalendarValue) => (value.value = v),
        month: "2024-03",
        locale: "en-US",
      }),
    );
    await wrapper.find('[data-iso="2024-03-10"]').trigger("click");
    await wrapper.find('[data-iso="2024-03-13"]').trigger("click");
    expect(value.value).toEqual({ start: "2024-03-10", end: "2024-03-13" });
    await nextTick();
    const range = (iso: string) =>
      wrapper
        .find(`[data-iso="${iso}"]`)
        .element.parentElement!.getAttribute("data-range");
    expect(range("2024-03-10")).toBe("start");
    expect(range("2024-03-11")).toBe("middle");
    expect(range("2024-03-13")).toBe("end");
    expect(
      wrapper.find('[role="grid"]').attributes("aria-multiselectable"),
    ).toBe("true");

    const dates = ref<SoneCalendarValue>(["2024-03-01"]);
    const multi = mount(() =>
      h(SoneCalendar, {
        mode: "multiple",
        modelValue: dates.value,
        "onUpdate:modelValue": (v: SoneCalendarValue) => (dates.value = v),
        locale: "en-US",
      }),
    );
    await multi.find('[data-iso="2024-03-04"]').trigger("click");
    expect(dates.value).toEqual(["2024-03-01", "2024-03-04"]);
  });

  it("refuses disabled days and stops at min and max", async () => {
    const value = ref<SoneCalendarValue>(null);
    const wrapper = mount(() =>
      h(SoneCalendar, {
        modelValue: value.value,
        "onUpdate:modelValue": (v: SoneCalendarValue) => (value.value = v),
        month: "2024-03",
        min: "2024-03-04",
        max: "2024-03-29",
        disabledDate: (iso: string) => iso === "2024-03-15",
        locale: "en-US",
      }),
    );
    expect(
      wrapper.find('[data-nav="previous"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find('[data-nav="next"]').attributes("disabled"),
    ).toBeDefined();
    const off = wrapper.find('[data-iso="2024-03-15"]');
    expect(off.attributes("aria-disabled")).toBe("true");
    await off.trigger("click");
    await wrapper.find('[data-iso="2024-03-02"]').trigger("click");
    expect(value.value).toBeNull();
  });
});
