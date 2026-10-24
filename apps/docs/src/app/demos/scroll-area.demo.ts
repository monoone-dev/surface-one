import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneScrollAreaDirective } from "@surface-one/angular/scroll-area";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start">
  <div soneScrollArea aria-label="Release tags"
    style="height: 14rem; width: 12rem; padding: var(--space-4); border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)">
    <p style="margin: 0 0 var(--space-3); font-weight: var(--font-weight-medium)">Tags</p>
    @for (tag of tags; track tag) {
      <div style="font-size: var(--font-size-sm)">{{ tag }}</div>
      <div soneSeparator style="margin-block: var(--space-2)"></div>
    }
  </div>
  <div style="width: 18rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)">
    <div soneScrollArea orientation="horizontal" fade aria-label="Swatches">
      <div style="display: flex; gap: var(--space-3); padding: var(--space-4); width: max-content">
        @for (swatch of swatches; track swatch) {
          <div style="display: grid; gap: var(--space-2); justify-items: start">
            <div [style.background]="'var(--' + swatch + ')'"
              style="width: 6rem; height: 6rem; border-radius: var(--radius-md); border: var(--border-width-thin) solid var(--border)"></div>
            <code style="font-size: var(--font-size-xs)">--{{ swatch }}</code>
          </div>
        }
      </div>
    </div>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-scroll-area-demo",
  imports: [SoneScrollAreaDirective, SoneSeparatorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ScrollAreaDemo {
  readonly tags = Array.from({ length: 30 }, (_, i) => `v1.2.0-beta.${30 - i}`);
  readonly swatches = [
    "accent",
    "accent-soft",
    "surface-hover",
    "success",
    "warning",
    "danger",
  ];
}
