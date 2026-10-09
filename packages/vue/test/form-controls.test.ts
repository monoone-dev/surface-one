import { mount } from "@vue/test-utils";
import { h, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneBadge,
  SoneBadgeRemove,
  SoneIcon,
  SoneInputOtp,
  SoneSelect,
  SoneStepper,
  provideSoneMessages,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const STEPS = [
  { key: "a", label: "Account" },
  { key: "b", label: "Verify" },
  { key: "c", label: "Recovery" },
];

describe("SoneStepper", () => {
  it("marks the current step, counts and v-models the clicked index", async () => {
    const at = ref(1);
    const w = mount(() =>
      h(SoneStepper, {
        steps: STEPS,
        current: at.value,
        variant: "numbered",
        "onUpdate:current": (v: number) => (at.value = v),
      }),
    );
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.attributes("aria-current"))).toEqual([
      undefined,
      "step",
      undefined,
    ]);
    expect(w.find(".stepper-count").text()).toBe("Step 2 of 3");
    await buttons[2]!.trigger("click");
    expect(at.value).toBe(2);
  });

  it("keeps a linear stepper from jumping ahead", async () => {
    const w = mount(SoneStepper, {
      props: { steps: STEPS, current: 0, linear: true },
    });
    const buttons = w.findAll("button");
    expect(buttons.map((b) => b.attributes("disabled"))).toEqual([
      undefined,
      "",
      "",
    ]);
    await buttons[1]!.trigger("click");
    expect(w.emitted("stepClick")).toBeUndefined();
  });

  it("renders no buttons when disabled and translates the count", () => {
    const w = mount(SoneStepper, {
      props: { steps: STEPS, current: 0, disabled: true },
      global: {
        plugins: [
          {
            install: (app) =>
              provideSoneMessages(app, {
                stepCount: (c, t) => `Krok ${c} z ${t}`,
              }),
          },
        ],
      },
    });
    expect(w.findAll("button")).toHaveLength(0);
    expect(w.find(".stepper-count").text()).toBe("Krok 1 z 3");
  });
});

describe("SoneInputOtp", () => {
  it("keeps only allowed characters, draws them in slots and completes", async () => {
    const code = ref("");
    const w = mount(() =>
      h(SoneInputOtp, {
        modelValue: code.value,
        groups: [3, 3],
        ariaLabel: "Code",
        ariaDescribedby: "otp-hint",
        "onUpdate:modelValue": (v: string) => (code.value = v),
      }),
    );
    const input = w.find("input");
    expect(input.attributes("autocomplete")).toBe("one-time-code");
    expect(input.attributes("inputmode")).toBe("numeric");
    expect(input.attributes("aria-describedby")).toBe("otp-hint");
    await input.setValue("12-a3");
    expect(code.value).toBe("123");
    expect(w.findAll(".otp-slot").map((s) => s.text())).toEqual([
      "1",
      "2",
      "3",
      "",
      "",
      "",
    ]);
    expect(w.findAll(".otp-separator")).toHaveLength(1);
    await input.setValue("1234567");
    expect(code.value).toBe("123456");
    const otp = w.findComponent(SoneInputOtp);
    expect(otp.emitted("complete")).toEqual([["123456"]]);
  });
});

describe("SoneBadgeRemove", () => {
  it("renders the same remove button as button[soneBadgeRemove]", () => {
    const w = mount(() =>
      h(SoneBadge, { variant: "secondary" }, () => [
        "design",
        h(SoneBadgeRemove, { "aria-label": "Remove design" }, () =>
          h(SoneIcon, { icon: "close" }),
        ),
      ]),
    );
    const b = w.find("button");
    expect(b.classes()).toContain("badge-remove");
    expect(b.attributes("type")).toBe("button");
    expect(b.attributes("data-slot")).toBe("badge-remove");
    expect(b.attributes("aria-label")).toBe("Remove design");
  });
});

describe("SoneSelect", () => {
  it("emits selectionChange only for a user pick, not when the owner sets the value", async () => {
    const w = mount(SoneSelect, {
      props: { modelValue: "a", ariaDescribedby: "hint" },
      slots: {
        default: () => [
          h("option", { value: "a" }, "A"),
          h("option", { value: "b" }, "B"),
        ],
      },
    });
    expect(w.find("select").attributes("aria-describedby")).toBe("hint");
    await w.setProps({ modelValue: "b" });
    expect(w.emitted("selectionChange")).toBeUndefined();
    expect(w.emitted("update:modelValue")).toBeUndefined();
    await w.find("select").setValue("a");
    expect(w.emitted("selectionChange")).toEqual([["a"]]);
    expect(w.emitted("update:modelValue")).toEqual([["a"]]);
  });
});
