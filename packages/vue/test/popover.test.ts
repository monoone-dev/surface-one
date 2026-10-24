import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SonePopover,
  SonePopoverContent,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
  SonePopoverTrigger,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const key = (el: Element, k: string) =>
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }),
  );

function setup() {
  const open = ref(false);
  const w = mount(
    () =>
      h("div", [
        h(
          SonePopover,
          {
            open: open.value,
            "onUpdate:open": (v: boolean) => (open.value = v),
          },
          () => [
            h(SonePopoverTrigger, { class: "btn" }, () => "Dimensions"),
            h(
              SonePopoverContent,
              { "aria-labelledby": "dim-title" },
              {
                default: ({ close }: { close: () => void }) => [
                  h(SonePopoverHeader, null, () =>
                    h(SonePopoverTitle, { id: "dim-title" }, () => "Size"),
                  ),
                  h("input", { "aria-label": "Width" }),
                  h("button", { onClick: close }, "Apply"),
                ],
              },
            ),
          ],
        ),
        h("button", { class: "outside" }, "Elsewhere"),
      ]),
    { attachTo: document.body },
  );
  const trigger = w.get("button.btn").element as HTMLButtonElement;
  const panel = () =>
    document.querySelector<HTMLElement>('[data-slot="popover"]');
  return { w, open, trigger, panel };
}

// jsdom lays nothing out: give every element a box, so the panel's controls are tabbable.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("SonePopover", () => {
  it("renders a closed trigger on the server, and the bare surface alone", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => [
          h(SonePopover, null, () => [
            h(SonePopoverTrigger, null, () => "Dimensions"),
            h(SonePopoverContent, null, () => "Panel"),
          ]),
          h(SonePopover, { "aria-label": "Old" }, () =>
            h(SonePopoverDescription, null, () => "Surface"),
          ),
        ],
      }),
    );
    expect(html).toContain(
      '<button type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">Dimensions</button>',
    );
    expect(html).not.toContain("Panel");
    expect(html).toContain(
      '<div class="popover" data-slot="popover" role="dialog" aria-label="Old"><p class="popover-description" data-slot="popover-description">Surface</p></div>',
    );
  });

  it("opens on click into a positioner on <body>, focuses the panel's first control and wires aria-controls", async () => {
    const { trigger, panel, open } = setup();
    trigger.click();
    await flush();
    expect(open.value).toBe(true);
    const el = panel()!;
    expect(el.parentElement!.classList).toContain("overlay-positioner");
    expect(el.parentElement!.parentElement).toBe(document.body);
    expect(el.getAttribute("role")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(el.id);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Width");
  });

  it("closes on Escape, giving focus back to the trigger", async () => {
    const { trigger, panel, open } = setup();
    trigger.click();
    await flush();
    key(document.activeElement!, "Escape");
    await flush();
    expect(open.value).toBe(false);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on a click outside and through the slot's close", async () => {
    const { w, trigger, panel, open } = setup();
    trigger.click();
    await flush();
    const outside = w.get("button.outside").element;
    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await flush();
    expect(open.value).toBe(false);
    trigger.click();
    await flush();
    const apply = Array.from(panel()!.querySelectorAll("button")).find(
      (b) => b.textContent === "Apply",
    )!;
    apply.click();
    await flush();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
