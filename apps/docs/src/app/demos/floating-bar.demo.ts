import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  type FloatingBarState,
  SoneFloatingBarComponent,
} from "@surface-one/angular/floating-bar";
import {
  SoneStatusOrbComponent,
  type StatusOrbState,
} from "@surface-one/angular/recording";

const TEMPLATE = `<div class="demo-stack" style="max-width: 420px; width: 100%">
  @if (visible()) {
    <div style="height: 3rem">
      <sone-floating-bar [state]="state()" (closed)="visible.set(false)">
        <sone-status-orb [state]="orb()" />
        <span>{{ state() === 'live' ? 'Recording · 02:14' : state() === 'processing' ? 'Writing the note…' : 'Ready · ⌘⇧R' }}</span>
      </sone-floating-bar>
    </div>
  } @else {
    <button soneBtn variant="outline" type="button" (click)="visible.set(true)">Show the bar</button>
  }
  <div class="demo-row">
    @for (s of states; track s) {
      <button soneBtn size="sm" [variant]="state() === s ? 'default' : 'outline'" type="button" (click)="state.set(s)">{{ s }}</button>
    }
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-floating-bar-demo",
  imports: [
    SoneButtonDirective,
    SoneFloatingBarComponent,
    SoneStatusOrbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class FloatingBarDemo {
  readonly states: FloatingBarState[] = ["idle", "live", "processing"];
  readonly state = signal<FloatingBarState>("idle");
  readonly visible = signal(true);
  readonly orb = computed<StatusOrbState>(() => {
    const state = this.state();
    return state === "idle" ? "ready" : state;
  });
}
