import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SoneCalendar } from "../src/components/calendar";

const day = (name: RegExp) => screen.getByRole("button", { name });

describe("SoneCalendar", () => {
  it("shows the month of the value with named days, today and the picked one", () => {
    render(
      <SoneCalendar
        defaultValue="2024-03-05"
        today="2024-03-12"
        locale="en-US"
        weekStartsOn={1}
      />,
    );
    expect(screen.getByText("March 2024")).toBeTruthy();
    expect(day(/March 5, 2024/).getAttribute("aria-pressed")).toBe("true");
    expect(day(/March 12, 2024/).getAttribute("aria-current")).toBe("date");
    // Padding days of February and April are shown by default.
    expect(day(/February 26, 2024/)).toBeTruthy();
    expect(screen.getByText("Mon")).toBeTruthy();
  });

  it("picks a single date and pages the months within min and max", () => {
    const onValueChange = vi.fn();
    const onMonthChange = vi.fn();
    render(
      <SoneCalendar
        locale="en-US"
        defaultMonth="2024-03"
        min="2024-03-04"
        max="2024-04-30"
        onValueChange={onValueChange}
        onMonthChange={onMonthChange}
      />,
    );
    expect(day(/March 3, 2024/).getAttribute("aria-disabled")).toBe("true");
    const previous = screen.getByRole("button", { name: "Previous month" });
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenCalledWith("2024-04");
    expect(screen.getByText("April 2024")).toBeTruthy();
    fireEvent.click(day(/April 10, 2024/));
    expect(onValueChange).toHaveBeenCalledWith("2024-04-10");
    expect(
      screen
        .getByRole("button", { name: "Next month" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("closes a range on the second pick and toggles dates in multiple mode", () => {
    const onRange = vi.fn();
    const { unmount } = render(
      <SoneCalendar
        mode="range"
        locale="en-US"
        defaultMonth="2024-03"
        onValueChange={onRange}
      />,
    );
    fireEvent.click(day(/March 10, 2024/));
    expect(onRange).toHaveBeenLastCalledWith({
      start: "2024-03-10",
      end: null,
    });
    fireEvent.click(day(/March 14, 2024/));
    expect(onRange).toHaveBeenLastCalledWith({
      start: "2024-03-10",
      end: "2024-03-14",
    });
    expect(day(/March 12, 2024/).getAttribute("aria-pressed")).toBe("true");
    unmount();

    const onDates = vi.fn();
    render(
      <SoneCalendar
        mode="multiple"
        locale="en-US"
        defaultValue={["2024-03-01"]}
        onValueChange={onDates}
      />,
    );
    fireEvent.click(day(/March 8, 2024/));
    expect(onDates).toHaveBeenLastCalledWith(["2024-03-01", "2024-03-08"]);
    fireEvent.click(day(/March 1, 2024/));
    expect(onDates).toHaveBeenLastCalledWith(["2024-03-08"]);
  });

  it("refuses dates a disabledDate rules out, and hides the padding days on request", () => {
    const onValueChange = vi.fn();
    render(
      <SoneCalendar
        locale="en-US"
        defaultMonth="2024-03"
        showOutsideDays={false}
        disabledDate={(iso) => iso === "2024-03-15"}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.queryByRole("button", { name: /February/ })).toBeNull();
    fireEvent.click(day(/March 15, 2024/));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("SoneDatePicker", () => {
  it("is the date field under its web name", async () => {
    const { SoneDatePicker, SoneDateField } =
      await import("../src/components/date-field");
    expect(SoneDatePicker).toBe(SoneDateField);
    render(
      <SoneDatePicker
        value="2024-03-05"
        locale="en-US"
        ariaLabel="Start date"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Start date: Mar 5, 2024" }),
    ).toBeTruthy();
  });
});
