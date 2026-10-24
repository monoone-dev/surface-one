import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneValueAccessor, soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  type SoneCalendarMode,
  type SoneCalendarValue,
  type SoneWeekday,
  addMonths,
  calendarCaption,
  calendarDates,
  calendarKeyTarget,
  calendarSelect,
  calendarStartMonth,
  calendarWeekdays,
  dateRangePart,
  emptyCalendarValue,
  isDateDisabled,
  isDateSelected,
  isoDateFormatter,
  isoMonth,
  monthMatrix,
  todayIsoDate,
} from "./calendar-grid";

/** One rendered day of `sone-calendar`. */
export interface SoneCalendarCell {
  readonly iso: string;
  readonly day: number;
  readonly outside: boolean;
  readonly hidden: boolean;
  readonly selected: boolean;
  readonly range: "start" | "end" | "middle" | "single" | null;
  readonly disabled: boolean;
  readonly today: boolean;
  readonly tabStop: boolean;
  readonly label: string;
}

const weekStart = (v: unknown): SoneWeekday =>
  (((Math.trunc(numberAttribute(v, 0)) % 7) + 7) % 7) as SoneWeekday;

/**
 * `<sone-calendar>` — a month grid to pick a date, a range or several dates (spartan/ui
 * and shadcn/ui Calendar). The grid follows the WAI-ARIA date picker pattern: one Tab
 * stop, the arrow keys move a day or a week, Home / End to the week's ends, PageUp /
 * PageDown a month and, with Shift, a year; Enter or Space picks. Dates are ISO
 * strings ("YYYY-MM-DD"); month and weekday names come from `Intl` in `locale`.
 */
@Component({
  selector: "sone-calendar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  templateUrl: "./calendar.component.html",
  host: {
    class: "calendar",
    "data-slot": "calendar",
    "[attr.data-mode]": "mode()",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneCalendarComponent),
      multi: true,
    },
  ],
})
export class SoneCalendarComponent extends SoneValueAccessor<SoneCalendarValue> {
  /** What a pick does: take one date, close a range, or toggle a date of a list. */
  readonly mode = input<SoneCalendarMode>("single");
  /**
   * The picked date(s) — `[(value)]`: "YYYY-MM-DD" or `null` (`single`), a list
   * (`multiple`) or `{ start, end }` (`range`).
   */
  readonly value = model<SoneCalendarValue>(null);
  /** The month shown, "YYYY-MM" — `[(month)]`. Default: the picked date's, else today's. */
  readonly month = model<string | null>(null);
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  /** Refuses more dates: `(iso) => true` disables that day. */
  readonly disabledDate = input<((iso: string) => boolean) | null>(null);
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  readonly weekStartsOn = input<SoneWeekday, unknown>(0, {
    transform: weekStart,
  });
  /** A BCP 47 tag for the month and weekday names (default: the app's `LOCALE_ID`). */
  readonly locale = input<string | null>(null);
  /**
   * Today, "YYYY-MM-DD". Default: the browser's date, read after the first render so
   * a prerendered page hydrates without a mismatch.
   */
  readonly today = input<string | null>(null);
  /** Shows the neighbour months' days that pad the first and last week. */
  readonly showOutsideDays = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Names the grid; by default the month caption does. */
  readonly ariaLabel = input<string | null>(null);
  /** Marks the grid's Tab stop `data-autofocus` (a popover focuses it on open). */
  readonly autofocusDay = input(false, { transform: booleanAttribute });
  readonly previousMonthLabel = input(
    $localize`:Calendar previous month button:Previous month`,
  );
  readonly nextMonthLabel = input(
    $localize`:Calendar next month button:Next month`,
  );
  /** Fires on every pick, with the day picked. */
  readonly dateSelect = output<string>();

  protected readonly captionId = soneId("sone-calendar-caption");
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly appLocale = inject(LOCALE_ID);
  private readonly clientToday = signal<string | null>(null);
  /** The roving Tab stop's date, once the user moved it. */
  private readonly focused = signal<string | null>(null);

  constructor() {
    super();
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      afterNextRender(() => this.clientToday.set(todayIsoDate()));
    }
  }

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? this.appLocale,
  );
  protected readonly todayIso = computed(
    () => this.today() ?? this.clientToday(),
  );

  /** The month on show, "YYYY-MM" — `null` on the server with no date to go by. */
  readonly shownMonth = computed(
    () =>
      isoMonth(this.month()) ??
      calendarStartMonth(
        this.mode(),
        this.value(),
        this.todayIso(),
        this.min(),
        this.max(),
      ),
  );

  protected readonly caption = computed(() => {
    const month = this.shownMonth();
    return month ? calendarCaption(month, this.resolvedLocale()) : "";
  });

  protected readonly weekdays = computed(() =>
    calendarWeekdays(this.resolvedLocale(), this.weekStartsOn()),
  );

  protected readonly canGoPrevious = computed(() => {
    const month = this.shownMonth();
    const min = isoMonth(this.min());
    return !!month && (!min || month > min);
  });

  protected readonly canGoNext = computed(() => {
    const month = this.shownMonth();
    const max = isoMonth(this.max());
    return !!month && (!max || month < max);
  });

  private readonly bounds = computed(() => ({
    min: this.min(),
    max: this.max(),
    disabled: this.disabledDate(),
  }));

  /** The grid's Tab stop: the moved-to day, else a picked day, today or the 1st of the month. */
  private readonly tabStop = computed(() => {
    const month = this.shownMonth();
    if (!month) return null;
    const inMonth = (iso: string | null | undefined): iso is string =>
      !!iso && isoMonth(iso) === month;
    const focused = this.focused();
    if (inMonth(focused)) return focused;
    const picked = calendarDates(this.mode(), this.value()).find(inMonth);
    if (picked) return picked;
    const today = this.todayIso();
    if (inMonth(today)) return today;
    return `${month}-01`;
  });

  /** The weeks of the month on show, every day with its state. */
  readonly weeks = computed<SoneCalendarCell[][]>(() => {
    const month = this.shownMonth();
    if (!month) return [];
    const [year, m] = month.split("-").map(Number);
    const mode = this.mode();
    const value = this.value();
    const bounds = this.bounds();
    const today = this.todayIso();
    const tabStop = this.tabStop();
    const showOutside = this.showOutsideDays();
    const label = isoDateFormatter(this.resolvedLocale(), {
      dateStyle: "full",
    });
    return monthMatrix(year, m, this.weekStartsOn()).map((week) =>
      week.map((d) => ({
        ...d,
        hidden: d.outside && !showOutside,
        selected: isDateSelected(mode, value, d.iso),
        range: mode === "range" ? dateRangePart(value, d.iso) : null,
        disabled: isDateDisabled(d.iso, bounds),
        today: d.iso === today,
        tabStop: d.iso === tabStop,
        label: label(d.iso),
      })),
    );
  });

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(
      (v as SoneCalendarValue | undefined) ?? emptyCalendarValue(this.mode()),
    );
  }

  /** Shows the previous (`-1`) or next (`1`) month. */
  go(by: number): void {
    const month = this.shownMonth();
    if (!month) return;
    this.month.set(isoMonth(addMonths(`${month}-01`, by)));
  }

  protected pick(cell: SoneCalendarCell): void {
    if (cell.disabled || this.isDisabled()) return;
    // Keep the month on show (or move to the padding day's) whatever the value becomes.
    this.month.set(isoMonth(cell.iso));
    this.focused.set(cell.iso);
    const next = calendarSelect(this.mode(), this.value(), cell.iso);
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    this.dateSelect.emit(cell.iso);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const from = this.tabStop();
    if (!from || this.isDisabled()) return;
    const target = calendarKeyTarget(event.key, from, {
      shiftKey: event.shiftKey,
      weekStartsOn: this.weekStartsOn(),
      min: this.min(),
      max: this.max(),
      rtl: this.host.closest("[dir]")?.getAttribute("dir") === "rtl",
    });
    if (target === null) return;
    event.preventDefault();
    this.focused.set(target);
    this.month.set(isoMonth(target));
    afterNextRender(
      () =>
        this.host.querySelector<HTMLElement>(`[data-iso="${target}"]`)?.focus(),
      { injector: this.injector },
    );
  }
}
