import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneFileUpload } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const png = new File(["x".repeat(10)], "photo.png", { type: "image/png" });
const pdf = new File(["x".repeat(20)], "brief.pdf", {
  type: "application/pdf",
});
const zip = new File(["x"], "all.zip", { type: "application/zip" });

function pick(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function drop(target: Element, type: string, files: File[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: { files, types: ["Files"], dropEffect: "none" },
  });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("SoneFileUpload", () => {
  it("renders the dropzone around the native input like Angular", async () => {
    const out = await ssr(() =>
      h(SoneFileUpload, {
        inputId: "files",
        multiple: true,
        accept: "image/*",
        description: "Images only",
        invalid: true,
      }),
    );
    expect(out).toContain(
      '<sone-file-upload data-slot="file-upload" data-invalid><div class="file-upload-dropzone" data-slot="file-upload-dropzone">',
    );
    expect(out).toMatch(
      /<input type="file" class="file-upload-input" data-slot="file-upload-input" id="files" accept="image\/\*" multiple aria-invalid="true" aria-describedby="sone-file-upload-[^"]+-description">/,
    );
    expect(out).toContain(
      '<label class="file-upload-label" for="files">Drop files here or click to browse</label>',
    );
    expect(out).not.toContain("file-upload-list");
  });

  it("adds picked and dropped files under the rules and removes them", async () => {
    const onRejected = vi.fn();
    const wrapper = mount(SoneFileUpload, {
      attachTo: document.body,
      props: {
        multiple: true,
        accept: "image/*,.pdf",
        maxSize: 25,
        maxFiles: 2,
        onRejected,
        "onUpdate:modelValue": (v: File[]) =>
          wrapper.setProps({ modelValue: v }),
      },
    });
    pick(wrapper.get("input").element as HTMLInputElement, [png, zip]);
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[png]]);
    expect(onRejected.mock.calls[0]![0][0].reason).toBe("type");
    expect(wrapper.get('[role="alert"]').text()).toBe(
      "all.zip is not an accepted file type.",
    );
    expect(wrapper.get(".file-upload-preview").attributes("src")).toBe(
      "blob:preview",
    );

    const zone = wrapper.get('[data-slot="file-upload-dropzone"]').element;
    drop(zone, "dragenter", [pdf]);
    await nextTick();
    expect(zone.hasAttribute("data-dragging")).toBe(true);
    expect(drop(zone, "drop", [pdf, png]).defaultPrevented).toBe(true);
    await nextTick();
    expect(zone.hasAttribute("data-dragging")).toBe(false);
    expect(wrapper.findAll(".file-upload-name").map((n) => n.text())).toEqual([
      "photo.png",
      "brief.pdf",
    ]);
    expect(wrapper.get('[role="alert"]').text()).toBe(
      "Only 2 files can be added.",
    );

    const remove = wrapper.findAll('[data-slot="file-upload-remove"]');
    expect(remove[0]!.attributes("aria-label")).toBe("Remove photo.png");
    await remove[0]!.trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[pdf]]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Remove brief.pdf",
    );
  });
});
