import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneButton } from "../src/components/button";
import {
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
  SoneSidebarProvider,
  SoneSidebarRail,
  SoneSidebarSeparator,
  SoneSidebarTrigger,
  SoneSidebarWrapper,
  useSoneSidebar,
  type SoneSidebarCollapsible,
  type SoneSidebarConfig,
} from "../src/components/sidebar";

const NO_STORAGE: Partial<SoneSidebarConfig> = {
  openStorageKey: null,
  widthStorageKey: null,
};

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** The docs demo. */
function Shell({
  config = NO_STORAGE,
  collapsible = "icon",
}: {
  config?: Partial<SoneSidebarConfig>;
  collapsible?: SoneSidebarCollapsible;
}) {
  return (
    <SoneSidebarWrapper config={config}>
      <SoneSidebar
        collapsible={collapsible}
        role="navigation"
        aria-label="Workspace"
      >
        <SoneSidebarHeader>
          <SoneSidebarTrigger type="button" aria-label="Toggle" />
        </SoneSidebarHeader>
        <SoneSidebarContent>
          <SoneSidebarGroup tone="danger">
            <SoneSidebarGroupLabel variant="destructive">
              Dev
            </SoneSidebarGroupLabel>
            <SoneSidebarMenu>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton
                  type="button"
                  isActive
                  variant="destructive"
                  tooltip="Logs"
                >
                  <span>Logs</span>
                </SoneSidebarMenuButton>
                <SoneSidebarMenuBadge>3</SoneSidebarMenuBadge>
              </SoneSidebarMenuItem>
            </SoneSidebarMenu>
          </SoneSidebarGroup>
          <SoneSidebarSeparator />
        </SoneSidebarContent>
        <SoneSidebarFooter>Footer</SoneSidebarFooter>
        <SoneSidebarRail />
      </SoneSidebar>
      <SoneSidebarInset>Main</SoneSidebarInset>
    </SoneSidebarWrapper>
  );
}

const q = <T extends Element = HTMLElement>(selector: string): T =>
  document.querySelector<T>(selector)!;
const attr = (selector: string, name: string) =>
  q(selector)?.getAttribute(name) ?? undefined;
const wrapperState = () => attr('[data-slot="sidebar-wrapper"]', "data-state");
const wrapperWidth = () =>
  q('[data-slot="sidebar-wrapper"]').style.getPropertyValue("--sidebar-width");

describe("SoneSidebar", () => {
  it("renders the Angular markup: data-slot, data-sidebar and the state attributes", () => {
    render(<Shell />);
    expect(wrapperState()).toBe("expanded");
    const sidebar = q("sone-sidebar");
    expect(sidebar.getAttribute("data-slot")).toBe("sidebar");
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
    expect(sidebar.getAttribute("data-collapsible")).toBe("");
    expect(sidebar.getAttribute("data-variant")).toBe("sidebar");
    expect(sidebar.getAttribute("data-side")).toBe("left");
    expect(sidebar.getAttribute("role")).toBe("navigation");
    expect(sidebar.getAttribute("aria-label")).toBe("Workspace");
    expect(
      q(
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
        q(`[data-slot="${slot}"][data-sidebar="${part}"]`),
        slot,
      ).toBeTruthy();
    }
    expect(q('[data-slot="sidebar-menu"]').tagName).toBe("UL");
    expect(q('[data-slot="sidebar-menu-item"]').tagName).toBe("LI");
    expect(attr('[data-slot="sidebar-group"]', "data-tone")).toBe("danger");
    expect(attr('[data-slot="sidebar-group-label"]', "data-variant")).toBe(
      "destructive",
    );
    const button = q('[data-slot="sidebar-menu-button"]');
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("data-sidebar")).toBe("menu-button");
    expect(button.getAttribute("data-size")).toBe("default");
    expect(button.getAttribute("data-variant")).toBe("destructive");
    expect(button.getAttribute("data-active")).toBe("true");
    const separator = q('[data-slot="sidebar-separator"]');
    expect(separator.className).toBe("separator");
    expect(separator.getAttribute("role")).toBe("none");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
    expect(attr('[data-sidebar="trigger"]', "aria-expanded")).toBe("true");
    expect(q('[data-slot="sidebar-inset"]').textContent).toBe("Main");
    // No style attribute when there is no width to set.
    expect(q('[data-slot="sidebar-wrapper"]').hasAttribute("style")).toBe(
      false,
    );
  });

  it("the trigger collapses it to icons and back", () => {
    render(<Shell />);
    const trigger = q('[data-sidebar="trigger"]');
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(wrapperState()).toBe("collapsed");
    const sidebar = q("sone-sidebar");
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
    expect(sidebar.getAttribute("data-collapsible")).toBe("icon");
    fireEvent.click(trigger);
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
    expect(sidebar.getAttribute("data-collapsible")).toBe("");
  });

  it("the trigger can render as a SoneButton (`as`), keeping its state", () => {
    const onClick = vi.fn();
    render(
      <SoneSidebarWrapper config={NO_STORAGE}>
        <SoneSidebarTrigger
          as={SoneButton}
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="Toggle sidebar"
          onClick={onClick}
        />
      </SoneSidebarWrapper>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger.className).toBe("btn");
    expect(trigger.getAttribute("data-slot")).toBe("button");
    expect(trigger.getAttribute("data-variant")).toBe("ghost");
    expect(trigger.getAttribute("data-size")).toBe("icon-sm");
    expect(trigger.getAttribute("data-sidebar")).toBe("trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a static sidebar (collapsible none) ignores the state", () => {
    render(<Shell collapsible="none" />);
    const sidebar = q("sone-sidebar");
    expect(sidebar.hasAttribute("data-state")).toBe(false);
    expect(sidebar.hasAttribute("data-collapsible")).toBe(false);
    expect(q('[data-slot="sidebar-container"]')).toBeNull();
    expect(
      sidebar.querySelector(':scope > [data-slot="sidebar-header"]'),
    ).toBeTruthy();
    fireEvent.click(q('[data-sidebar="trigger"]'));
    expect(sidebar.hasAttribute("data-state")).toBe(false);
  });

  it("toggles on Cmd/Ctrl+B, but not in a field, with other modifiers or after preventDefault", () => {
    const { unmount } = render(
      <>
        <Shell />
        <input id="field" />
        <textarea />
      </>,
    );
    const press = (init: KeyboardEventInit, target: EventTarget = document) =>
      act(() => {
        target.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "b",
            bubbles: true,
            cancelable: true,
            ...init,
          }),
        );
      });

    press({ metaKey: true });
    expect(wrapperState()).toBe("collapsed");
    press({ ctrlKey: true, key: "B" });
    expect(wrapperState()).toBe("expanded");

    press({ metaKey: true, shiftKey: true });
    press({ metaKey: true, altKey: true });
    press({});
    press({ metaKey: true }, document.getElementById("field")!);
    press({ metaKey: true }, document.querySelector("textarea")!);
    const blocked = (e: Event) => e.preventDefault();
    document.body.addEventListener("keydown", blocked);
    press({ metaKey: true }, document.body);
    document.body.removeEventListener("keydown", blocked);
    expect(wrapperState()).toBe("expanded");

    const remove = vi.spyOn(document, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("restores the stored state and width on mount and persists changes", () => {
    localStorage.setItem("index-one.shell.sidebarExpanded", "false");
    localStorage.setItem("index-one.shell.sidebarWidth", "9999");
    render(<Shell config={{}} />);
    expect(wrapperState()).toBe("collapsed");
    // Clamped to maxWidth.
    expect(wrapperWidth()).toBe("480px");

    fireEvent.click(q('[data-sidebar="trigger"]'));
    expect(localStorage.getItem("index-one.shell.sidebarExpanded")).toBe(
      "true",
    );
  });

  it("does not touch storage when its keys are null", () => {
    const set = vi.spyOn(Storage.prototype, "setItem");
    const get = vi.spyOn(Storage.prototype, "getItem");
    render(<Shell />);
    fireEvent.click(q('[data-sidebar="trigger"]'));
    expect(set).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it("the rail: click toggles, keys resize, Enter and Alt-click reset, a drag resizes", () => {
    render(
      <Shell
        config={{
          ...NO_STORAGE,
          defaultWidth: 256,
          minWidth: 200,
          maxWidth: 480,
        }}
      />,
    );
    const rail = q('[data-slot="sidebar-rail"]');
    const a = (name: string) => rail.getAttribute(name) ?? undefined;

    expect(a("role")).toBe("separator");
    expect(a("tabindex")).toBe("0");
    expect(a("aria-orientation")).toBe("vertical");
    expect(a("aria-valuenow")).toBe("256");
    expect(a("aria-valuemin")).toBe("200");
    expect(a("aria-valuemax")).toBe("480");
    expect(a("aria-label")).toBe("Resize sidebar");
    expect(a("title")).toBe(
      "Click to collapse · drag to resize · ⌥-click to reset width",
    );

    fireEvent.keyDown(rail, { key: "ArrowRight" });
    expect(a("aria-valuenow")).toBe("272");
    expect(wrapperWidth()).toBe("272px");
    fireEvent.keyDown(rail, { key: "ArrowLeft", shiftKey: true });
    expect(a("aria-valuenow")).toBe("208");
    fireEvent.keyDown(rail, { key: "End" });
    expect(a("aria-valuenow")).toBe("480");
    fireEvent.keyDown(rail, { key: "Home" });
    expect(a("aria-valuenow")).toBe("200");
    fireEvent.keyDown(rail, { key: "Enter" });
    expect(a("aria-valuenow")).toBe("256");
    expect(wrapperWidth()).toBe("");

    fireEvent.keyDown(rail, { key: "ArrowRight" });
    fireEvent.click(rail, { altKey: true });
    expect(a("aria-valuenow")).toBe("256");
    expect(a("role")).toBe("separator");

    // A drag (past the 3px threshold) resizes and swallows the click that ends it.
    const pointer = (type: string, clientX: number) =>
      act(() => {
        rail.dispatchEvent(
          Object.assign(
            new MouseEvent(type, { clientX, button: 0, bubbles: true }),
            { pointerId: 1 },
          ),
        );
      });
    pointer("pointerdown", 100);
    pointer("pointermove", 140);
    expect(attr('[data-slot="sidebar-wrapper"]', "data-resizing")).toBe("");
    pointer("pointerup", 140);
    fireEvent.click(rail);
    expect(wrapperWidth()).toBe("296px");
    expect(
      attr('[data-slot="sidebar-wrapper"]', "data-resizing"),
    ).toBeUndefined();
    expect(a("role")).toBe("separator");

    fireEvent.click(rail);
    expect(a("role")).toBe("button");
    expect(a("tabindex")).toBe("-1");
    expect(a("aria-label")).toBe("Toggle sidebar");
    expect(a("title")).toBe("Click to expand");
    expect(a("aria-valuenow")).toBeUndefined();
    fireEvent.keyDown(rail, { key: "ArrowRight" });
    fireEvent.click(rail);
    expect(a("role")).toBe("separator");
  });

  it("menu-button tooltips show only while the sidebar is collapsed to icons", () => {
    vi.useFakeTimers();
    render(<Shell />);
    const button = q('[data-slot="sidebar-menu-button"]');
    const bubble = () => document.querySelector(".sone-tooltip");

    fireEvent.mouseEnter(button);
    act(() => vi.advanceTimersByTime(1000));
    expect(bubble()).toBeNull();
    fireEvent.mouseLeave(button);

    fireEvent.click(q('[data-sidebar="trigger"]'));
    fireEvent.mouseEnter(button);
    act(() => vi.advanceTimersByTime(1000));
    expect(bubble()?.textContent).toBe("Logs");
    expect(bubble()?.getAttribute("data-side")).toBe("right");
  });

  it("menu sub-buttons and skeletons", () => {
    render(
      <>
        <SoneSidebarMenuSubButton href="/a" isActive>
          A
        </SoneSidebarMenuSubButton>
        <SoneSidebarMenuSkeleton showIcon />
      </>,
    );
    const sub = q('[data-slot="sidebar-menu-sub-button"]');
    expect(sub.tagName).toBe("A");
    expect(sub.getAttribute("data-size")).toBe("md");
    expect(sub.getAttribute("data-active")).toBe("true");
    expect(sub.getAttribute("href")).toBe("/a");
    const skeleton = q('[data-slot="sidebar-menu-skeleton"]');
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton.getAttribute("data-show-icon")).toBe("");
    expect(skeleton.style.getPropertyValue("--skeleton-width")).toMatch(
      /^(5\d|6\d|7\d|8\d)%$/,
    );
  });

  it("shares a state provided above the wrapper; useSoneSidebar needs one", () => {
    let toggle = (): void => undefined;
    function Driver() {
      toggle = useSoneSidebar().toggleSidebar;
      return null;
    }
    render(
      <SoneSidebarProvider config={NO_STORAGE}>
        <Driver />
        <Shell config={{ defaultOpen: true }} />
      </SoneSidebarProvider>,
    );
    act(() => toggle());
    expect(attr("sone-sidebar", "data-state")).toBe("collapsed");

    function Lonely() {
      useSoneSidebar();
      return null;
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Lonely />)).toThrow(/SoneSidebarWrapper/);
  });
});

describe("SoneSidebar on the server", () => {
  it("renders the default state without storage and hydrates with no mismatch", async () => {
    localStorage.setItem("index-one.shell.sidebarExpanded", "false");
    const html = renderToString(<Shell config={{}} />);
    expect(html).toContain("<sone-sidebar");
    expect(html).toContain('data-slot="sidebar-wrapper" data-state="expanded"');
    expect(html).toContain('data-slot="sidebar-menu-button"');

    const el = document.createElement("div");
    document.body.appendChild(el);
    el.innerHTML = html;
    const errors: unknown[] = [];
    const error = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => void errors.push(...args));
    await act(async () => {
      hydrateRoot(el, <Shell config={{}} />, {
        onRecoverableError: (e) => errors.push(e),
      });
    });
    expect(errors.map(String).join(" ")).not.toMatch(/hydrat|mismatch/i);
    error.mockRestore();
    // The stored state applies after hydration.
    expect(
      el
        .querySelector('[data-slot="sidebar-wrapper"]')
        ?.getAttribute("data-state"),
    ).toBe("collapsed");
  });
});
