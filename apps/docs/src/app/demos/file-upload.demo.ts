import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneFileUploadComponent } from "@surface-one/angular/file-upload";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <div soneField>
    <label soneFieldLabel for="demo-attachments">Attachments</label>
    <sone-file-upload
      inputId="demo-attachments"
      multiple
      accept="image/*,.pdf"
      [maxSize]="2000000"
      [maxFiles]="4"
      description="PNG, JPG or PDF, up to 2 MB each"
      [(value)]="files"
    />
    <p soneFieldDescription>Up to four files, attached to the meeting notes.</p>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-file-upload-demo",
  imports: [SoneFileUploadComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class FileUploadDemo {
  readonly files = signal<File[]>([]);
}
