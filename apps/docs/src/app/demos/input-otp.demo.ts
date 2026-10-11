import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneInputOtpComponent } from "@surface-one/angular/input-otp";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <div soneField [invalid]="wrong()">
    <label soneFieldLabel for="demo-otp">Verification code</label>
    <sone-input-otp inputId="demo-otp" [(value)]="code" [groups]="[3, 3]"
      [invalid]="wrong()" (complete)="check($event)" />
    @if (wrong()) {
      <p soneFieldError>That code didn’t match. Try 123456.</p>
    } @else {
      <p soneFieldDescription>We sent a 6-digit code to your email.</p>
    }
  </div>
  <div soneField>
    <label soneFieldLabel for="demo-otp-2fa">Authenticator code</label>
    <sone-input-otp inputId="demo-otp-2fa" disabled />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-input-otp-demo",
  imports: [SoneInputOtpComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class InputOtpDemo {
  readonly code = signal("");
  readonly wrong = signal(false);

  check(value: string): void {
    this.wrong.set(value !== "123456");
  }
}
