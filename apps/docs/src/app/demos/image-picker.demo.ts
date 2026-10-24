import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneImagePickerComponent,
  type ImagePickerValue,
} from "@surface-one/angular/image-picker";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

const TEMPLATE = `<div class="demo-stack" style="max-width: 20rem">
  <div soneField>
    <label soneFieldLabel for="demo-cover">Cover image</label>
    <sone-image-picker
      inputId="demo-cover"
      label="Add a cover"
      [maxSize]="2000000"
      [(value)]="cover"
    />
    <p soneFieldDescription>PNG or JPG, up to 2 MB.</p>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-image-picker-demo",
  imports: [SoneImagePickerComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ImagePickerDemo {
  readonly cover = signal<ImagePickerValue>(null);
}
