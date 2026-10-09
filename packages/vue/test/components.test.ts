import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneButton,
  SoneChoiceCard,
  SoneChoiceGroup,
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleTrigger,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogTitle,
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneMenu,
  SoneMenuItem,
  SoneSegmented,
  SoneSwitch,
  SoneToggleGroup,
  SoneToggleGroupItem,
  provideSoneMessages,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("SoneButton", () => {
  it("swallows clicks on a link marked aria-disabled", async () => {
    let clicks = 0;
    const w = mount(SoneButton, {
      props: { as: "a" },
      attrs: { href: "#", "aria-disabled": "true", onClick: () => clicks++ },
      slots: { default: () => "Go" },
    });
    await w.trigger("click");
    expect(clicks).toBe(0);
  });
});

describe("SoneSwitch", () => {
  it("v-models a boolean", async () => {
    const on = ref(false);
    const w = mount(() =>
      h(SoneSwitch, {
        modelValue: on.value,
        "onUpdate:modelValue": (v: boolean) => (on.value = v),
      }),
    );
    await w.find("input").setValue(true);
    expect(on.value).toBe(true);
    expect(w.find("input").attributes("data-state")).toBe("checked");
  });
});

describe("SoneSegmented", () => {
  it("presses the selected option and emits the clicked one", async () => {
    const w = mount(SoneSegmented, {
      props: {
        modelValue: "a",
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      },
    });
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.attributes("aria-pressed"))).toEqual([
      "true",
      "false",
    ]);
    await buttons[1]!.trigger("click");
    expect(w.emitted("update:modelValue")).toEqual([["b"]]);
  });
});

describe("SoneToggleGroup", () => {
  it("moves focus with the arrow keys", async () => {
    const w = mount(
      () =>
        h(SoneToggleGroup, null, () => [
          h(SoneToggleGroupItem, null, () => "1"),
          h(SoneToggleGroupItem, { disabled: true }, () => "2"),
          h(SoneToggleGroupItem, null, () => "3"),
        ]),
      { attachTo: document.body },
    );
    const [first, , third] = w.findAll("button");
    (first!.element as HTMLElement).focus();
    await first!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(third!.element);
    w.unmount();
  });
});

describe("SoneChoiceGroup", () => {
  it("is one Tab stop and arrows select the next card", async () => {
    const plan = ref("a");
    const w = mount(
      () =>
        h(SoneChoiceGroup, null, () =>
          ["a", "b", "c"].map((p) =>
            h(
              SoneChoiceCard,
              {
                key: p,
                selected: plan.value === p,
                onClick: () => (plan.value = p),
              },
              () => p,
            ),
          ),
        ),
      { attachTo: document.body },
    );
    await nextTick();
    const cards = () => w.findAll('[role="radio"]');
    expect(cards().map((c) => c.attributes("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
    await cards()[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(plan.value).toBe("b");
    expect(cards().map((c) => c.attributes("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
    w.unmount();
  });
});

describe("SoneCollapsible", () => {
  it("works without v-model and links the trigger to the content", async () => {
    const w = mount(() =>
      h(SoneCollapsible, null, () => [
        h(SoneCollapsibleTrigger, null, () => "More"),
        h(SoneCollapsibleContent, null, () => "Body"),
      ]),
    );
    const trigger = w.find("button");
    const content = w.find('[data-slot="collapsible-content"]');
    expect(trigger.attributes("aria-controls")).toBe(content.attributes("id"));
    expect(content.attributes("hidden")).toBeDefined();
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(content.attributes("hidden")).toBeUndefined();
  });
});

describe("SoneField", () => {
  it("describes the control by its description and error and marks it invalid", async () => {
    const invalid = ref(false);
    const w = mount(() =>
      h(SoneField, { invalid: invalid.value }, () => [
        h("input", { "aria-describedby": "own" }),
        h(SoneFieldDescription, { id: "desc" }, () => "Help"),
        invalid.value ? h(SoneFieldError, { id: "err" }, () => "Wrong") : null,
      ]),
    );
    await nextTick();
    const input = w.find("input");
    expect(input.attributes("aria-describedby")).toBe("own desc");
    invalid.value = true;
    await nextTick();
    await nextTick();
    expect(input.attributes("aria-describedby")).toBe("own desc err");
    expect(input.attributes("aria-invalid")).toBe("true");
    invalid.value = false;
    await nextTick();
    await nextTick();
    expect(input.attributes("aria-describedby")).toBe("own desc");
    expect(input.attributes("aria-invalid")).toBeUndefined();
  });
});

describe("SoneDialog", () => {
  const Host = defineComponent({
    setup() {
      const open = ref(false);
      return { open };
    },
    render() {
      return [
        h(
          "button",
          { id: "opener", onClick: () => (this.open = true) },
          "Open",
        ),
        h(
          SoneDialog,
          {
            open: this.open,
            "onUpdate:open": (v: boolean) => (this.open = v),
          },
          () => [
            h(SoneDialogTitle, null, () => "Title"),
            h(SoneDialogDescription, null, () => "Text"),
            h("input", { id: "field", autofocus: true }),
          ],
        ),
      ];
    },
  });

  it("is labelled, takes focus, closes on Escape and gives focus back", async () => {
    const w = mount(Host, { attachTo: document.body });
    const opener = document.getElementById("opener")!;
    opener.focus();
    opener.click();
    await nextTick();
    await nextTick();
    const panel = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(panel.parentElement!.parentElement).toBe(document.body);
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)!
        .textContent,
    ).toBe("Title");
    expect(
      document.getElementById(panel.getAttribute("aria-describedby")!)!
        .textContent,
    ).toBe("Text");
    expect(document.activeElement?.id).toBe("field");
    panel.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await nextTick();
    await nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    w.unmount();
  });

  it("names the close button with the provided messages", async () => {
    const w = mount(SoneDialog, {
      global: {
        plugins: [
          { install: (app) => provideSoneMessages(app, { close: "Zamknij" }) },
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(
      document.querySelector(".dialog-close")?.getAttribute("aria-label"),
    ).toBe("Zamknij");
    w.unmount();
  });
});

describe("SoneMenu", () => {
  it("is a menu of menu items by default, and the role can be overridden", () => {
    const w = mount(SoneMenu, {
      slots: {
        default: () => [
          h(SoneMenuItem, null, () => "Rename"),
          h(SoneMenuItem, { role: "option" }, () => "Pick"),
        ],
      },
    });
    expect(w.attributes("role")).toBe("menu");
    const items = w.findAll(".menu-item");
    expect(items[0].attributes("role")).toBe("menuitem");
    expect(items[1].attributes("role")).toBe("option");
    const listbox = mount(SoneMenu, { attrs: { role: "listbox" } });
    expect(listbox.attributes("role")).toBe("listbox");
  });
});
