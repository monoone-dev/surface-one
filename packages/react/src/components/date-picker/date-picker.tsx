"use client";

import {
  createElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from "react";

import {
  calendarSelect,
  datePickerLabelledBy,
  formatCalendarValue,
  isCalendarValueComplete,
  todayIsoDate,
  type SoneCalendarValue,
  type SoneWeekday,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { cx, flag } from "../../utils/part";
import { SoneCalendar } from "../calendar/calendar";
import { SoneIcon } from "../icon/icon";
import {
  SonePopover,
  SonePopoverContent,
  SonePopoverTrigger,
} from "../popover/popover";

/** A date picker picks one date or a range. */
export type SoneDatePickerMode = "single" | "range";

export interface SoneDatePickerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue" | "onChange" | "placeholder"
> {
  /** One date (`single`, the default) or a range (`range`). */
  readonly mode?: SoneDatePickerMode;
  /** "YYYY-MM-DD" or `{ start, end }` (`range`), controlled with `onValueChange`; or `defaultValue`. */
  readonly value?: SoneCalendarValue;
  readonly defaultValue?: SoneCalendarValue;
  readonly onValueChange?: (value: SoneCalendarValue) => void;
  /** The calendar is open, controlled with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Every pick, with the day picked. */
  readonly onDateSelect?: (iso: string) => void;
  /** Shown while no date is picked (default: the messages' `datePickerPlaceholder`). */
  readonly placeholder?: string;
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  readonly min?: string | null;
  readonly max?: string | null;
  /** Refuses more dates: `(iso) => true` disables that day. */
  readonly disabledDate?: ((iso: string) => boolean) | null;
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  readonly weekStartsOn?: SoneWeekday;
  /** A BCP 47 tag for the shown date and the calendar (default: the messages' `dateLocale`). */
  readonly locale?: string | null;
  /** How the date is shown (`Intl.DateTimeFormat` options); a long date by default. */
  readonly formatOptions?: Intl.DateTimeFormatOptions;
  /** Today for the calendar, "YYYY-MM-DD" (default: the browser's, read after mount). */
  readonly today?: string | null;
  /** Close the calendar once a date (or a whole range) is picked. */
  readonly closeOnSelect?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** The button's `id`, for a `<label htmlFor>`. */
  readonly triggerId?: string;
  /** Names the picker when no `<label>` does: read with the date, "Due date: May 4, 2026". */
  readonly "aria-label"?: string;
  /** Extra ids for the button's `aria-describedby` (a hint, an error). */
  readonly "aria-describedby"?: string;
  /** Names the calendar popover (default: the messages' `datePickerDialog`). */
  readonly dialogLabel?: string;
}

const LONG_DATE: Intl.DateTimeFormatOptions = { dateStyle: "long" };

/**
 * `<sone-date-picker>` — a field-like button that opens a calendar in a popover
 * (shadcn/ui Date Picker): `value` / `defaultValue` / `onValueChange` ("YYYY-MM-DD" or
 * `{ start, end }` with `mode="range"`), shown through `Intl` in `locale`. The popover
 * closes on a pick (a whole range) and gives focus back to the button.
 */
export function SoneDatePicker({
  mode = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onDateSelect,
  placeholder,
  min = null,
  max = null,
  disabledDate = null,
  weekStartsOn = 0,
  locale: localeProp = null,
  formatOptions = LONG_DATE,
  today: todayProp = null,
  closeOnSelect = true,
  disabled = false,
  invalid = false,
  triggerId,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  dialogLabel,
  className,
  ...rest
}: SoneDatePickerProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<SoneCalendarValue>(
    valueProp,
    defaultValue ?? null,
    onValueChange,
  );
  const [open, setOpen] = useControllable<boolean>(
    openProp,
    defaultOpen ?? false,
    onOpenChange,
  );
  const valueId = `sone-date-picker-value-${useId()}`;
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [clientToday, setClientToday] = useState<string | null>(null);
  const [labelledBy, setLabelledBy] = useState<string | null>(null);
  useEffect(() => {
    setClientToday(todayIsoDate());
    setLabelledBy(datePickerLabelledBy(trigger.current, valueId));
  }, [valueId]);

  const locale = localeProp ?? messages.dateLocale;
  const display = formatCalendarValue(mode, value, locale, formatOptions);
  const text = display || (placeholder ?? messages.datePickerPlaceholder);
  const name = ariaLabel ? `${ariaLabel}: ${text}` : undefined;

  const pick = (iso: string): void => {
    // The calendar applies the same pick to the same value (calendarSelect).
    const next = calendarSelect(mode, value, iso);
    setValue(next);
    onDateSelect?.(iso);
    if (closeOnSelect && isCalendarValueComplete(mode, next)) {
      setOpen(false);
      trigger.current?.focus();
    }
  };

  return createElement(
    "sone-date-picker",
    {
      ...rest,
      className: cx("date-picker", className),
      "data-slot": "date-picker",
      "data-mode": mode,
    },
    <SonePopover open={open} onOpenChange={setOpen}>
      <SonePopoverTrigger
        ref={trigger}
        className="btn date-picker-trigger"
        data-slot="button"
        data-variant="outline"
        data-size="default"
        id={triggerId}
        aria-label={name}
        aria-labelledby={name ? undefined : (labelledBy ?? undefined)}
        aria-describedby={ariaDescribedby}
        aria-invalid={invalid ? "true" : undefined}
        data-empty={flag(!display)}
        disabled={disabled}
      >
        <SoneIcon icon="calendar" />
        <span
          className="date-picker-value"
          data-slot="date-picker-value"
          id={valueId}
        >
          {text}
        </span>
      </SonePopoverTrigger>
      <SonePopoverContent
        className="date-picker-content"
        aria-label={dialogLabel ?? messages.datePickerDialog}
      >
        <SoneCalendar
          autofocusDay
          mode={mode}
          value={value}
          min={min}
          max={max}
          disabledDate={disabledDate}
          weekStartsOn={weekStartsOn}
          locale={locale}
          today={todayProp ?? clientToday}
          onDateSelect={pick}
        />
      </SonePopoverContent>
    </SonePopover>,
  );
}
