import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneDatePicker,
  type SoneCalendarValue,
} from "../src/components/index";

const day = (iso: string) =>
  document.querySelector<HTMLElement>(`[data-iso="${iso}"]`)!;

describe("SoneDatePicker", () => {
  it("renders an outline button with the formatted date on the server", () => {
    const html = renderToString(
      <SoneDatePicker
        defaultValue="2026-05-04"
        locale="en-US"
        aria-label="Due date"
      />,
    );
    expect(html).toContain(
      '<sone-date-picker class="date-picker" data-slot="date-picker" data-mode="single">',
    );
    expect(html).toContain('aria-label="Due date: May 4, 2026"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain(">May 4, 2026</span>");
    const empty = renderToString(<SoneDatePicker locale="en-US" />);
    expect(empty).toContain('data-empty=""');
    expect(empty).toContain(">Pick a date</span>");
  });

  it("opens the calendar on the picked day, picks and gives focus back", async () => {
    const onValueChange = vi.fn();
    render(
      <div>
        <label htmlFor="due">Due date</label>
        <SoneDatePicker
          triggerId="due"
          defaultValue="2026-05-04"
          locale="en-US"
          onValueChange={onValueChange}
        />
      </div>,
    );
    const trigger = document.getElementById("due")!;
    const valueId = document.querySelector(".date-picker-value")!.id;
    expect(trigger.getAttribute("aria-labelledby")).toBe(
      `${document.querySelector("label")!.id} ${valueId}`,
    );
    expect(screen.getByRole("button", { name: "Due date May 4, 2026" })).toBe(
      trigger,
    );
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Choose a date" });
    expect(dialog.querySelector(".calendar-caption")!.textContent).toBe(
      "May 2026",
    );
    expect(document.activeElement).toBe(day("2026-05-04"));
    fireEvent.click(day("2026-05-20"));
    await act(async () => undefined);
    expect(onValueChange).toHaveBeenCalledWith("2026-05-20");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent!.trim()).toBe("May 20, 2026");
  });

  it("keeps a range open until both ends are picked", () => {
    function Stay() {
      const [value, setValue] = useState<SoneCalendarValue>(null);
      return (
        <SoneDatePicker
          mode="range"
          value={value}
          onValueChange={setValue}
          locale="en-US"
          today="2026-05-01"
        />
      );
    }
    render(<Stay />);
    fireEvent.click(screen.getByRole("button", { name: "Pick a date" }));
    fireEvent.click(day("2026-05-04"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(day("2026-05-08"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.querySelector(".date-picker-value")!.textContent).toMatch(
      /^May 4\s*–\s*8, 2026$/,
    );
  });

  it("stays shut while disabled", () => {
    render(<SoneDatePicker disabled aria-label="Due date" />);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", true);
    fireEvent.click(button);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
