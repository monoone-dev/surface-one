// The date math is shared with the web calendar (packages/angular/calendar/calendar-grid.ts,
// through @surface-one/core): SoneDateField and SoneCalendar lay out and format alike.
export {
  daysInMonth,
  formatIsoDate,
  isoMonth,
  monthGrid,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
  weekdayOf,
  type CalendarDate,
} from "@surface-one/core/calendar";
