/**
 * Whole calendar days from `then` to `now` in local time (`0` = the same day,
 * `1` = yesterday). Counted on the calendar, not in 24-hour blocks, so a 23- or
 * 25-hour day (a daylight-saving switch) never shifts a date into the wrong group.
 * Pure: no Angular, no DOM.
 */
export function calendarDaysBetween(now: Date, then: Date): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const day = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((day(now) - day(then)) / DAY_MS);
}
