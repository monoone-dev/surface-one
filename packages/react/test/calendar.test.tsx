import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneCalendar,
  type SoneCalendarValue,
} from "../src/components/calendar";

const day = (container: HTMLElement, iso: string) =>
  container.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`)!;

describe("SoneCalendar", () => {
  it("renders the month grid on the server, with no date read there", () => {
    const html = renderToString(
      <SoneCalendar
        defaultValue="2024-03-05"
        locale="en-US"
        weekStartsOn={1}
      />,
    );
    expect(html).toContain(
      '<sone-calendar class="calendar" data-slot="calendar" data-mode="single">',
    );
    expect(html).toContain('role="grid"');
    expect(html).toContain("March 2024");
    expect(html).toContain('abbr="Monday">Mon</th>');
    expect(html).toContain('aria-label="Tuesday, March 5, 2024"');
    expect(html).not.toContain('aria-current="date"');
    expect(renderToString(<SoneCalendar locale="en-US" />)).toContain(
      "<tbody></tbody>",
    );
  });

  it("picks a date and moves the roving Tab stop with the date-grid keys", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SoneCalendar
        defaultValue="2024-03-05"
        today="2024-03-12"
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );
    const stop = () =>
      container
        .querySelector('.calendar-day[tabindex="0"]')!
        .getAttribute("data-iso");
    expect(stop()).toBe("2024-03-05");
    expect(day(container, "2024-03-12").getAttribute("aria-current")).toBe(
      "date",
    );
    fireEvent.click(day(container, "2024-03-08"));
    expect(onValueChange).toHaveBeenCalledWith("2024-03-08");
    expect(
      day(container, "2024-03-08").parentElement!.getAttribute("aria-selected"),
    ).toBe("true");
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(stop()).toBe("2024-03-09");
    expect(document.activeElement?.getAttribute("data-iso")).toBe("2024-03-09");
    fireEvent.keyDown(grid, { key: "End" });
    expect(stop()).toBe("2024-03-09");
    fireEvent.keyDown(grid, { key: "Home" });
    expect(stop()).toBe("2024-03-03");
    fireEvent.keyDown(grid, { key: "PageDown", shiftKey: true });
    expect(container.querySelector(".calendar-caption")!.textContent).toBe(
      "March 2025",
    );
  });

  it("closes a range, marks its band, and toggles dates in multiple mode", () => {
    function Range() {
      const [value, setValue] = useState<SoneCalendarValue>(null);
      return (
        <SoneCalendar
          mode="range"
          value={value}
          onValueChange={setValue}
          defaultMonth="2024-03"
          locale="en-US"
        />
      );
    }
    const { container, unmount } = render(<Range />);
    fireEvent.click(day(container, "2024-03-10"));
    fireEvent.click(day(container, "2024-03-13"));
    const part = (iso: string) =>
      day(container, iso).parentElement!.getAttribute("data-range");
    expect(part("2024-03-10")).toBe("start");
    expect(part("2024-03-12")).toBe("middle");
    expect(part("2024-03-13")).toBe("end");
    unmount();

    const onDates = vi.fn();
    const multi = render(
      <SoneCalendar
        mode="multiple"
        defaultValue={["2024-03-01"]}
        locale="en-US"
        onValueChange={onDates}
      />,
    );
    expect(multi.getByRole("grid").getAttribute("aria-multiselectable")).toBe(
      "true",
    );
    fireEvent.click(day(multi.container, "2024-03-04"));
    expect(onDates).toHaveBeenCalledWith(["2024-03-01", "2024-03-04"]);
  });

  it("refuses disabled days, stops at min and max and reads today after mount", async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SoneCalendar
        defaultMonth="2024-03"
        min="2024-03-04"
        max="2024-03-29"
        disabledDate={(iso) => iso === "2024-03-15"}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Next month" })).toHaveProperty(
      "disabled",
      true,
    );
    fireEvent.click(day(container, "2024-03-15"));
    fireEvent.click(day(container, "2024-03-02"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(day(container, "2024-03-15").getAttribute("aria-disabled")).toBe(
      "true",
    );
    await act(async () => undefined);
    const today = render(<SoneCalendar locale="en-US" />);
    expect(
      today.container.querySelector('[aria-current="date"]'),
    ).not.toBeNull();
  });
});
