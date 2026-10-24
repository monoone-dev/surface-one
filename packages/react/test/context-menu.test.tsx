import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneContextMenuTrigger } from "../src/components/context-menu";
import { SoneMenu, SoneMenuItem } from "../src/components/menu";

afterEach(() => {
  document.body.innerHTML = "";
});

function setup(onCopy = vi.fn()) {
  const view = render(
    <SoneContextMenuTrigger
      id="area"
      tabIndex={0}
      menu={
        <SoneMenu aria-label="Actions">
          <SoneMenuItem onClick={onCopy}>Copy</SoneMenuItem>
          <SoneMenuItem disabled>Cut</SoneMenuItem>
          <SoneMenuItem>Paste</SoneMenuItem>
        </SoneMenu>
      }
    >
      Right-click here
    </SoneContextMenuTrigger>,
  );
  const area = view.container.querySelector<HTMLElement>("#area")!;
  return { area, onCopy };
}

describe("SoneContextMenuTrigger", () => {
  it("renders the area like Angular and opens the menu at the pointer", () => {
    const { area, onCopy } = setup();
    expect(area.getAttribute("data-slot")).toBe("context-menu-trigger");
    expect(area.hasAttribute("aria-haspopup")).toBe(false);
    const prevented = !fireEvent.contextMenu(area, {
      clientX: 120,
      clientY: 80,
    });
    expect(prevented).toBe(true);
    const positioner = document.querySelector<HTMLElement>(
      ".overlay-positioner",
    )!;
    expect(positioner.style.left).toBe("120px");
    expect(positioner.style.top).toBe("84px");
    expect(area.getAttribute("data-state")).toBe("open");
    const copy = document.querySelector<HTMLElement>('[role="menuitem"]')!;
    act(() => copy.click());
    expect(onCopy).toHaveBeenCalled();
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it("opens on Shift+F10 on the first item and closes on Escape", () => {
    const { area } = setup();
    act(() => area.focus());
    fireEvent.keyDown(area, { key: "F10", shiftKey: true });
    expect(document.activeElement?.textContent).toBe("Copy");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Paste");
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(area);
  });
});
