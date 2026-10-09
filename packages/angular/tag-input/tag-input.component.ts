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
import {
  type BadgeVariant,
  SoneBadgeDirective,
  SoneBadgeRemoveDirective,
} from "@surface-one/angular/badge";
import { SoneIconComponent } from "@surface-one/angular/icon";

export type TagRejectReason = "duplicate" | "invalid" | "max";

/** What `(rejected)` emits: the refused tag and why. */
export interface SoneTagRejection {
  readonly tag: string;
  readonly reason: TagRejectReason;
}

let nextTagInputId = 0;

/**
 * Tags as removable chips — a ControlValueAccessor of `string[]`. Enter or a
 * comma adds the typed tag (a pasted "a, b, c" adds three), Backspace in the
 * empty field removes the last one. Duplicates are refused case-insensitively.
 */
@Component({
  selector: "sone-tag-input",
  imports: [SoneBadgeDirective, SoneBadgeRemoveDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./tag-input.component.html",
  styleUrl: "./tag-input.component.scss",
  host: {
    "data-slot": "tag-input",
    "[attr.data-invalid]": "invalid() ? 'true' : null",
    "[attr.data-disabled]": "isDisabled() ? 'true' : null",
    "[attr.data-focused]": "focused() ? '' : null",
    "(click)": "focusFromFrame($event)",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneTagInputComponent),
      multi: true,
    },
  ],
})
export class SoneTagInputComponent implements ControlValueAccessor {
  readonly value = model<readonly string[]>([]);

  readonly placeholder = input("");

  /** The text field's accessible name. */
  readonly ariaLabel = input<string | null>($localize`Add tag`);

  readonly inputId = input<string | null>(null);

  /** At most this many tags; further ones are rejected with reason `max`. */
  readonly max = input<number | null>(null);

  /** Show this many chips and a "+N more" toggle for the rest. */
  readonly maxVisible = input<number | null>(null);

  /** Offered while typing (a native `<datalist>`). */
  readonly suggestions = input<readonly string[]>([]);

  /** Return `false` to refuse a tag (reason `invalid`). */
  readonly validate = input<((tag: string) => boolean) | null>(null);

  /** The chips' badge variant. */
  readonly variant = input<BadgeVariant>("secondary");

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });

  readonly added = output<string>();
  readonly removed = output<string>();
  readonly rejected = output<SoneTagRejection>();

  readonly listId = `sone-tag-input-list-${nextTagInputId++}`;

  readonly draft = signal("");
  readonly expanded = signal(false);
  readonly focused = signal(false);
  readonly announcement = signal("");
  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  readonly hiddenCount = computed(() => {
    const limit = this.maxVisible();
    return limit == null ? 0 : Math.max(this.value().length - limit, 0);
  });

  readonly visibleTags = computed(() => {
    const limit = this.maxVisible();
    return this.expanded() || limit == null
      ? this.value()
      : this.value().slice(0, Math.max(limit, 0));
  });

  readonly listLabel = $localize`Tags`;
  readonly showLessLabel = $localize`Show less`;

  moreLabel(n: number): string {
    return $localize`+${n}:count: more`;
  }

  removeLabel(tag: string): string {
    return $localize`Remove ${tag}:tag:`;
  }

  private onChange: (v: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    this.value.set(Array.isArray(v) ? v.map(String) : []);
  }
  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  focus(): void {
    this.field().nativeElement.focus();
  }

  onInput(e: Event): void {
    const text = (e.target as HTMLInputElement).value;
    if (!text.includes(",")) {
      this.draft.set(text);
      return;
    }
    const parts = text.split(",");
    const rest = parts.pop() ?? "";
    const refused = this.addAll(parts);
    this.setDraft([...refused, rest].filter((p) => p.trim()).join(", "));
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    if (e.key === "Enter" || e.key === ",") {
      if (e.key === "," || this.draft().trim()) e.preventDefault();
      this.commit();
    } else if (
      e.key === "Backspace" &&
      this.draft() === "" &&
      this.value().length > 0
    ) {
      e.preventDefault();
      this.remove(this.value()[this.value().length - 1]!, false);
    }
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  /** Adds what is typed; refused text stays in the field to be fixed. */
  commit(): void {
    if (!this.draft().trim()) return;
    this.setDraft(this.addAll(this.draft().split(",")).join(", "));
  }

  remove(tag: string, refocus = true): void {
    if (this.isDisabled()) return;
    const next = this.value().filter((t) => t !== tag);
    if (next.length === this.value().length) return;
    this.emit(next);
    this.removed.emit(tag);
    this.announcement.set($localize`Removed ${tag}:tag:`);
    if (refocus) this.focus();
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  focusFromFrame(e: MouseEvent): void {
    const target = e.target as Element | null;
    if (target?.closest("button, a, input, select, textarea")) return;
    if (!this.isDisabled()) this.focus();
  }

  private addAll(parts: readonly string[]): string[] {
    const next = [...this.value()];
    const refused: string[] = [];
    const accepted: string[] = [];
    const max = this.max();
    const validate = this.validate();
    for (const raw of parts) {
      const tag = raw.trim();
      if (!tag) continue;
      let reason: TagRejectReason | null = null;
      if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        reason = "duplicate";
      } else if (validate && !validate(tag)) {
        reason = "invalid";
      } else if (max != null && next.length >= max) {
        reason = "max";
      }
      if (reason) {
        refused.push(tag);
        this.rejected.emit({ tag, reason });
      } else {
        next.push(tag);
        accepted.push(tag);
      }
    }
    if (accepted.length) {
      this.emit(next);
      for (const tag of accepted) this.added.emit(tag);
      this.announcement.set($localize`Added ${accepted.join(", ")}:tags:`);
    }
    return refused;
  }

  private emit(next: string[]): void {
    this.value.set(next);
    this.onChange(next);
  }

  private setDraft(text: string): void {
    this.draft.set(text);
    const el = this.field().nativeElement;
    if (el.value !== text) el.value = text;
  }
}
