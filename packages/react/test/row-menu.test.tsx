import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { SoneMenuItem } from "../src/components/menu";
import {
  SonePageActions,
  SonePageActionsLead,
  SonePageActionsStatus,
  type SonePageActionsHandle,
} from "../src/components/page-actions";
import {
  SoneRowMenu,
  type SoneRowMenuHandle,
} from "../src/components/row-menu";

afterEach(() => {
  document.body.innerHTML = "";
});

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const ITEMS = [
  <SoneMenuItem key="a" type="button">
    Rename
  </SoneMenuItem>,
  <SoneMenuItem key="b" type="button" disabled>
    Locked
  </SoneMenuItem>,
  <SoneMenuItem key="c" type="button" data-menu-keep-open="">
    Stay
  </SoneMenuItem>,
];

const panel = () => document.body.querySelector<HTMLElement>(".row-menu-panel");

describe("SoneRowMenu", () => {
  it("renders the closed trigger on the server", () => {
    const out = html(
      <SoneRowMenu label="Actions for Research">{ITEMS}</SoneRowMenu>,
    );
    expect(out).toMatch(
      /^<sone-row-menu data-slot="row-menu" data-state="closed"><button type="button" class="row-menu-trigger" data-slot="row-menu-trigger" data-state="closed" aria-haspopup="menu" aria-expanded="false" aria-controls="sone-row-menu-[^"]+" aria-label="Actions for Research" title="Actions for Research"><svg viewBox="0 0 24 24"/,
    );
    expect(out).not.toContain("row-menu-panel");
  });

  it("opens a placed menu on <body>, closes on an item, Escape and outside clicks", () => {
    const changes: boolean[] = [];
    const { container } = render(
      <SoneRowMenu
        label="Actions"
        prominent
        onOpenChange={(o) => changes.push(o)}
      >
        {ITEMS}
      </SoneRowMenu>,
    );
    const host = container.firstElementChild!;
    expect(host.className).toBe("is-prominent");
    const trigger = container.querySelector("button")!;
    fireEvent.click(trigger, { detail: 1 });
    const menu = panel()!;
    expect(menu.getAttribute("role")).toBe("menu");
    expect(menu.id).toBe(trigger.getAttribute("aria-controls"));
    expect(menu.classList.contains("is-positioned")).toBe(true);
    expect(menu.style.left).toMatch(/px$/);
    expect(host.getAttribute("data-state")).toBe("open");
    expect(host.className).toBe("is-open is-prominent");
    expect(changes).toEqual([true]);

    fireEvent.click(menu.querySelectorAll("button")[2]!);
    expect(panel()).not.toBeNull();
    fireEvent.click(menu.querySelector("button")!);
    expect(panel()).toBeNull();
    expect(changes).toEqual([true, false]);

    fireEvent.click(trigger, { detail: 1 });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger, { detail: 1 });
    act(() => document.body.click());
    expect(panel()).toBeNull();
  });

  it("opens from the keyboard on the first or last item and moves with the arrows", () => {
    const handle = createRef<SoneRowMenuHandle>();
    const { container } = render(
      <SoneRowMenu label="Actions" handleRef={handle}>
        {ITEMS}
      </SoneRowMenu>,
    );
    const trigger = container.querySelector("button")!;
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    const buttons = panel()!.querySelectorAll("button");
    expect(document.activeElement).toBe(buttons[2]);
    expect(handle.current!.isOpen).toBe(true);
    fireEvent.keyDown(buttons[2]!, { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(buttons[0]!, { key: "ArrowDown" });
    // The disabled item is skipped.
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.keyDown(buttons[2]!, { key: "Tab" });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("does not open while disabled and swaps title for a styled tooltip", () => {
    const { container } = render(
      <SoneRowMenu label="Actions" disabled tooltip="More">
        {ITEMS}
      </SoneRowMenu>,
    );
    const trigger = container.querySelector("button")!;
    expect(trigger.hasAttribute("title")).toBe(false);
    expect(trigger.disabled).toBe(true);
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(panel()).toBeNull();
  });
});

describe("SonePageActions", () => {
  it("renders the status, the parts and a prominent row menu", () => {
    const out = html(
      <SonePageActions status="Edited Oct 08">
        <SoneMenuItem>Copy link</SoneMenuItem>
        <SonePageActionsLead>lead</SonePageActionsLead>
        <SonePageActionsStatus>Saved</SonePageActionsStatus>
      </SonePageActions>,
    );
    expect(out).toMatch(
      /^<sone-page-actions data-slot="page-actions" data-state="closed"><span class="page-actions-status" data-slot="page-actions-status">Edited Oct 08<\/span><span data-slot="page-actions-status">Saved<\/span><span data-slot="page-actions-lead">lead<\/span><sone-row-menu data-slot="row-menu" data-state="closed" class="is-prominent">/,
    );
    expect(out).toContain('aria-label="More actions" title="More actions"');
    expect(html(<SonePageActions showMenu={false} />)).toBe(
      '<sone-page-actions data-slot="page-actions" data-state="closed"></sone-page-actions>',
    );
  });

  it("puts the other children in the menu and reports open", () => {
    const changes: boolean[] = [];
    const handle = createRef<SonePageActionsHandle>();
    const { container } = render(
      <SonePageActions
        label="Page actions"
        handleRef={handle}
        onOpenChange={(o) => changes.push(o)}
      >
        <SonePageActionsLead>lead</SonePageActionsLead>
        <SoneMenuItem type="button">Copy link</SoneMenuItem>
      </SonePageActions>,
    );
    const host = container.firstElementChild!;
    fireEvent.click(container.querySelector(".row-menu-trigger")!, {
      detail: 1,
    });
    expect(host.getAttribute("data-state")).toBe("open");
    expect(panel()!.textContent).toBe("Copy link");
    expect(changes).toEqual([true]);
    act(() => handle.current!.close());
    expect(host.getAttribute("data-state")).toBe("closed");
  });
});
