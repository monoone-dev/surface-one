import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  input,
  model,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SONE_COLLAPSIBLE_PARTS } from "@surface-one/angular/collapsible";

/**
 * `<sone-collapsible-section>` — a titled section that folds, built on the
 * Collapsible: a full-width header button (chevron, `title`, optional `subtitle`
 * and a secondary-badge `count`) that keeps `aria-expanded` / `aria-controls` in
 * sync, and the projected body below it. `[(open)]` binds the state. Controls in
 * `[soneCollapsibleSectionActions]` sit at the end of the header, outside the
 * button.
 */
@Component({
  selector: "sone-collapsible-section",
  exportAs: "soneCollapsibleSection",
  imports: [SONE_COLLAPSIBLE_PARTS, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./collapsible-section.component.html",
  styleUrl: "./collapsible-section.component.scss",
  host: {
    "data-slot": "collapsible-section",
    "[attr.data-state]": "open() ? 'open' : 'closed'",
    // `title` is an input here, not the native tooltip attribute.
    "[attr.title]": "null",
  },
})
export class SoneCollapsibleSectionComponent {
  /** The section's name, shown in the header button. */
  readonly title = input.required<string>();
  /** A quiet line after the title (a date range, a source). */
  readonly subtitle = input<string | null>(null);
  /** A count in a secondary badge after the title; `null` hides it. */
  readonly count = input<number | string | null>(null);
  /** Whether the body is shown (`[(open)]`). */
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
}

/** `[soneCollapsibleSectionActions]` — controls at the end of the header, outside the toggle button. */
@Directive({
  selector: "[soneCollapsibleSectionActions]",
  host: {
    class: "collapsible-section-actions",
    "data-slot": "collapsible-section-actions",
  },
})
export class SoneCollapsibleSectionActionsDirective {}

export const SONE_COLLAPSIBLE_SECTION_PARTS = [
  SoneCollapsibleSectionComponent,
  SoneCollapsibleSectionActionsDirective,
] as const;
