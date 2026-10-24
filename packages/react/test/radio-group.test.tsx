import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
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
  it("renders the radiogroup and its native radios on the server", () => {
    const html = renderToString(
      <SoneRadioGroup defaultValue="b" name="plan" aria-label="Plan">
        <Radios />
      </SoneRadioGroup>,
    );
    expect(html).toContain(
      '<div data-slot="radio-group" role="radiogroup" data-orientation="vertical" aria-label="Plan" class="radio-group">',
    );
    expect(html).toContain(
      '<input type="radio" data-slot="radio" aria-label="B" name="plan" checked="" value="b"/>',
    );
    expect(html).toContain('disabled="" aria-label="C" name="plan" value="c"');
  });

  it("shares a unique name, works uncontrolled and reports the pick", () => {
    const onValueChange = vi.fn();
    render(
      <SoneRadioGroup as="fieldset" required onValueChange={onValueChange}>
        <Radios />
      </SoneRadioGroup>,
    );
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a!.name).toMatch(/^sone-radio-group-/);
    expect(b!.name).toBe(a!.name);
    expect(a!.required).toBe(true);
    fireEvent.click(b!);
    expect(b!.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("follows a controlled value and disables every radio of a disabled group", () => {
    function Plan() {
      const [value, setValue] = useState<string | null>("a");
      return (
        <>
          <SoneRadioGroup
            aria-label="Plan"
            value={value}
            onValueChange={setValue}
          >
            <Radios />
          </SoneRadioGroup>
          <button type="button" onClick={() => setValue("b")}>
            Pick B
          </button>
        </>
      );
    }
    render(<Plan />);
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a!.checked).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Pick B" }));
    expect(b!.checked).toBe(true);
    expect(a!.checked).toBe(false);

    render(
      <SoneRadioGroup aria-label="Locked" disabled>
        <Radios />
      </SoneRadioGroup>,
    );
    const locked = screen.getByRole("radiogroup", { name: "Locked" });
    expect(locked.getAttribute("aria-disabled")).toBe("true");
    expect([...locked.querySelectorAll("input")].every((r) => r.disabled)).toBe(
      true,
    );
  });
});
