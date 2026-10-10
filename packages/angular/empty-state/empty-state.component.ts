import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

export type EmptyStateTone = "default" | "locked" | "error" | "loading";

/**
 * `<sone-empty-state>` — spartan/ui Empty. Two ways to fill it, which combine:
 *
 * - **Slots** — project the parts (`[soneEmptyHeader]` › `[soneEmptyMedia]`,
 *   `[soneEmptyTitle]`, `[soneEmptyDescription]`, then `[soneEmptyContent]`).
 * - **Composed** — set `icon`, `title`, `description` and `tone`, and the header is
 *   drawn for you; anything projected (actions in `[soneEmptyContent]`, a hint line)
 *   follows it.
 *
 * `tone`: `locked` defaults the icon to `lock`; `error` to `alert-circle` and announces
 * with `role="alert"`; `loading` (or `busy`) swaps the media for a spinner and
 * announces with `role="status"`. The effective tone is on the host as `data-tone`.
 */
@Component({
  selector: "sone-empty-state",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent, SoneSpinnerComponent],
  host: {
    class: "empty-state",
    "data-slot": "empty",
    "[attr.data-tone]": "effectiveTone()",
    "[attr.role]": "role()",
    // `title` is an input here, not the native tooltip attribute.
    "[attr.title]": "null",
  },
  templateUrl: "./empty-state.component.html",
  styleUrl: "./empty-state.component.scss",
})
export class SoneEmptyStateComponent {
  /** The media glyph. Defaults to `lock` for `tone="locked"`, `alert-circle` for `"error"`. */
  readonly icon = input<ShellIcon | null>(null);
  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly tone = input<EmptyStateTone>("default");
  /** Shows the loading state (spinner, `role="status"`) whatever the `tone`. */
  readonly busy = input(false, { transform: booleanAttribute });

  protected readonly effectiveTone = computed<EmptyStateTone>(() =>
    this.busy() ? "loading" : this.tone(),
  );
  protected readonly loading = computed(
    () => this.effectiveTone() === "loading",
  );
  protected readonly mediaIcon = computed<ShellIcon | null>(() => {
    const icon = this.icon();
    if (icon) return icon;
    switch (this.effectiveTone()) {
      case "locked":
        return "lock";
      case "error":
        return "alert-circle";
      default:
        return null;
    }
  });
  /** Slot-only usage (no input set) renders exactly what is projected, as before. */
  protected readonly composed = computed(
    () =>
      this.loading() ||
      this.mediaIcon() !== null ||
      !!this.title() ||
      !!this.description(),
  );
  protected readonly role = computed(() => {
    switch (this.effectiveTone()) {
      case "error":
        return "alert";
      case "loading":
        return "status";
      default:
        return null;
    }
  });
  protected readonly loadingLabel = $localize`Loading`;
}
