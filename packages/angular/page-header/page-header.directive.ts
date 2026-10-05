import { Directive } from "@angular/core";

@Directive({
  selector: "[sonePageHeader]",
  host: { class: "page-header", "data-slot": "page-header" },
})
export class SonePageHeaderDirective {}

@Directive({
  selector: "[sonePageHeaderContent]",
  host: { class: "page-header-content", "data-slot": "page-header-content" },
})
export class SonePageHeaderContentDirective {}

@Directive({
  selector: "[sonePageHeaderEyebrow]",
  host: {
    class: "page-header-eyebrow section-label",
    "data-slot": "page-header-eyebrow",
  },
})
export class SonePageHeaderEyebrowDirective {}

@Directive({
  selector: "[sonePageHeaderTitle]",
  host: { class: "page-header-title", "data-slot": "page-header-title" },
})
export class SonePageHeaderTitleDirective {}

@Directive({
  selector: "[sonePageHeaderDescription]",
  host: {
    class: "page-header-description",
    "data-slot": "page-header-description",
  },
})
export class SonePageHeaderDescriptionDirective {}

@Directive({
  selector: "[sonePageHeaderActions]",
  host: { class: "page-header-actions", "data-slot": "page-header-actions" },
})
export class SonePageHeaderActionsDirective {}

export const SONE_PAGE_HEADER_PARTS = [
  SonePageHeaderDirective,
  SonePageHeaderContentDirective,
  SonePageHeaderEyebrowDirective,
  SonePageHeaderTitleDirective,
  SonePageHeaderDescriptionDirective,
  SonePageHeaderActionsDirective,
] as const;
