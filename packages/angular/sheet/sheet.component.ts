import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneOverlayBase, SONE_OVERLAY } from "@surface-one/angular/dialog";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_FOCUS_SCOPE,
  SoneTeleportToBodyDirective,
} from "@surface-one/angular/core";

export type SheetSide = "top" | "right" | "bottom" | "left";
export type SheetSize = "default" | "lg";

@Component({
  selector: "sone-sheet",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  hostDirectives: [SoneTeleportToBodyDirective],
  providers: [
    {
      provide: SONE_OVERLAY,
      useExisting: forwardRef(() => SoneSheetComponent),
    },
    {
      provide: SONE_FOCUS_SCOPE,
      useExisting: forwardRef(() => SoneSheetComponent),
    },
  ],
  host: {
    class: "sheet-overlay",
    "data-slot": "sheet-overlay",
    "(click)": "onLayerClick($event)",
  },
  templateUrl: "./sheet.component.html",
  styleUrl: "./sheet.component.scss",
})
export class SoneSheetComponent extends SoneOverlayBase {
  readonly side = input<SheetSide>("right");
  readonly size = input<SheetSize>("default");
  readonly scrimCloses = input(true);

  protected readonly closeOnScrim = (): boolean => this.scrimCloses();
}
