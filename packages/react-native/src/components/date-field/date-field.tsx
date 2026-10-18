import { useMemo, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { fontFamily, shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSheet, SoneSheetTitle } from "../sheet/sheet";
import {
  formatIsoDate,
  monthGrid,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
} from "./date-utils";

export interface SoneDateFieldLabels {
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly clear: string;
}

const DEFAULT_LABELS: SoneDateFieldLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  clear: "Clear date",
};

export interface SoneDateFieldProps {
  /** The date as "YYYY-MM-DD" (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** A pick, or `undefined` once the date is cleared. */
  readonly onValueChange?: (date: string | undefined) => void;
  /**
   * Replaces the built-in calendar with your own picker (a native date dialog …):
   * receives the current "YYYY-MM-DD" and resolves the new one — `undefined` for a cancel.
   */
  readonly pick?: (
    current: string | undefined,
  ) => string | undefined | Promise<string | undefined>;
  /** Shown while no date is set. */
  readonly placeholder?: string;
  /** The earliest and latest date the built-in calendar allows ("YYYY-MM-DD"). */
  readonly min?: string;
  readonly max?: string;
  /** A BCP 47 tag for the shown date and the calendar (default: the device's). */
  readonly locale?: string;
  /** Formats the shown date; default: `Intl` medium date in `locale`. */
  readonly formatDate?: (date: string) => string;
  /** 0 = Sunday, 1 = Monday (the default). */
  readonly weekStartsOn?: 0 | 1;
  /** A clear button once a date is set. */
  readonly clearable?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** Names the field (and the calendar sheet): "Start date". */
  readonly ariaLabel?: string | null;
  readonly labels?: Partial<SoneDateFieldLabels>;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-date-field>` — a field-styled trigger showing a formatted date; it opens a
 * calendar sheet (pure JavaScript — no native module) or your `pick`. Values are
 * "YYYY-MM-DD" strings: `value` / `defaultValue` / `onValueChange`.
 */
export function SoneDateField({
  value: valueProp,
  defaultValue,
  onValueChange,
  pick,
  placeholder = "",
  min,
  max,
  locale,
  formatDate,
  weekStartsOn = 1,
  clearable = false,
  disabled = false,
  invalid = false,
  ariaLabel,
  labels: labelsProp,
  style,
  testID,
}: SoneDateFieldProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [value, setValue] = useControllable<string | undefined>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = useState(false);
  const focus = useFocusRing();
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    const ring = (r: string) => [t.inputShadow, r].filter(Boolean).join(", ");
    return {
      row: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.space2,
      } as ViewStyle,
      trigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: t.controlGapMd,
        height: t.controlHMd,
        paddingHorizontal: t.controlPxMd,
        borderWidth: t.borderWidthThin,
        borderColor: t.inputBorder,
        borderRadius: t.controlRadius,
        backgroundColor: t.inputBg,
        ...shadow(t.inputShadow),
      } as ViewStyle,
      pressed: { borderColor: t.inputHoverBorder } as ViewStyle,
      focused: {
        borderColor: t.accentEdge,
        boxShadow: ring(t.focusRing),
      } as ViewStyle,
      invalid: { borderColor: t.invalidBorder } as ViewStyle,
      disabled: {
        opacity: t.disabledOpacity,
        backgroundColor: t.inputDisabledBg,
      } as ViewStyle,
      fg: {
        color: t.textPrimary,
        fontSize: t.controlFontSize,
        fontFamily: fontFamily(th),
        lineHeight: Math.round(t.controlFontSize * t.leadingSm),
        iconSize: t.controlIcon,
      },
    };
  });

  const shown = value
    ? formatDate
      ? formatDate(value)
      : formatIsoDate(value, locale)
    : "";

  const start = async (): Promise<void> => {
    if (disabled) return;
    if (!pick) return setOpen(true);
    const next = await pick(value);
    if (next) setValue(next);
  };

  return (
    <View style={[s.row, style]}>
      <Pressable
        role="button"
        aria-label={
          ariaLabel
            ? [ariaLabel, shown || placeholder].filter(Boolean).join(": ")
            : undefined
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={() => void start()}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        testID={testID}
        style={({ pressed }) => [
          s.trigger,
          { flex: 1 },
          pressed && !disabled && s.pressed,
          focus.focused && s.focused,
          invalid && s.invalid,
          disabled && s.disabled,
        ]}
      >
        <SoneForegroundProvider value={s.fg}>
          <SoneIcon name="calendar" />
          <SoneText
            numberOfLines={1}
            tone={shown ? "primary" : "muted"}
            style={{ flex: 1 }}
          >
            {shown || placeholder}
          </SoneText>
        </SoneForegroundProvider>
      </Pressable>
      {clearable && value && !disabled ? (
        <SoneButton
          variant="ghost"
          size="icon"
          aria-label={labels.clear}
          onPress={() => setValue(undefined)}
        >
          <SoneIcon name="close" />
        </SoneButton>
      ) : null}
      {open ? (
        <SoneSheet
          side="bottom"
          ariaLabel={ariaLabel ?? placeholder}
          onDismiss={() => setOpen(false)}
        >
          <SoneSheetTitle>{ariaLabel ?? placeholder}</SoneSheetTitle>
          <Calendar
            value={value}
            min={min}
            max={max}
            locale={locale}
            weekStartsOn={weekStartsOn}
            labels={labels}
            onPick={(date) => {
              setValue(date);
              setOpen(false);
            }}
          />
        </SoneSheet>
      ) : null}
    </View>
  );
}

interface CalendarProps {
  readonly value: string | undefined;
  readonly min?: string;
  readonly max?: string;
  readonly locale?: string;
  readonly weekStartsOn: 0 | 1;
  readonly labels: SoneDateFieldLabels;
  readonly onPick: (date: string) => void;
}

function Calendar({
  value,
  min,
  max,
  locale,
  weekStartsOn,
  labels,
  onPick,
}: CalendarProps) {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const current = parseIsoDate(value);
  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);
  const [view, setView] = useState(() => {
    const base = current ?? parseIsoDate(min) ?? today;
    return { year: base.year, month: base.month };
  });
  const rows = monthGrid(view.year, view.month, weekStartsOn);
  const title = formatIsoDate(toIsoDate({ ...view, day: 1 }), locale, {
    month: "long",
    year: "numeric",
  });
  // 2024-01-07 was a Sunday: the weekday names in the locale, from the week's first day.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    formatIsoDate(
      toIsoDate({ year: 2024, month: 1, day: 7 + ((i + weekStartsOn) % 7) }),
      locale,
      { weekday: "short" },
    ),
  );
  const disabledDay = (iso: string): boolean =>
    (!!min && iso < min) || (!!max && iso > max);
  const cell = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  } as const;

  return (
    <View style={{ gap: t.space2 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          aria-label={labels.previousMonth}
          onPress={() => setView((v) => shiftMonth(v.year, v.month, -1))}
        >
          <SoneIcon name="chevron-left" />
        </SoneButton>
        <SoneText
          role="heading"
          aria-live="polite"
          weight="medium"
          style={{ flex: 1, textAlign: "center" }}
        >
          {title}
        </SoneText>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          aria-label={labels.nextMonth}
          onPress={() => setView((v) => shiftMonth(v.year, v.month, 1))}
        >
          <SoneIcon name="chevron-right" />
        </SoneButton>
      </View>
      <View style={{ flexDirection: "row" }} aria-hidden>
        {weekdays.map((w, i) => (
          <View key={i} style={cell}>
            <SoneText tone="muted" size="xs">
              {w}
            </SoneText>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((day, c) => {
            if (day === null) return <View key={c} style={{ flex: 1 }} />;
            const date = { ...view, day };
            const iso = toIsoDate(date);
            const selected = iso === value;
            const isToday = iso === toIsoDate(today);
            const off = disabledDay(iso);
            return (
              <Pressable
                key={c}
                role="button"
                aria-label={formatIsoDate(iso, locale, { dateStyle: "full" })}
                aria-pressed={selected}
                aria-current={isToday ? "date" : undefined}
                aria-disabled={off || undefined}
                disabled={off}
                onPress={() => onPick(iso)}
                style={({ pressed }) => [
                  cell,
                  {
                    height: t.controlHMd,
                    borderRadius: t.controlRadius,
                    borderWidth: isToday && !selected ? t.borderWidthThin : 0,
                    borderColor: t.border,
                  },
                  pressed && { backgroundColor: t.surfaceHover },
                  selected && { backgroundColor: t.accent },
                  off && { opacity: t.disabledOpacity },
                ]}
              >
                <SoneText
                  aria-hidden
                  numeric
                  size="sm"
                  weight={selected ? "semibold" : "normal"}
                  style={{
                    color: selected ? t.textOnAccent : t.textPrimary,
                    fontWeight: weight(
                      selected ? t.fontWeightSemibold : t.fontWeightNormal,
                    ),
                  }}
                >
                  {day}
                </SoneText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
