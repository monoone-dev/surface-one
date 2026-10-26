import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  computed,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import { plural } from "@surface-one/angular/format";

/**
 * `button[soneSourceListTrigger]` — the sources behind an answer folded into one small chip:
 * up to three stacked marks (projected: favicons, `<sone-avatar>`s, marks) and a count
 * (“6 sources”). It is a plain button: open the full `<sone-source-list>` from it (a popover,
 * a sheet or a disclosure) and wire `aria-expanded` / `aria-controls` for what it opens.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- a native button that renders its own parts (as spartan/ui)
  selector: "button[soneSourceListTrigger]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "source-list-trigger",
    "[attr.type]": "type",
  },
  templateUrl: "./source-list-trigger.component.html",
})
export class SoneSourceListTriggerComponent {
  /** How many sources there are (the count on the chip). */
  readonly count = input(0, { transform: numberAttribute });

  protected readonly type =
    inject(new HostAttributeToken("type"), { optional: true }) ?? "button";
  protected readonly label = computed(() =>
    plural(
      Math.max(0, Math.round(this.count())),
      $localize`:The count on a chip of an answer's sources:{count, plural, =1 {1 source} other {# sources}}`,
    ),
  );
}
