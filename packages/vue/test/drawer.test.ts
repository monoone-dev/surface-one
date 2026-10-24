import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SoneDrawer,
  SoneDrawerClose,
  SoneDrawerDescription,
  SoneDrawerHeader,
  SoneDrawerTitle,
} from "../src/index";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 400,
    height: 400,
  } as DOMRect);
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

const flush = async (): Promise<void> => {
  await nextTick();
  await nextTick();
};

let clock = 0;
function pointer(el: Element, type: string, clientY: number): void {
  const e = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientY,
  });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "isPrimary", { value: true });
  Object.defineProperty(e, "timeStamp", { value: (clock += 200) });
  el.dispatchEvent(e);
}

const Host = defineComponent({
  props: { snapPoints: { type: Array, default: () => [] } },
  setup() {
    return {
      open: ref(true),
      snap: ref<number | null>(null),
      dismissed: ref(0),
    };
  },
  render() {
    return h(
      SoneDrawer,
      {
        open: this.open,
        "onUpdate:open": (v: boolean) => (this.open = v),
        onDismiss: () => this.dismissed++,
        snapPoints: this.snapPoints as number[],
        activeSnapPoint: this.snap,
        "onUpdate:activeSnapPoint": (v: number | null) => (this.snap = v),
      },
      () => [
        h(SoneDrawerHeader, null, () => [
          h(SoneDrawerTitle, null, () => "Move goal"),
          h(SoneDrawerDescription, null, () => "Set your daily activity goal."),
          h(SoneDrawerClose),
        ]),
        h("button", { id: "submit" }, "Submit"),
      ],
    );
  },
});

describe("SoneDrawer", () => {
  it("is a modal sheet from the bottom with a drag handle and no corner close", async () => {
    mount(Host, { attachTo: document.body });
    await flush();
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel.getAttribute("data-slot")).toBe("drawer-content");
    expect(panel.classList.contains("sheet-content")).toBe(true);
    expect(panel.getAttribute("data-side")).toBe("bottom");
    expect(document.querySelector('[data-slot="drawer-handle"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="drawer-close"]')).toBeNull();
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)
        ?.textContent,
    ).toBe("Move goal");
  });

  it("springs back from a short swipe and is dismissed by a long one", async () => {
    const w = mount(Host, { attachTo: document.body });
    await flush();
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;
    const handle = document.querySelector('[data-slot="drawer-handle"]')!;
    pointer(handle, "pointerdown", 100);
    pointer(handle, "pointermove", 150);
    expect(panel.style.translate).toBe("0 50px");
    pointer(handle, "pointerup", 150);
    expect(panel.style.translate).toBe("");
    pointer(handle, "pointerdown", 100);
    pointer(handle, "pointermove", 300);
    pointer(handle, "pointerup", 300);
    await flush();
    expect(w.vm.open).toBe(false);
    expect(w.vm.dismissed).toBe(1);
  });

  it("rests on snap points, v-models the active one and the handle cycles them", async () => {
    const w = mount(Host, {
      props: { snapPoints: [0.5, 1] },
      attachTo: document.body,
    });
    await flush();
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel.hasAttribute("data-snap-points")).toBe(true);
    expect(panel.style.translate).toBe("0 200px");
    (
      document.querySelector('[data-slot="drawer-handle"]') as HTMLElement
    ).click();
    await flush();
    expect(w.vm.snap).toBe(1);
    expect(panel.style.translate).toBe("");
  });

  it("closes from the close part", async () => {
    const w = mount(Host, { attachTo: document.body });
    await flush();
    (document.querySelector('[aria-label="Close"]') as HTMLElement).click();
    await flush();
    expect(w.vm.open).toBe(false);
  });
});
