// Behaviour tests for the components the SSR smoke test (ssr.test.ts) only renders:
// disclosure, input number, item, kbd, logo, meter, page header, separator, sheet,
// skeleton, slider and spinner.
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneButton,
  SoneDisclosure,
  SoneInputNumber,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemSeparator,
  SoneItemTitle,
  SoneKbd,
  SoneKbdGroup,
  SoneLogo,
  SoneMeter,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderDescription,
  SonePageHeaderTitle,
  SoneSeparator,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetTitle,
  SoneSkeleton,
  SoneSlider,
  SoneSpinner,
  provideSoneLogoAssets,
  provideSoneMessages,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async (): Promise<void> => {
  await nextTick();
  await nextTick();
};

describe("SoneDisclosure", () => {
  it("wires trigger and panel and v-models open", async () => {
    const open = ref(false);
    const w = mount(() =>
      h(
        SoneDisclosure,
        {
          open: open.value,
          "onUpdate:open": (v: boolean) => (open.value = v),
        },
        { summary: () => "Advanced", default: () => "Hidden settings" },
      ),
    );
    const trigger = w.find("button");
    const panel = w.find("[role=region]");
    expect(trigger.attributes("aria-controls")).toBe(panel.attributes("id"));
    expect(panel.attributes("aria-labelledby")).toBe(trigger.attributes("id"));
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(panel.attributes("hidden")).toBeDefined();

    await trigger.trigger("click");
    expect(open.value).toBe(true);
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(w.find("[role=region]").attributes("hidden")).toBeUndefined();
    expect(w.find("[data-slot=accordion-item]").attributes("data-state")).toBe(
      "open",
    );
  });

  it("works unbound, ignores clicks when disabled and takes a panel label", async () => {
    const w = mount(SoneDisclosure, {
      props: { panelLabel: "Details" },
      slots: { summary: () => "More" },
    });
    const panel = () => w.find("[role=region]");
    expect(panel().attributes("aria-label")).toBe("Details");
    expect(panel().attributes("aria-labelledby")).toBeUndefined();
    await w.find("button").trigger("click");
    expect(w.emitted("update:open")).toEqual([[true]]);
    expect(panel().attributes("hidden")).toBeUndefined();

    await w.setProps({ disabled: true });
    expect(w.find("button").attributes("disabled")).toBeDefined();
    await w.find("button").trigger("click");
    expect(w.emitted("update:open")).toHaveLength(1);
  });
});

describe("SoneInputNumber", () => {
  const mountNumber = (props: Record<string, unknown> = {}) => {
    const value = ref<number | null>(
      (props["modelValue"] as number | null) ?? 2,
    );
    const w = mount(() =>
      h(SoneInputNumber, {
        ariaLabel: "Guests",
        inputId: "guests",
        min: 0,
        max: 5,
        ...props,
        modelValue: value.value,
        "onUpdate:modelValue": (v: number | null) => (value.value = v),
      }),
    );
    return { w, value };
  };

  it("is a spinbutton the arrow, page and Home / End keys step within bounds", async () => {
    const { w, value } = mountNumber();
    const field = w.find("input");
    expect(field.attributes("role")).toBe("spinbutton");
    expect(field.attributes("aria-valuenow")).toBe("2");
    expect(field.attributes("aria-valuemin")).toBe("0");
    expect(field.attributes("aria-valuemax")).toBe("5");

    await field.trigger("keydown", { key: "ArrowUp" });
    expect(value.value).toBe(3);
    await field.trigger("keydown", { key: "ArrowDown" });
    expect(value.value).toBe(2);
    await field.trigger("keydown", { key: "PageUp" });
    expect(value.value).toBe(5);
    await field.trigger("keydown", { key: "Home" });
    expect(value.value).toBe(0);
    await field.trigger("keydown", { key: "End" });
    expect(value.value).toBe(5);
    expect(w.find("input").attributes("aria-valuenow")).toBe("5");
  });

  it("steps with the buttons, disabling the one at its bound", async () => {
    const { w, value } = mountNumber({ modelValue: 4 });
    const plus = () => w.find("[data-slot=input-number-increment]");
    const minus = () => w.find("[data-slot=input-number-decrement]");
    expect(plus().attributes("aria-label")).toBe("Increase");
    expect(minus().attributes("aria-label")).toBe("Decrease");
    expect(plus().attributes("aria-controls")).toBe("guests");
    await plus().trigger("click");
    expect(value.value).toBe(5);
    expect(plus().attributes("disabled")).toBeDefined();
    expect(minus().attributes("disabled")).toBeUndefined();
  });

  it("parses typed text on Enter or blur, clamps it and clears to null", async () => {
    const { w, value } = mountNumber();
    const field = w.find("input");
    await field.setValue("9");
    await field.trigger("keydown", { key: "Enter" });
    expect(value.value).toBe(5);
    await field.setValue("1,5");
    await field.trigger("blur");
    expect(value.value).toBe(2);
    await field.setValue("");
    await field.trigger("blur");
    expect(value.value).toBeNull();
    expect((w.find("input").element as HTMLInputElement).value).toBe("");
  });
});

describe("SoneItem", () => {
  it("renders the parts with their classes, slots and data attributes", () => {
    const w = mount(() =>
      h(SoneItemGroup, { size: "sm" }, () => [
        h(SoneItem, { variant: "outline", size: "sm" }, () => [
          h(SoneItemMedia, { variant: "icon" }, () => "★"),
          h(SoneItemContent, null, () => h(SoneItemTitle, null, () => "Name")),
          h(SoneItemActions, null, () => h(SoneButton, null, () => "Edit")),
        ]),
        h(SoneItemSeparator),
        h(SoneItem, { as: "a", href: "/x" }, () => "Link item"),
      ]),
    );
    const group = w.find("[data-slot=item-group]");
    expect(group.attributes("role")).toBe("list");
    expect(group.attributes("data-size")).toBe("sm");
    const item = w.find("[data-slot=item]");
    expect(item.classes()).toContain("item");
    expect(item.attributes("data-variant")).toBe("outline");
    expect(w.find("[data-slot=item-media]").attributes("data-variant")).toBe(
      "icon",
    );
    expect(w.find("p.item-title").text()).toBe("Name");
    expect(w.find("[data-slot=item-separator]").attributes("role")).toBe(
      "none",
    );
    const link = w.find("a[data-slot=item]");
    expect(link.attributes("href")).toBe("/x");
    expect(link.attributes("data-variant")).toBe("default");
  });
});

describe("SoneKbd", () => {
  it("wraps keys in kbd elements, alone and grouped", () => {
    const w = mount(() => [
      h(SoneKbd, null, () => "Esc"),
      h(SoneKbdGroup, null, () => [h(SoneKbd, null, () => "⌘"), "K"]),
    ]);
    const single = w.find("sone-kbd");
    expect(single.attributes("data-slot")).toBe("kbd");
    expect(single.find("kbd").text()).toBe("Esc");
    const group = w.find("sone-kbd-group");
    expect(group.attributes("data-slot")).toBe("kbd-group");
    expect(group.find("kbd").text()).toBe("⌘K");
  });
});

describe("SoneLogo", () => {
  it("draws the light and dark files and is decorative without a label", () => {
    const w = mount(SoneLogo, { props: { brand: "ivy", kind: "mark" } });
    const images = w.findAll("img");
    expect(images.map((i) => i.attributes("src"))).toEqual([
      "/brand/ivy-light-mark.svg",
      "/brand/ivy-dark-mark.svg",
    ]);
    expect(images.every((i) => i.attributes("aria-hidden") === "true")).toBe(
      true,
    );
    expect(w.attributes("data-brand")).toBe("ivy");
    expect(w.attributes("data-kind")).toBe("mark");
  });

  it("names the image with the label and reads the asset base", () => {
    const w = mount(SoneLogo, {
      props: { label: "SurfaceOne", size: "lg" },
      global: {
        plugins: [{ install: (app) => provideSoneLogoAssets(app, "/assets") }],
      },
    });
    const image = w.find("img");
    expect(image.attributes("alt")).toBe("SurfaceOne");
    expect(image.attributes("aria-hidden")).toBeUndefined();
    expect(image.attributes("src")).toBe("/assets/surface-one-light-icon.svg");
    expect(w.attributes("data-size")).toBe("lg");
  });
});

describe("SoneMeter", () => {
  it("is an image named by a sentence, with the pips on and off", async () => {
    const w = mount(SoneMeter, {
      props: { label: "Accuracy", value: 3, max: 4, detail: "Good" },
    });
    expect(w.attributes("role")).toBe("img");
    expect(w.attributes("aria-label")).toBe("Accuracy: 3 of 4. Good");
    const pips = w.findAll("[data-slot=meter-indicator]");
    expect(pips.map((p) => p.attributes("data-state"))).toEqual([
      "on",
      "on",
      "on",
      "off",
    ]);
    await w.setProps({ value: 12, max: 20, detail: null });
    expect(w.findAll("[data-slot=meter-indicator]")).toHaveLength(10);
    expect(w.attributes("aria-label")).toBe("Accuracy: 10 of 10");
  });

  it("speaks the provided messages", () => {
    const w = mount(SoneMeter, {
      props: { value: 1, max: 3 },
      global: {
        plugins: [
          {
            install: (app) =>
              provideSoneMessages(app, {
                meterCount: (f, m) => `${f} z ${m}`,
              }),
          },
        ],
      },
    });
    expect(w.attributes("aria-label")).toBe("1 z 3");
    expect(w.find("[data-slot=meter-label]").exists()).toBe(false);
  });
});

describe("SonePageHeader", () => {
  it("is a header with an h1 title and the description and actions parts", () => {
    const w = mount(() =>
      h(SonePageHeader, null, () => [
        h(SonePageHeaderTitle, null, () => "Notes"),
        h(SonePageHeaderDescription, null, () => "Everything you wrote."),
        h(SonePageHeaderActions, null, () => h(SoneButton, null, () => "New")),
      ]),
    );
    const header = w.find("header");
    expect(header.classes()).toContain("page-header");
    expect(header.attributes("data-slot")).toBe("page-header");
    expect(w.find("h1.page-header-title").text()).toBe("Notes");
    expect(w.find("p.page-header-description").text()).toBe(
      "Everything you wrote.",
    );
    expect(w.find("[data-slot=page-header-actions] button").text()).toBe("New");
  });
});

describe("SoneSeparator", () => {
  it("is decorative by default and a semantic separator on request", async () => {
    const w = mount(SoneSeparator);
    expect(w.attributes("role")).toBe("none");
    expect(w.attributes("aria-orientation")).toBeUndefined();
    expect(w.attributes("data-orientation")).toBe("horizontal");
    await w.setProps({ decorative: false, orientation: "vertical" });
    expect(w.attributes("role")).toBe("separator");
    expect(w.attributes("aria-orientation")).toBe("vertical");
    expect(w.attributes("data-orientation")).toBe("vertical");
  });
});

describe("SoneSheet", () => {
  const Host = defineComponent({
    setup() {
      return { open: ref(false), dismissed: ref(0) };
    },
    render() {
      return [
        h(
          "button",
          { id: "opener", onClick: () => (this.open = true) },
          "Open",
        ),
        h(
          SoneSheet,
          {
            side: "left",
            size: "lg",
            open: this.open,
            "onUpdate:open": (v: boolean) => (this.open = v),
            onDismiss: () => this.dismissed++,
          },
          () => [
            h(SoneSheetTitle, null, () => "Filters"),
            h(SoneSheetDescription, null, () => "Narrow the list."),
            h("button", { id: "apply" }, "Apply"),
          ],
        ),
      ];
    },
  });

  it("renders nothing while closed, then a labelled dialog on its side", async () => {
    const w = mount(Host, { attachTo: document.body });
    expect(document.querySelector("[data-slot=sheet-content]")).toBeNull();
    const opener = document.getElementById("opener")!;
    opener.focus();
    opener.click();
    await flush();
    const panel = document.querySelector<HTMLElement>(
      "[data-slot=sheet-content]",
    )!;
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("data-side")).toBe("left");
    expect(panel.getAttribute("data-size")).toBe("lg");
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)!
        .textContent,
    ).toBe("Filters");
    expect(
      document.querySelector("[data-slot=sheet-overlay]")!.parentElement,
    ).toBe(document.body);
    w.unmount();
  });

  it("the corner close dismisses, writes open back and returns focus", async () => {
    const w = mount(Host, { attachTo: document.body });
    const opener = document.getElementById("opener")!;
    opener.focus();
    opener.click();
    await flush();
    document
      .querySelector<HTMLButtonElement>("[data-slot=sheet-close]")!
      .click();
    await flush();
    expect(document.querySelector("[data-slot=sheet-content]")).toBeNull();
    expect((w.vm as unknown as { open: boolean }).open).toBe(false);
    expect((w.vm as unknown as { dismissed: number }).dismissed).toBe(1);
    expect(document.activeElement).toBe(opener);
    w.unmount();
  });

  it("closes on a scrim press unless scrimCloses is off", async () => {
    const w = mount(SoneSheet, {
      props: { ariaLabel: "Filters", scrimCloses: false },
      attachTo: document.body,
    });
    await flush();
    const layer = document.querySelector<HTMLElement>(
      "[data-slot=sheet-overlay]",
    )!;
    const press = () => {
      layer.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      layer.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };
    press();
    await flush();
    expect(w.emitted("dismiss")).toBeUndefined();
    await w.setProps({ scrimCloses: true });
    press();
    await flush();
    expect(w.emitted("dismiss")).toHaveLength(1);
    expect(w.emitted("update:open")).toEqual([[false]]);
    w.unmount();
  });
});

describe("SoneSkeleton", () => {
  it("is a hidden placeholder that takes classes and as", () => {
    const w = mount(SoneSkeleton, {
      props: { as: "span" },
      attrs: { class: "h-4" },
    });
    expect(w.element.tagName).toBe("SPAN");
    expect(w.attributes("aria-hidden")).toBe("true");
    expect(w.attributes("data-slot")).toBe("skeleton");
    expect(w.classes()).toEqual(["skeleton", "h-4"]);
  });
});

describe("SoneSlider", () => {
  it("is a range input that v-models a number and paints its fill", async () => {
    const value = ref(25);
    const w = mount(() =>
      h(SoneSlider, {
        modelValue: value.value,
        "onUpdate:modelValue": (v: number) => (value.value = v),
        min: 0,
        max: 50,
        step: 5,
        ariaLabel: "Volume",
      }),
    );
    const input = w.find("input");
    expect(input.attributes("type")).toBe("range");
    expect(input.attributes("aria-label")).toBe("Volume");
    expect(input.attributes("step")).toBe("5");
    expect(input.attributes("style")).toContain("--sone-range-fill: 50%");
    await input.setValue("40");
    expect(value.value).toBe(40);
    expect(w.find("input").attributes("style")).toContain(
      "--sone-range-fill: 80%",
    );
  });

  it("passes host and control attributes apart and follows disabled", () => {
    const w = mount(SoneSlider, {
      props: { disabled: true, modelValue: 500 },
      attrs: { id: "zoom", class: "wide" },
    });
    expect(w.attributes("data-disabled")).toBe("");
    expect(w.classes()).toContain("wide");
    const input = w.find("input");
    expect(input.attributes("id")).toBe("zoom");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("style")).toContain("--sone-range-fill: 100%");
  });
});

describe("SoneSpinner", () => {
  it("is a labelled status by default and decorative with a null label", async () => {
    const w = mount(SoneSpinner, { props: { size: 24 } });
    const svg = w.find("svg");
    expect(svg.attributes("role")).toBe("status");
    expect(svg.attributes("aria-label")).toBe("Loading");
    expect(svg.attributes("style")).toContain("width: 24px");
    await w.setProps({ label: "Saving" });
    expect(w.find("svg").attributes("aria-label")).toBe("Saving");
    await w.setProps({ label: null });
    expect(w.find("svg").attributes("role")).toBeUndefined();
    expect(w.find("svg").attributes("aria-hidden")).toBe("true");
  });
});
