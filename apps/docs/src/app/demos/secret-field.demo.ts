import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneSecretFieldComponent } from "@surface-one/angular/secret-field";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <sone-secret-field
    label="API key"
    placeholder="Paste your API key"
    help="Stored in the system keychain and never logged."
    clearable
    [hasKey]="hasKey()"
    [busy]="busy()"
    (save)="save($event)"
    (clear)="hasKey.set(false)"
  />
  <sone-secret-field
    label="Workspace token"
    placeholder="tok_…"
    setLabel="Token set ✓"
    saveLabel="Save"
    [hasKey]="false"
    error="The keychain refused the write. Try again."
  />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-secret-field-demo",
  imports: [SoneSecretFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SecretFieldDemo {
  readonly hasKey = signal(false);
  readonly busy = signal(false);

  // A real app hands the value to secure storage; the demo only simulates the round trip.
  save(_value: string): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      this.hasKey.set(true);
    }, 600);
  }
}
