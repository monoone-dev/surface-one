import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneMenu, SoneMenuItem } from "../src/components/menu";
import { SoneMenubar, SoneMenubarTrigger } from "../src/components/menubar";

function setup() {
  const view = render(
    <SoneMenubar aria-label="Editor">
      <SoneMenubarTrigger
        id="file"
        menu={
          <SoneMenu aria-label="File">
            <SoneMenuItem>New Tab</SoneMenuItem>
            <SoneMenuItem>Print</SoneMenuItem>
          </SoneMenu>
        }
      >
        File
      </SoneMenubarTrigger>
      <SoneMenubarTrigger
        id="edit"
        menu={
          <SoneMenu aria-label="Edit">
            <SoneMenuItem>Undo</SoneMenuItem>
            <SoneMenuItem>Redo</SoneMenuItem>
          </SoneMenu>
        }
      >
        Edit
      </SoneMenubarTrigger>
    </SoneMenubar>,
  );
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s)!;
  return { $ };
}

describe("SoneMenubar", () => {
  it("renders the bar like Angular with one Tab stop", () => {
    const { $ } = setup();
    expect($('[data-slot="menubar"]').getAttribute("role")).toBe("menubar");
    const file = $("#file");
    expect(file.className).toBe("menubar-trigger");
    expect(file.getAttribute("role")).toBe("menuitem");
    expect(file.getAttribute("aria-haspopup")).toBe("menu");
    expect(file.getAttribute("tabindex")).toBe("0");
    expect($("#edit").getAttribute("tabindex")).toBe("-1");
    act(() => file.focus());
    fireEvent.keyDown(file, { key: "ArrowRight" });
    expect(document.activeElement).toBe($("#edit"));
  });

  it("moves from an open menu to the next with ArrowRight and switches on hover", () => {
    const { $ } = setup();
    const file = $("#file");
    act(() => file.focus());
    fireEvent.keyDown(file, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("New Tab");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(file.getAttribute("aria-expanded")).toBe("false");
    expect($("#edit").getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toBe("Undo");
    fireEvent.pointerEnter(file);
    expect(file.getAttribute("aria-expanded")).toBe("true");
    expect($("#edit").getAttribute("aria-expanded")).toBe("false");
  });
});
