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
import { soneId, SoneValueAccessor } from "@surface-one/angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  type BadgeVariant,
  SoneBadgeDirective,
  SoneBadgeRemoveDirective,
} from "@surface-one/angular/badge";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  type SoneTagRejection,
  addTags,
  hiddenTagCount,
  splitTagDraft,
  tagDraftAfter,
  visibleTags,
} from "./tags";

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
export class SoneTagInputComponent extends SoneValueAccessor<string[]> {
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

  readonly listId = soneId("sone-tag-input-list");

  readonly draft = signal("");
  readonly expanded = signal(false);
  readonly focused = signal(false);
  readonly announcement = signal("");
  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  readonly hiddenCount = computed(() =>
    hiddenTagCount(this.value().length, this.maxVisible()),
  );

  readonly visibleTags = computed(() =>
    visibleTags(this.value(), this.maxVisible(), this.expanded()),
  );

  readonly listLabel = $localize`Tags`;
  readonly showLessLabel = $localize`Show less`;

  moreLabel(n: number): string {
    return $localize`+${n}:count: more`;
  }

  removeLabel(tag: string): string {
    return $localize`Remove ${tag}:tag:`;
  }

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(Array.isArray(v) ? v.map(String) : []);
  }

  focus(): void {
    this.field().nativeElement.focus();
  }

  onInput(e: Event): void {
    const text = (e.target as HTMLInputElement).value;
    const split = splitTagDraft(text);
    if (!split) {
      this.draft.set(text);
      return;
    }
    this.setDraft(tagDraftAfter(this.addAll(split.parts), split.rest));
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
    this.setDraft(tagDraftAfter(this.addAll(this.draft().split(","))));
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

  /** Adds the parts it accepts and reports the ones it refuses (left in the field). */
  private addAll(parts: readonly string[]): SoneTagRejection[] {
    const { next, accepted, rejected } = addTags(this.value(), parts, {
      max: this.max(),
      validate: this.validate(),
    });
    for (const r of rejected) this.rejected.emit(r);
    if (accepted.length) {
      this.emit(next);
      for (const tag of accepted) this.added.emit(tag);
      this.announcement.set($localize`Added ${accepted.join(", ")}:tags:`);
    }
    return rejected;
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
