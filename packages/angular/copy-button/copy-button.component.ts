import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import {
  type ButtonSize,
  type ButtonVariant,
  SoneButtonDirective,
} from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * Copies `value` to the clipboard from the click handler (nothing runs on the
 * server), swaps to a "Copied" state for `resetAfter` ms and announces it in a
 * polite live region.
 */
@Component({
  selector: "sone-copy-button",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./copy-button.component.html",
  styleUrl: "./copy-button.component.scss",
  host: {
    "data-slot": "copy-button",
    "[attr.data-state]": "isCopied() ? 'copied' : 'idle'",
  },
})
export class SoneCopyButtonComponent {
  private readonly doc = inject(DOCUMENT);

  /** The text that goes to the clipboard. */
  readonly value = input.required<string>();

  readonly label = input($localize`Copy`);
  readonly copiedLabel = input($localize`Copied`);

  readonly variant = input<ButtonVariant>("outline");
  /** Default: `sm`, or `icon-sm` when `iconOnly`. */
  readonly size = input<ButtonSize | null>(null);

  /** Only the glyph; `label` / `copiedLabel` become its accessible name. */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });

  /** How long the "Copied" state lasts, in ms. */
  readonly resetAfter = input(1500, { transform: numberAttribute });

  /** The value reached the clipboard. */
  readonly copied = output<string>();
  /** The clipboard refused the write. */
  readonly copyError = output<unknown>();

  readonly isCopied = signal(false);

  readonly effectiveSize = computed<ButtonSize>(
    () => this.size() ?? (this.iconOnly() ? "icon-sm" : "sm"),
  );

  readonly text = computed(() =>
    this.isCopied() ? this.copiedLabel() : this.label(),
  );

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  async copy(): Promise<void> {
    const value = this.value();
    try {
      await this.write(value);
    } catch (error) {
      this.clearTimer();
      this.isCopied.set(false);
      this.copyError.emit(error);
      return;
    }
    this.isCopied.set(true);
    this.copied.emit(value);
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.isCopied.set(false);
    }, this.resetAfter());
  }

  private async write(value: string): Promise<void> {
    const clipboard = this.doc.defaultView?.navigator?.clipboard;
    if (clipboard?.writeText) {
      await clipboard.writeText(value);
      return;
    }
    // No async Clipboard API (an insecure origin): the legacy copy command.
    const area = this.doc.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    this.doc.body.appendChild(area);
    area.select();
    const ok = this.doc.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("copy command refused");
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
