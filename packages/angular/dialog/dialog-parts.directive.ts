import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  inject,
  input,
} from "@angular/core";
import { SONE_OVERLAY, soneId } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

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

/**
 * `button[soneDialogClose]` — a close button for a dialog or sheet header. Inside an
 * overlay it closes it (when it may be dismissed) and the corner close steps aside.
 * Project your own glyph to replace the default cross.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute component on the element it styles (as spartan/ui)
  selector: "button[soneDialogClose], button[soneSheetClose]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent],
  host: {
    class: "btn dialog-header-close",
    "data-slot": "dialog-close",
    "data-variant": "ghost",
    "data-size": "icon-sm",
    type: "button",
    "[attr.aria-label]": "label()",
    "(click)": "close($event)",
  },
  template: `<ng-content><sone-icon icon="close" /></ng-content>`,
})
export class SoneDialogCloseComponent {
  readonly label = input($localize`:verb|Closes a dialog or sheet:Close`);
  private readonly overlay = inject(SONE_OVERLAY, { optional: true });

  protected close(event: Event): void {
    if (!event.defaultPrevented) this.overlay?.requestClose?.();
  }
}

export const SONE_DIALOG_PARTS = [
  SoneDialogHeaderDirective,
  SoneDialogTitleDirective,
  SoneDialogDescriptionDirective,
  SoneDialogMediaDirective,
  SoneDialogFooterDirective,
  SoneDialogCloseComponent,
] as const;
