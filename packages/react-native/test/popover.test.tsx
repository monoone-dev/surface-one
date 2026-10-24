import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SoneButton } from "../src/components/button";
import {
  SonePopover,
  SonePopoverContent,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
  SonePopoverTrigger,
} from "../src/components/popover";

function setup(onOpenChange = vi.fn()) {
  render(
    <SonePopover onOpenChange={onOpenChange}>
      <SonePopoverTrigger>
        <SoneButton>Dimensions</SoneButton>
      </SonePopoverTrigger>
      <SonePopoverContent aria-label="Dimensions">
        {(close) => (
          <>
            <SonePopoverHeader>
              <SonePopoverTitle>Size</SonePopoverTitle>
              <SonePopoverDescription>Of the layer.</SonePopoverDescription>
            </SonePopoverHeader>
            <SoneButton onPress={close}>Apply</SoneButton>
          </>
        )}
      </SonePopoverContent>
    </SonePopover>,
  );
  return { onOpenChange };
}

describe("SonePopover", () => {
  it("opens a named dialog from its trigger, which says it has one", () => {
    const { onOpenChange } = setup();
    const trigger = screen.getByRole("button", { name: "Dimensions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog", { name: "Dimensions" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Size" })).toBeTruthy();
    expect(
      screen
        .getAllByRole("button", { name: "Dimensions" })[0]!
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("closes through the content's close and a press outside", () => {
    const { onOpenChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Dimensions" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Dimensions" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("needs its root", () => {
    expect(() =>
      render(
        <SonePopoverTrigger>
          <SoneButton>Lost</SoneButton>
        </SonePopoverTrigger>,
      ),
    ).toThrow(/needs a SonePopover/);
  });
});
