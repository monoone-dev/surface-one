import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  useId,
  type PropType,
} from "vue";

import {
  calendarSelect,
  datePickerLabelledBy,
  formatCalendarValue,
  isCalendarValueComplete,
  todayIsoDate,
  type SoneCalendarValue,
  type SoneWeekday,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { flag } from "../../utils/part";
import { SoneCalendar } from "../calendar";
import { SoneIcon } from "../icon";
import {
  SonePopover,
  SonePopoverContent,
  SonePopoverTrigger,
} from "../popover";

/** A date picker picks one date or a range. */
export type SoneDatePickerMode = "single" | "range";

/**
 * `<sone-date-picker>` — a field-like button that opens a calendar in a popover
 * (shadcn/ui Date Picker): `v-model` is "YYYY-MM-DD" (or `{ start, end }` with
 * `mode="range"`), shown through `Intl` in `locale`; `v-model:open`. The popover
 * closes on a pick (a whole range) and gives focus back to the button.
 */
export const SoneDatePicker = defineComponent({
  name: "SoneDatePicker",
  props: {
    /** One date (`single`, the default) or a range (`range`). */
    mode: { type: String as PropType<SoneDatePickerMode>, default: "single" },
    /** The picked date "YYYY-MM-DD" or `{ start, end }` (`range`) — `v-model`. */
    modelValue: {
      type: [String, Object] as PropType<SoneCalendarValue>,
      default: null,
    },
    /** The calendar is open — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** Shown while no date is picked (default: the messages' `datePickerPlaceholder`). */
    placeholder: { type: String, default: undefined },
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
    /** A BCP 47 tag for the shown date and the calendar (default: the messages' `dateLocale`). */
    locale: { type: String as PropType<string | null>, default: null },
    /** How the date is shown (`Intl.DateTimeFormat` options); a long date by default. */
    formatOptions: {
      type: Object as PropType<Intl.DateTimeFormatOptions>,
      default: () => ({ dateStyle: "long" }),
    },
    /** Today for the calendar, "YYYY-MM-DD" (default: the browser's, read once mounted). */
    today: { type: String as PropType<string | null>, default: null },
    /** Close the calendar once a date (or a whole range) is picked. */
    closeOnSelect: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    /** The button's `id`, for a `<label for>`. */
    triggerId: { type: String as PropType<string | null>, default: null },
    /** Names the picker when no `<label>` does: read with the date, "Due date: May 4, 2026". */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** Extra ids for the button's `aria-describedby` (a hint, an error). */
    ariaDescribedby: { type: String as PropType<string | null>, default: null },
    /** Names the calendar popover (default: the messages' `datePickerDialog`). */
    dialogLabel: { type: String, default: undefined },
  },
  emits: {
    "update:modelValue": (_value: SoneCalendarValue) => true,
    "update:open": (_open: boolean) => true,
    /** Every pick, with the day picked. */
    dateSelect: (_iso: string) => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel<SoneCalendarValue>(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const open = useModel<boolean>(
      () => props.open,
      (v) => emit("update:open", v),
    );
    const valueId = `sone-date-picker-value-${useId()}`;
    const root = ref<HTMLElement | null>(null);
    const popover = ref<{ close(restoreFocus?: boolean): void } | null>(null);
    const clientToday = ref<string | null>(null);
    const labelledBy = ref<string | null>(null);
    onMounted(() => {
      clientToday.value = todayIsoDate();
      labelledBy.value = datePickerLabelledBy(
        root.value?.querySelector<HTMLButtonElement>(".date-picker-trigger") ??
          null,
        valueId,
      );
    });

    const locale = computed(() => props.locale ?? messages.value.dateLocale);
    const display = computed(() =>
      formatCalendarValue(
        props.mode,
        value.value,
        locale.value,
        props.formatOptions,
      ),
    );
    const close = (restoreFocus = false): void =>
      popover.value?.close(restoreFocus);
    expose({ close });

    // The calendar applies the same pick to the same value (calendarSelect).
    const onPick = (iso: string): void => {
      const next = calendarSelect(props.mode, value.value, iso);
      value.set(next);
      emit("dateSelect", iso);
      if (props.closeOnSelect && isCalendarValueComplete(props.mode, next))
        close(true);
    };

    return () => {
      const text =
        display.value ||
        (props.placeholder ?? messages.value.datePickerPlaceholder);
      const name = props.ariaLabel ? `${props.ariaLabel}: ${text}` : undefined;
      return h(
        "sone-date-picker",
        {
          ref: root,
          class: "date-picker",
          "data-slot": "date-picker",
          "data-mode": props.mode,
        },
        h(
          SonePopover,
          {
            ref: popover,
            open: open.value,
            "onUpdate:open": (v: boolean) => {
              if (v !== open.value) open.set(v);
            },
          },
          {
            default: () => [
              h(
                SonePopoverTrigger,
                {
                  class: "btn date-picker-trigger",
                  "data-slot": "button",
                  "data-variant": "outline",
                  "data-size": "default",
                  id: props.triggerId ?? undefined,
                  "aria-label": name,
                  "aria-labelledby": name
                    ? undefined
                    : (labelledBy.value ?? undefined),
                  "aria-describedby": props.ariaDescribedby ?? undefined,
                  "aria-invalid": props.invalid ? "true" : undefined,
                  "data-empty": flag(!display.value),
                  disabled: props.disabled,
                },
                {
                  default: () => [
                    h(SoneIcon, { icon: "calendar" }),
                    h(
                      "span",
                      {
                        class: "date-picker-value",
                        "data-slot": "date-picker-value",
                        id: valueId,
                      },
                      text,
                    ),
                  ],
                },
              ),
              h(
                SonePopoverContent,
                {
                  class: "date-picker-content",
                  "aria-label":
                    props.dialogLabel ?? messages.value.datePickerDialog,
                },
                {
                  default: () =>
                    h(SoneCalendar, {
                      autofocusDay: true,
                      mode: props.mode,
                      modelValue: value.value,
                      min: props.min,
                      max: props.max,
                      disabledDate: props.disabledDate,
                      weekStartsOn: props.weekStartsOn,
                      locale: locale.value,
                      today: props.today ?? clientToday.value,
                      onDateSelect: onPick,
                    }),
                },
              ),
            ],
          },
        ),
      );
    };
  },
});
