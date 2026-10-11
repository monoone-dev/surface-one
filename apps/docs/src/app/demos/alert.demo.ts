import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack" style="max-width: 34rem">
  <div soneAlert>
    <sone-icon icon="alert-circle" />
    <p soneAlertTitle>Heads up</p>
    <p soneAlertDescription>Summaries are generated on this device by default.</p>
  </div>
  <div soneAlert variant="success" role="status">
    <sone-icon icon="check" />
    <p soneAlertTitle>Export complete</p>
    <p soneAlertDescription>Weekly sync.md was saved to your notes folder.</p>
  </div>
  <div soneAlert variant="warning" role="status">
    <sone-icon icon="lock" />
    <p soneAlertTitle>3 items are in a locked folder</p>
    <p soneAlertDescription>Unlock the folder to restore or delete them.</p>
    <div soneAlertAction><button soneBtn variant="outline" size="xs" type="button">Unlock</button></div>
  </div>
  <div soneAlert variant="destructive" role="alert">
    <sone-icon icon="alert-circle" />
    <p soneAlertTitle>Couldn’t reach the server</p>
    <p soneAlertDescription>Your transcript is safe. Try again in a moment.</p>
    <div soneAlertAction><button soneBtn variant="outline" size="xs" type="button">Retry</button></div>
  </div>
  @if (hint()) {
    <div soneAlert variant="info" role="status" dismissible (dismissed)="hint.set(false)">
      <sone-icon icon="sparkles" />
      <p soneAlertTitle>Ivy noticed a follow-up</p>
      <p soneAlertDescription>“Send the budget draft by Friday” was added to Tasks.</p>
    </div>
  } @else {
    <button soneBtn variant="outline" size="sm" type="button" (click)="hint.set(true)">Show the hint again</button>
  }
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-alert-demo",
  imports: [...SONE_ALERT_PARTS, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AlertDemo {
  readonly hint = signal(true);
}
