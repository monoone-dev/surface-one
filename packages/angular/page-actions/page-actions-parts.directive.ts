import { Directive } from "@angular/core";

// One element, one slot: put a part on a WRAPPER when its content is itself a
// slotted part — two directives writing `data-slot` on one host clobber each other.
@Directive({
  selector: "[sonePageActionsStatus]",
  host: { "data-slot": "page-actions-status" },
})
export class SonePageActionsStatusDirective {}

@Directive({
  selector: "[sonePageActionsLead]",
  host: { "data-slot": "page-actions-lead" },
})
export class SonePageActionsLeadDirective {}

export const SONE_PAGE_ACTIONS_PARTS = [
  SonePageActionsStatusDirective,
  SonePageActionsLeadDirective,
] as const;
