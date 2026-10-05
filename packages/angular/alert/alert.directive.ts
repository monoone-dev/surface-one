import { Directive, input } from "@angular/core";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

@Directive({
  selector: "[soneAlert]",
  host: {
    class: "alert",
    "data-slot": "alert",
    "[attr.data-variant]": "variant()",
  },
})
export class SoneAlertDirective {
  readonly variant = input<AlertVariant>("default");
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
