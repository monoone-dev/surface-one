import { enableAutoUnmount, mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneButton,
  SoneSidebar,
  SoneSidebarContent,
  SoneSidebarFooter,
  SoneSidebarGroup,
  SoneSidebarGroupLabel,
  SoneSidebarHeader,
  SoneSidebarInset,
  SoneSidebarMenu,
  SoneSidebarMenuBadge,
  SoneSidebarMenuButton,
  SoneSidebarMenuItem,
  SoneSidebarMenuSkeleton,
  SoneSidebarMenuSubButton,
  SoneSidebarRail,
  SoneSidebarSeparator,
  SoneSidebarTrigger,
  SoneSidebarWrapper,
  provideSoneSidebar,
  useSoneSidebar,
  type SoneSidebarConfig,
} from "../src/index";

const NO_STORAGE: Partial<SoneSidebarConfig> = {
  openStorageKey: null,
  widthStorageKey: null,
};

// Every mounted wrapper listens on the document: unmount it before the next test.
enableAutoUnmount(afterEach);

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const attach = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
};

/** The docs demo, as a render function. */
const shell = (
  config: Partial<SoneSidebarConfig> = NO_STORAGE,
  collapsible: "icon" | "offcanvas" | "none" = "icon",
) =>
  h(SoneSidebarWrapper, { config }, () => [
    h(
      SoneSidebar,
      { collapsible, role: "navigation", "aria-label": "Workspace" },
      () => [
        h(SoneSidebarHeader, null, () =>
          h(SoneSidebarTrigger, { type: "button", "aria-label": "Toggle" }),
        ),
        h(SoneSidebarContent, null, () => [
          h(SoneSidebarGroup, { tone: "danger" }, () => [
            h(SoneSidebarGroupLabel, { variant: "destructive" }, () => "Dev"),
            h(SoneSidebarMenu, null, () => [
              h(SoneSidebarMenuItem, null, () => [
                h(
                  SoneSidebarMenuButton,
                  {
                    type: "button",
                    isActive: true,
                    variant: "destructive",
                    tooltip: "Logs",
                  },
                  () => h("span", "Logs"),
                ),
                h(SoneSidebarMenuBadge, null, () => "3"),
              ]),
            ]),
          ]),
          h(SoneSidebarSeparator),
        ]),
        h(SoneSidebarFooter, null, () => "Footer"),
        h(SoneSidebarRail),
      ],
    ),
    h(SoneSidebarInset, null, () => "Main"),
  ]);

describe("SoneSidebar", () => {
  it("renders the Angular markup: data-slot, data-sidebar and the state attributes", () => {
    const w = mount(() => shell(), { attachTo: attach() });
    const wrapper = w.get('[data-slot="sidebar-wrapper"]');
    expect(wrapper.attributes("data-state")).toBe("expanded");
    const sidebar = w.get("sone-sidebar");
    expect(sidebar.attributes()).toMatchObject({
      "data-slot": "sidebar",
      "data-state": "expanded",
      "data-collapsible": "",
      "data-variant": "sidebar",
      "data-side": "left",
      role: "navigation",
      "aria-label": "Workspace",
    });
    expect(
      w.get(
        '[data-slot="sidebar-container"][data-side="left"] > [data-slot="sidebar-inner"][data-sidebar="sidebar"]',
      ),
    ).toBeTruthy();
    for (const [slot, part] of [
      ["sidebar-header", "header"],
      ["sidebar-content", "content"],
      ["sidebar-footer", "footer"],
      ["sidebar-group", "group"],
      ["sidebar-group-label", "group-label"],
      ["sidebar-menu", "menu"],
      ["sidebar-menu-item", "menu-item"],
      ["sidebar-menu-badge", "menu-badge"],
      ["sidebar-separator", "separator"],
      ["sidebar-rail", "rail"],
    ]) {
      expect(
        w.find(`[data-slot="${slot}"][data-sidebar="${part}"]`).exists(),
        slot,
      ).toBe(true);
    }
    expect(w.get('[data-slot="sidebar-menu"]').element.tagName).toBe("UL");
    expect(w.get('[data-slot="sidebar-menu-item"]').element.tagName).toBe("LI");
    expect(w.get('[data-slot="sidebar-group"]').attributes("data-tone")).toBe(
      "danger",
    );
    expect(
      w.get('[data-slot="sidebar-group-label"]').attributes("data-variant"),
    ).toBe("destructive");
    const button = w.get('[data-slot="sidebar-menu-button"]');
    expect(button.element.tagName).toBe("BUTTON");
    expect(button.attributes()).toMatchObject({
      "data-sidebar": "menu-button",
      "data-size": "default",
      "data-variant": "destructive",
      "data-active": "true",
    });
    expect(w.get('[data-slot="sidebar-separator"]').attributes()).toMatchObject(
      { class: "separator", role: "none", "data-orientation": "horizontal" },
    );
    expect(w.get('[data-sidebar="trigger"]').attributes("aria-expanded")).toBe(
      "true",
    );
    expect(w.get('[data-slot="sidebar-inset"]').text()).toBe("Main");
  });

  it("the trigger collapses it to icons and back", async () => {
    const w = mount(() => shell(), { attachTo: attach() });
    const trigger = w.get('[data-sidebar="trigger"]');
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(
      w.get('[data-slot="sidebar-wrapper"]').attributes("data-state"),
    ).toBe("collapsed");
    const sidebar = w.get("sone-sidebar");
    expect(sidebar.attributes("data-state")).toBe("collapsed");
    expect(sidebar.attributes("data-collapsible")).toBe("icon");
    await trigger.trigger("click");
    expect(sidebar.attributes("data-state")).toBe("expanded");
    expect(sidebar.attributes("data-collapsible")).toBe("");
  });

  it("the trigger can render as a SoneButton (`:as`), keeping its state", async () => {
    const w = mount(
      () =>
        h(SoneSidebarWrapper, { config: NO_STORAGE }, () =>
          h(SoneSidebarTrigger, {
            as: SoneButton,
            variant: "ghost",
            size: "icon-sm",
            type: "button",
            "aria-label": "Toggle sidebar",
          }),
        ),
      { attachTo: attach() },
    );
    const trigger = w.get("button");
    expect(trigger.attributes()).toMatchObject({
      class: "btn",
      "data-slot": "button",
      "data-variant": "ghost",
      "data-size": "icon-sm",
      "data-sidebar": "trigger",
      "aria-expanded": "true",
    });
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("a static sidebar (collapsible none) ignores the state", async () => {
    const w = mount(() => shell(NO_STORAGE, "none"), { attachTo: attach() });
    const sidebar = w.get("sone-sidebar");
    expect(sidebar.attributes("data-state")).toBeUndefined();
    expect(sidebar.attributes("data-collapsible")).toBeUndefined();
    expect(w.find('[data-slot="sidebar-container"]').exists()).toBe(false);
    expect(sidebar.find(':scope > [data-slot="sidebar-header"]').exists()).toBe(
      true,
    );
    await w.get('[data-sidebar="trigger"]').trigger("click");
    expect(sidebar.attributes("data-state")).toBeUndefined();
  });

  it("toggles on Cmd/Ctrl+B, but not in a field, with other modifiers or after preventDefault", async () => {
    const w = mount(
      () => [shell(), h("input", { id: "field" }), h("textarea")],
      { attachTo: attach() },
    );
    const state = () =>
      w.get('[data-slot="sidebar-wrapper"]').attributes("data-state");
    const press = (init: KeyboardEventInit, target: EventTarget = document) =>
      target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "b",
          bubbles: true,
          cancelable: true,
          ...init,
        }),
      );

    press({ metaKey: true });
    await nextTick();
    expect(state()).toBe("collapsed");
    press({ ctrlKey: true, key: "B" });
    await nextTick();
    expect(state()).toBe("expanded");

    press({ metaKey: true, shiftKey: true });
    press({ metaKey: true, altKey: true });
    press({});
    press({ metaKey: true }, document.getElementById("field")!);
    press({ metaKey: true }, document.querySelector("textarea")!);
    const blocked = (e: Event) => e.preventDefault();
    document.body.addEventListener("keydown", blocked);
    press({ metaKey: true }, document.body);
    document.body.removeEventListener("keydown", blocked);
    await nextTick();
    expect(state()).toBe("expanded");

    w.unmount();
    const remove = vi.spyOn(document, "removeEventListener");
    const again = mount(() => shell(), { attachTo: attach() });
    again.unmount();
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("restores the stored state and width on mount and persists changes", async () => {
    localStorage.setItem("index-one.shell.sidebarExpanded", "false");
    localStorage.setItem("index-one.shell.sidebarWidth", "9999");
    const w = mount(() => shell({}), { attachTo: attach() });
    await nextTick();
    const wrapper = w.get('[data-slot="sidebar-wrapper"]');
    expect(wrapper.attributes("data-state")).toBe("collapsed");
    // Clamped to maxWidth.
    expect(
      (wrapper.element as HTMLElement).style.getPropertyValue(
        "--sidebar-width",
      ),
    ).toBe("480px");

    await w.get('[data-sidebar="trigger"]').trigger("click");
    expect(localStorage.getItem("index-one.shell.sidebarExpanded")).toBe(
      "true",
    );
  });

  it("does not touch storage when its keys are null", async () => {
    const set = vi.spyOn(Storage.prototype, "setItem");
    const get = vi.spyOn(Storage.prototype, "getItem");
    const w = mount(() => shell(), { attachTo: attach() });
    await w.get('[data-sidebar="trigger"]').trigger("click");
    expect(set).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it("the rail: click toggles, keys resize, Enter and Alt-click reset, a drag resizes", async () => {
    const w = mount(
      () =>
        shell({
          ...NO_STORAGE,
          defaultWidth: 256,
          minWidth: 200,
          maxWidth: 480,
        }),
      { attachTo: attach() },
    );
    const rail = w.get('[data-slot="sidebar-rail"]');
    const wrapper = w.get('[data-slot="sidebar-wrapper"]')
      .element as HTMLElement;
    const width = () => wrapper.style.getPropertyValue("--sidebar-width");

    expect(rail.attributes()).toMatchObject({
      role: "separator",
      tabindex: "0",
      "aria-orientation": "vertical",
      "aria-valuenow": "256",
      "aria-valuemin": "200",
      "aria-valuemax": "480",
      "aria-label": "Resize sidebar",
      title: "Click to collapse · drag to resize · ⌥-click to reset width",
    });

    await rail.trigger("keydown", { key: "ArrowRight" });
    expect(rail.attributes("aria-valuenow")).toBe("272");
    expect(width()).toBe("272px");
    await rail.trigger("keydown", { key: "ArrowLeft", shiftKey: true });
    expect(rail.attributes("aria-valuenow")).toBe("208");
    await rail.trigger("keydown", { key: "End" });
    expect(rail.attributes("aria-valuenow")).toBe("480");
    await rail.trigger("keydown", { key: "Home" });
    expect(rail.attributes("aria-valuenow")).toBe("200");
    await rail.trigger("keydown", { key: "Enter" });
    expect(rail.attributes("aria-valuenow")).toBe("256");
    expect(width()).toBe("");

    await rail.trigger("keydown", { key: "ArrowRight" });
    await rail.trigger("click", { altKey: true });
    expect(rail.attributes("aria-valuenow")).toBe("256");
    expect(rail.attributes("role")).toBe("separator");

    // A drag (past the 3px threshold) resizes and swallows the click that ends it.
    const pointer = (type: string, clientX: number) =>
      rail.element.dispatchEvent(
        Object.assign(
          new MouseEvent(type, { clientX, button: 0, bubbles: true }),
          { pointerId: 1 },
        ),
      );
    pointer("pointerdown", 100);
    pointer("pointermove", 140);
    await nextTick();
    expect(
      w.get('[data-slot="sidebar-wrapper"]').attributes("data-resizing"),
    ).toBe("");
    pointer("pointerup", 140);
    await rail.trigger("click");
    await nextTick();
    expect(width()).toBe("296px");
    expect(
      w.get('[data-slot="sidebar-wrapper"]').attributes("data-resizing"),
    ).toBeUndefined();
    expect(rail.attributes("role")).toBe("separator");

    await rail.trigger("click");
    expect(rail.attributes()).toMatchObject({
      role: "button",
      tabindex: "-1",
      "aria-label": "Toggle sidebar",
      title: "Click to expand",
    });
    expect(rail.attributes("aria-valuenow")).toBeUndefined();
    await rail.trigger("keydown", { key: "ArrowRight" });
    await rail.trigger("click");
    expect(rail.attributes("role")).toBe("separator");
  });

  it("menu-button tooltips show only while the sidebar is collapsed to icons", async () => {
    vi.useFakeTimers();
    const w = mount(() => shell(), { attachTo: attach() });
    const button = w.get('[data-slot="sidebar-menu-button"]');
    const bubble = () => document.querySelector(".sone-tooltip");

    await button.trigger("mouseenter");
    vi.advanceTimersByTime(1000);
    expect(bubble()).toBeNull();
    await button.trigger("mouseleave");

    await w.get('[data-sidebar="trigger"]').trigger("click");
    await button.trigger("mouseenter");
    vi.advanceTimersByTime(1000);
    expect(bubble()?.textContent).toBe("Logs");
    expect(bubble()?.getAttribute("data-side")).toBe("right");
  });

  it("menu sub-buttons and skeletons", () => {
    const w = mount(() => [
      h(SoneSidebarMenuSubButton, { href: "/a", isActive: true }, () => "A"),
      h(SoneSidebarMenuSkeleton, { showIcon: true }),
    ]);
    const sub = w.get('[data-slot="sidebar-menu-sub-button"]');
    expect(sub.element.tagName).toBe("A");
    expect(sub.attributes()).toMatchObject({
      "data-size": "md",
      "data-active": "true",
      href: "/a",
    });
    const skeleton = w.get('[data-slot="sidebar-menu-skeleton"]');
    expect(skeleton.attributes("aria-hidden")).toBe("true");
    expect(skeleton.attributes("data-show-icon")).toBe("");
    expect(
      (skeleton.element as HTMLElement).style.getPropertyValue(
        "--skeleton-width",
      ),
    ).toMatch(/^(5\d|6\d|7\d|8\d)%$/);
  });

  it("shares a state provided above the wrapper; useSoneSidebar needs one", async () => {
    let toggle = (): void => undefined;
    const Owner = defineComponent({
      setup() {
        const sidebar = provideSoneSidebar(NO_STORAGE);
        toggle = sidebar.toggleSidebar;
        return () => shell({ defaultOpen: true });
      },
    });
    const w = mount(Owner, { attachTo: attach() });
    toggle();
    await nextTick();
    expect(w.get("sone-sidebar").attributes("data-state")).toBe("collapsed");

    const Lonely = defineComponent({
      setup() {
        useSoneSidebar();
        return () => null;
      },
    });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(() => mount(Lonely)).toThrow(/SoneSidebarWrapper/);
  });
});

describe("SoneSidebar on the server", () => {
  it("renders the default state without storage and hydrates with no mismatch", async () => {
    localStorage.setItem("index-one.shell.sidebarExpanded", "false");
    const render = () => shell({});
    const html = await renderToString(createSSRApp({ render }));
    expect(html).toContain('data-state="expanded"');

    const el = attach();
    el.innerHTML = html;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    createSSRApp({ render }).mount(el);
    const calls = [...warn.mock.calls, ...error.mock.calls].flat().join(" ");
    expect(calls).not.toMatch(/mismatch/i);
    // The stored state applies after hydration.
    await nextTick();
    expect(
      el
        .querySelector('[data-slot="sidebar-wrapper"]')
        ?.getAttribute("data-state"),
    ).toBe("collapsed");
  });
});
