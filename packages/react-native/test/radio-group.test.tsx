import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SoneRadio, SoneRadioGroup } from "../src/components/radio-group";

const Radios = () => (
  <>
    <SoneRadio value="a" aria-label="A" />
    <SoneRadio value="b" aria-label="B" />
    <SoneRadio value="c" aria-label="C" disabled />
  </>
);

describe("SoneRadioGroup", () => {
  it("is a named radiogroup whose radios check on press", () => {
    const onValueChange = vi.fn();
    render(
      <SoneRadioGroup aria-label="Plan" onValueChange={onValueChange}>
        <Radios />
      </SoneRadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeTruthy();
    const b = screen.getByRole("radio", { name: "B" });
    expect(b.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(b);
    expect(b.getAttribute("aria-checked")).toBe("true");
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("is one Tab stop, and the arrow keys check the next enabled radio", () => {
    render(
      <SoneRadioGroup aria-label="Plan" defaultValue="b">
        <Radios />
      </SoneRadioGroup>,
    );
    const radio = (name: string) => screen.getByRole("radio", { name });
    expect(radio("B").getAttribute("tabindex")).toBe("0");
    expect(radio("A").getAttribute("tabindex")).toBe("-1");
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    // C is disabled: from B the next enabled radio wraps round to A.
    fireEvent.keyDown(group, { key: "ArrowDown" });
    expect(radio("A").getAttribute("aria-checked")).toBe("true");
    expect(radio("A").getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(group, { key: "ArrowUp" });
    expect(radio("B").getAttribute("aria-checked")).toBe("true");
  });

  it("gives the first radio the Tab stop while none is checked, and honours disabled", () => {
    const onValueChange = vi.fn();
    const { unmount } = render(
      <SoneRadioGroup aria-label="Size">
        <Radios />
      </SoneRadioGroup>,
    );
    expect(
      screen.getByRole("radio", { name: "A" }).getAttribute("tabindex"),
    ).toBe("0");
    expect(
      screen.getByRole("radio", { name: "B" }).getAttribute("tabindex"),
    ).toBe("-1");
    unmount();
    render(
      <SoneRadioGroup aria-label="Plan" disabled onValueChange={onValueChange}>
        <Radios />
      </SoneRadioGroup>,
    );
    const a = screen.getByRole("radio", { name: "A" });
    expect(a.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(a);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
