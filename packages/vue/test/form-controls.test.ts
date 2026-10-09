import { mount } from "@vue/test-utils";
import { h, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import { SoneStepper, provideSoneMessages } from "../src/index";

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
