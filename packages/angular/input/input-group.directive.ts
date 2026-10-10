import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";

export type InputGroupAddonAlign =
  "inline-start" | "inline-end" | "block-start" | "block-end";

@Directive({
  selector: "[soneInputGroup]",
  host: {
    // A <form> host (the chat composer) keeps its implicit form role.
    "[attr.role]": "isForm ? null : 'group'",
    "data-slot": "input-group",
    "[attr.data-invalid]": "invalid() ? 'true' : null",
    "[attr.data-disabled]": "disabled() ? 'true' : null",
    "[attr.data-fill]": "fill() ? '' : null",
  },
})
export class SoneInputGroupDirective {
  protected readonly isForm =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName ===
    "FORM";
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Take the free space of a flex row (`flex: 1`, may shrink) — a search box beside buttons. */
  readonly fill = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "[soneInputGroupAddon]",
  host: {
    role: "group",
    "data-slot": "input-group-addon",
    "[attr.data-align]": "align()",
    "(click)": "focusControl($event)",
  },
})
export class SoneInputGroupAddonDirective {
  readonly align = input<InputGroupAddonAlign>("inline-start");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  focusControl(e: MouseEvent): void {
    const target = e.target as Element | null;
    if (target?.closest("button, a, input, select, textarea, [tabindex]")) {
      return;
    }
    const group = this.host.nativeElement.closest('[data-slot="input-group"]');
    const control = group?.querySelector<HTMLElement>(
      'input[data-slot="input-group-control"], textarea[data-slot="input-group-control"], ' +
        '[data-slot="input-group-control"] input',
    );
    control?.focus();
  }
}

@Directive({
  selector: "input[soneInputGroupInput], textarea[soneInputGroupTextarea]",
  host: { "data-slot": "input-group-control" },
})
export class SoneInputGroupControlDirective {}

@Directive({
  selector: "[soneInputGroupText]",
  host: { "data-slot": "input-group-text" },
})
export class SoneInputGroupTextDirective {}

export const SONE_INPUT_GROUP_PARTS = [
  SoneInputGroupDirective,
  SoneInputGroupAddonDirective,
  SoneInputGroupControlDirective,
  SoneInputGroupTextDirective,
] as const;
