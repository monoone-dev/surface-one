import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneImagePicker } from "../src/index";

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const pdf = new File(["x"], "brief.pdf", { type: "application/pdf" });

function pick(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("SoneImagePicker", () => {
  it("renders the empty field like Angular", async () => {
    const out = (
      await renderToString(
        createSSRApp({
          render: () => h(SoneImagePicker, { inputId: "cover", invalid: true }),
        }),
      )
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(out).toContain(
      '<sone-image-picker data-slot="image-picker" data-empty data-invalid><div class="image-picker-box" data-slot="image-picker-box" style="aspect-ratio:16 / 9;"><input type="file" class="image-picker-input" data-slot="image-picker-input" id="cover" accept="image/*" aria-invalid="true">',
    );
    expect(out).toContain(
      '<label class="image-picker-label" for="cover">Add image</label>',
    );
  });

  it("previews a pick, rejects a wrong type and removes the image", async () => {
    const wrapper = mount(SoneImagePicker, {
      attachTo: document.body,
      props: {
        modelValue: null,
        "onUpdate:modelValue": (v: unknown) =>
          wrapper.setProps({ modelValue: v as File | null }),
      },
    });
    await nextTick();
    const input = wrapper.find("input").element as HTMLInputElement;
    pick(input, [pdf]);
    await nextTick();
    expect(wrapper.emitted("rejected")).toHaveLength(1);
    expect(wrapper.find('[role="alert"]').text()).toBe(
      "brief.pdf is not an accepted file type.",
    );

    pick(input, [png]);
    await nextTick();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([png]);
    expect(wrapper.find(".image-picker-image").attributes("src")).toBe(
      "blob:preview",
    );
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(document.activeElement?.getAttribute("data-slot")).toBe(
      "image-picker-change",
    );

    await wrapper.find('[data-slot="image-picker-remove"]').trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")!.at(-1)).toEqual([null]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    wrapper.unmount();
  });
});
