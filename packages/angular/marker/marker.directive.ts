import { Directive, input } from "@angular/core";

export type MarkerVariant = "default" | "separator" | "border";

@Directive({
  selector: "[soneMarker]",
  host: { "data-slot": "marker", "[attr.data-variant]": "variant()" },
})
export class SoneMarkerDirective {
  readonly variant = input<MarkerVariant>("default");
}

@Directive({
  selector: "[soneMarkerIcon]",
  host: { "data-slot": "marker-icon", "aria-hidden": "true" },
})
export class SoneMarkerIconDirective {}

@Directive({
  selector: "[soneMarkerContent]",
  host: { "data-slot": "marker-content" },
})
export class SoneMarkerContentDirective {}

export const SONE_MARKER_PARTS = [
  SoneMarkerDirective,
  SoneMarkerIconDirective,
  SoneMarkerContentDirective,
] as const;
