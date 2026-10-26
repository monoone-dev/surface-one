import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneMarkComponent, MARK_TONES } from "@surface-one/angular/mark";

const TEMPLATE = `<div class="demo-stack">
  <div style="display: flex; flex-wrap: wrap; gap: var(--space-3)">
    @for (tone of tones; track tone) {
      <sone-mark [tone]="tone" icon="sparkles" [label]="tone" />
    }
  </div>
  <div style="display: flex; align-items: center; gap: var(--space-3)">
    <sone-mark size="sm" icon="code" tone="iris" />
    <sone-mark icon="code" tone="iris" />
    <sone-mark size="lg" icon="code" tone="iris" />
    <sone-mark [size]="56" icon="code" tone="iris" label="Code" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-mark-demo",
  imports: [SoneMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MarkDemo {
  readonly tones = MARK_TONES;
}
