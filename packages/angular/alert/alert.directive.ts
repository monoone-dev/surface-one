import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  input,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

export type AlertActionsAlign = "start" | "center" | "end";

/**
 * An attribute COMPONENT (still `[soneAlert]`, still `SoneAlertDirective`): the
 * close button of a `dismissible` alert has to be rendered on the server too,
 * which a directive cannot do. The children are projected unchanged.
 */
@Component({
  selector: "[soneAlert]",
  imports: [SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />
    @if (dismissible()) {
      <button
        soneBtn
        variant="ghost"
        size="icon-xs"
        type="button"
        class="alert-close"
        data-slot="alert-close"
        [attr.aria-label]="closeLabel()"
        [attr.title]="closeLabel()"
        (click)="dismissed.emit()"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="m5.5 5.5 9 9M14.5 5.5l-9 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    }`,
  host: {
    class: "alert",
    "data-slot": "alert",
    "[attr.data-variant]": "variant()",
    "[attr.data-dismissible]": "dismissible() ? '' : null",
    "[attr.data-actions-align]": "actionsAlign()",
  },
})
export class SoneAlertDirective {
  readonly variant = input<AlertVariant>("default");

  /** Adds a close button at the end; the owner removes the alert on `(dismissed)`. */
  readonly dismissible = input(false, { transform: booleanAttribute });

  /** The close button's accessible name. */
  readonly closeLabel = input($localize`Dismiss`);

  /**
   * Where `[soneAlertAction]` sits against a title + description: `start` (top),
   * `center` or `end` (bottom). `null` keeps the default (top with a title, centred
   * on a one-line alert).
   */
  readonly actionsAlign = input<AlertActionsAlign | null>(null);

  /** The close button was pressed. */
  readonly dismissed = output<void>();
}

@Directive({
  selector: "[soneAlertTitle]",
  host: { class: "alert-title", "data-slot": "alert-title" },
})
export class SoneAlertTitleDirective {}

@Directive({
  selector: "[soneAlertDescription]",
  host: { class: "alert-description", "data-slot": "alert-description" },
})
export class SoneAlertDescriptionDirective {}

@Directive({
  selector: "[soneAlertAction]",
  host: { class: "alert-action", "data-slot": "alert-action" },
})
export class SoneAlertActionDirective {}

export const SONE_ALERT_PARTS = [
  SoneAlertDirective,
  SoneAlertTitleDirective,
  SoneAlertDescriptionDirective,
  SoneAlertActionDirective,
] as const;
