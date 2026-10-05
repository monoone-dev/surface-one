import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  type SoneToast,
  SoneToasterComponent,
} from "@surface-one/angular/toaster";

const TEMPLATE = `<div class="demo-row">
  <button soneBtn variant="outline" type="button" (click)="push('success', 'Exported to your vault.')">Success</button>
  <button soneBtn variant="outline" type="button" (click)="push('info', 'A new version is ready.', 'Restart')">Info with action</button>
  <button soneBtn variant="outline" type="button" (click)="push('danger', 'Couldn’t reach the server.', 'Retry')">Error</button>
</div>

<sone-toaster [toasts]="toasts()" (dismiss)="dismiss($event)" (action)="dismiss($event)" />`;

export const code = TEMPLATE;

@Component({
  selector: "docs-toaster-demo",
  imports: [SoneButtonDirective, SoneToasterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ToasterDemo {
  readonly toasts = signal<SoneToast[]>([]);
  private nextId = 1;

  // The host owns the queue: push a toast, drop it on dismiss or action.
  push(kind: SoneToast["kind"], message: string, actionLabel?: string): void {
    const toast: SoneToast = { id: this.nextId++, kind, message };
    if (actionLabel) toast.action = { label: actionLabel };
    this.toasts.update((list) => [...list, toast]);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
