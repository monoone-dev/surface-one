import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SoneCheckbox } from "../src/components/checkbox";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldLabel,
} from "../src/components/input";

describe("SoneCheckbox", () => {
  it("is a checkbox that toggles uncontrolled and reports it", () => {
    const onCheckedChange = vi.fn();
    render(
      <SoneCheckbox aria-label="Updates" onCheckedChange={onCheckedChange} />,
    );
    const box = screen.getByRole("checkbox", { name: "Updates" });
    expect(box.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(box);
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("says mixed while indeterminate, and a press clears it", () => {
    function SelectAll() {
      const [checked, setChecked] = useState(false);
      const [mixed, setMixed] = useState(true);
      return (
        <SoneCheckbox
          aria-label="All files"
          checked={checked}
          onCheckedChange={setChecked}
          indeterminate={mixed}
          onIndeterminateChange={setMixed}
        />
      );
    }
    render(<SelectAll />);
    const box = screen.getByRole("checkbox", { name: "All files" });
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    fireEvent.click(box);
    expect(box.getAttribute("aria-checked")).toBe("true");
  });

  it("takes its name and state from a field, and ignores presses when disabled", () => {
    const onCheckedChange = vi.fn();
    render(
      <SoneField disabled>
        <SoneFieldLabel>Keep a backup</SoneFieldLabel>
        <SoneCheckbox onCheckedChange={onCheckedChange} />
        <SoneFieldDescription>
          Managed by your administrator.
        </SoneFieldDescription>
      </SoneField>,
    );
    const box = screen.getByRole("checkbox", { name: "Keep a backup" });
    expect(box.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
