import { useContext, useMemo, type ReactElement } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import {
  addMonths,
  calendarCaption,
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
} from "@surface-one/core/calendar";

import { SoneMessagesContext } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { weight } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type {
  SoneCalendarMode,
  SoneCalendarValue,
  SoneDateRange,
  SoneWeekday,
} from "@surface-one/core/calendar";

export interface SoneCalendarProps {
  /** What a pick does: take one date, close a range, or toggle a date of a list. */
  readonly mode?: SoneCalendarMode;
  /**
   * The picked date(s), controlled with `onValueChange`; or `defaultValue`:
   * "YYYY-MM-DD" (`single`), a list (`multiple`) or `{ start, end }` (`range`).
   */
  readonly value?: SoneCalendarValue;
  readonly defaultValue?: SoneCalendarValue;
  readonly onValueChange?: (value: SoneCalendarValue) => void;
  /** The month shown, "YYYY-MM", controlled with `onMonthChange`; or `defaultMonth`. */
  readonly month?: string | null;
  readonly defaultMonth?: string | null;
  readonly onMonthChange?: (month: string | null) => void;
  /** Every pick, with the day picked. */
  readonly onDateSelect?: (iso: string) => void;
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  readonly min?: string | null;
  readonly max?: string | null;
  /** Refuses more dates: `(iso) => true` disables that day. */
  readonly disabledDate?: ((iso: string) => boolean) | null;
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  readonly weekStartsOn?: SoneWeekday;
  /** A BCP 47 tag for the month and weekday names (default: the device's). */
  readonly locale?: string | null;
  /** Today, "YYYY-MM-DD" (default: the device's date). */
  readonly today?: string | null;
  /** Shows the neighbour months' days that pad the first and last week. */
  readonly showOutsideDays?: boolean;
  readonly disabled?: boolean;
  /** Names the calendar; by default the month caption does. */
  readonly "aria-label"?: string;
  readonly previousMonthLabel?: string;
  readonly nextMonthLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-calendar>` — a month grid to pick a date, a range or several dates (spartan/ui
 * and shadcn/ui Calendar), pure JavaScript. Every day is a button named with its full
 * date (`aria-pressed` while picked, `aria-current="date"` for today); the month
 * buttons page through the months. The date math is the web calendar's.
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
  "aria-label": ariaLabel,
  previousMonthLabel,
  nextMonthLabel,
  style,
  testID,
}: SoneCalendarProps): ReactElement {
  const messages = useContext(SoneMessagesContext);
  const theme = useSoneTheme();
  const t = theme.tokens;
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
  const deviceToday = useMemo(() => todayIsoDate(), []);
  const locale = localeProp ?? undefined;
  const today = todayProp ?? deviceToday;
  const shown =
    isoMonth(month) ?? calendarStartMonth(mode, value, today, min, max)!;
  const setMonth = (iso: string): void => {
    const next = isoMonth(iso);
    if (next !== month) setMonthState(next);
  };
  const can = (dir: -1 | 1): boolean => {
    const bound = isoMonth(dir < 0 ? min : max);
    return !bound || (dir < 0 ? shown > bound : shown < bound);
  };
  const pick = (iso: string): void => {
    setMonth(iso);
    setValue(calendarSelect(mode, value, iso));
    onDateSelect?.(iso);
  };

  const label = isoDateFormatter(locale, { dateStyle: "full" });
  const bounds = { min, max, disabled: disabledDate };
  const weeks = monthMatrix(
    Number(shown.slice(0, 4)),
    Number(shown.slice(5, 7)),
    weekStartsOn,
  );
  const cell = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  } as const;

  return (
    <View
      style={[
        { gap: t.space2 },
        disabled && { opacity: t.disabledOpacity },
        style,
      ]}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      testID={testID}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          aria-label={previousMonthLabel ?? messages.calendarPreviousMonth}
          disabled={disabled || !can(-1)}
          onPress={() => setMonth(addMonths(`${shown}-01`, -1))}
        >
          <SoneIcon name="chevron-left" />
        </SoneButton>
        <SoneText
          role="heading"
          aria-live="polite"
          weight="medium"
          style={{ flex: 1, textAlign: "center", textTransform: "capitalize" }}
        >
          {calendarCaption(shown, locale)}
        </SoneText>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          aria-label={nextMonthLabel ?? messages.calendarNextMonth}
          disabled={disabled || !can(1)}
          onPress={() => setMonth(addMonths(`${shown}-01`, 1))}
        >
          <SoneIcon name="chevron-right" />
        </SoneButton>
      </View>
      <View style={{ flexDirection: "row" }} aria-hidden>
        {calendarWeekdays(locale, weekStartsOn).map((w, i) => (
          <View key={i} style={cell}>
            <SoneText size="xs" style={{ color: t.calendarWeekdayFg }}>
              {w.short}
            </SoneText>
          </View>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]!.iso} style={{ flexDirection: "row" }}>
          {week.map((d) => {
            if (d.outside && !showOutsideDays)
              return <View key={d.iso} style={{ flex: 1 }} />;
            const selected = isDateSelected(mode, value, d.iso);
            const range = mode === "range" ? dateRangePart(value, d.iso) : null;
            const band = range === "middle";
            const filled = selected && !band;
            const isToday = d.iso === today;
            const off = disabled || isDateDisabled(d.iso, bounds);
            return (
              <View
                key={d.iso}
                style={[
                  { flex: 1 },
                  (range === "start" || band || range === "end") && {
                    backgroundColor: t.calendarRangeBg,
                  },
                  range === "start" && {
                    borderTopLeftRadius: t.controlRadius,
                    borderBottomLeftRadius: t.controlRadius,
                  },
                  range === "end" && {
                    borderTopRightRadius: t.controlRadius,
                    borderBottomRightRadius: t.controlRadius,
                  },
                ]}
              >
                <Pressable
                  role="button"
                  aria-label={label(d.iso)}
                  aria-pressed={selected}
                  aria-current={isToday ? "date" : undefined}
                  aria-disabled={off || undefined}
                  disabled={off}
                  onPress={() => pick(d.iso)}
                  style={({ pressed }) => [
                    cell,
                    {
                      height: t.controlHMd,
                      borderRadius: t.controlRadius,
                      borderWidth: isToday && !filled ? t.borderWidthThin : 0,
                      borderColor: t.border,
                    },
                    pressed && { backgroundColor: t.calendarDayHoverBg },
                    filled && { backgroundColor: t.calendarSelectedBg },
                    off && { opacity: t.disabledOpacity },
                  ]}
                >
                  <SoneText
                    aria-hidden
                    numeric
                    size="sm"
                    style={{
                      color: filled
                        ? t.calendarSelectedFg
                        : band
                          ? t.calendarRangeFg
                          : d.outside
                            ? t.calendarOutsideFg
                            : t.textPrimary,
                      fontWeight: weight(
                        filled ? t.fontWeightSemibold : t.fontWeightNormal,
                      ),
                    }}
                  >
                    {d.day}
                  </SoneText>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
