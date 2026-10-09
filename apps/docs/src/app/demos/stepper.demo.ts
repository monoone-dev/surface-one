import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  type SoneStep,
  SoneStepperComponent,
} from "@surface-one/angular/stepper";

const TEMPLATE = `<div class="demo-stack" style="max-width: 40rem">
  <sone-stepper [steps]="steps" [(current)]="setup" ariaLabel="Setup progress" disabled />
  <sone-stepper [steps]="steps" [(current)]="account" variant="numbered" linear ariaLabel="Account setup" />
  <div style="display: flex; gap: var(--space-2)">
    <button soneBtn variant="outline" size="sm" type="button" (click)="back()">Back</button>
    <button soneBtn size="sm" type="button" (click)="next()">Next</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-stepper-demo",
  imports: [SoneStepperComponent, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class StepperDemo {
  readonly steps: readonly SoneStep[] = [
    { key: "account", label: "Account", description: "Email and password" },
    { key: "verify", label: "Verify", description: "Enter the code" },
    { key: "recovery", label: "Recovery", description: "Save the phrase" },
  ];
  readonly setup = signal(1);
  readonly account = signal(1);

  back(): void {
    this.setup.update((i) => Math.max(i - 1, 0));
    this.account.update((i) => Math.max(i - 1, 0));
  }

  next(): void {
    const last = this.steps.length - 1;
    this.setup.update((i) => Math.min(i + 1, last));
    this.account.update((i) => Math.min(i + 1, last));
  }
}
