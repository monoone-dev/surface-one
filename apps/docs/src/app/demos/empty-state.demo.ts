import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_EMPTY_PARTS,
  SoneEmptyStateComponent,
} from "@surface-one/angular/empty-state";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<sone-empty-state>
  <div soneEmptyHeader>
    <div soneEmptyMedia variant="icon"><sone-icon icon="meetings" /></div>
    <h3 soneEmptyTitle>No meetings yet</h3>
    <p soneEmptyDescription>Record a meeting and it is transcribed right here, on this device.</p>
  </div>
  <div soneEmptyContent>
    <div class="demo-row">
      <button soneBtn type="button">Start recording</button>
      <button soneBtn variant="outline" type="button">Import audio</button>
    </div>
  </div>
</sone-empty-state>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-empty-state-demo",
  imports: [
    SoneEmptyStateComponent,
    ...SONE_EMPTY_PARTS,
    SoneButtonDirective,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class EmptyStateDemo {}
