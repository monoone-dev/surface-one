import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneTextarea } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const BOX =
  "line-height: 20px; padding: 8px 0; border: 1px solid; box-sizing: border-box";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("SoneTextarea", () => {
  it("renders the native textarea and the counter like Angular", async () => {
    const out = await ssr(() =>
      h(SoneTextarea, {
        id: "bio",
        modelValue: "Hello",
        maxlength: 20,
        autosize: true,
        invalid: true,
        showCount: true,
      }),
    );
    expect(out).toContain('id="bio"');
    expect(out).toContain('data-slot="textarea"');
    expect(out).toContain(" data-autosize ");
    expect(out).toContain('maxlength="20"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain(
      '<sone-textarea-count class="textarea-count" data-slot="textarea-count" data-state="default"><span aria-hidden="true">5/20</span><span class="sr-only" aria-live="polite"></span></sone-textarea-count>',
    );
  });

  it("binds v-model, autosizes and speaks the characters left near the limit", async () => {
    let content = 36;
    vi.spyOn(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      "get",
    ).mockImplementation(() => content);
    const wrapper = mount(SoneTextarea, {
      attachTo: document.body,
      props: {
        modelValue: "",
        autosize: true,
        minRows: 2,
        maxRows: 4,
        maxlength: 20,
        showCount: true,
        style: BOX,
        "onUpdate:modelValue": (v: string) =>
          wrapper.setProps({ modelValue: v }),
      },
    });
    const ta = wrapper.get("textarea").element as HTMLTextAreaElement;
    expect(ta.style.height).toBe("58px");
    content = 200;
    await wrapper.get("textarea").setValue("x".repeat(19));
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      "x".repeat(19),
    ]);
    expect(ta.style.height).toBe("98px");
    expect(ta.style.overflowY).toBe("auto");
    expect(wrapper.get('[aria-live="polite"]').text()).toBe("1 character left");
    expect(wrapper.get("sone-textarea-count").attributes("data-state")).toBe(
      "near",
    );
  });
});
