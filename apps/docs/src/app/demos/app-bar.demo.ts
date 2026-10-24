import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_APP_BAR_PARTS } from "@surface-one/angular/app-bar";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <sone-app-bar
    title="Inbox"
    subtitle="12 unread"
    [level]="3"
    showBack
    (back)="backs.set(backs() + 1)"
  >
    <button soneAppBarTrailing soneBtn type="button" variant="ghost" size="icon" aria-label="Search">
      <sone-icon icon="search" />
    </button>
  </sone-app-bar>
  <p class="text-hint" aria-live="polite">Back pressed {{ backs() }} times</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-app-bar-demo",
  imports: [...SONE_APP_BAR_PARTS, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AppBarDemo {
  readonly backs = signal(0);
}
