import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SONE_RESIZABLE_PARTS } from "@surface-one/angular/resizable";

const TEMPLATE = `<div class="demo-stack" style="max-width: 32rem; width: 100%">
  <sone-resizable-group [(sizes)]="sizes"
    style="height: 14rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)">
    <sone-resizable-panel defaultSize="30" minSize="15" collapsible>
      <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Sidebar</div>
    </sone-resizable-panel>
    <sone-resizable-handle withHandle />
    <sone-resizable-panel defaultSize="70" minSize="30">
      <sone-resizable-group direction="vertical">
        <sone-resizable-panel defaultSize="60">
          <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Content</div>
        </sone-resizable-panel>
        <sone-resizable-handle />
        <sone-resizable-panel defaultSize="40">
          <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Console</div>
        </sone-resizable-panel>
      </sone-resizable-group>
    </sone-resizable-panel>
  </sone-resizable-group>
  <p style="margin: 0; color: var(--text-secondary)">Sidebar: {{ sidebar() }}%</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-resizable-demo",
  imports: [...SONE_RESIZABLE_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ResizableDemo {
  readonly sizes = signal<readonly number[]>([]);
  readonly sidebar = computed(() => Math.round(this.sizes()[0] ?? 30));
}
