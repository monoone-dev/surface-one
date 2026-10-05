import { Directive, input } from "@angular/core";

export type CardSize = "default" | "sm";

@Directive({
  selector: "[soneCard]",
  host: { class: "card", "data-slot": "card", "[attr.data-size]": "size()" },
})
export class SoneCardDirective {
  readonly size = input<CardSize>("default");
}

@Directive({
  selector: "[soneCardHeader]",
  host: { class: "card-header", "data-slot": "card-header" },
})
export class SoneCardHeaderDirective {}

@Directive({
  selector: "[soneCardTitle]",
  host: { class: "card-title", "data-slot": "card-title" },
})
export class SoneCardTitleDirective {}

@Directive({
  selector: "[soneCardDescription]",
  host: { class: "card-description", "data-slot": "card-description" },
})
export class SoneCardDescriptionDirective {}

@Directive({
  selector: "[soneCardAction]",
  host: { class: "card-action", "data-slot": "card-action" },
})
export class SoneCardActionDirective {}

@Directive({
  selector: "[soneCardContent]",
  host: { class: "card-content", "data-slot": "card-content" },
})
export class SoneCardContentDirective {}

@Directive({
  selector: "[soneCardFooter]",
  host: { class: "card-footer", "data-slot": "card-footer" },
})
export class SoneCardFooterDirective {}

export const SONE_CARD_PARTS = [
  SoneCardDirective,
  SoneCardHeaderDirective,
  SoneCardTitleDirective,
  SoneCardDescriptionDirective,
  SoneCardActionDirective,
  SoneCardContentDirective,
  SoneCardFooterDirective,
] as const;
