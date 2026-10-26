import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneButtonDirective,
  SoneButtonGroupDirective,
} from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" variant="accent">Accent</button>
    <button soneBtn type="button" variant="secondary">Secondary</button>
    <button soneBtn type="button" variant="soft">Soft</button>
    <button soneBtn type="button" variant="outline">Outline</button>
    <button soneBtn type="button" variant="ghost">Ghost</button>
    <button soneBtn type="button" variant="destructive">Destructive</button>
    <button soneBtn type="button" variant="link">Link</button>
  </div>
  <div class="demo-row">
    <button soneBtn type="button" size="xs">Extra small</button>
    <button soneBtn type="button" size="sm">Small</button>
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" size="lg">Large</button>
    <button soneBtn type="button" disabled>Disabled</button>
  </div>
  <div class="demo-row" style="align-items: center">
    <button soneBtn type="button" variant="ghost" size="icon" aria-label="Share"><sone-icon icon="share" /></button>
    <button soneBtn type="button" variant="soft" size="icon" aria-label="Settings"><sone-icon icon="settings" /></button>
    <button soneBtn type="button" variant="outline" size="icon" aria-label="Copy"><sone-icon icon="copy" /></button>
    <!-- Toggle buttons: aria-pressed="true" draws the pressed fill -->
    <button soneBtn type="button" variant="ghost" size="icon" aria-label="Star"
      [attr.aria-pressed]="starred()" (click)="starred.set(!starred())"><sone-icon icon="star" /></button>
    <button soneBtn type="button" variant="outline" size="icon" aria-label="Pin to sidebar"
      [attr.aria-pressed]="pinned()" (click)="pinned.set(!pinned())"><sone-icon icon="bookmark" /></button>
  </div>
  <div soneButtonGroup>
    <button soneBtn type="button" variant="outline">Day</button>
    <button soneBtn type="button" variant="outline">Week</button>
    <button soneBtn type="button" variant="outline">Month</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-button-demo",
  imports: [SoneButtonDirective, SoneButtonGroupDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ButtonDemo {
  readonly starred = signal(true);
  readonly pinned = signal(true);
}
