import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import {
  type SoneCommandFilter,
  SoneValueAccessor,
  listNavigationIndex,
  soneCommandFilter,
  soneId,
} from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  type SoneOverlayContent,
  SoneOverlayTriggerBase,
} from "@surface-one/angular/popover";

import {
  type SoneComboboxItems,
  type SoneComboboxOption,
  type SoneComboboxValue,
  comboboxActiveOption,
  comboboxLabelIds,
  comboboxNavigate,
  comboboxOptionId,
  comboboxOptions,
  comboboxSelectedOptions,
  comboboxToggle,
  filterComboboxItems,
  isComboboxSelected,
} from "./combobox-options";

/** What the input needs from its combobox. */
abstract class SoneComboboxHost {
  abstract readonly control: () => HTMLElement;
  abstract handleKeydown(event: KeyboardEvent): boolean;
  abstract onPopupAttached(panel: HTMLElement | null): void;
  abstract onPopupClosed(): void;
}

/**
 * `input[soneComboboxInput]` — the combobox's text field and the trigger of its
 * listbox popup, on the popover family's overlay (`SoneOverlayTriggerBase`): the popup
 * renders on `<body>` next to the whole control, closes on Escape and on a click
 * outside, and focus never leaves the input. Used by `sone-combobox`.
 */
@Directive({
  selector: "input[soneComboboxInput]",
  exportAs: "soneComboboxInput",
})
export class SoneComboboxInputDirective extends SoneOverlayTriggerBase {
  readonly content = input<SoneOverlayContent | null>(null, {
    alias: "soneComboboxInput",
  });
  protected readonly haspopup = "listbox";
  private readonly combobox = inject(SoneComboboxHost);

  protected override anchorElement(): HTMLElement {
    return this.combobox.control();
  }

  /** A click opens the popup (it never toggles it shut while typing). */
  protected override onTriggerClick(): void {
    if (!this.open()) this.open.set(true);
  }

  protected override onTriggerKeydown(event: KeyboardEvent): void {
    if (this.combobox.handleKeydown(event)) return;
    super.onTriggerKeydown(event);
  }

  /** Focus stays in the input: the highlight is `aria-activedescendant`. */
  protected focusPanel(): void {}

  protected override onAttach(panel: HTMLElement | null): void {
    if (panel) panel.style.minWidth = `${this.anchorElement().offsetWidth}px`;
    this.combobox.onPopupAttached(panel);
  }

  protected override onDetach(): void {
    this.combobox.onPopupClosed();
  }
}

/**
 * `<sone-combobox>` — a text field that filters a listbox of options as you type
 * (shadcn/ui Combobox, spartan/ui Autocomplete; the WAI-ARIA combobox pattern). Up /
 * Down, Home / End and PageUp / PageDown move the highlight (`aria-activedescendant`),
 * Enter picks, Escape closes. `options` holds `{ value, label, disabled, keywords }` or
 * labelled groups of them; `[(value)]` is one value or, with `multiple`, a list shown
 * as removable chips (Backspace removes the last). `[(search)]` is the typed text.
 */
@Component({
  selector: "sone-combobox",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneComboboxInputDirective, SoneIconComponent],
  templateUrl: "./combobox.component.html",
  host: {
    class: "combobox",
    "data-slot": "combobox",
    "[attr.data-multiple]": "multiple() ? '' : null",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.data-invalid]": "invalid() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneComboboxComponent),
      multi: true,
    },
    {
      provide: SoneComboboxHost,
      useExisting: forwardRef(() => SoneComboboxComponent),
    },
  ],
})
export class SoneComboboxComponent
  extends SoneValueAccessor<SoneComboboxValue>
  implements SoneComboboxHost
{
  /** The options: `{ value, label, disabled?, keywords? }`, or `{ label, options }` groups. */
  readonly options = input<SoneComboboxItems>([]);
  /** Pick several options, shown as chips; `value` is then a list. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** The picked value (`null` while none), or a list with `multiple` — `[(value)]`. */
  readonly value = model<SoneComboboxValue>(null);
  /** The typed text — `[(search)]`; it clears when the popup closes. */
  readonly search = model("");
  /** The popup is open — `[(open)]`. */
  readonly open = model(false);
  /** Filter the options by `search`. Turn off when the options come filtered from a server. */
  readonly shouldFilter = input(true, { transform: booleanAttribute });
  /** A custom match function (default `soneCommandFilter`: every word, accent-insensitive). */
  readonly filter = input<SoneCommandFilter>(soneCommandFilter);
  readonly placeholder = input("");
  /** Shown in the popup when no option matches. */
  readonly emptyText = input(
    $localize`:Combobox empty state:No results found.`,
  );
  /** A clear button while something is picked. */
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** The input's `id`, for a `<label for>`. */
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);
  /** Names the input when no `<label>` does. */
  readonly ariaLabel = input<string | null>(null);
  /** Extra ids for the input's `aria-describedby`. */
  readonly ariaDescribedby = input<string | null>(null);
  readonly clearLabel = input(
    $localize`:Combobox clear button:Clear selection`,
  );

  protected readonly listId = soneId("sone-combobox-list");
  private readonly controlEl =
    viewChild.required<ElementRef<HTMLElement>>("control");
  private readonly inputEl =
    viewChild.required<ElementRef<HTMLInputElement>>("field");
  private readonly trigger = viewChild.required(SoneComboboxInputDirective);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injector = inject(Injector);
  /** The user typed since the popup opened: the field shows `search`, not the picked label. */
  private readonly editing = signal(false);
  private readonly active = signal<string | null>(null);
  protected readonly listLabelledBy = signal<string | null>(null);

  readonly control = (): HTMLElement => this.controlEl().nativeElement;

  constructor() {
    super();
    if (this.browser) {
      afterNextRender(() =>
        this.listLabelledBy.set(
          comboboxLabelIds(this.inputEl().nativeElement, this.listId),
        ),
      );
      // The list grew or shrank: re-place the popup (it may sit above the field).
      effect(() => {
        this.sections();
        if (!untracked(this.open)) return;
        afterNextRender(() => this.trigger().reposition(), {
          injector: this.injector,
        });
      });
    }
  }

  /** Every option, in order (their index names their DOM id). */
  private readonly allOptions = computed(() => comboboxOptions(this.options()));

  /** The options left by the search, in their groups. */
  readonly sections = computed(() =>
    filterComboboxItems(
      this.options(),
      this.editing() && this.shouldFilter() ? this.search() : "",
      this.filter(),
    ),
  );
  private readonly visible = computed(() =>
    this.sections().flatMap((s) => s.options),
  );
  /** The highlighted option. */
  readonly activeOption = computed(() =>
    comboboxActiveOption(this.visible(), this.active(), this.value()),
  );
  /** The picked options, in the value's order. */
  readonly selectedOptions = computed(() =>
    comboboxSelectedOptions(this.options(), this.value()),
  );
  protected readonly hasValue = computed(
    () => this.selectedOptions().length > 0,
  );
  protected readonly inputText = computed(() => {
    if (this.editing() || this.multiple()) return this.search();
    return this.selectedOptions()[0]?.label ?? "";
  });
  protected readonly shownPlaceholder = computed(() =>
    this.multiple() && this.hasValue() ? "" : this.placeholder(),
  );
  protected readonly activeId = computed(() => {
    const active = this.activeOption();
    return this.open() && active ? this.optionId(active) : null;
  });

  protected optionId(option: SoneComboboxOption): string {
    return comboboxOptionId(
      this.listId,
      this.allOptions().findIndex((o) => o.value === option.value),
    );
  }

  protected groupId(index: number): string {
    return `${this.listId}-group-${index}`;
  }

  protected isSelected(option: SoneComboboxOption): boolean {
    return isComboboxSelected(this.value(), option.value);
  }

  protected removeLabel(label: string): string {
    return $localize`Remove ${label}:tag:`;
  }

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(
      (v as SoneComboboxValue | undefined) ?? (this.multiple() ? [] : null),
    );
  }

  private commit(next: SoneComboboxValue): void {
    this.value.set(next);
    this.onChange(next);
  }

  /** Picks `option` (toggles it with `multiple`); a single pick closes the popup. */
  choose(option: SoneComboboxOption): void {
    if (option.disabled || this.isDisabled()) return;
    this.commit(comboboxToggle(this.value(), option.value, this.multiple()));
    this.active.set(option.value);
    if (this.multiple()) {
      this.search.set("");
      this.editing.set(false);
    } else {
      this.trigger().close(false);
    }
  }

  /** Removes one picked value (a chip). */
  remove(value: string): void {
    if (this.isDisabled()) return;
    const current = this.value();
    this.commit(
      Array.isArray(current)
        ? current.filter((v) => v !== value)
        : current === value
          ? null
          : current,
    );
  }

  /** Clears the value and the search. */
  clear(): void {
    this.commit(this.multiple() ? [] : null);
    this.search.set("");
    this.editing.set(false);
    this.inputEl().nativeElement.focus();
  }

  protected highlight(option: SoneComboboxOption): void {
    if (!option.disabled) this.active.set(option.value);
  }

  protected onInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.editing.set(true);
    this.active.set(null);
    this.open.set(true);
  }

  protected onBlur(): void {
    this.onTouched();
    if (this.open()) this.trigger().close(false);
  }

  /** Mousedown on the frame (not on the input or a button) focuses the input. */
  protected onControlMousedown(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (target === this.inputEl().nativeElement) return;
    event.preventDefault();
    if (!this.isDisabled()) this.inputEl().nativeElement.focus();
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    this.inputEl().nativeElement.focus();
    if (this.open()) this.trigger().close(false);
    else this.open.set(true);
  }

  /** @internal The combobox keys; `true` when handled (the overlay's own handling is skipped). */
  handleKeydown(event: KeyboardEvent): boolean {
    if (event.isComposing || this.isDisabled()) return false;
    const open = this.open();
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        if (!open) {
          event.preventDefault();
          if (!event.altKey && event.key === "ArrowUp") {
            const enabled = this.visible().filter((o) => !o.disabled);
            this.active.set(enabled[enabled.length - 1]?.value ?? null);
          }
          this.open.set(true);
          return true;
        }
        break;
      case "Enter": {
        const active = this.activeOption();
        if (!open || !active) return false;
        event.preventDefault();
        this.choose(active);
        return true;
      }
      case "Backspace": {
        const picked = this.selectedOptions();
        if (this.multiple() && !this.search() && picked.length) {
          event.preventDefault();
          this.remove(picked[picked.length - 1]!.value);
          return true;
        }
        return false;
      }
    }
    if (!open) return false;
    const next = comboboxNavigate(
      event.key,
      this.activeOption()?.value ?? null,
      this.visible(),
      (key, current, count) =>
        listNavigationIndex(key, current, count, { wrap: true }),
    );
    if (next === null) return false;
    event.preventDefault();
    this.active.set(next);
    this.scrollActiveIntoView();
    return true;
  }

  private scrollActiveIntoView(): void {
    if (!this.browser) return;
    afterNextRender(
      () => {
        const id = this.activeId();
        if (id)
          this.inputEl()
            .nativeElement.ownerDocument.getElementById(id)
            ?.scrollIntoView?.({ block: "nearest" });
      },
      { injector: this.injector },
    );
  }

  /** @internal */
  onPopupAttached(panel: HTMLElement | null): void {
    panel
      ?.querySelector("[data-highlighted]")
      ?.scrollIntoView?.({ block: "nearest" });
  }

  /** @internal The popup closed: the field shows the picked label again. */
  onPopupClosed(): void {
    this.editing.set(false);
    this.active.set(null);
    if (this.search()) this.search.set("");
  }
}
