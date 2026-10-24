"use client";

import {
  createElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";

import {
  addMonths,
  calendarCaption,
  calendarDates,
  calendarKeyTarget,
  calendarSelect,
  calendarStartMonth,
  calendarWeekdays,
  dateRangePart,
  isDateDisabled,
  isDateSelected,
  isoDateFormatter,
  isoMonth,
  monthMatrix,
  todayIsoDate,
  type SoneCalendarMode,
  type SoneCalendarValue,
  type SoneWeekday,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { cx, flag } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type {
  SoneCalendarMode,
  SoneCalendarValue,
  SoneDateRange,
  SoneWeekday,
} from "@surface-one/core";

/** The props a calendar shares with the date picker that wraps it. */
export interface SoneCalendarSharedProps {
  /** What a pick does: take one date, close a range, or toggle a date of a list. */
  readonly mode?: SoneCalendarMode;
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  readonly min?: string | null;
  readonly max?: string | null;
  /** Refuses more dates: `(iso) => true` disables that day. */
  readonly disabledDate?: ((iso: string) => boolean) | null;
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  readonly weekStartsOn?: SoneWeekday;
  /** A BCP 47 tag for the month and weekday names (default: the messages' `dateLocale`). */
  readonly locale?: string | null;
  /** Today, "YYYY-MM-DD". Default: the browser's date, read after mount (SSR-safe). */
  readonly today?: string | null;
  /** Shows the neighbour months' days that pad the first and last week. */
  readonly showOutsideDays?: boolean;
  readonly disabled?: boolean;
}

export interface SoneCalendarProps
  extends
    SoneCalendarSharedProps,
    Omit<
      HTMLAttributes<HTMLElement>,
      "defaultValue" | "onChange" | "aria-label"
    > {
  /** The picked date(s), controlled with `onValueChange`; or `defaultValue`. */
  readonly value?: SoneCalendarValue;
  readonly defaultValue?: SoneCalendarValue;
  readonly onValueChange?: (value: SoneCalendarValue) => void;
  /** The month shown, "YYYY-MM", controlled with `onMonthChange`; or `defaultMonth`. */
  readonly month?: string | null;
  readonly defaultMonth?: string | null;
  readonly onMonthChange?: (month: string | null) => void;
  /** Every pick, with the day picked. */
  readonly onDateSelect?: (iso: string) => void;
  /** Names the grid; by default the month caption does. */
  readonly "aria-label"?: string;
  /** Marks the grid's Tab stop `data-autofocus` (a popover focuses it on open). */
  readonly autofocusDay?: boolean;
  readonly previousMonthLabel?: string;
  readonly nextMonthLabel?: string;
}

/**
 * `<sone-calendar>` — a month grid to pick a date, a range or several dates (spartan/ui
 * and shadcn/ui Calendar): `value` / `defaultValue` / `onValueChange` ("YYYY-MM-DD", a
 * list or `{ start, end }`), `month` / `onMonthChange` ("YYYY-MM"). The grid follows
 * the WAI-ARIA date picker pattern: arrows, Home / End, PageUp / PageDown (Shift: a
 * year), Enter or Space picks.
 */
export function SoneCalendar({
  mode = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  onDateSelect,
  min = null,
  max = null,
  disabledDate = null,
  weekStartsOn = 0,
  locale: localeProp = null,
  today: todayProp = null,
  showOutsideDays = true,
  disabled = false,
  autofocusDay = false,
  previousMonthLabel,
  nextMonthLabel,
  "aria-label": ariaLabel,
  className,
  ...rest
}: SoneCalendarProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<SoneCalendarValue>(
    valueProp,
    defaultValue ?? null,
    onValueChange,
  );
  const [month, setMonthState] = useControllable<string | null>(
    monthProp,
    defaultMonth ?? null,
    onMonthChange,
  );
  const captionId = `sone-calendar-caption-${useId()}`;
  const root = useRef<HTMLElement | null>(null);
  const [clientToday, setClientToday] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  useEffect(() => setClientToday(todayIsoDate()), []);
  useEffect(() => {
    if (!focusTarget) return;
    root.current
      ?.querySelector<HTMLElement>(`[data-iso="${focusTarget}"]`)
      ?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const locale = localeProp ?? messages.dateLocale;
  const today = todayProp ?? clientToday;
  const shown =
    isoMonth(month) ?? calendarStartMonth(mode, value, today, min, max);
  const inMonth = (iso: string | null | undefined): iso is string =>
    !!shown && !!iso && isoMonth(iso) === shown;
  const tabStop = !shown
    ? null
    : inMonth(focused)
      ? focused
      : (calendarDates(mode, value).find(inMonth) ??
        (inMonth(today) ? today : `${shown}-01`));

  const setMonth = (iso: string | null): void => {
    const next = isoMonth(iso);
    if (next !== month) setMonthState(next);
  };
  const go = (by: number): void => {
    if (shown) setMonth(addMonths(`${shown}-01`, by));
  };
  const pick = (iso: string, off: boolean): void => {
    if (off || disabled) return;
    setMonth(iso);
    setFocused(iso);
    setValue(calendarSelect(mode, value, iso));
    onDateSelect?.(iso);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>): void => {
    if (!tabStop || disabled) return;
    const target = calendarKeyTarget(event.key, tabStop, {
      shiftKey: event.shiftKey,
      weekStartsOn,
      min,
      max,
      rtl: root.current?.closest("[dir]")?.getAttribute("dir") === "rtl",
    });
    if (target === null) return;
    event.preventDefault();
    setFocused(target);
    setMonth(target);
    setFocusTarget(target);
  };

  const nav = (dir: "previous" | "next"): ReactElement => {
    const bound = isoMonth(dir === "previous" ? min : max);
    const can =
      !!shown &&
      (!bound || (dir === "previous" ? shown > bound : shown < bound));
    return (
      <button
        type="button"
        className="calendar-nav btn"
        data-slot="button"
        data-variant="ghost"
        data-size="icon-sm"
        data-nav={dir}
        aria-label={
          dir === "previous"
            ? (previousMonthLabel ?? messages.calendarPreviousMonth)
            : (nextMonthLabel ?? messages.calendarNextMonth)
        }
        disabled={disabled || !can}
        onClick={() => go(dir === "previous" ? -1 : 1)}
      >
        <SoneIcon
          icon={dir === "previous" ? "chevron-left" : "chevron-right"}
        />
      </button>
    );
  };

  const label = isoDateFormatter(locale, { dateStyle: "full" });
  const bounds = { min, max, disabled: disabledDate };
  const weeks = shown
    ? monthMatrix(
        Number(shown.slice(0, 4)),
        Number(shown.slice(5, 7)),
        weekStartsOn,
      )
    : [];

  return createElement(
    "sone-calendar",
    {
      ...rest,
      ref: root,
      className: cx("calendar", className),
      "data-slot": "calendar",
      "data-mode": mode,
      "data-disabled": flag(disabled),
    },
    <div className="calendar-header" data-slot="calendar-header">
      {nav("previous")}
      <div
        className="calendar-caption"
        data-slot="calendar-caption"
        aria-live="polite"
        id={captionId}
      >
        {shown ? calendarCaption(shown, locale) : ""}
      </div>
      {nav("next")}
    </div>,
    <table
      className="calendar-grid"
      data-slot="calendar-grid"
      role="grid"
      aria-labelledby={ariaLabel ? undefined : captionId}
      aria-label={ariaLabel}
      aria-multiselectable={mode === "single" ? undefined : "true"}
      aria-disabled={disabled ? "true" : undefined}
      onKeyDown={onKeyDown}
    >
      <thead>
        <tr>
          {calendarWeekdays(locale, weekStartsOn).map((w, i) => (
            <th
              key={i}
              scope="col"
              className="calendar-weekday"
              data-slot="calendar-weekday"
              abbr={w.long}
            >
              {w.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr
            key={week[0]!.iso}
            className="calendar-week"
            data-slot="calendar-week"
          >
            {week.map((d) => {
              const hidden = d.outside && !showOutsideDays;
              const selected = isDateSelected(mode, value, d.iso);
              const off = isDateDisabled(d.iso, bounds);
              return (
                <td
                  key={d.iso}
                  role="gridcell"
                  className="calendar-cell"
                  data-slot="calendar-cell"
                  aria-selected={hidden ? undefined : selected}
                  data-range={
                    mode === "range"
                      ? (dateRangePart(value, d.iso) ?? undefined)
                      : undefined
                  }
                >
                  {hidden ? null : (
                    <button
                      type="button"
                      className="calendar-day"
                      data-slot="calendar-day"
                      data-iso={d.iso}
                      data-outside={flag(d.outside)}
                      data-selected={flag(selected)}
                      data-autofocus={flag(autofocusDay && d.iso === tabStop)}
                      tabIndex={d.iso === tabStop ? 0 : -1}
                      aria-label={label(d.iso)}
                      aria-current={d.iso === today ? "date" : undefined}
                      aria-disabled={off ? "true" : undefined}
                      disabled={disabled}
                      onClick={() => pick(d.iso, off)}
                    >
                      {d.day}
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>,
  );
}
