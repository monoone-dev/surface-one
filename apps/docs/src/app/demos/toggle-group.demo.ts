import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_TOGGLE_PARTS,
  type ToggleGroupValue,
} from "@surface-one/angular/toggle-group";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <!-- type="single": the group presses the item whose value matches [(value)] -->
    <div soneToggleGroup variant="outline" type="single" [(value)]="view" aria-label="View">
      @for (v of ['List', 'Board', 'Calendar']; track v) {
        <button soneToggleGroupItem type="button" [value]="v">{{ v }}</button>
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
  <!-- dashed: the off state reads as "still to pick"; stretch: equal-width items and tabs -->
  <div style="display: grid; gap: var(--space-3); max-width: 24rem">
    <div soneToggleGroup variant="dashed" size="sm" spacing="2" stretch role="group" aria-label="Destination">
      @for (d of ['Existing folder', 'New folder']; track d) {
        <button soneToggleGroupItem type="button" [pressed]="dest() === d" (click)="dest.set(d)">{{ d }}</button>
      }
    </div>
    <div soneTabsList stretch aria-label="Kind">
      @for (k of ['Folder', 'Workspace']; track k) {
        <button soneTabsTrigger type="button" [active]="kind() === k" (click)="kind.set(k)">{{ k }}</button>
      }
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
  readonly view = signal<ToggleGroupValue>("List");
  readonly pinned = signal(true);
  readonly locked = signal(false);
  readonly tab = signal("Overview");
  readonly dest = signal("Existing folder");
  readonly kind = signal("Folder");
}
