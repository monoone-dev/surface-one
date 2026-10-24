import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneTextarea } from "../src/components/input";

describe("SoneTextarea (autosize and counter)", () => {
  it("keeps an autosizing textarea between minRows and maxRows", () => {
    render(<SoneTextarea aria-label="Bio" autosize minRows={2} maxRows={4} />);
    const ta = screen.getByRole("textbox", { name: "Bio" });
    const style = getComputedStyle(ta);
    expect(Number.parseFloat(style.minHeight)).toBeGreaterThan(0);
    expect(Number.parseFloat(style.maxHeight)).toBeGreaterThan(
      Number.parseFloat(style.minHeight),
    );
  });

  it("counts against maxLength and names the characters left near the limit", () => {
    render(
      <SoneTextarea
        aria-label="Bio"
        defaultValue="Hello"
        maxLength={20}
        showCount
      />,
    );
    expect(screen.getByText("5/20")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
      target: { value: "x".repeat(19) },
    });
    const count = screen.getByText("19/20");
    expect(count.getAttribute("aria-label")).toBe("1 character left");
    expect(count.getAttribute("aria-live")).toBe("polite");
  });
});
