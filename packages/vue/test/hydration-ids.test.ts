import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneCollapsibleSection,
  SoneConfirm,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
  SoneRating,
} from "../src/index";

async function hydrate(render: () => unknown): Promise<HTMLElement> {
  // Another request rendered first, as on a long-running server.
  await renderToString(createSSRApp({ render }));
  const html = await renderToString(createSSRApp({ render }));
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.innerHTML = html;
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  createSSRApp({ render }).mount(el);
  const calls = [...warn.mock.calls, ...error.mock.calls].flat().join(" ");
  expect(calls).not.toMatch(/mismatch/i);
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

// Generated ids and names come from useId(), never a module counter: a counter runs on
// in the server process and restarts in the browser, so the hydrated markup disagrees.
describe("ids survive hydration", () => {
  it("SoneRating: the radio group name matches the server's", async () => {
    const el = await hydrate(() => [
      h(SoneRating, { modelValue: 2, ariaLabel: "First" }),
      h(SoneRating, { modelValue: 3, ariaLabel: "Second" }),
    ]);
    const names = [...el.querySelectorAll("input")].map((i) => i.name);
    expect(new Set(names).size).toBe(2);
  });

  it("SoneConfirm and SoneCollapsibleSection: the ARIA links match the server's", async () => {
    const el = await hydrate(() => [
      h(SoneConfirm, { autoFocus: false }, () => [
        h(SoneConfirmTitle, null, () => "Delete?"),
        h(SoneConfirmDescription, null, () => "Gone for good."),
        h(SoneConfirmError, null, () => "Failed."),
      ]),
      h(SoneCollapsibleSection, { title: "Items", open: true }, () => "Body"),
    ]);
    const confirm = el.querySelector('[data-slot="confirm"]')!;
    const title = el.querySelector('[data-slot="confirm-title"]')!;
    expect(title.id).not.toBe("");
    expect(confirm.getAttribute("aria-labelledby")).toBe(title.id);
    expect(confirm.getAttribute("aria-describedby")?.split(" ")).toHaveLength(
      2,
    );
    const trigger = el.querySelector("button.collapsible-trigger")!;
    expect(
      el.querySelector(`#${trigger.getAttribute("aria-controls")}`),
    ).not.toBeNull();
  });
});
