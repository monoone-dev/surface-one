import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneSecretField,
  SoneTagInput,
  SoneToaster,
  provideSoneMessages,
  type SoneTagRejection,
  type SoneToast,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const ssr = (render: () => unknown): Promise<string> =>
  renderToString(createSSRApp({ render }));

const TOASTS: SoneToast[] = [
  { id: 1, kind: "success", message: "Saved." },
  {
    id: 2,
    kind: "danger",
    message: "Failed.",
    action: { label: "Retry" },
    secondaryAction: { label: "Details" },
  },
];

describe("SoneToaster", () => {
  it("renders the Angular markup on the server, nothing inside while empty", async () => {
    expect(await ssr(() => h(SoneToaster, { toasts: [] }))).toBe(
      '<sone-toaster data-slot="toaster"></sone-toaster>',
    );
    const out = await ssr(() => h(SoneToaster, { toasts: TOASTS }));
    expect(out).toContain(
      '<div class="toast-viewport" aria-live="polite" aria-atomic="false">',
    );
    expect(out).toContain(
      '<div class="toast is-success" data-slot="toast" data-kind="success" role="status">',
    );
    expect(out).toContain('aria-label="Dismiss notification"');
  });

  it("emits dismiss, action and secondaryAction with the toast id", async () => {
    const w = mount(SoneToaster, { props: { toasts: TOASTS } });
    const second = w.findAll('[data-slot="toast"]')[1]!;
    const buttons = second.findAll("button");
    expect(buttons.map((b) => b.text())).toEqual(["Details", "Retry", ""]);
    expect(buttons[1]!.classes()).toEqual(["btn", "toast-action"]);
    for (const b of buttons) await b.trigger("click");
    expect(w.emitted("secondaryAction")).toEqual([[2]]);
    expect(w.emitted("action")).toEqual([[2]]);
    expect(w.emitted("dismiss")).toEqual([[2]]);
  });
});

describe("SoneSecretField", () => {
  it("shows the status badge, hides it while unknown and translates", async () => {
    const out = await ssr(() =>
      h(SoneSecretField, { hasKey: true, clearable: true }),
    );
    expect(out).toContain(
      '<sone-secret-field data-slot="secret-field" data-state="set">',
    );
    expect(out).toContain('data-slot="secret-field-status"');
    expect(out).toContain("Key set ✓");
    expect(out).toContain(">Clear<");
    const unknown = mount(SoneSecretField);
    expect(unknown.attributes("data-state")).toBe("unknown");
    expect(unknown.find('[data-slot="secret-field-status"]').exists()).toBe(
      false,
    );
    const pl = mount(SoneSecretField, {
      props: { hasKey: false },
      global: {
        plugins: [
          {
            install: (app) =>
              provideSoneMessages(app, { secretUnset: "Nie ustawiono" }),
          },
        ],
      },
    });
    expect(pl.find(".badge").text()).toBe("Nie ustawiono");
  });

  it("saves the draft and empties the field once busy settles without an error", async () => {
    const busy = ref(false);
    const saved: string[] = [];
    const w = mount(() =>
      h(SoneSecretField, {
        hasKey: false,
        busy: busy.value,
        onSave: (v: string) => {
          saved.push(v);
          busy.value = true;
        },
      }),
    );
    const input = w.find("input");
    expect(input.attributes("type")).toBe("password");
    expect(input.attributes("aria-label")).toBe("Status");
    const save = w.find("button");
    expect(save.attributes("disabled")).toBe("");
    await input.setValue("sk-123");
    expect(save.attributes("disabled")).toBeUndefined();
    await save.trigger("click");
    expect(saved).toEqual(["sk-123"]);
    expect(w.find("button").text()).toBe("Saving…");
    expect((w.find("input").element as HTMLInputElement).value).toBe("sk-123");
    busy.value = false;
    await nextTick();
    await nextTick();
    expect((w.find("input").element as HTMLInputElement).value).toBe("");
  });

  it("keeps the draft when the save fails and links the error", async () => {
    const w = mount(SoneSecretField, {
      props: { hasKey: false, error: "Refused." },
      attachTo: document.body,
    });
    await w.find("input").setValue("sk-1");
    await w.find("button").trigger("click");
    await nextTick();
    expect((w.find("input").element as HTMLInputElement).value).toBe("sk-1");
    expect(w.emitted("save")).toEqual([["sk-1"]]);
    const error = w.find('[data-slot="field-error"]');
    expect(w.find("input").attributes("aria-describedby")).toBe(
      error.attributes("id"),
    );
    w.unmount();
  });
});

describe("SoneTagInput", () => {
  it("renders the Angular markup on the server", async () => {
    const out = await ssr(() =>
      h(SoneTagInput, {
        modelValue: ["a", "b", "c"],
        maxVisible: 2,
        suggestions: ["x"],
      }),
    );
    expect(out).toContain(
      '<ul class="tag-input-list" data-slot="tag-input-list" aria-label="Tags">',
    );
    expect(out).toContain(
      '<li class="badge tag-input-tag" data-slot="badge" data-variant="secondary">',
    );
    expect(out).toContain('aria-label="Remove a"');
    expect(out).toContain('aria-expanded="false">+1 more</button>');
    expect(out).toContain('aria-label="Add tag"');
    expect(out).toMatch(/list="sone-tag-input-list-[^"]+"/);
  });

  it("adds on Enter and comma, refuses duplicates, invalid and over-max tags", async () => {
    const tags = ref<string[]>(["design"]);
    const rejected: SoneTagRejection[] = [];
    const added: string[] = [];
    const w = mount(() =>
      h(SoneTagInput, {
        modelValue: tags.value,
        max: 3,
        validate: (t: string) => t !== "bad",
        "onUpdate:modelValue": (v: string[]) => (tags.value = v),
        onRejected: (r: SoneTagRejection) => rejected.push(r),
        onAdded: (t: string) => added.push(t),
      }),
    );
    const input = w.find("input");
    await input.setValue("q3");
    await input.trigger("keydown", { key: "Enter" });
    expect(tags.value).toEqual(["design", "q3"]);
    expect((input.element as HTMLInputElement).value).toBe("");
    await input.setValue("DESIGN, bad, ops, more, ty");
    expect(tags.value).toEqual(["design", "q3", "ops"]);
    expect(added).toEqual(["q3", "ops"]);
    expect(rejected).toEqual([
      { tag: "DESIGN", reason: "duplicate" },
      { tag: "bad", reason: "invalid" },
      { tag: "more", reason: "max" },
    ]);
    expect((input.element as HTMLInputElement).value).toBe(
      "DESIGN, bad, more,  ty",
    );
    expect(w.find(".sr-only").text()).toBe("Added ops");
  });

  it("removes with the chip button and Backspace, and toggles the overflow", async () => {
    const tags = ref<string[]>(["a", "b", "c"]);
    const removed: string[] = [];
    const w = mount(
      () =>
        h(SoneTagInput, {
          modelValue: tags.value,
          maxVisible: 1,
          "onUpdate:modelValue": (v: string[]) => (tags.value = v),
          onRemoved: (t: string) => removed.push(t),
        }),
      { attachTo: document.body },
    );
    const more = w.find('[data-slot="tag-input-more"]');
    expect(more.text()).toBe("+2 more");
    await more.trigger("click");
    expect(w.findAll(".tag-input-tag")).toHaveLength(3);
    expect(w.find('[data-slot="tag-input-more"]').text()).toBe("Show less");
    await w.find('[aria-label="Remove b"]').trigger("click");
    expect(tags.value).toEqual(["a", "c"]);
    expect(document.activeElement).toBe(w.find("input").element);
    await w.find("input").trigger("keydown", { key: "Backspace" });
    expect(tags.value).toEqual(["a"]);
    expect(removed).toEqual(["b", "c"]);
    w.unmount();
  });

  it("has no remove buttons while disabled", () => {
    const w = mount(SoneTagInput, {
      props: { modelValue: ["a"], disabled: true, invalid: true },
    });
    expect(w.find("button").exists()).toBe(false);
    expect(w.attributes("data-disabled")).toBe("true");
    expect(w.attributes("data-invalid")).toBe("true");
    expect(w.find("input").attributes("aria-invalid")).toBe("true");
  });
});
