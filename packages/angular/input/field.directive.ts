import {
  DestroyRef,
  Directive,
  ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

let nextFieldPartId = 0;

const CONTROL_SELECTOR =
  '[data-slot="input-group-control"] input, input[data-slot="input-group-control"], ' +
  'textarea[data-slot="input-group-control"], input:not([type="hidden"]), select, textarea';

@Directive({
  selector: "[soneField]",
  host: {
    role: "group",
    "data-slot": "field",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-invalid]": "invalid() ? 'true' : null",
    "[attr.data-disabled]": "disabled() ? 'true' : null",
  },
})
export class SoneFieldDirective {
  readonly orientation = input<FieldOrientation>("vertical");
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _describedBy = signal<readonly string[]>([]);
  private readonly describedBy = computed(() => this._describedBy().join(" "));

  private written: {
    el: Element;
    ids: readonly string[];
    invalid: boolean;
  } | null = null;

  constructor() {
    afterEveryRender({ write: () => this.syncControl() });
  }

  register(id: string): void {
    this._describedBy.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }
  unregister(id: string): void {
    this._describedBy.update((ids) => ids.filter((x) => x !== id));
  }

  private syncControl(): void {
    const el = this.host.nativeElement.querySelector(CONTROL_SELECTOR);
    const prev = this.written;
    if (prev && prev.el !== el) {
      this.unwrite(prev);
      this.written = null;
    }
    if (!el) {
      return;
    }
    const ids = this.describedBy() ? this.describedBy().split(" ") : [];
    const invalid = this.invalid();
    const current = this.written;
    if (current && sameIds(current.ids, ids) && current.invalid === invalid) {
      return;
    }
    const own = (el.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((t) => t && !(current?.ids ?? []).includes(t));
    const merged = [...own, ...ids.filter((id) => !own.includes(id))];
    if (merged.length) {
      el.setAttribute("aria-describedby", merged.join(" "));
    } else {
      el.removeAttribute("aria-describedby");
    }
    if (invalid) {
      el.setAttribute("aria-invalid", "true");
    } else if (current?.invalid) {
      el.removeAttribute("aria-invalid");
    }
    this.written = { el, ids, invalid };
  }

  private unwrite(prev: {
    el: Element;
    ids: readonly string[];
    invalid: boolean;
  }): void {
    const rest = (prev.el.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((t) => t && !prev.ids.includes(t));
    if (rest.length) {
      prev.el.setAttribute("aria-describedby", rest.join(" "));
    } else {
      prev.el.removeAttribute("aria-describedby");
    }
    if (prev.invalid) {
      prev.el.removeAttribute("aria-invalid");
    }
  }
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function useFieldPart(prefix: string): string {
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const field = inject(SoneFieldDirective, { optional: true });
  const id = el.id || `sone-${prefix}-${++nextFieldPartId}`;
  if (field) {
    field.register(id);
    inject(DestroyRef).onDestroy(() => field.unregister(id));
  }
  return id;
}

@Directive({
  selector: "label[soneLabel], span[soneLabel]",
  host: { "data-slot": "label" },
})
export class SoneLabelDirective {}

@Directive({
  selector: "[soneFieldLabel]",
  host: { "data-slot": "field-label" },
})
export class SoneFieldLabelDirective {}

/**
 * `[soneFieldLabelOptional]` — the quiet "Optional" marker inside a field label:
 * `<label soneFieldLabel>Notes <span soneFieldLabelOptional>Optional</span></label>`.
 */
@Directive({
  selector: "[soneFieldLabelOptional]",
  host: { "data-slot": "field-label-optional" },
})
export class SoneFieldLabelOptionalDirective {}

@Directive({
  selector: "[soneFieldDescription]",
  host: { "data-slot": "field-description", "[attr.id]": "id" },
})
export class SoneFieldDescriptionDirective {
  readonly id = useFieldPart("field-desc");
}

@Directive({
  selector: "[soneFieldError]",
  host: { "data-slot": "field-error", role: "alert", "[attr.id]": "id" },
})
export class SoneFieldErrorDirective {
  readonly id = useFieldPart("field-error");
}

@Directive({
  selector: "[soneFieldContent]",
  host: { "data-slot": "field-content" },
})
export class SoneFieldContentDirective {}

@Directive({
  selector: "[soneFieldTitle]",
  host: { "data-slot": "field-title" },
})
export class SoneFieldTitleDirective {}

@Directive({
  selector: "[soneFieldGroup]",
  host: { "data-slot": "field-group", "[attr.data-variant]": "variant()" },
})
export class SoneFieldGroupDirective {
  readonly variant = input<"default" | "choices">("default");
}

@Directive({
  selector: "fieldset[soneFieldSet]",
  host: { "data-slot": "field-set" },
})
export class SoneFieldSetDirective {}

@Directive({
  selector: "legend[soneFieldLegend]",
  host: { "data-slot": "field-legend", "[attr.data-variant]": "variant()" },
})
export class SoneFieldLegendDirective {
  readonly variant = input<"legend" | "label">("legend");
}

@Directive({
  selector: "[soneFieldSeparator]",
  host: { "data-slot": "field-separator", role: "separator" },
})
export class SoneFieldSeparatorDirective {}

@Directive({
  selector: "[soneFieldSeparatorContent]",
  host: { "data-slot": "field-separator-content" },
})
export class SoneFieldSeparatorContentDirective {}

export const SONE_FIELD_PARTS = [
  SoneLabelDirective,
  SoneFieldDirective,
  SoneFieldLabelDirective,
  SoneFieldLabelOptionalDirective,
  SoneFieldDescriptionDirective,
  SoneFieldErrorDirective,
  SoneFieldContentDirective,
  SoneFieldTitleDirective,
  SoneFieldGroupDirective,
  SoneFieldSetDirective,
  SoneFieldLegendDirective,
  SoneFieldSeparatorDirective,
  SoneFieldSeparatorContentDirective,
] as const;
