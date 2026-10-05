import { Directive, input } from "@angular/core";

import { SoneSeparatorDirective } from "@surface-one/angular/separator";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";

@Directive({
  selector: "[soneItem]",
  host: {
    class: "item",
    "data-slot": "item",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
  },
})
export class SoneItemDirective {
  readonly variant = input<ItemVariant>("default");
  readonly size = input<ItemSize>("default");
}

export type ItemMediaVariant = "default" | "icon" | "image";

@Directive({
  selector: "[soneItemMedia]",
  host: {
    class: "item-media",
    "data-slot": "item-media",
    "[attr.data-variant]": "variant()",
  },
})
export class SoneItemMediaDirective {
  readonly variant = input<ItemMediaVariant>("default");
}

@Directive({
  selector: "[soneItemContent]",
  host: { class: "item-content", "data-slot": "item-content" },
})
export class SoneItemContentDirective {}

@Directive({
  selector: "[soneItemTitle]",
  host: { class: "item-title", "data-slot": "item-title" },
})
export class SoneItemTitleDirective {}

@Directive({
  selector: "[soneItemDescription]",
  host: { class: "item-description", "data-slot": "item-description" },
})
export class SoneItemDescriptionDirective {}

@Directive({
  selector: "[soneItemActions]",
  host: { class: "item-actions", "data-slot": "item-actions" },
})
export class SoneItemActionsDirective {}

@Directive({
  selector: "[soneItemHeader]",
  host: { class: "item-header", "data-slot": "item-header" },
})
export class SoneItemHeaderDirective {}

@Directive({
  selector: "[soneItemFooter]",
  host: { class: "item-footer", "data-slot": "item-footer" },
})
export class SoneItemFooterDirective {}

@Directive({
  selector: "[soneItemGroup]",
  host: {
    class: "item-group",
    role: "list",
    "data-slot": "item-group",
    "[attr.data-size]": "size()",
  },
})
export class SoneItemGroupDirective {
  readonly size = input<ItemSize>("default");
}

@Directive({
  selector: "[soneItemSeparator]",
  hostDirectives: [SoneSeparatorDirective],
  host: { class: "item-separator", "data-slot": "item-separator" },
})
export class SoneItemSeparatorDirective {}

export const SONE_ITEM_PARTS = [
  SoneItemDirective,
  SoneItemMediaDirective,
  SoneItemContentDirective,
  SoneItemTitleDirective,
  SoneItemDescriptionDirective,
  SoneItemActionsDirective,
  SoneItemHeaderDirective,
  SoneItemFooterDirective,
  SoneItemGroupDirective,
  SoneItemSeparatorDirective,
] as const;
