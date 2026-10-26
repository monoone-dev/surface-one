import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
} from "@angular/core";

/**
 * `<sone-rail>` — a narrow column of icon buttons beside the page (on the glass in the
 * Surface skin): app-level places such as Home, Search or Settings. A `nav` landmark named
 * by `ariaLabel`; put the buttons in `[soneRailGroup]` blocks — the first group sits at the
 * top, the last at the bottom.
 */
@Component({
  selector: "sone-rail",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav
    class="rail"
    data-slot="rail-nav"
    [attr.aria-label]="ariaLabel()"
  >
    <ng-content />
  </nav>`,
  styleUrl: "./rail.component.scss",
  host: { "data-slot": "rail" },
})
export class SoneRailComponent {
  /** Names the navigation landmark. */
  readonly ariaLabel = input<string>(
    $localize`:The rail's navigation landmark:Main`,
  );
}

/** A column of rail buttons; the rail spreads its groups from top to bottom. */
@Directive({
  selector: "[soneRailGroup]",
  host: { class: "rail-group", "data-slot": "rail-group" },
})
export class SoneRailGroupDirective {}
