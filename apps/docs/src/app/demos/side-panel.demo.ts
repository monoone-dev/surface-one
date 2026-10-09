import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_SIDE_PANEL_PARTS } from "@surface-one/angular/side-panel";

const TEMPLATE = `<div class="demo-row" style="align-items: stretch; width: 100%; min-height: 280px">
  <div class="demo-stack" style="flex: 1">
    <p>Weekly sync — the note stays in place while the panel docks beside it.</p>
    @if (!open()) {
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open details</button>
    }
  </div>
  @if (open()) {
    <aside soneSidePanel aria-labelledby="side-panel-demo-title">
      <header soneSidePanelHeader>
        <h2 soneSidePanelTitle id="side-panel-demo-title">Details</h2>
        <div soneSidePanelActions>
          <sone-side-panel-close label="Close details" (closed)="open.set(false)" />
        </div>
      </header>
      <div soneSidePanelContent>
        <p>Created 9 October · 3 participants · 42 minutes.</p>
      </div>
    </aside>
  }
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-side-panel-demo",
  imports: [SoneButtonDirective, ...SONE_SIDE_PANEL_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SidePanelDemo {
  readonly open = signal(true);
}
