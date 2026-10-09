import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

import {
  SoneDialogComponent,
  type DialogSize,
} from "@surface-one/angular/dialog";

/**
 * `<sone-command-dialog>` — a `sone-dialog` sized and padded for a command
 * palette (shadcn/ui CommandDialog). Project a `<sone-command>` into it; render it
 * with `@if` and close it on `(dismiss)`, like any dialog. Escape, the scrim and
 * focus return come from `sone-dialog`.
 */
@Component({
  selector: "sone-command-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneDialogComponent],
  host: { "data-slot": "command-dialog" },
  template: `<sone-dialog
    class="command-dialog"
    [size]="size()"
    [ariaLabel]="label()"
    [showClose]="false"
    (dismiss)="dismiss.emit()"
  >
    <ng-content />
  </sone-dialog>`,
})
export class SoneCommandDialogComponent {
  /** Names the dialog for assistive technology. */
  readonly label = input.required<string>();
  readonly size = input<DialogSize>("md");
  readonly dismiss = output<void>();
}
