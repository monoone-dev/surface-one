import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SonePopover,
  SonePopoverContent,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
  SonePopoverTrigger,
} from "../src/components/popover";

function setup(onOpenChange = vi.fn()) {
  const view = render(
    <>
      <SonePopover onOpenChange={onOpenChange}>
        <SonePopoverTrigger className="btn">Dimensions</SonePopoverTrigger>
        <SonePopoverContent aria-labelledby="dim-title">
          {(close) => (
            <>
              <SonePopoverHeader>
                <SonePopoverTitle id="dim-title">Size</SonePopoverTitle>
              </SonePopoverHeader>
              <input aria-label="Width" />
              <button type="button" onClick={close}>
                Apply
              </button>
            </>
          )}
        </SonePopoverContent>
      </SonePopover>
      <button type="button" className="outside">
        Elsewhere
      </button>
    </>,
  );
  const trigger =
    view.container.querySelector<HTMLButtonElement>("button.btn")!;
  const panel = () =>
    document.querySelector<HTMLElement>('[data-slot="popover"]');
  return { view, trigger, panel, onOpenChange };
}

// jsdom lays nothing out: give every element a box, so the panel's controls are tabbable.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("SonePopover", () => {
  it("renders a closed trigger on the server, and the bare surface alone", () => {
    const html = renderToString(
      <>
        <SonePopover>
          <SonePopoverTrigger>Dimensions</SonePopoverTrigger>
          <SonePopoverContent>Panel</SonePopoverContent>
        </SonePopover>
        <SonePopover aria-label="Old">
          <SonePopoverDescription>Surface</SonePopoverDescription>
        </SonePopover>
      </>,
    );
    expect(html).toContain(
      '<button type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">Dimensions</button>',
    );
    expect(html).not.toContain("Panel");
    expect(html).toContain(
      '<div data-slot="popover" role="dialog" aria-label="Old" class="popover"><p data-slot="popover-description" class="popover-description">Surface</p></div>',
    );
  });

  it("opens on click into a positioner on <body>, focuses the panel's first control and wires aria-controls", () => {
    const { trigger, panel, onOpenChange } = setup();
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const el = panel()!;
    expect(el.parentElement!.classList).toContain("overlay-positioner");
    expect(el.parentElement!.parentElement).toBe(document.body);
    expect(el.getAttribute("role")).toBe("dialog");
    expect(screen.getByRole("dialog", { name: "Size" })).toBe(el);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(el.id);
    expect(document.activeElement).toBe(screen.getByLabelText("Width"));
  });

  it("closes on Escape, giving focus back to the trigger", () => {
    const { trigger, panel, onOpenChange } = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on a click outside and through the content's close", () => {
    const { view, trigger, panel } = setup();
    fireEvent.click(trigger);
    act(() => {
      view.container
        .querySelector(".outside")!
        .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    });
    expect(panel()).toBeNull();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("is controlled through open", () => {
    const html = renderToString(
      <SonePopover open>
        <SonePopoverTrigger>Dimensions</SonePopoverTrigger>
      </SonePopover>,
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="sone-popover-');
  });
});
