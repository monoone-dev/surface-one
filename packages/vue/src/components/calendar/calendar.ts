import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  useId,
  type PropType,
} from "vue";

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

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { flag } from "../../utils/part";
import { SoneIcon } from "../icon";

export type {
  SoneCalendarMode,
  SoneCalendarValue,
  SoneDateRange,
  SoneWeekday,
} from "@surface-one/core";

/** The props a calendar shares with the date picker that wraps it. */
export const calendarProps = {
  /** What a pick does: take one date, close a range, or toggle a date of a list. */
  mode: { type: String as PropType<SoneCalendarMode>, default: "single" },
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  min: { type: String as PropType<string | null>, default: null },
  max: { type: String as PropType<string | null>, default: null },
  /** Refuses more dates: `(iso) => true` disables that day. */
  disabledDate: {
    type: Function as PropType<((iso: string) => boolean) | null>,
    default: null,
  },
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  weekStartsOn: { type: Number as PropType<SoneWeekday>, default: 0 },
  /** A BCP 47 tag for the month and weekday names (default: the messages' `dateLocale`). */
  locale: { type: String as PropType<string | null>, default: null },
  /** Today, "YYYY-MM-DD". Default: the browser's date, read once mounted (SSR-safe). */
  today: { type: String as PropType<string | null>, default: null },
  /** Shows the neighbour months' days that pad the first and last week. */
  showOutsideDays: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
} as const;

/**
 * `<sone-calendar>` — a month grid to pick a date, a range or several dates (spartan/ui
 * and shadcn/ui Calendar): `v-model` ("YYYY-MM-DD", a list or `{ start, end }`),
 * `v-model:month` ("YYYY-MM"). The grid follows the WAI-ARIA date picker pattern:
 * arrows, Home / End, PageUp / PageDown (Shift: a year), Enter or Space picks.
 */
export const SoneCalendar = defineComponent({
  name: "SoneCalendar",
  props: {
    ...calendarProps,
    /** The picked date(s) — `v-model`. */
    modelValue: {
      type: [String, Array, Object] as PropType<SoneCalendarValue>,
      default: null,
    },
    /** The month shown, "YYYY-MM" — `v-model:month`. */
    month: { type: String as PropType<string | null>, default: null },
    /** Names the grid; by default the month caption does. */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** Marks the grid's Tab stop `data-autofocus` (a popover focuses it on open). */
    autofocusDay: { type: Boolean, default: false },
    previousMonthLabel: { type: String, default: undefined },
    nextMonthLabel: { type: String, default: undefined },
  },
  emits: {
    "update:modelValue": (_value: SoneCalendarValue) => true,
    "update:month": (_month: string | null) => true,
    /** Every pick, with the day picked. */
    dateSelect: (_iso: string) => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel<SoneCalendarValue>(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const month = useModel<string | null>(
      () => props.month,
      (v) => emit("update:month", v),
    );
    const captionId = `sone-calendar-caption-${useId()}`;
    const root = ref<HTMLElement | null>(null);
    const clientToday = ref<string | null>(null);
    const focused = ref<string | null>(null);
    onMounted(() => (clientToday.value = todayIsoDate()));

    const locale = computed(() => props.locale ?? messages.value.dateLocale);
    const today = computed(() => props.today ?? clientToday.value);
    const shownMonth = computed(
      () =>
        isoMonth(month.value) ??
        calendarStartMonth(
          props.mode,
          value.value,
          today.value,
          props.min,
          props.max,
        ),
    );
    const tabStop = computed(() => {
      const shown = shownMonth.value;
      if (!shown) return null;
      const inMonth = (iso: string | null | undefined): iso is string =>
        !!iso && isoMonth(iso) === shown;
      if (inMonth(focused.value)) return focused.value;
      const picked = calendarDates(props.mode, value.value).find(inMonth);
      if (picked) return picked;
      if (inMonth(today.value)) return today.value;
      return `${shown}-01`;
    });

    const setMonth = (iso: string | null): void => {
      const next = isoMonth(iso);
      if (next !== month.value) month.set(next);
    };
    const go = (by: number): void => {
      const shown = shownMonth.value;
      if (shown) setMonth(addMonths(`${shown}-01`, by));
    };
    const pick = (iso: string, disabled: boolean): void => {
      if (disabled || props.disabled) return;
      setMonth(iso);
      focused.value = iso;
      value.set(calendarSelect(props.mode, value.value, iso));
      emit("dateSelect", iso);
    };
    const onKeydown = (event: KeyboardEvent): void => {
      const from = tabStop.value;
      if (!from || props.disabled) return;
      const target = calendarKeyTarget(event.key, from, {
        shiftKey: event.shiftKey,
        weekStartsOn: props.weekStartsOn,
        min: props.min,
        max: props.max,
        rtl: root.value?.closest("[dir]")?.getAttribute("dir") === "rtl",
      });
      if (target === null) return;
      event.preventDefault();
      focused.value = target;
      setMonth(target);
      void nextTick(() =>
        root.value
          ?.querySelector<HTMLElement>(`[data-iso="${target}"]`)
          ?.focus(),
      );
    };
    expose({ go });

    const navButton = (dir: "previous" | "next") => {
      const shown = shownMonth.value;
      const bound = isoMonth(dir === "previous" ? props.min : props.max);
      const can =
        !!shown &&
        (!bound || (dir === "previous" ? shown > bound : shown < bound));
      return h(
        "button",
        {
          type: "button",
          class: "calendar-nav btn",
          "data-slot": "button",
          "data-variant": "ghost",
          "data-size": "icon-sm",
          "data-nav": dir,
          "aria-label":
            dir === "previous"
              ? (props.previousMonthLabel ??
                messages.value.calendarPreviousMonth)
              : (props.nextMonthLabel ?? messages.value.calendarNextMonth),
          disabled: props.disabled || !can,
          onClick: () => go(dir === "previous" ? -1 : 1),
        },
        h(SoneIcon, {
          icon: dir === "previous" ? "chevron-left" : "chevron-right",
        }),
      );
    };

    return () => {
      const shown = shownMonth.value;
      const label = isoDateFormatter(locale.value, { dateStyle: "full" });
      const bounds = {
        min: props.min,
        max: props.max,
        disabled: props.disabledDate,
      };
      const weeks = shown
        ? monthMatrix(
            Number(shown.slice(0, 4)),
            Number(shown.slice(5, 7)),
            props.weekStartsOn,
          )
        : [];
      return h(
        "sone-calendar",
        {
          ref: root,
          class: "calendar",
          "data-slot": "calendar",
          "data-mode": props.mode,
          "data-disabled": flag(props.disabled),
        },
        [
          h(
            "div",
            { class: "calendar-header", "data-slot": "calendar-header" },
            [
              navButton("previous"),
              h(
                "div",
                {
                  class: "calendar-caption",
                  "data-slot": "calendar-caption",
                  "aria-live": "polite",
                  id: captionId,
                },
                shown ? calendarCaption(shown, locale.value) : "",
              ),
              navButton("next"),
            ],
          ),
          h(
            "table",
            {
              class: "calendar-grid",
              "data-slot": "calendar-grid",
              role: "grid",
              "aria-labelledby": props.ariaLabel ? undefined : captionId,
              "aria-label": props.ariaLabel ?? undefined,
              "aria-multiselectable":
                props.mode === "single" ? undefined : "true",
              "aria-disabled": props.disabled ? "true" : undefined,
              onKeydown,
            },
            [
              h(
                "thead",
                h(
                  "tr",
                  calendarWeekdays(locale.value, props.weekStartsOn).map((w) =>
                    h(
                      "th",
                      {
                        scope: "col",
                        class: "calendar-weekday",
                        "data-slot": "calendar-weekday",
                        abbr: w.long,
                      },
                      w.short,
                    ),
                  ),
                ),
              ),
              h(
                "tbody",
                weeks.map((week) =>
                  h(
                    "tr",
                    {
                      key: week[0]!.iso,
                      class: "calendar-week",
                      "data-slot": "calendar-week",
                    },
                    week.map((d) => {
                      const hidden = d.outside && !props.showOutsideDays;
                      const selected = isDateSelected(
                        props.mode,
                        value.value,
                        d.iso,
                      );
                      const disabled = isDateDisabled(d.iso, bounds);
                      return h(
                        "td",
                        {
                          key: d.iso,
                          role: "gridcell",
                          class: "calendar-cell",
                          "data-slot": "calendar-cell",
                          "aria-selected": hidden
                            ? undefined
                            : String(selected),
                          "data-range":
                            props.mode === "range"
                              ? (dateRangePart(value.value, d.iso) ?? undefined)
                              : undefined,
                        },
                        hidden
                          ? []
                          : [
                              h(
                                "button",
                                {
                                  type: "button",
                                  class: "calendar-day",
                                  "data-slot": "calendar-day",
                                  "data-iso": d.iso,
                                  "data-outside": flag(d.outside),
                                  "data-selected": flag(selected),
                                  "data-autofocus": flag(
                                    props.autofocusDay &&
                                      d.iso === tabStop.value,
                                  ),
                                  tabindex: d.iso === tabStop.value ? 0 : -1,
                                  "aria-label": label(d.iso),
                                  "aria-current":
                                    d.iso === today.value ? "date" : undefined,
                                  "aria-disabled": disabled
                                    ? "true"
                                    : undefined,
                                  disabled: props.disabled,
                                  onClick: () => pick(d.iso, disabled),
                                },
                                String(d.day),
                              ),
                            ],
                      );
                    }),
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    };
  },
});
