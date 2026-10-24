import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";

import {
  SoneMenu,
  SoneMenuItem,
  SoneMenuTrigger,
} from "../src/components/menu";

// A real click runs the microtask checkpoint after every listener, so React commits
// the update a native listener scheduled before the event reaches React's own
// listener on <body>. jsdom's dispatch has no checkpoint; flushing on <body> first
// stands in for it. This file must register it before React listens on <body>.
document.body.addEventListener("click", () => flushSync(() => undefined));

function Harness({ onPick }: { onPick: (what: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <SoneMenuTrigger
      className="btn"
      open={open}
      onOpenChange={setOpen}
      menu={
        <SoneMenu>
          <SoneMenuItem onClick={() => onPick("edit")}>Edit</SoneMenuItem>
          <SoneMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onPick("stay");
            }}
          >
            Stay
          </SoneMenuItem>
        </SoneMenu>
      }
    >
      Options
    </SoneMenuTrigger>
  );
}

describe("SoneMenuTrigger under a real click", () => {
  it("runs the item's onClick before the menu closes", () => {
    const onPick = vi.fn();
    const view = render(<Harness onPick={onPick} />);
    const trigger =
      view.container.querySelector<HTMLButtonElement>("button.btn")!;
    const menu = () =>
      document.querySelector<HTMLElement>('[data-slot="menu"]');

    fireEvent.click(trigger);
    const edit = document.querySelector<HTMLElement>('[role="menuitem"]')!;
    act(() => edit.click());

    expect(onPick).toHaveBeenCalledWith("edit");
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps the menu open when the item stops the click", () => {
    const onPick = vi.fn();
    const view = render(<Harness onPick={onPick} />);
    const trigger =
      view.container.querySelector<HTMLButtonElement>("button.btn")!;
    const menu = () =>
      document.querySelector<HTMLElement>('[data-slot="menu"]');

    fireEvent.click(trigger);
    const stay =
      document.querySelectorAll<HTMLElement>('[role="menuitem"]')[1]!;
    act(() => stay.click());

    expect(onPick).toHaveBeenCalledWith("stay");
    expect(menu()).not.toBeNull();
  });
});
