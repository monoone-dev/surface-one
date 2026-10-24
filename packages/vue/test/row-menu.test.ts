import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneMenuItem,
  SonePageActions,
  SonePageActionsLead,
  SonePageActionsStatus,
  SoneRowMenu,
  type SoneRowMenuExposed,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const ssr = (render: () => unknown): Promise<string> =>
  renderToString(createSSRApp({ render }));

const items = () => [
  h(SoneMenuItem, { type: "button" }, () => "Rename"),
  h(SoneMenuItem, { type: "button", disabled: true }, () => "Locked"),
  h(SoneMenuItem, { type: "button", "data-menu-keep-open": "" }, () => "Stay"),
];

const panel = () => document.body.querySelector<HTMLElement>(".row-menu-panel");

describe("SoneRowMenu", () => {
  it("renders the closed trigger on the server", async () => {
    const out = await ssr(() =>
      h(SoneRowMenu, { label: "Actions for Research" }, items),
    );
    expect(out).toMatch(
      /^<sone-row-menu data-slot="row-menu" data-state="closed"><button type="button" class="row-menu-trigger" data-slot="row-menu-trigger" data-state="closed" aria-haspopup="menu" aria-expanded="false" aria-controls="sone-row-menu-[\w-]+" aria-label="Actions for Research" title="Actions for Research"><svg viewBox="0 0 24 24"/,
    );
    expect(out).not.toContain("row-menu-panel");
  });

  it("opens a placed menu on <body>, closes on an item, Escape and outside clicks", async () => {
    const w = mount(SoneRowMenu, {
      props: { label: "Actions", prominent: true },
      slots: { default: items },
      attachTo: document.body,
    });
    expect(w.classes()).toEqual(["is-prominent"]);
    const trigger = w.find("button");
    trigger.element.dispatchEvent(
      new MouseEvent("click", { detail: 1, bubbles: true }),
    );
    await nextTick();
    const menu = panel()!;
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.id).toBe(trigger.attributes("aria-controls"));
    expect(menu.getAttribute("aria-label")).toBe("Actions");
    expect(menu.classList.contains("is-positioned")).toBe(true);
    expect(menu.style.left).toMatch(/px$/);
    expect(w.attributes("data-state")).toBe("open");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(w.emitted("openChange")).toEqual([[true]]);

    // A keep-open item and a disabled one leave it open; an item closes it.
    menu.querySelectorAll("button")[2]!.click();
    await nextTick();
    expect(panel()).not.toBeNull();
    menu.querySelector("button")!.click();
    await nextTick();
    expect(panel()).toBeNull();
    expect(w.emitted("openChange")).toEqual([[true], [false]]);

    await trigger.trigger("click");
    await nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger.element);

    await trigger.trigger("click");
    await nextTick();
    document.body.click();
    await nextTick();
    expect(panel()).toBeNull();
    w.unmount();
  });

  it("opens from the keyboard on the first or last item and moves with the arrows", async () => {
    const w = mount(SoneRowMenu, {
      props: { label: "Actions" },
      slots: { default: items },
      attachTo: document.body,
    });
    const trigger = w.find("button");
    await trigger.trigger("keydown", { key: "ArrowUp" });
    await nextTick();
    const buttons = panel()!.querySelectorAll("button");
    expect(document.activeElement).toBe(buttons[2]);
    panel()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    expect(document.activeElement).toBe(buttons[0]);
    panel()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    // The disabled item is skipped.
    expect(document.activeElement).toBe(buttons[2]);
    panel()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    await nextTick();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger.element);
    (w.vm as unknown as SoneRowMenuExposed).close();
    w.unmount();
  });

  it("does not open while disabled and swaps title for a styled tooltip", async () => {
    const w = mount(SoneRowMenu, {
      props: { label: "Actions", disabled: true, tooltip: "More" },
      slots: { default: items },
      attachTo: document.body,
    });
    const trigger = w.find("button");
    expect(trigger.attributes("title")).toBeUndefined();
    expect(trigger.attributes("disabled")).toBe("");
    trigger.element.dispatchEvent(new MouseEvent("click"));
    await nextTick();
    expect(panel()).toBeNull();
    w.unmount();
  });
});

describe("SonePageActions", () => {
  it("renders the status, the parts and a prominent row menu", async () => {
    const out = await ssr(() =>
      h(SonePageActions, { status: "Edited Oct 08" }, () => [
        h(SoneMenuItem, null, () => "Copy link"),
        h(SonePageActionsLead, null, () => "lead"),
        h(SonePageActionsStatus, null, () => "Saved"),
      ]),
    );
    expect(out).toMatch(
      /^<sone-page-actions data-slot="page-actions" data-state="closed"><span class="page-actions-status" data-slot="page-actions-status">Edited Oct 08<\/span><span data-slot="page-actions-status">Saved<\/span><span data-slot="page-actions-lead">lead<\/span><sone-row-menu class="is-prominent" data-slot="row-menu" data-state="closed">/,
    );
    expect(out).toContain('aria-label="More actions" title="More actions"');
    expect(await ssr(() => h(SonePageActions, { showMenu: false }))).toBe(
      '<sone-page-actions data-slot="page-actions" data-state="closed"><!----><!----></sone-page-actions>',
    );
  });

  it("puts the other children in the menu and reports open", async () => {
    const w = mount(SonePageActions, {
      props: { label: "Page actions" },
      slots: {
        default: () => [
          h(SonePageActionsLead, null, () => "lead"),
          h(SoneMenuItem, { type: "button" }, () => "Copy link"),
        ],
      },
      attachTo: document.body,
    });
    expect(w.find('[data-slot="page-actions-lead"]').exists()).toBe(true);
    await w.find(".row-menu-trigger").trigger("click");
    await nextTick();
    expect(w.attributes("data-state")).toBe("open");
    expect(panel()!.textContent).toBe("Copy link");
    expect(w.emitted("openChange")).toEqual([[true]]);
    (w.vm as unknown as { close(): void }).close();
    await nextTick();
    expect(w.attributes("data-state")).toBe("closed");
    w.unmount();
  });
});
