import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
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
  viewChild,
  type ElementRef,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SoneCalendarComponent,
  type SoneCalendarValue,
  type SoneWeekday,
  formatCalendarValue,
  isCalendarValueComplete,
  todayIsoDate,
} from "@surface-one/angular/calendar";
import { SoneValueAccessor, soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SonePopoverDirective,
  SonePopoverTriggerDirective,
} from "@surface-one/angular/popover";

import { datePickerLabelledBy } from "./date-picker-label";

/** A date picker picks one date or a range. */
export type SoneDatePickerMode = "single" | "range";

const weekStart = (v: unknown): SoneWeekday =>
  (((Math.trunc(numberAttribute(v, 0)) % 7) + 7) % 7) as SoneWeekday;

/**
 * `<sone-date-picker>` — a field-like button that opens a calendar in a popover
 * (shadcn/ui Date Picker): `[(value)]` is "YYYY-MM-DD" (or `{ start, end }` with
 * `mode="range"`), shown through `Intl` in `locale`. The popover closes on a pick (a
 * whole range) and gives focus back to the button; it is also a form control.
 */
@Component({
  selector: "sone-date-picker",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneButtonDirective,
    SoneCalendarComponent,
    SoneIconComponent,
    SonePopoverDirective,
    SonePopoverTriggerDirective,
  ],
  templateUrl: "./date-picker.component.html",
  host: {
    class: "date-picker",
    "data-slot": "date-picker",
    "[attr.data-mode]": "mode()",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneDatePickerComponent),
      multi: true,
    },
  ],
})
export class SoneDatePickerComponent extends SoneValueAccessor<SoneCalendarValue> {
  /** One date (`single`, the default) or a range (`range`). */
  readonly mode = input<SoneDatePickerMode>("single");
  /** The picked date "YYYY-MM-DD" or `{ start, end }` (`range`) — `[(value)]`. */
  readonly value = model<SoneCalendarValue>(null);
  /** The calendar is open — `[(open)]`. */
  readonly open = model(false);
  /** Shown while no date is picked. */
  readonly placeholder = input($localize`:Date picker placeholder:Pick a date`);
  /** The earliest and latest date that can be picked ("YYYY-MM-DD"). */
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  /** Refuses more dates: `(iso) => true` disables that day. */
  readonly disabledDate = input<((iso: string) => boolean) | null>(null);
  /** The first day of the week: 0 = Sunday (the default) … 6 = Saturday. */
  readonly weekStartsOn = input<SoneWeekday, unknown>(0, {
    transform: weekStart,
  });
  /** A BCP 47 tag for the shown date and the calendar (default: the app's `LOCALE_ID`). */
  readonly locale = input<string | null>(null);
  /** How the date is shown (`Intl.DateTimeFormat` options); a long date by default. */
  readonly formatOptions = input<Intl.DateTimeFormatOptions>({
    dateStyle: "long",
  });
  /** Today for the calendar, "YYYY-MM-DD" (default: the browser's, read after render). */
  readonly today = input<string | null>(null);
  /** Close the calendar once a date (or a whole range) is picked. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** The button's `id`, for a `<label for>`. */
  readonly triggerId = input<string | null>(null);
  /** Names the picker when no `<label>` does: read with the date, "Due date: May 4, 2026". */
  readonly ariaLabel = input<string | null>(null);
  /** Extra ids for the button's `aria-describedby` (a hint, an error). */
  readonly ariaDescribedby = input<string | null>(null);
  /** Names the calendar popover. */
  readonly dialogLabel = input($localize`:Date picker dialog:Choose a date`);
  /** Fires on every pick, with the day picked. */
  readonly dateSelect = output<string>();

  protected readonly valueId = soneId("sone-date-picker-value");
  private readonly appLocale = inject(LOCALE_ID);
  private readonly trigger = viewChild.required(SonePopoverTriggerDirective);
  private readonly button =
    viewChild.required<ElementRef<HTMLButtonElement>>("button");
  protected readonly labelledBy = signal<string | null>(null);
  /** The browser's date, read after the first render (the calendar opens on it at once). */
  protected readonly clientToday = signal<string | null>(null);

  constructor() {
    super();
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      afterNextRender(() => {
        this.clientToday.set(todayIsoDate());
        this.labelledBy.set(
          datePickerLabelledBy(this.button().nativeElement, this.valueId),
        );
      });
    }
  }

  protected readonly resolvedLocale = computed(
    () => this.locale() ?? this.appLocale,
  );
  /** The picked date as text, empty while none is. */
  readonly display = computed(() =>
    formatCalendarValue(
      this.mode(),
      this.value(),
      this.resolvedLocale(),
      this.formatOptions(),
    ),
  );
  protected readonly name = computed(() => {
    const label = this.ariaLabel();
    return label ? `${label}: ${this.display() || this.placeholder()}` : null;
  });

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set((v as SoneCalendarValue | undefined) ?? null);
  }

  /** Closes the calendar; with `restoreFocus`, focus goes back to the button. */
  close(restoreFocus = false): void {
    this.trigger().close(restoreFocus);
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.onTouched();
  }

  protected onPick(value: SoneCalendarValue, iso: string): void {
    this.value.set(value);
    this.onChange(value);
    this.dateSelect.emit(iso);
    if (this.closeOnSelect() && isCalendarValueComplete(this.mode(), value)) {
      this.close(true);
    }
  }
}
