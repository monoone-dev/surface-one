import { Directive, input } from "@angular/core";

export type BubbleVariant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive";
export type BubbleAlign = "start" | "end";

@Directive({
  selector: "[soneBubble]",
  host: {
    "data-slot": "bubble",
    "[attr.data-variant]": "variant()",
    "[attr.data-align]": "align()",
  },
})
export class SoneBubbleDirective {
  readonly variant = input<BubbleVariant>("default");
  readonly align = input<BubbleAlign>("start");
}

@Directive({
  selector: "[soneBubbleContent]",
  host: { "data-slot": "bubble-content" },
})
export class SoneBubbleContentDirective {}

@Directive({
  selector: "[soneBubbleGroup]",
  host: { "data-slot": "bubble-group" },
})
export class SoneBubbleGroupDirective {}

export const SONE_BUBBLE_PARTS = [
  SoneBubbleDirective,
  SoneBubbleContentDirective,
  SoneBubbleGroupDirective,
] as const;
