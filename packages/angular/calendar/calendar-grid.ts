// The calendar's date math, with no framework in it: `sone-calendar` and `sone-date-picker`,
// their Vue and React twins and React Native's SoneCalendar / SoneDateField (through
// @surface-one/core) lay out, move and select the same way. Dates are ISO strings,
// "YYYY-MM-DD", in no time zone: every Date built here is UTC, so the server and the
// browser agree whatever their zones.

/** A calendar date: `month` is 1–12. */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** One day of a calendar: a single date, a range or several dates. */
export type SoneCalendarMode = "single" | "range" | "multiple";

/** A range's ends ("YYYY-MM-DD"); `end` is `null` while only the start is picked. */
export interface SoneDateRange {
  readonly start: string | null;
  readonly end: string | null;
}

/**
 * A calendar's value: a date or `null` (`single`), a list of dates (`multiple`) or a
 * range (`range`).
 */
export type SoneCalendarValue =
  string | readonly string[] | SoneDateRange | null;

/** The first day of the week: 0 = Sunday … 6 = Saturday. */
export type SoneWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** What a calendar refuses: before `min`, after `max`, or a date `disabled` says no to. */
export interface CalendarBounds {
  readonly min?: string | null;
  readonly max?: string | null;
  readonly disabled?: ((iso: string) => boolean) | null;
}

/** One cell of a month: the date, its day number and whether it pads from a neighbour month. */
export interface CalendarDay {
  readonly iso: string;
  readonly day: number;
  /** In the month before or after the one shown. */
  readonly outside: boolean;
}

const pad = (n: number, w = 2): string => String(n).padStart(w, "0");

const utc = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));

const fromUtc = (d: Date): CalendarDate => ({
  year: d.getUTCFullYear(),
  month: d.getUTCMonth() + 1,
  day: d.getUTCDate(),
});

export function daysInMonth(year: number, month: number): number {
  return utc(year, month + 1, 0).getUTCDate();
}

/** "YYYY-MM-DD" (anything after the date is ignored) → a date, or `null` when invalid. */
export function parseIsoDate(
  iso: string | null | undefined,
): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month))
    return null;
  return { year, month, day };
}

export function toIsoDate({ year, month, day }: CalendarDate): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** The local date of `now` (default: this moment) as "YYYY-MM-DD". */
export function todayIsoDate(now: Date = new Date()): string {
  return toIsoDate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(year: number, month: number, day: number): number {
  return utc(year, month, day).getUTCDay();
}

export function shiftMonth(
  year: number,
  month: number,
  by: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + by;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** `iso` moved by `days` (negative goes back). */
export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return toIsoDate(fromUtc(utc(d.year, d.month, d.day + days)));
}

/** `iso` moved by `months`; the day is clamped to the target month (Jan 31 + 1 → Feb 29). */
export function addMonths(iso: string, months: number): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  const { year, month } = shiftMonth(d.year, d.month, months);
  return toIsoDate({
    year,
    month,
    day: Math.min(d.day, daysInMonth(year, month)),
  });
}

/** `iso` moved by `years` (Feb 29 + 1 → Feb 28). */
export function addYears(iso: string, years: number): string {
  return addMonths(iso, years * 12);
}

/** The first day of `iso`'s week. */
export function startOfWeek(iso: string, weekStartsOn: number = 0): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  const back = (weekdayOf(d.year, d.month, d.day) - weekStartsOn + 7) % 7;
  return addDays(iso, -back);
}

/** The last day of `iso`'s week. */
export function endOfWeek(iso: string, weekStartsOn: number = 0): string {
  return addDays(startOfWeek(iso, weekStartsOn), 6);
}

/** "YYYY-MM" of a date or a month ("YYYY-MM-DD" or "YYYY-MM"), or `null`. */
export function isoMonth(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  return `${m[1]}-${m[2]}`;
}

/** The month as rows of 7 day numbers; `null` pads the first and last week. */
export function monthGrid(
  year: number,
  month: number,
  weekStartsOn: number = 0,
): (number | null)[][] {
  return monthMatrix(year, month, weekStartsOn).map((week) =>
    week.map((d) => (d.outside ? null : d.day)),
  );
}

/**
 * The month as rows of 7 days, from the first day of the week that holds the 1st to
 * the last day of the week that holds the last day (4 to 6 rows). Days of the
 * neighbour months are marked `outside`.
 */
export function monthMatrix(
  year: number,
  month: number,
  weekStartsOn: number = 0,
): CalendarDay[][] {
  const first = toIsoDate({ year, month, day: 1 });
  const last = toIsoDate({ year, month, day: daysInMonth(year, month) });
  const end = endOfWeek(last, weekStartsOn);
  const weeks: CalendarDay[][] = [];
  let iso = startOfWeek(first, weekStartsOn);
  while (iso <= end) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = parseIsoDate(iso)!;
      week.push({ iso, day: d.day, outside: d.month !== month });
      iso = addDays(iso, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** True when `iso` is before `min`, after `max` or refused by `disabled`. */
export function isDateDisabled(iso: string, bounds: CalendarBounds): boolean {
  if (bounds.min && iso < bounds.min) return true;
  if (bounds.max && iso > bounds.max) return true;
  return !!bounds.disabled?.(iso);
}

/** `iso` pulled into [`min`, `max`]. */
export function clampDate(
  iso: string,
  min?: string | null,
  max?: string | null,
): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** The keys a date grid answers (the WAI-ARIA date picker dialog pattern). */
export const CALENDAR_KEYS: readonly string[] = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

/**
 * Where focus moves from `focused` for `key` in a date grid: a day left / right,
 * a week up / down, the first / last day of the week (Home / End), a month back /
 * on (PageUp / PageDown) or, with Shift, a year. `null` for any other key. The
 * result is clamped into [`min`, `max`]; `rtl` swaps Left and Right.
 */
export function calendarKeyTarget(
  key: string,
  focused: string,
  options: {
    readonly shiftKey?: boolean;
    readonly weekStartsOn?: number;
    readonly min?: string | null;
    readonly max?: string | null;
    readonly rtl?: boolean;
  } = {},
): string | null {
  const flip = options.rtl ? -1 : 1;
  let target: string;
  switch (key) {
    case "ArrowLeft":
      target = addDays(focused, -flip);
      break;
    case "ArrowRight":
      target = addDays(focused, flip);
      break;
    case "ArrowUp":
      target = addDays(focused, -7);
      break;
    case "ArrowDown":
      target = addDays(focused, 7);
      break;
    case "Home":
      target = startOfWeek(focused, options.weekStartsOn ?? 0);
      break;
    case "End":
      target = endOfWeek(focused, options.weekStartsOn ?? 0);
      break;
    case "PageUp":
      target = options.shiftKey
        ? addYears(focused, -1)
        : addMonths(focused, -1);
      break;
    case "PageDown":
      target = options.shiftKey ? addYears(focused, 1) : addMonths(focused, 1);
      break;
    default:
      return null;
  }
  return clampDate(target, options.min, options.max);
}

const isRange = (value: SoneCalendarValue): value is SoneDateRange =>
  !!value && typeof value === "object" && !Array.isArray(value);

/** The dates `value` holds for `mode`, in order (a range gives its ends). */
export function calendarDates(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
): string[] {
  if (mode === "multiple") return Array.isArray(value) ? [...value].sort() : [];
  if (mode === "range") {
    if (!isRange(value)) return [];
    return [value.start, value.end].filter((d): d is string => !!d);
  }
  return typeof value === "string" && value ? [value] : [];
}

/** True when `iso` is picked: the date, one of the dates or within the range. */
export function isDateSelected(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
  iso: string,
): boolean {
  if (mode === "range") return dateRangePart(value, iso) !== null;
  return calendarDates(mode, value).includes(iso);
}

/** Where `iso` sits in a range value: its `start`, `end`, `middle`, a `single`-day range, or `null`. */
export function dateRangePart(
  value: SoneCalendarValue,
  iso: string,
): "start" | "end" | "middle" | "single" | null {
  if (!isRange(value) || !value.start) return null;
  const end = value.end ?? value.start;
  if (iso < value.start || iso > end) return null;
  if (value.start === end) return "single";
  if (iso === value.start) return "start";
  if (iso === end) return "end";
  return "middle";
}

/**
 * The value after picking `iso`: `single` takes it, `multiple` toggles it, `range`
 * starts a new range on the first pick and closes it on the second (a pick before
 * the start swaps the ends).
 */
export function calendarSelect(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
  iso: string,
): SoneCalendarValue {
  if (mode === "multiple") {
    const dates = Array.isArray(value) ? (value as readonly string[]) : [];
    return dates.includes(iso)
      ? dates.filter((d) => d !== iso)
      : [...dates, iso].sort();
  }
  if (mode === "range") {
    const range = isRange(value) ? value : null;
    if (!range?.start || range.end) return { start: iso, end: null };
    return iso < range.start
      ? { start: iso, end: range.start }
      : { start: range.start, end: iso };
  }
  return iso;
}

/** True when a pick completed the value: any `single` / `multiple` pick, a range with both ends. */
export function isCalendarValueComplete(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
): boolean {
  if (mode !== "range") return true;
  return isRange(value) && !!value.start && !!value.end;
}

/** The value a calendar holds when nothing is picked in `mode`. */
export function emptyCalendarValue(mode: SoneCalendarMode): SoneCalendarValue {
  return mode === "multiple" ? [] : null;
}

/**
 * A cached `Intl.DateTimeFormat` for ISO dates (UTC, so the zone never shifts a day):
 * `isoDateFormatter("en-US", { dateStyle: "full" })("2024-03-05")`.
 */
export function isoDateFormatter(
  locale?: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): (iso: string) => string {
  const format = new Intl.DateTimeFormat(locale ?? undefined, {
    ...options,
    timeZone: "UTC",
  });
  return (iso) => {
    const d = parseIsoDate(iso);
    return d ? format.format(utc(d.year, d.month, d.day)) : iso;
  };
}

/** `iso` formatted with `Intl` in `locale` (medium date by default); an invalid date is returned as is. */
export function formatIsoDate(
  iso: string,
  locale?: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return isoDateFormatter(locale, options)(iso);
}

/** The month's caption in `locale`: "March 2024", "marzec 2024". */
export function calendarCaption(month: string, locale?: string | null): string {
  return formatIsoDate(`${month}-01`, locale, {
    month: "long",
    year: "numeric",
  });
}

/** The weekday names from `weekStartsOn`, short ("Mo") and long ("Monday"), in `locale`. */
export function calendarWeekdays(
  locale?: string | null,
  weekStartsOn: number = 0,
): { readonly short: string; readonly long: string }[] {
  const short = isoDateFormatter(locale, { weekday: "short" });
  const long = isoDateFormatter(locale, { weekday: "long" });
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const iso = toIsoDate({
      year: 2023,
      month: 1,
      day: 1 + ((i + weekStartsOn) % 7),
    });
    return { short: short(iso), long: long(iso) };
  });
}

/**
 * A calendar value as text: the date, the dates joined by commas, or the range
 * ("Mar 5 – 9, 2024" where `Intl` can shorten it). Empty for no value.
 */
export function formatCalendarValue(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
  locale?: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const format = isoDateFormatter(locale, options);
  if (mode === "range") {
    if (!isRange(value) || !value.start) return "";
    if (!value.end) return `${format(value.start)} –`;
    const start = parseIsoDate(value.start);
    const end = parseIsoDate(value.end);
    const intl = new Intl.DateTimeFormat(locale ?? undefined, {
      ...options,
      timeZone: "UTC",
    });
    if (start && end && typeof intl.formatRange === "function") {
      return intl.formatRange(
        utc(start.year, start.month, start.day),
        utc(end.year, end.month, end.day),
      );
    }
    return `${format(value.start)} – ${format(value.end)}`;
  }
  return calendarDates(mode, value).map(format).join(", ");
}

/** The month a calendar opens on: the first picked date's, else `fallbacks` in order. */
export function calendarStartMonth(
  mode: SoneCalendarMode,
  value: SoneCalendarValue,
  ...fallbacks: (string | null | undefined)[]
): string | null {
  for (const candidate of [calendarDates(mode, value)[0], ...fallbacks]) {
    const month = isoMonth(candidate);
    if (month) return month;
  }
  return null;
}
