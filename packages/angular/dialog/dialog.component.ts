import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTeleportToBodyDirective } from "@surface-one/angular/core";
import { SONE_OVERLAY, SoneOverlayBase } from "./overlay-base";

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl";

@Component({
  selector: "sone-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  hostDirectives: [SoneTeleportToBodyDirective],
  providers: [
    {
      provide: SONE_OVERLAY,
      useExisting: forwardRef(() => SoneDialogComponent),
    },
  ],
  host: {
    class: "dialog-overlay",
    "data-slot": "dialog-overlay",
    "(click)": "onLayerClick($event)",
  },
  templateUrl: "./dialog.component.html",
})
export class SoneDialogComponent extends SoneOverlayBase {
  readonly size = input<DialogSize>("sm");
  readonly scrimCloses = input(true);

  protected readonly role = "dialog";
  protected readonly slot = "dialog-content";
  protected readonly closeOnScrim = (): boolean => this.scrimCloses();
}

@Component({
  selector: "sone-alert-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  hostDirectives: [SoneTeleportToBodyDirective],
  providers: [
    {
      provide: SONE_OVERLAY,
      useExisting: forwardRef(() => SoneAlertDialogComponent),
    },
  ],
  host: {
    class: "dialog-overlay",
    "data-slot": "alert-dialog-overlay",
    "(click)": "onLayerClick($event)",
  },
  templateUrl: "./dialog.component.html",
})
export class SoneAlertDialogComponent extends SoneOverlayBase {
  readonly size = input<"xs" | "md">("md");

  protected readonly role = "alertdialog";
  protected readonly slot = "alert-dialog-content";
  protected readonly closeOnScrim = (): boolean => false;
  protected override readonly cornerClose = (): boolean => false;
}
