// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  addYears,
  calendarCaption,
  calendarDates,
  calendarKeyTarget,
  calendarSelect,
  calendarStartMonth,
  calendarWeekdays,
  dateRangePart,
  endOfWeek,
  formatCalendarValue,
  formatIsoDate,
  isCalendarValueComplete,
  isDateDisabled,
  isDateSelected,
  isoMonth,
  monthGrid,
  monthMatrix,
  parseIsoDate,
  shiftMonth,
  startOfWeek,
  todayIsoDate,
  toIsoDate,
} from "../src";

describe("the calendar dates", () => {
  it("parse, print and move by days, months and years", () => {
    expect(parseIsoDate("2024-02-29")).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("2024-13-01")).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
    expect(toIsoDate({ year: 987, month: 3, day: 5 })).toBe("0987-03-05");
    expect(addDays("2024-02-28", 2)).toBe("2024-03-01");
    expect(addDays("2024-01-01", -1)).toBe("2023-12-31");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2024-03-31", -1)).toBe("2024-02-29");
    expect(addYears("2024-02-29", 1)).toBe("2025-02-28");
    expect(shiftMonth(2024, 12, 1)).toEqual({ year: 2025, month: 1 });
    expect(shiftMonth(2024, 1, -1)).toEqual({ year: 2023, month: 12 });
    expect(isoMonth("2024-03-05")).toBe("2024-03");
    expect(isoMonth("2024-00")).toBeNull();
    expect(todayIsoDate(new Date(2026, 9, 24, 23, 59))).toBe("2026-10-24");
  });

  it("find the ends of a week from any first weekday", () => {
    // 2024-03-06 is a Wednesday.
    expect(startOfWeek("2024-03-06", 0)).toBe("2024-03-03");
    expect(startOfWeek("2024-03-06", 1)).toBe("2024-03-04");
    expect(endOfWeek("2024-03-06", 1)).toBe("2024-03-10");
    expect(startOfWeek("2024-03-06", 6)).toBe("2024-03-02");
  });

  it("lay a month out in whole weeks, padded from the neighbour months", () => {
    // February 2024 starts on a Thursday.
    const weeks = monthMatrix(2024, 2, 1);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]![0]).toEqual({ iso: "2024-01-29", day: 29, outside: true });
    expect(weeks[0]![3]).toEqual({ iso: "2024-02-01", day: 1, outside: false });
    expect(weeks.flat().filter((d) => !d.outside)).toHaveLength(29);
    expect(weeks.at(-1)!.at(-1)!.iso).toBe("2024-03-03");
    expect(monthGrid(2024, 2, 0)[0]).toEqual([null, null, null, null, 1, 2, 3]);
    // February 2026 starts on a Sunday and fills exactly four weeks.
    expect(monthMatrix(2026, 2, 0)).toHaveLength(4);
  });

  it("move focus the WAI-ARIA date grid way, within min and max", () => {
    const from = "2024-03-06";
    expect(calendarKeyTarget("ArrowRight", from)).toBe("2024-03-07");
    expect(calendarKeyTarget("ArrowLeft", from)).toBe("2024-03-05");
    expect(calendarKeyTarget("ArrowLeft", from, { rtl: true })).toBe(
      "2024-03-07",
    );
    expect(calendarKeyTarget("ArrowUp", from)).toBe("2024-02-28");
    expect(calendarKeyTarget("ArrowDown", from)).toBe("2024-03-13");
    expect(calendarKeyTarget("Home", from, { weekStartsOn: 1 })).toBe(
      "2024-03-04",
    );
    expect(calendarKeyTarget("End", from, { weekStartsOn: 1 })).toBe(
      "2024-03-10",
    );
    expect(calendarKeyTarget("PageUp", from)).toBe("2024-02-06");
    expect(calendarKeyTarget("PageDown", from)).toBe("2024-04-06");
    expect(calendarKeyTarget("PageUp", from, { shiftKey: true })).toBe(
      "2023-03-06",
    );
    expect(calendarKeyTarget("PageDown", from, { shiftKey: true })).toBe(
      "2025-03-06",
    );
    expect(calendarKeyTarget("ArrowDown", from, { max: "2024-03-10" })).toBe(
      "2024-03-10",
    );
    expect(calendarKeyTarget("PageUp", from, { min: "2024-03-01" })).toBe(
      "2024-03-01",
    );
    expect(calendarKeyTarget("Enter", from)).toBeNull();
  });

  it("refuse days out of bounds or disabled", () => {
    const bounds = {
      min: "2024-03-02",
      max: "2024-03-28",
      disabled: (iso: string) => iso.endsWith("-15"),
    };
    expect(isDateDisabled("2024-03-01", bounds)).toBe(true);
    expect(isDateDisabled("2024-03-29", bounds)).toBe(true);
    expect(isDateDisabled("2024-03-15", bounds)).toBe(true);
    expect(isDateDisabled("2024-03-14", bounds)).toBe(false);
  });

  it("select one date, toggle several and close a range", () => {
    expect(calendarSelect("single", "2024-03-01", "2024-03-05")).toBe(
      "2024-03-05",
    );
    expect(calendarSelect("multiple", ["2024-03-09"], "2024-03-05")).toEqual([
      "2024-03-05",
      "2024-03-09",
    ]);
    expect(
      calendarSelect("multiple", ["2024-03-05", "2024-03-09"], "2024-03-05"),
    ).toEqual(["2024-03-09"]);
    const started = calendarSelect("range", null, "2024-03-10");
    expect(started).toEqual({ start: "2024-03-10", end: null });
    expect(isCalendarValueComplete("range", started)).toBe(false);
    expect(calendarSelect("range", started, "2024-03-04")).toEqual({
      start: "2024-03-04",
      end: "2024-03-10",
    });
    const range = calendarSelect("range", started, "2024-03-12");
    expect(range).toEqual({ start: "2024-03-10", end: "2024-03-12" });
    expect(isCalendarValueComplete("range", range)).toBe(true);
    expect(calendarSelect("range", range, "2024-03-20")).toEqual({
      start: "2024-03-20",
      end: null,
    });
  });

  it("say which days are picked and where they sit in a range", () => {
    const range = { start: "2024-03-10", end: "2024-03-12" };
    expect(dateRangePart(range, "2024-03-10")).toBe("start");
    expect(dateRangePart(range, "2024-03-11")).toBe("middle");
    expect(dateRangePart(range, "2024-03-12")).toBe("end");
    expect(dateRangePart(range, "2024-03-13")).toBeNull();
    expect(
      dateRangePart({ start: "2024-03-10", end: null }, "2024-03-10"),
    ).toBe("single");
    expect(isDateSelected("range", range, "2024-03-11")).toBe(true);
    expect(isDateSelected("single", "2024-03-11", "2024-03-11")).toBe(true);
    expect(isDateSelected("multiple", ["2024-03-11"], "2024-03-12")).toBe(
      false,
    );
    expect(calendarDates("multiple", ["2024-03-11", "2024-03-01"])).toEqual([
      "2024-03-01",
      "2024-03-11",
    ]);
    expect(calendarStartMonth("single", null, null, "2024-05-02")).toBe(
      "2024-05",
    );
    expect(calendarStartMonth("range", range, "2026-10-24")).toBe("2024-03");
  });

  it("name months, weekdays and values through Intl, in UTC", () => {
    expect(calendarCaption("2024-03", "en-US")).toBe("March 2024");
    expect(calendarCaption("2024-03", "pl-PL")).toMatch(/2024/);
    const monday = calendarWeekdays("en-US", 1);
    expect(monday[0]).toEqual({ short: "Mon", long: "Monday" });
    expect(monday[6]!.long).toBe("Sunday");
    expect(calendarWeekdays("en-US", 0)[0]!.long).toBe("Sunday");
    expect(formatIsoDate("2024-03-05", "en-US")).toBe("Mar 5, 2024");
    expect(formatIsoDate("nope", "en-US")).toBe("nope");
    expect(formatCalendarValue("single", "2024-03-05", "en-US")).toBe(
      "Mar 5, 2024",
    );
    expect(
      formatCalendarValue("multiple", ["2024-03-06", "2024-03-05"], "en-US"),
    ).toBe("Mar 5, 2024, Mar 6, 2024");
    expect(
      formatCalendarValue(
        "range",
        { start: "2024-03-05", end: "2024-03-09" },
        "en-US",
      ),
    ).toMatch(/^Mar 5\s*–\s*9, 2024$/);
    expect(
      formatCalendarValue("range", { start: "2024-03-05", end: null }, "en-US"),
    ).toBe("Mar 5, 2024 –");
    expect(formatCalendarValue("single", null, "en-US")).toBe("");
  });
});
