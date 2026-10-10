import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

export type ConfirmVariant = "default" | "destructive";
export type ConfirmSize = "default" | "compact";
export type ConfirmLayout = "inline" | "card";

let nextConfirmPartId = 0;

/**
 * `[soneConfirm]` — an inline confirmation: the shadcn/ui Alert Dialog anatomy
 * (title, description, Cancel then the action) rendered in place, in a row or a
 * list, instead of in a modal. Render it with `@if` when the user asks to
 * delete / discard / leave; it is a `role="alertdialog"` named by its
 * `[soneConfirmTitle]` (or your `aria-label`) and described by its
 * `[soneConfirmDescription]` and `[soneConfirmError]`.
 *
 * The buttons are drawn for you, always Cancel then Confirm. Focus moves to the
 * Confirm button when it opens, Escape cancels, and while `busy` both buttons are
 * `aria-disabled` (focus stays put) and the action shows `busyLabel` with a
 * spinner. Extra controls in `[soneConfirmActions]` sit at the start of the
 * button row. Give focus back to the control that opened it on `(cancel)`.
 */
@Component({
  selector: "[soneConfirm]",
  exportAs: "soneConfirm",
  imports: [SoneButtonDirective, SoneSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "confirm",
    "data-slot": "confirm",
    role: "alertdialog",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-layout]": "layout()",
    "[attr.aria-labelledby]": "titleId()",
    "[attr.aria-describedby]": "describedBy()",
    "[attr.aria-busy]": "busy() ? 'true' : null",
    "(keydown.escape)": "onEscape($event)",
  },
  templateUrl: "./confirm.component.html",
  styleUrl: "./confirm.component.scss",
})
export class SoneConfirmComponent {
  /** `destructive` paints the action red (delete, discard, leave). */
  readonly variant = input<ConfirmVariant>("default");
  /** `compact` uses extra-small buttons and tighter spacing — for a list row. */
  readonly size = input<ConfirmSize>("default");
  /** `inline`: text and buttons share one wrapping row. `card`: a bordered panel, buttons below. */
  readonly layout = input<ConfirmLayout>("inline");
  /** The action button's label. */
  readonly confirmLabel = input($localize`Confirm`);
  /** The cancel button's label. */
  readonly cancelLabel = input($localize`Cancel`);
  /** The action button's label while `busy`. */
  readonly busyLabel = input($localize`Working…`);
  /** The action is running: both buttons are disabled and the action shows `busyLabel`. */
  readonly busy = input(false, { transform: booleanAttribute });
  /** Move focus to the Confirm button when the confirmation renders (default `true`). */
  readonly autoFocus = input(true, { transform: booleanAttribute });

  /** The user confirmed (click on the action; never while `busy`). */
  readonly confirm = output<void>();
  /** The user cancelled (the Cancel button or Escape; never while `busy`). */
  readonly cancel = output<void>();

  private readonly confirmButton =
    viewChild.required<ElementRef<HTMLButtonElement>>("confirmButton");

  private readonly titleIds = signal<readonly string[]>([]);
  private readonly describedIds = signal<readonly string[]>([]);
  protected readonly titleId = computed(() => this.titleIds()[0] ?? null);
  protected readonly describedBy = computed(
    () => this.describedIds().join(" ") || null,
  );
  protected readonly actionVariant = computed(() =>
    this.variant() === "destructive" ? "destructive" : "default",
  );
  protected readonly cancelVariant = computed(() =>
    this.layout() === "card" ? "outline" : "ghost",
  );
  protected readonly buttonSize = computed(() =>
    this.size() === "compact" ? "xs" : "sm",
  );

  constructor() {
    afterNextRender(() => {
      if (this.autoFocus()) {
        this.confirmButton().nativeElement.focus();
      }
    });
  }

  /** Focuses the Confirm button. */
  focus(): void {
    this.confirmButton().nativeElement.focus();
  }

  /** @internal Called by the title part. */
  registerTitle(id: string): () => void {
    this.titleIds.update((ids) => [...ids, id]);
    return () => this.titleIds.update((ids) => ids.filter((x) => x !== id));
  }

  /** @internal Called by the description and error parts. */
  registerDescription(id: string): () => void {
    this.describedIds.update((ids) => [...ids, id]);
    return () => this.describedIds.update((ids) => ids.filter((x) => x !== id));
  }

  protected onConfirm(): void {
    if (this.busy()) return;
    this.confirm.emit();
  }

  protected onCancel(): void {
    if (this.busy()) return;
    this.cancel.emit();
  }

  protected onEscape(e: Event): void {
    // Handled here, so an enclosing dialog or sheet stays open.
    e.preventDefault();
    e.stopPropagation();
    this.onCancel();
  }
}

function usePart(
  prefix: string,
  register: (root: SoneConfirmComponent, id: string) => () => void,
): string {
  const authored = inject(new HostAttributeToken("id"), { optional: true });
  const root = inject(SoneConfirmComponent, { optional: true });
  // Read the authored attribute, not the DOM: after SSR hydration the element already carries a
  // server-generated id, and reusing it collides with ids generated later on the client.
  const id = authored || `sone-confirm-${prefix}-${++nextConfirmPartId}`;
  if (root) {
    const unregister = register(root, id);
    inject(DestroyRef).onDestroy(unregister);
  }
  return id;
}

/** `[soneConfirmTitle]` — the question; names the alertdialog. */
@Directive({
  selector: "[soneConfirmTitle]",
  host: {
    class: "confirm-title",
    "data-slot": "confirm-title",
    "[attr.id]": "id",
  },
})
export class SoneConfirmTitleDirective {
  readonly id = usePart("title", (root, id) => root.registerTitle(id));
}

/** `[soneConfirmDescription]` — the consequence ("This cannot be undone."). */
@Directive({
  selector: "[soneConfirmDescription]",
  host: {
    class: "confirm-description",
    "data-slot": "confirm-description",
    "[attr.id]": "id",
  },
})
export class SoneConfirmDescriptionDirective {
  readonly id = usePart("desc", (root, id) => root.registerDescription(id));
}

/** `[soneConfirmError]` — why the last attempt failed; announced with `role="alert"`. */
@Directive({
  selector: "[soneConfirmError]",
  host: {
    class: "confirm-error",
    "data-slot": "confirm-error",
    role: "alert",
    "[attr.id]": "id",
  },
})
export class SoneConfirmErrorDirective {
  readonly id = usePart("error", (root, id) => root.registerDescription(id));
}

/** `[soneConfirmActions]` — extra controls at the start of the button row (a "Don't ask again" checkbox). */
@Directive({
  selector: "[soneConfirmActions]",
  host: { class: "confirm-actions", "data-slot": "confirm-actions" },
})
export class SoneConfirmActionsDirective {}

export const SONE_CONFIRM_PARTS = [
  SoneConfirmComponent,
  SoneConfirmTitleDirective,
  SoneConfirmDescriptionDirective,
  SoneConfirmErrorDirective,
  SoneConfirmActionsDirective,
] as const;
