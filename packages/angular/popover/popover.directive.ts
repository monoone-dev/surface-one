import { Directive, input } from "@angular/core";

import {
  SoneOverlayPanel,
  SonePopoverTriggerDirective,
} from "./overlay-trigger";

/**
 * `[sonePopover]` (or `[sonePopoverContent]`) — the popover surface (spartan/ui
 * Popover content): opaque, padded, `role="dialog"` by default — name it with
 * `aria-labelledby` (its `sonePopoverTitle`) or `aria-label`. Put it in the
 * `<ng-template>` a `sonePopoverTrigger` opens, or pass it to the trigger by reference
 * (`#pop="sonePopover"`): it stays hidden in place until the trigger opens it.
 */
@Directive({
  selector: "[sonePopover], [sonePopoverContent]",
  exportAs: "sonePopover",
  host: {
    class: "popover",
    "data-slot": "popover",
    "[attr.role]": "role()",
  },
})
export class SonePopoverDirective extends SoneOverlayPanel {
  /** `dialog` by default; `null` (or another role) when the panel is not one. */
  readonly role = input<string | null>("dialog");
}

/** `[sonePopoverHeader]` — the title and description at the top of a popover. */
@Directive({
  selector: "[sonePopoverHeader]",
  host: { class: "popover-header", "data-slot": "popover-header" },
})
export class SonePopoverHeaderDirective {}

/** `[sonePopoverTitle]` — the popover's title; give it an `id` the popover names itself by. */
@Directive({
  selector: "[sonePopoverTitle]",
  host: { class: "popover-title", "data-slot": "popover-title" },
})
export class SonePopoverTitleDirective {}

/** `[sonePopoverDescription]` — a secondary line under the title. */
@Directive({
  selector: "[sonePopoverDescription]",
  host: { class: "popover-description", "data-slot": "popover-description" },
})
export class SonePopoverDescriptionDirective {}

export const SONE_POPOVER_PARTS = [
  SonePopoverTriggerDirective,
  SonePopoverDirective,
  SonePopoverHeaderDirective,
  SonePopoverTitleDirective,
  SonePopoverDescriptionDirective,
] as const;
