import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneSelectComponent } from "@surface-one/angular/select";

const TEMPLATE = `<div soneFieldGroup style="max-width: 20rem">
  <div soneField>
    <label soneFieldLabel for="demo-language">Language</label>
    <sone-select selectId="demo-language" [(value)]="language">
      <option value="auto">Detect automatically</option>
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="fr">Français</option>
    </sone-select>
    <p soneFieldDescription>Selected: {{ language() }}</p>
  </div>
  <div soneField invalid>
    <label soneFieldLabel for="demo-workspace">Workspace</label>
    <sone-select selectId="demo-workspace" invalid value="">
      <option value="">Choose a workspace…</option>
      <option value="team">Team workspace</option>
    </sone-select>
    <p soneFieldError>Pick a workspace to continue.</p>
  </div>
  <div class="demo-row">
    <sone-select size="sm" ariaLabel="Sort order" value="newest">
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </sone-select>
    <sone-select disabled ariaLabel="Region (locked)" value="eu">
      <option value="eu">Europe</option>
    </sone-select>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-select-demo",
  imports: [SoneSelectComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SelectDemo {
  readonly language = signal("en");
}
