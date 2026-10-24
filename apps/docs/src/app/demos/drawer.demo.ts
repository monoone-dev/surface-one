import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_DIALOG_PARTS } from "@surface-one/angular/dialog";
import { SoneDrawerComponent } from "@surface-one/angular/drawer";

const TEMPLATE = `<div class="demo-row">
  <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open drawer</button>
  <button soneBtn variant="outline" type="button" (click)="snapped.set(true)">Open with snap points</button>
</div>

<sone-drawer [(open)]="open">
  <header soneDrawerHeader>
    <h2 soneDrawerTitle>Move goal</h2>
    <p soneDrawerDescription>Set your daily activity goal.</p>
  </header>
  <div class="demo-row" style="justify-content: center">
    <button soneBtn variant="outline" size="icon" type="button" aria-label="Decrease" (click)="goal.set(goal() - 10)">−</button>
    <strong style="font-size: var(--font-size-3xl); min-width: 6ch; text-align: center">{{ goal() }}</strong>
    <button soneBtn variant="outline" size="icon" type="button" aria-label="Increase" (click)="goal.set(goal() + 10)">+</button>
  </div>
  <footer soneDrawerFooter>
    <button soneBtn type="button" (click)="open.set(false)">Submit</button>
    <button soneBtn variant="outline" type="button" (click)="open.set(false)">Cancel</button>
  </footer>
</sone-drawer>

<sone-drawer [(open)]="snapped" [snapPoints]="[0.4, 1]" [(activeSnapPoint)]="snap">
  <header soneDrawerHeader>
    <h2 soneDrawerTitle>Activity</h2>
    <p soneDrawerDescription>Drag the handle up for the whole week, down to close.</p>
  </header>
  <ul style="margin: 0; padding-inline: var(--space-6)">
    @for (day of days; track day) {
      <li>{{ day }}: 30 minutes</li>
    }
  </ul>
</sone-drawer>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-drawer-demo",
  imports: [SoneButtonDirective, SoneDrawerComponent, ...SONE_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DrawerDemo {
  readonly open = signal(false);
  readonly snapped = signal(false);
  readonly snap = signal<number | null>(0.4);
  readonly goal = signal(350);
  readonly days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
}
