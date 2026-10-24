import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from "@angular/core";
import { NgControl } from "@angular/forms";

import { autosizeTextarea, textareaCount } from "./textarea-autosize";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v, 0);

/**
 * `textarea[soneTextarea]` — the native multi-line field (spartan/ui `hlmTextarea`,
 * shadcn/ui Textarea) in the skin's `--textarea-*` look, which every `<textarea>` already
 * has; the directive adds `autosize` (the height follows the content between `minRows`
 * and `maxRows`), the `invalid` state and the character count a `sone-textarea-count`
 * shows. Inside a `[soneField]` the field wires `aria-describedby` and `aria-invalid`.
 */
@Directive({
  selector: "textarea[soneTextarea]",
  exportAs: "soneTextarea",
  host: {
    "data-slot": "textarea",
    "[attr.data-autosize]": "autosize() ? '' : null",
    "[attr.maxlength]": "maxlength()",
    "[attr.aria-invalid]": "invalid() ? 'true' : null",
    "(input)": "sync()",
  },
})
export class SoneTextareaDirective {
  /** Grow and shrink with the content (the native resize handle goes away). */
  readonly autosize = input(false, { transform: booleanAttribute });
  /** The fewest rows an autosizing textarea shows. */
  readonly minRows = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The most rows it grows to; it scrolls past them. */
  readonly maxRows = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The native `maxlength`; a `sone-textarea-count` counts against it. */
  readonly maxlength = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** A failed check: `aria-invalid` and the destructive border and ring. */
  readonly invalid = input(false, { transform: booleanAttribute });

  readonly element =
    inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;
  private readonly _value = signal("");
  /** The current text, kept in step with typing and with values written from outside. */
  readonly value = this._value.asReadonly();
  /** The counter of the current text against `maxlength`. */
  readonly count = computed(() =>
    textareaCount(this._value(), this.maxlength()),
  );
  private sized: string | null = null;
  private rows = "";

  constructor() {
    // A value written by a binding fires no input event: catch it after every render…
    afterEveryRender({ write: () => this.sync() });
    // …and one written by the forms API (ngModel, formControl), which may not render.
    const control = inject(NgControl, { optional: true, self: true });
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const sub = control?.valueChanges?.subscribe(() => this.sync());
      if (sub) destroyRef.onDestroy(() => sub.unsubscribe());
    });
  }

  /** Re-reads the value and re-fits the height (also after a font or width change). */
  sync(): void {
    const el = this.element;
    const value = el.value;
    if (value !== this._value()) this._value.set(value);
    if (!this.autosize()) {
      if (this.sized !== null) {
        el.style.height = "";
        el.style.overflowY = "";
        this.sized = null;
      }
      return;
    }
    const rows = `${this.minRows()}/${this.maxRows()}`;
    if (this.sized === value && this.rows === rows) return;
    this.sized = value;
    this.rows = rows;
    autosizeTextarea(el, { minRows: this.minRows(), maxRows: this.maxRows() });
  }
}

/**
 * `<sone-textarea-count [for]="ta">` — the character counter of a `soneTextarea`
 * (`#ta="soneTextarea"`): `12/200` against its `maxlength` (or the bare count), tinted
 * as the limit nears. A polite live region says how many characters are left once
 * few are, rather than on every keystroke.
 */
@Component({
  selector: "sone-textarea-count",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "textarea-count",
    "data-slot": "textarea-count",
    "[attr.data-state]": "count().state",
  },
  template: `<span aria-hidden="true">{{ count().text }}</span
    ><span class="sr-only" aria-live="polite">{{ announcement() }}</span>`,
})
export class SoneTextareaCountComponent {
  /** The textarea to count (`#ta="soneTextarea"`). */
  readonly for = input.required<SoneTextareaDirective>();
  /** "N characters left", read once few are left. */
  readonly remainingLabel = input<(remaining: number) => string>((remaining) =>
    remaining === 1
      ? $localize`:A textarea counter, one character left:1 character left`
      : $localize`:A textarea counter, characters left:${remaining}:count: characters left`,
  );

  protected readonly count = computed(() => this.for().count());
  protected readonly announcement = computed(() => {
    const count = this.count();
    return count.announce && count.remaining !== null
      ? this.remainingLabel()(count.remaining)
      : "";
  });
}

export const SONE_TEXTAREA_PARTS = [
  SoneTextareaDirective,
  SoneTextareaCountComponent,
] as const;
