import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CONFIRM_PARTS } from "@surface-one/angular/confirm";

const TEMPLATE = `<div class="demo-stack" style="max-width: 32rem">
  <!-- Inline: render it with @if in place of the button that asked -->
  @if (confirming()) {
    <div
      soneConfirm
      variant="destructive"
      confirmLabel="Delete"
      busyLabel="Deleting…"
      [busy]="busy()"
      (confirm)="remove()"
      (cancel)="close()"
    >
      <p soneConfirmTitle>Delete “Weekly sync”?</p>
      <p soneConfirmDescription>It moves to the trash for 30 days.</p>
    </div>
  } @else {
    <div class="demo-row">
      <button #opener soneBtn variant="outline" type="button" (click)="confirming.set(true)">
        Delete note
      </button>
      <span role="status" style="color: var(--text-secondary)">{{ status() }}</span>
    </div>
  }

  <!-- Card: a bordered panel; extra controls go in soneConfirmActions -->
  <div soneConfirm layout="card" variant="destructive" confirmLabel="Remove lock" [autoFocus]="false">
    <h3 soneConfirmTitle>Remove the lock from “Board”?</h3>
    <p soneConfirmDescription>Its notes are decrypted and stay readable without Touch ID.</p>
    <p soneConfirmError>Touch ID was cancelled. Try again.</p>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-confirm-demo",
  imports: [SoneButtonDirective, ...SONE_CONFIRM_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ConfirmDemo {
  readonly confirming = signal(false);
  readonly busy = signal(false);
  readonly status = signal("");
  private readonly opener = viewChild<ElementRef<HTMLButtonElement>>("opener");

  remove(): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      this.status.set("Deleted");
      this.close();
    }, 800);
  }

  close(): void {
    this.confirming.set(false);
    // Give focus back to the button that opened it, once it is rendered again.
    setTimeout(() => this.opener()?.nativeElement.focus());
  }
}
