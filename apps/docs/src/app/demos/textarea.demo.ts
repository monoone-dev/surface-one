import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_TEXTAREA_PARTS } from "@surface-one/angular/textarea";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <div soneField>
    <label soneFieldLabel for="demo-message">Message</label>
    <textarea soneTextarea id="demo-message" placeholder="Type your message here."></textarea>
  </div>
  <div soneField>
    <label soneFieldLabel for="demo-bio">Bio</label>
    <textarea soneTextarea #bioField="soneTextarea" id="demo-bio" autosize minRows="2" maxRows="6"
      maxlength="160" [value]="bio()" (input)="bio.set(bioField.element.value)"></textarea>
    <sone-textarea-count [for]="bioField" />
    <p soneFieldDescription>Grows from two to six rows. Shown on your public profile.</p>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-textarea-demo",
  imports: [...SONE_TEXTAREA_PARTS, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TextareaDemo {
  readonly bio = signal(
    "Designer in Kraków. I write about type, tokens and tidy interfaces.",
  );
}
