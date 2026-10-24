import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_POPOVER_PARTS } from "@surface-one/angular/popover";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 17rem">
  <button soneBtn variant="outline" type="button" [sonePopoverTrigger]="dimensions">Dimensions</button>
  <ng-template #dimensions let-close="close">
    <div sonePopoverContent aria-labelledby="dimensions-title">
      <div sonePopoverHeader>
        <p sonePopoverTitle id="dimensions-title">Dimensions</p>
        <p sonePopoverDescription>Set the size of the layer.</p>
      </div>
      <div soneField>
        <label soneFieldLabel for="dimensions-width">Width</label>
        <input id="dimensions-width" type="text" value="100%" />
      </div>
      <div soneField>
        <label soneFieldLabel for="dimensions-height">Height</label>
        <input id="dimensions-height" type="text" value="25px" />
      </div>
      <button soneBtn size="sm" type="button" (click)="close()">Apply</button>
    </div>
  </ng-template>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-popover-demo",
  imports: [...SONE_POPOVER_PARTS, ...SONE_FIELD_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PopoverDemo {}
