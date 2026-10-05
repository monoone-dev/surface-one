import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <div soneToggleGroup variant="outline" role="group" aria-label="View">
      @for (v of ['List', 'Board', 'Calendar']; track v) {
        <button soneToggleGroupItem type="button" [pressed]="view() === v" (click)="view.set(v)">{{ v }}</button>
      }
    </div>
    <button soneToggle variant="outline" type="button" [pressed]="pinned()" (click)="pinned.set(!pinned())">
      <sone-icon icon="star" inline="start" /> Pinned
    </button>
    <button soneToggle type="button" aria-label="Lock editing" [pressed]="locked()" (click)="locked.set(!locked())">
      <sone-icon icon="lock" />
    </button>
  </div>
  <div style="display: grid; gap: var(--space-3)">
    <div soneTabsList role="tablist" aria-label="Project">
      @for (t of ['Overview', 'Activity', 'Settings']; track t) {
        <button soneTabsTrigger role="tab" type="button" [id]="'demo-tab-' + t"
          [active]="tab() === t" [attr.tabindex]="tab() === t ? 0 : -1" (click)="tab.set(t)">{{ t }}</button>
      }
    </div>
    <div role="tabpanel" [attr.aria-labelledby]="'demo-tab-' + tab()" style="color: var(--text-secondary)">
      {{ tab() }} content goes here.
    </div>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-toggle-group-demo",
  imports: [...SONE_TOGGLE_PARTS, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ToggleGroupDemo {
  readonly view = signal("List");
  readonly pinned = signal(true);
  readonly locked = signal(false);
  readonly tab = signal("Overview");
}
