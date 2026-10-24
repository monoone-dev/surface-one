import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneCheckbox } from "../src/components/checkbox";

describe("SoneCheckbox", () => {
  it("renders the native checkbox the Angular directive marks up, on the server", () => {
    const html = renderToString(
      <>
        <SoneCheckbox id="terms" defaultChecked />
        <SoneCheckbox indeterminate />
      </>,
    );
    expect(html).toContain(
      '<input id="terms" type="checkbox" data-slot="checkbox" checked=""/>',
    );
    // The mixed state is a DOM property only: nothing on the server.
    expect(html).not.toContain("indeterminate");
  });

  it("works uncontrolled and reports changes", () => {
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    render(
      <SoneCheckbox
        aria-label="Updates"
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    );
    const box = screen.getByRole("checkbox", { name: "Updates" });
    fireEvent.click(box);
    expect((box as HTMLInputElement).checked).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("sets the mixed state on the element and clears it on a click", () => {
    function SelectAll() {
      const [checked, setChecked] = useState(false);
      const [mixed, setMixed] = useState(true);
      return (
        <>
          <SoneCheckbox
            aria-label="All files"
            checked={checked}
            onCheckedChange={setChecked}
            indeterminate={mixed}
            onIndeterminateChange={setMixed}
          />
          <button type="button" onClick={() => setMixed(true)}>
            Mix
          </button>
        </>
      );
    }
    render(<SelectAll />);
    const box = screen.getByRole("checkbox", {
      name: "All files",
    }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    fireEvent.click(box);
    expect(box.checked).toBe(true);
    expect(box.indeterminate).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Mix" }));
    expect(box.indeterminate).toBe(true);
  });
});
