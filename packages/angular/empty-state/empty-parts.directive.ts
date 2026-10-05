import { Directive, input } from "@angular/core";

export type EmptyMediaVariant = "default" | "icon";

@Directive({
  selector: "[soneEmpty]",
  host: { class: "empty-state", "data-slot": "empty" },
})
export class SoneEmptyDirective {}

@Directive({
  selector: "[soneEmptyHeader]",
  host: { class: "empty-header", "data-slot": "empty-header" },
})
export class SoneEmptyHeaderDirective {}

@Directive({
  selector: "[soneEmptyMedia]",
  host: {
    class: "empty-media",
    "data-slot": "empty-media",
    "[attr.data-variant]": "variant()",
  },
})
export class SoneEmptyMediaDirective {
  readonly variant = input<EmptyMediaVariant>("default");
}

@Directive({
  selector: "[soneEmptyTitle]",
  host: { class: "empty-title", "data-slot": "empty-title" },
})
export class SoneEmptyTitleDirective {}

@Directive({
  selector: "[soneEmptyDescription]",
  host: { class: "empty", "data-slot": "empty-description" },
})
export class SoneEmptyDescriptionDirective {}

@Directive({
  selector: "[soneEmptyContent]",
  host: { class: "empty-content", "data-slot": "empty-content" },
})
export class SoneEmptyContentDirective {}

export const SONE_EMPTY_PARTS = [
  SoneEmptyDirective,
  SoneEmptyHeaderDirective,
  SoneEmptyMediaDirective,
  SoneEmptyTitleDirective,
  SoneEmptyDescriptionDirective,
  SoneEmptyContentDirective,
] as const;
