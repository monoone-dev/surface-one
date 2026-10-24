import {
  Directive,
  HostAttributeToken,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor, soneId } from "@surface-one/angular/core";

export type RadioGroupOrientation = "vertical" | "horizontal";

/**
 * `[soneRadioGroup]` — a set of native radios with one value (spartan/ui RadioGroup,
 * native first): put it on a `fieldset` (with a `legend`) or a `div` (with an
 * `aria-label`). It shares one `name` between its `input[soneRadio]`s, so the browser
 * keeps the arrow keys and the single Tab stop, and holds the value — `[(value)]`,
 * `ngModel` or `formControl`.
 */
@Directive({
  selector: "[soneRadioGroup]",
  exportAs: "soneRadioGroup",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneRadioGroupDirective),
      multi: true,
    },
  ],
  host: {
    role: "radiogroup",
    class: "radio-group",
    "data-slot": "radio-group",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
    "[attr.aria-required]": "required() ? 'true' : null",
  },
})
export class SoneRadioGroupDirective extends SoneValueAccessor<string | null> {
  /** The value of the checked radio, `null` while none is — `[(value)]`. */
  readonly value = model<string | null>(null);
  /** The `name` every radio of the group shares; unique by default. */
  readonly name = input<string>(soneId("sone-radio-group"));
  /** Disables every radio of the group. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** One of the radios must be checked (the native `required`). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Lays the radios out in a column or a row. */
  readonly orientation = input<RadioGroupOrientation>("vertical");

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(value: unknown): void {
    this.value.set(
      value === null || value === undefined ? null : String(value),
    );
  }

  /** @internal A radio of the group was checked. */
  select(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** @internal A radio of the group lost focus. */
  touch(): void {
    this.onTouched();
  }
}

/**
 * `input[soneRadio]` — one native radio of a `[soneRadioGroup]`: it takes the group's
 * `name`, is checked while its `value` is the group's, and checks it when picked. Pair it
 * with a label through `[soneField] orientation="horizontal"` + `label[soneFieldLabel]`.
 */
@Directive({
  selector: "input[soneRadio]",
  exportAs: "soneRadio",
  host: {
    type: "radio",
    "data-slot": "radio",
    "[attr.name]": "name()",
    "[attr.value]": "value()",
    "[checked]": "checked()",
    "[disabled]": "isDisabled()",
    "[required]": "group?.required() ?? false",
    "(change)": "onChange()",
    "(blur)": "group?.touch()",
  },
})
export class SoneRadioDirective {
  /** What the group's value becomes when this radio is checked. */
  readonly value = input.required<string>();
  /** Disables this radio alone. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(SoneRadioGroupDirective, {
    optional: true,
  });
  private readonly authoredName = inject(new HostAttributeToken("name"), {
    optional: true,
  });
  private readonly authoredChecked =
    inject(new HostAttributeToken("checked"), { optional: true }) !== null;

  protected readonly name = computed(
    () => this.group?.name() ?? this.authoredName,
  );
  /** Checked while the group's value is this radio's (outside a group: as authored). */
  readonly checked = computed(() =>
    this.group ? this.group.value() === this.value() : this.authoredChecked,
  );
  readonly isDisabled = computed(
    () => this.disabled() || !!this.group?.isDisabled(),
  );

  protected onChange(): void {
    this.group?.select(this.value());
  }
}

export const SONE_RADIO_GROUP_PARTS = [
  SoneRadioGroupDirective,
  SoneRadioDirective,
] as const;
