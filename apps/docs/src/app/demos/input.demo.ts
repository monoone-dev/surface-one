import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_FIELD_PARTS,
  SONE_INPUT_GROUP_PARTS,
} from "@surface-one/angular/input";

const TEMPLATE = `<form soneFieldGroup style="max-width: 26rem" (submit)="$event.preventDefault()">
  <div soneField>
    <label soneFieldLabel for="demo-name">Display name</label>
    <input id="demo-name" type="text" placeholder="Alex Doe" />
    <p soneFieldDescription>Shown to people you share notes with.</p>
  </div>
  <div soneField invalid>
    <label soneFieldLabel for="demo-site">Website</label>
    <div soneInputGroup>
      <span soneInputGroupAddon><span soneInputGroupText>https://</span></span>
      <input soneInputGroupInput id="demo-site" type="text" value="not a host" />
    </div>
    <p soneFieldError>Enter a host name, such as example.com.</p>
  </div>
  <div soneField>
    <label soneFieldLabel for="demo-quota">Storage limit</label>
    <div soneInputGroup>
      <input soneInputGroupInput id="demo-quota" type="number" value="20" />
      <span soneInputGroupAddon align="inline-end"><span soneInputGroupText>GB</span></span>
      <span soneInputGroupAddon align="inline-end">
        <button soneBtn variant="ghost" size="xs" type="button">Reset</button>
      </span>
    </div>
  </div>
  <fieldset soneFieldSet>
    <legend soneFieldLegend variant="label">Notify me about</legend>
    <div soneFieldGroup variant="choices">
      <div soneField orientation="horizontal">
        <input id="demo-mentions" type="checkbox" checked />
        <label soneFieldLabel for="demo-mentions">Mentions and replies</label>
      </div>
      <div soneField orientation="horizontal">
        <input id="demo-digest" type="checkbox" />
        <label soneFieldLabel for="demo-digest">Weekly digest</label>
      </div>
    </div>
  </fieldset>
  <div soneField>
    <label soneFieldLabel for="demo-bio">Bio</label>
    <textarea id="demo-bio" placeholder="A sentence or two about you."></textarea>
  </div>
</form>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-input-demo",
  imports: [
    ...SONE_FIELD_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    SoneButtonDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class InputDemo {}
