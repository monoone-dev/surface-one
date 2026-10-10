import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

export type LoadMoreAlign = "start" | "center";

/**
 * `<sone-load-more>` — the "Show more" button at the end of a paged list. It emits
 * `(load)`; the owner fetches the next page and sets `busy` meanwhile (the button
 * stays focusable, `aria-disabled`, and shows a spinner with `busyLabel`).
 * `remaining` adds the count left to the label — "Show more (12)" — and hides the
 * whole thing at 0. When the last page failed, set `error`: the message is
 * announced (`role="alert"`) and the button becomes `retryLabel`.
 */
@Component({
  selector: "sone-load-more",
  imports: [SoneButtonDirective, SoneSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./load-more.component.html",
  styleUrl: "./load-more.component.scss",
  host: {
    "data-slot": "load-more",
    "[attr.data-align]": "align()",
    "[attr.data-state]": "state()",
    "[hidden]": "done()",
  },
})
export class SoneLoadMoreComponent {
  /** The next page is loading. */
  readonly busy = input(false, { transform: booleanAttribute });
  /** How many items are left; shown in the label, and `0` hides the control. `null` = unknown. */
  readonly remaining = input<number | null>(null);
  /** Why the last load failed; shown above a retry button. */
  readonly error = input<string | null>(null);
  readonly label = input($localize`Show more`);
  readonly busyLabel = input($localize`Loading…`);
  readonly retryLabel = input($localize`Try again`);
  readonly align = input<LoadMoreAlign>("center");

  /** Load the next page (or retry the failed one). Never emitted while `busy`. */
  readonly load = output<void>();

  protected readonly state = computed(() =>
    this.busy() ? "loading" : this.error() ? "error" : "idle",
  );
  protected readonly done = computed(
    () => this.remaining() === 0 && !this.error() && !this.busy(),
  );
  protected readonly text = computed(() => {
    if (this.busy()) return this.busyLabel();
    if (this.error()) return this.retryLabel();
    const n = this.remaining();
    return n === null ? this.label() : `${this.label()} (${n})`;
  });

  protected onClick(): void {
    if (this.busy()) return;
    this.load.emit();
  }
}
