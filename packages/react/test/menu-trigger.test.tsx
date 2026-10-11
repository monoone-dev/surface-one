import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuTrigger,
} from "../src/components/menu";
import { SoneDialog } from "../src/components/dialog";

function Harness({
  onPick,
  onOpen,
}: {
  onPick: (what: string) => void;
  onOpen?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SoneMenuTrigger
      className="btn"
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        onOpen?.(v);
      }}
      menu={
        <SoneMenu>
          <SoneMenuItem onClick={() => onPick("edit")}>Edit</SoneMenuItem>
          <SoneMenuItem disabled>Move</SoneMenuItem>
          <SoneMenuItem onClick={() => onPick("delete")}>Delete</SoneMenuItem>
          <SoneMenuCheckboxItem checked data-menu-keep-open="">
            Pinned
          </SoneMenuCheckboxItem>
        </SoneMenu>
      }
    >
      Options
    </SoneMenuTrigger>
  );
}

function setup() {
  const onPick = vi.fn();
  const onOpen = vi.fn();
  const view = render(<Harness onPick={onPick} onOpen={onOpen} />);
  const trigger =
    view.container.querySelector<HTMLButtonElement>("button.btn")!;
  const menu = () => document.querySelector<HTMLElement>('[data-slot="menu"]');
  const items = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
  return { view, trigger, menu, items, onPick, onOpen };
}

describe("SoneMenuTrigger", () => {
  it("renders a closed menu button on the server", () => {
    const html = renderToString(
      <SoneMenuTrigger menu={<SoneMenu />}>Options</SoneMenuTrigger>,
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
  });

  it("opens from ArrowDown on the first item, in a positioner on <body>", () => {
    const { trigger, menu, items } = setup();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const positioner = menu()!.parentElement!;
    expect(positioner.dataset["slot"]).toBe("overlay-positioner");
    expect(positioner.parentElement).toBe(document.body);
    expect(positioner.hasAttribute("data-placed")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(trigger.getAttribute("aria-controls")).toBe(menu()!.id);
    expect(document.activeElement).toBe(items()[0]);
    expect(items().every((i) => i.getAttribute("tabindex") === "-1")).toBe(
      true,
    );
  });

  it("moves with the arrows (skipping disabled items), Home / End and typeahead", () => {
    const { trigger, items } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    const [edit, , del, pinned] = items();
    expect(document.activeElement).toBe(pinned);
    fireEvent.keyDown(pinned!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(del);
    fireEvent.keyDown(del!, { key: "Home" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit!, { key: "End" });
    expect(document.activeElement).toBe(pinned);
    fireEvent.keyDown(pinned!, { key: "d" });
    expect(document.activeElement).toBe(del);
  });

  it("activates with Enter, closes and gives focus back to the trigger", () => {
    const { trigger, items, menu, onPick, onOpen } = setup();
    fireEvent.keyDown(trigger, { key: "Enter" });
    items()[2]!.focus();
    act(() => {
      fireEvent.keyDown(items()[2]!, { key: "Enter" });
    });
    expect(onPick).toHaveBeenCalledWith("delete");
    expect(onOpen).toHaveBeenLastCalledWith(false);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
  });

  it("stays open for a keep-open item, closes on Escape and on a click outside", () => {
    const { trigger, items, menu, onOpen } = setup();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    act(() => items()[3]!.click());
    expect(menu()).not.toBeNull();
    act(() => {
      fireEvent.keyDown(items()[0]!, { key: "Escape" });
    });
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(menu()).not.toBeNull();
    act(() => {
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(menu()).toBeNull();
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it("a mouse click focuses the menu itself, a second click closes it", () => {
    const { trigger, menu } = setup();
    fireEvent.click(trigger, { detail: 1 });
    expect(document.activeElement).toBe(menu());
    fireEvent.click(trigger, { detail: 1 });
    expect(menu()).toBeNull();
  });

  it("closes on Escape from the trigger without closing the dialog around it", () => {
    const onDialog = vi.fn();
    const view = render(
      <SoneDialog open onOpenChange={onDialog}>
        <Harness onPick={() => {}} />
      </SoneDialog>,
    );
    const trigger = document.querySelector<HTMLButtonElement>("button.btn")!;
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    trigger.focus();
    act(() => {
      fireEvent.keyDown(trigger, { key: "Escape" });
    });
    expect(document.querySelector('[data-slot="menu"]')).toBeNull();
    expect(onDialog).not.toHaveBeenCalled();
    view.unmount();
  });
});
