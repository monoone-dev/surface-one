import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";

export type SearchFieldSize = "sm" | "default";

/**
 * `<sone-search-field>` — a search box on the Input Group: a leading search glyph,
 * the field (`role="searchbox"`) and, when `clearable` and not empty, a clear
 * button at the end. A form control (ControlValueAccessor) or `[(value)]`.
 *
 * Enter emits `(submit)` with the current text. Escape clears a `clearable` field
 * that has text; on an empty (or non-clearable) field it emits `(escape)` — close
 * the panel that holds it there. `focus()` focuses the field.
 */
@Component({
  selector: "sone-search-field",
  exportAs: "soneSearchField",
  imports: [SoneButtonDirective, SoneIconComponent, SONE_INPUT_GROUP_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./search-field.component.html",
  styleUrl: "./search-field.component.scss",
  host: {
    "data-slot": "search-field",
    "[attr.data-size]": "size()",
    // `ariaLabel` is an input here, not the host's own name.
    "[attr.aria-label]": "null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneSearchFieldComponent),
      multi: true,
    },
  ],
})
export class SoneSearchFieldComponent implements ControlValueAccessor {
  /** The search text (`[(value)]`). */
  readonly value = model("");

  readonly size = input<SearchFieldSize>("default");
  readonly placeholder = input($localize`Search`);
  /** The field's accessible name. */
  readonly ariaLabel = input<string | null>($localize`Search`);
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);
  /** Shows a clear button while the field has text; Escape clears it too. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** The clear button's accessible name. */
  readonly clearLabel = input($localize`Clear search`);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Enter was pressed; carries the current text. */
  readonly submit = output<string>();
  /** Escape was pressed on an empty or non-clearable field. */
  readonly escape = output<void>();

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  protected readonly showClear = computed(
    () => this.clearable() && this.value() !== "" && !this.isDisabled(),
  );

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    this.value.set(v == null ? "" : String(v));
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  /** Focuses the field. */
  focus(): void {
    this.field().nativeElement.focus();
  }

  /** Empties the field (as the clear button does) and focuses it. */
  clear(): void {
    this.commit("");
    this.focus();
  }

  protected onInput(e: Event): void {
    this.commit((e.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      this.submit.emit(this.value());
    } else if (e.key === "Escape") {
      if (this.clearable() && this.value() !== "") {
        e.preventDefault();
        e.stopPropagation();
        this.commit("");
      } else {
        this.escape.emit();
      }
    }
  }

  private commit(v: string): void {
    this.value.set(v);
    this.onChange(v);
  }
}
