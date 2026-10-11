import { DestroyRef, Directive, inject, input } from "@angular/core";
import { SONE_OVERLAY, soneId } from "@surface-one/angular/core";

@Directive({
  selector: "[soneDialogHeader], [soneSheetHeader]",
  host: { class: "dialog-header", "data-slot": "dialog-header" },
})
export class SoneDialogHeaderDirective {}

@Directive({
  selector: "[soneDialogTitle], [soneSheetTitle]",
  host: {
    class: "dialog-title",
    "data-slot": "dialog-title",
    "[attr.id]": "id()",
  },
})
export class SoneDialogTitleDirective {
  readonly id = input<string>(soneId("sone-dialog-title"));

  // Unregister on destroy: a title inside an `@if` must not leave the dialog labelled by a dead id.
  constructor() {
    const overlay = inject(SONE_OVERLAY, { optional: true });
    overlay?.registerTitle(this);
    inject(DestroyRef).onDestroy(() => overlay?.unregisterTitle?.(this));
  }
}

@Directive({
  selector: "[soneDialogDescription], [soneSheetDescription]",
  host: {
    class: "dialog-description",
    "data-slot": "dialog-description",
    "[attr.id]": "id()",
  },
})
export class SoneDialogDescriptionDirective {
  readonly id = input<string>(soneId("sone-dialog-description"));

  constructor() {
    const overlay = inject(SONE_OVERLAY, { optional: true });
    overlay?.registerDescription?.(this);
    inject(DestroyRef).onDestroy(() => overlay?.unregisterDescription?.(this));
  }
}

export type DialogMediaTone = "default" | "accent" | "destructive" | "warning";

@Directive({
  selector: "[soneDialogMedia], [soneSheetMedia]",
  host: {
    class: "dialog-media",
    "data-slot": "dialog-media",
    "aria-hidden": "true",
    "[attr.data-tone]": "tone()",
  },
})
export class SoneDialogMediaDirective {
  readonly tone = input<DialogMediaTone>("default");
}

@Directive({
  selector: "[soneDialogFooter], [soneSheetFooter]",
  host: { class: "dialog-footer", "data-slot": "dialog-footer" },
})
export class SoneDialogFooterDirective {}

export const SONE_DIALOG_PARTS = [
  SoneDialogHeaderDirective,
  SoneDialogTitleDirective,
  SoneDialogDescriptionDirective,
  SoneDialogMediaDirective,
  SoneDialogFooterDirective,
] as const;
