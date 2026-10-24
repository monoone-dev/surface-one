import { useState, type ReactElement } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneStyles } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { fontFamily, shadow } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneButton } from "../button/button";
import { SoneCalendar } from "../calendar/calendar";
import { SoneIcon } from "../icon/icon";
import { SoneSheet, SoneSheetTitle } from "../sheet/sheet";
import { formatIsoDate, isoMonth } from "./date-utils";

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
}: SoneDateFieldProps): ReactElement {
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
          <SoneCalendar
            value={value ?? null}
            defaultMonth={isoMonth(value) ?? isoMonth(min)}
            min={min}
            max={max}
            locale={locale}
            weekStartsOn={weekStartsOn}
            showOutsideDays={false}
            previousMonthLabel={labels.previousMonth}
            nextMonthLabel={labels.nextMonth}
            onDateSelect={(date) => {
              setValue(date);
              setOpen(false);
            }}
          />
        </SoneSheet>
      ) : null}
    </View>
  );
}

/**
 * `<sone-date-picker>` on a phone: the date field IS the date picker — a field that
 * opens a calendar sheet — so the web name points at it rather than at a copy.
 */
export const SoneDatePicker = SoneDateField;
export type SoneDatePickerProps = SoneDateFieldProps;
