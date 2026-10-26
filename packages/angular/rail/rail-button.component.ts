import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from "@angular/core";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";

import type { RailBadge } from "./rail-types";

/**
 * `<sone-rail-button>` — one place on a rail: a square icon button whose `label` is its
 * accessible name and its tooltip (`title`). `current` marks the place on screen
 * (`aria-current="page"`): a raised island with the accent icon. `badge` adds a status dot
 * in the corner (busy pulses); say the status in the label when it matters.
 */
@Component({
  selector: "sone-rail-button",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    class="rail-button"
    data-slot="rail-button-trigger"
    [attr.aria-label]="label()"
    [attr.title]="label()"
    [attr.aria-current]="current() ? 'page' : null"
    [disabled]="disabled()"
  >
    <sone-icon [icon]="icon()" />
    @if (badge(); as badge) {
      <span
        class="rail-badge"
        data-slot="rail-badge"
        [attr.data-badge]="badge"
        aria-hidden="true"
      ></span>
    }
  </button>`,
  styleUrl: "./rail-button.component.scss",
  host: { "data-slot": "rail-button" },
})
export class SoneRailButtonComponent {
  readonly icon = input.required<ShellIcon>();
  /** The accessible name and the tooltip. */
  readonly label = input.required<string>();
  /** The place on screen now (`aria-current="page"`). */
  readonly current = input(false, { transform: booleanAttribute });
  /** A status dot in the corner. */
  readonly badge = input<RailBadge | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
}
