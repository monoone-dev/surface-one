// @vitest-environment node
// A daylight-saving zone: the night of 30 March 2025 is 23 hours long in Warsaw, so a
// calendar-day difference measured in milliseconds is not a whole number of days.
process.env["TZ"] = "Europe/Warsaw";

import { describe, expect, it } from "vitest";

import {
  SONE_DEFAULT_MESSAGES as m,
  chatHistoryGroupLabel,
  chatHistoryRows,
  filterChatHistoryRows,
  groupChatHistoryRows,
} from "../src";

describe("chatHistoryGroupLabel", () => {
  it("groups by calendar day", () => {
    const now = new Date(2025, 5, 15, 9, 0);
    const at = (d: number, h = 12) => new Date(2025, 5, d, h);
    expect(chatHistoryGroupLabel(at(15, 8), now, m)).toBe("Today");
    expect(chatHistoryGroupLabel(at(14, 23), now, m)).toBe("Yesterday");
    expect(chatHistoryGroupLabel(at(9), now, m)).toBe("Previous 7 days");
    expect(chatHistoryGroupLabel(at(1), now, m)).toBe("Previous 30 days");
    expect(chatHistoryGroupLabel(new Date(2025, 0, 1), now, m)).toBe("Older");
    expect(chatHistoryGroupLabel("not a date", now, m)).toBe("Older");
  });

  it("calls the day before a 23-hour day yesterday, not today", () => {
    const now = new Date(2025, 2, 31, 10, 0); // the day after the clocks went forward
    expect(chatHistoryGroupLabel(new Date(2025, 2, 30, 20), now, m)).toBe(
      "Yesterday",
    );
    // …and a 25-hour day (clocks back on 26 October) still counts as one.
    const autumn = new Date(2025, 9, 27, 10, 0);
    expect(chatHistoryGroupLabel(new Date(2025, 9, 26, 20), autumn, m)).toBe(
      "Yesterday",
    );
  });
});

describe("the chat history rows", () => {
  const threads = [
    { id: "a", title: "Budget review", updatedAt: "2025-06-15T08:00:00" },
    { id: "b", title: "Hiring plan", updatedAt: 0, updatedLabel: "long ago" },
  ];

  it("label each date, filter by title and group by age", () => {
    const rows = chatHistoryRows(threads, "en");
    expect(rows[1]!.updatedLabel).toBe("long ago");
    expect(filterChatHistoryRows(rows, "  BUDGET ")).toEqual([rows[0]]);
    expect(filterChatHistoryRows(rows, " ")).toBe(rows);
    expect(groupChatHistoryRows(rows, "list", new Date(), m)).toEqual([
      { label: null, rows },
    ]);
    expect(groupChatHistoryRows([], "list", new Date(), m)).toEqual([]);
    const groups = groupChatHistoryRows(
      rows,
      "sidebar",
      new Date(2025, 5, 15, 9),
      m,
    );
    expect(groups.map((g) => g.label)).toEqual(["Today", "Older"]);
  });
});
