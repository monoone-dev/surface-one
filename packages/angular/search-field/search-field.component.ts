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
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_INPUT_GROUP_PARTS,
  type InputGroupVariant,
} from "@surface-one/angular/input";

export type SearchFieldSize = "sm" | "default";
/** `default`: a bordered field. `filled`: a grey fill and no border, the field colour on focus. */
export type SearchFieldVariant = InputGroupVariant;

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
export class SoneSearchFieldComponent extends SoneValueAccessor<string> {
  /** The search text (`[(value)]`). */
  readonly value = model("");

  readonly size = input<SearchFieldSize>("default");
  /**
   * `filled`: a grey fill and no border (Isles' search box); it takes the field colour on
   * focus and keeps the focus ring. The search glyph and the placeholder identify it in
   * place of a 3:1 border.
   */
  readonly variant = input<SearchFieldVariant>("default");
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

  protected readonly showClear = computed(
    () => this.clearable() && this.value() !== "" && !this.isDisabled(),
  );

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(v == null ? "" : String(v));
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

  /**
   * Writes the field too, not only the model: when Escape lands before change detection
   * rendered the last keystroke, the `[value]` binding still holds the old model value,
   * so setting the model back to it would change nothing on screen.
   */
  private commit(v: string): void {
    const field = this.field().nativeElement;
    if (field.value !== v) field.value = v;
    this.value.set(v);
    this.onChange(v);
  }
}
