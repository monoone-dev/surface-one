/** Calendar dates are ISO strings, "YYYY-MM-DD", in the device's calendar (no time zone). */
export interface CalendarDate {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number;
}

const pad = (n: number, w = 2): string => String(n).padStart(w, "0");

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

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

export function shiftMonth(
  year: number,
  month: number,
  by: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + by;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** The month as rows of 7 cells (`null` pads the first and last week). */
export function monthGrid(
  year: number,
  month: number,
  weekStartsOn: 0 | 1,
): (number | null)[][] {
  const lead = (weekdayOf(year, month, 1) - weekStartsOn + 7) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function formatIsoDate(
  iso: string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale, options).format(
    new Date(d.year, d.month - 1, d.day),
  );
}
