import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { type DockPosition, SONE_DOCK_PARTS } from "@surface-one/angular/dock";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import {
  type SegmentOption,
  SoneSegmentedComponent,
} from "@surface-one/angular/segmented";

const TEMPLATE = `<div class="demo-stack" style="width: 100%">
  <sone-segmented size="sm" ariaLabel="Dock position" [options]="positions" [(value)]="position" />
  <div class="demo-canvas" style="position: relative; height: 24rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg); background: var(--surface-base)">
    <sone-dock [position]="$any(position())" ariaLabel="Drawing tools">
      @for (t of tools; track t.id) {
        <button soneDockItem [label]="t.label" [shortcut]="t.key" [active]="tool() === t.id" (click)="tool.set(t.id)">
          <sone-icon [icon]="t.icon" />
        </button>
      }
      <div soneDockSeparator></div>
      <button soneDockItem label="Undo" shortcut="Ctrl+Z"><sone-icon icon="undo" /></button>
      <button soneDockItem label="Redo" shortcut="Ctrl+Shift+Z"><sone-icon icon="redo" /></button>
    </sone-dock>
  </div>
  <p class="text-hint">Tool: {{ tool() }} · Tab into the dock, then use the arrow keys.</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-dock-demo",
  imports: [...SONE_DOCK_PARTS, SoneIconComponent, SoneSegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DockDemo {
  readonly positions: SegmentOption[] = (
    ["top", "bottom", "left", "right"] as DockPosition[]
  ).map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }));
  readonly position = signal<string>("bottom");
  readonly tool = signal("select");
  readonly tools: readonly {
    id: string;
    label: string;
    key: string;
    icon: ShellIcon;
  }[] = [
    { id: "select", label: "Select", key: "V", icon: "mouse-pointer" },
    { id: "hand", label: "Hand", key: "H", icon: "hand" },
    { id: "rect", label: "Rectangle", key: "R", icon: "square" },
    { id: "diamond", label: "Decision", key: "D", icon: "diamond" },
    { id: "connector", label: "Connector", key: "C", icon: "spline" },
    { id: "text", label: "Text", key: "T", icon: "type" },
    { id: "note", label: "Sticky note", key: "N", icon: "sticky-note" },
  ];
}
