import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from "@angular/core";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";

export type FilterChipTone =
  "default" | "danger" | "warning" | "success" | "accent";

export interface FilterChipOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  /** Shown in a badge after the label; leave it out (or `null`) for none. */
  readonly count?: number | null;
  /** Tints the count badge (`danger` for errors, `warning` for warnings). */
  readonly tone?: FilterChipTone;
  readonly disabled?: boolean;
}

export type FilterChipsVariant = "toggle" | "tabs";
export type FilterChipsSize = "sm" | "default";

const TONE_BADGE: Record<FilterChipTone, BadgeVariant> = {
  default: "secondary",
  danger: "destructive",
  warning: "warning",
  success: "success",
  accent: "accent",
};

/**
 * `<sone-filter-chips>` — one-of-many filter buttons rendered from data, with an
 * optional count badge per option. `variant="toggle"` is an outline Toggle Group
 * of separate chips; `variant="tabs"` is a Tabs list. Either way each option is a
 * toggle button (`aria-pressed`) in a labelled `role="group"` — a filter, not a
 * tab panel — with arrow-key, Home and End navigation. `[(value)]` binds the
 * selected option.
 */
@Component({
  selector: "sone-filter-chips",
  exportAs: "soneFilterChips",
  imports: [SONE_TOGGLE_PARTS, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./filter-chips.component.html",
  styleUrl: "./filter-chips.component.scss",
  host: {
    "data-slot": "filter-chips",
    "[attr.data-variant]": "variant()",
    // `ariaLabel` is an input here, given to the group inside.
    "[attr.aria-label]": "null",
  },
})
export class SoneFilterChipsComponent<T extends string = string> {
  readonly options = input.required<readonly FilterChipOption<T>[]>();
  /** The selected option's value (`[(value)]`). */
  readonly value = model<T | null>(null);
  readonly variant = input<FilterChipsVariant>("toggle");
  /** The chip size of `variant="toggle"` (the tabs list has one size). */
  readonly size = input<FilterChipsSize>("sm");
  /** Names the group ("Filter by level"). */
  readonly ariaLabel = input<string | null>(null);

  protected readonly toggleSize = computed(() =>
    this.size() === "sm" ? "sm" : "default",
  );

  protected badgeVariant(tone: FilterChipTone | undefined): BadgeVariant {
    return TONE_BADGE[tone ?? "default"];
  }

  protected select(option: FilterChipOption<T>): void {
    if (option.disabled) return;
    this.value.set(option.value);
  }
}
