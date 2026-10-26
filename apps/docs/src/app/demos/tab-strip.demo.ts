import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneTabStripComponent,
  SoneTabStripTrailingDirective,
  type TabStripTab,
} from "@surface-one/angular/tab-strip";

const TEMPLATE = `<div
  style="display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-2); border-radius: var(--island-radius); background: var(--app-backdrop)"
>
  <sone-tab-strip
    ariaLabel="Documents"
    panelIdPrefix="doc"
    [tabs]="tabs()"
    [(active)]="active"
    closable
    addable
    (close)="close($event)"
    (add)="add()"
  >
    <span soneTabStripTrailing class="text-hint">{{ tabs().length }} open</span>
  </sone-tab-strip>
  @for (tab of tabs(); track tab.id) {
    <section
      role="tabpanel"
      [id]="'doc-' + tab.id"
      [attr.aria-labelledby]="'doc-tab-' + tab.id"
      [hidden]="tab.id !== active()"
      tabindex="0"
      style="min-height: 8rem; padding: var(--space-4); border-radius: var(--island-radius); background: var(--surface-base); box-shadow: var(--island-shadow)"
    >
      <p>{{ tab.label }}</p>
    </section>
  }
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tab-strip-demo",
  imports: [SoneTabStripComponent, SoneTabStripTrailingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TabStripDemo {
  readonly tabs = signal<TabStripTab[]>([
    { id: "plan", label: "Release plan", status: "done" },
    { id: "agent", label: "Agent run", status: "busy", note: "4 min" },
    { id: "review", label: "Review notes", status: "waiting", note: "waits" },
  ]);
  readonly active = signal<string | null>("agent");
  private count = 0;

  close(id: string): void {
    const tabs = this.tabs();
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    if (this.active() === id)
      this.active.set((rest[i] ?? rest[i - 1])?.id ?? null);
    this.tabs.set(rest);
  }

  add(): void {
    const id = `new-${++this.count}`;
    this.tabs.update((tabs) => [
      ...tabs,
      { id, label: `Untitled ${this.count}` },
    ]);
    this.active.set(id);
  }
}
