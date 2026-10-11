// Pure date tests, run in plain Node (node:test) the way `npm run test:graph-layout`
// runs its spec: node --import ./scripts/node-ts-resolve.mjs --test <this file>.
import assert from "node:assert/strict";
import { test } from "node:test";

// A zone with daylight saving, so the 23- and 25-hour days exist.
process.env.TZ = "Europe/Warsaw";

const { calendarDaysBetween } = await import("./chat-history-age");

test("the same day is 0, the day before is 1", () => {
  const now = new Date(2026, 5, 10, 9, 0);
  assert.equal(calendarDaysBetween(now, new Date(2026, 5, 10, 0, 1)), 0);
  assert.equal(calendarDaysBetween(now, new Date(2026, 5, 9, 23, 59)), 1);
  assert.equal(calendarDaysBetween(now, new Date(2026, 5, 3, 12, 0)), 7);
});

test("yesterday stays yesterday across the 23-hour spring-forward day", () => {
  // 29 March 2026: clocks jump from 02:00 to 03:00 in Europe/Warsaw.
  const now = new Date(2026, 2, 30, 0, 30);
  const then = new Date(2026, 2, 29, 0, 10);
  // Midnight to midnight is only 23 hours here.
  const midnights =
    new Date(2026, 2, 30).getTime() - new Date(2026, 2, 29).getTime();
  assert.equal(midnights, 23 * 60 * 60 * 1000);
  assert.equal(calendarDaysBetween(now, then), 1);
  assert.equal(calendarDaysBetween(new Date(2026, 2, 29, 23, 0), then), 0);
});

test("the 25-hour fall-back day counts as one day", () => {
  // 25 October 2026: clocks go back from 03:00 to 02:00.
  const now = new Date(2026, 9, 26, 0, 10);
  assert.equal(calendarDaysBetween(now, new Date(2026, 9, 25, 0, 5)), 1);
  assert.equal(calendarDaysBetween(now, new Date(2026, 9, 24, 23, 0)), 2);
});

test("year boundaries count calendar days", () => {
  assert.equal(
    calendarDaysBetween(new Date(2027, 0, 1, 8), new Date(2026, 11, 31, 22)),
    1,
  );
});
