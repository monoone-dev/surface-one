import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneSidebarComponent } from "@surface-one/angular/sidebar";
import {
  SoneTreeRowComponent,
  type TreeRowIcon,
} from "@surface-one/angular/tree-row";

interface TreeLine {
  id: string;
  label: string;
  icon: TreeRowIcon;
  depth: number;
  parent: string | null;
  count: number | null;
  expandable: boolean;
}

const TEMPLATE = `<sone-sidebar style="width: 18rem">
  @for (line of visibleLines(); track line.id) {
    <sone-tree-row
      [label]="line.label"
      [icon]="line.icon"
      [depth]="line.depth"
      [count]="line.count"
      [expandable]="line.expandable"
      [expanded]="expanded().has(line.id)"
      [selected]="selectedId() === line.id"
      (activate)="selectedId.set(line.id)"
      (toggleExpand)="toggle(line.id)"
    />
  }
</sone-sidebar>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tree-row-demo",
  imports: [SoneSidebarComponent, SoneTreeRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TreeRowDemo {
  // The tree stays FLAT: one list of depth-tagged lines, nesting is indentation.
  readonly lines: TreeLine[] = [
    {
      id: "product",
      label: "Product",
      icon: "folder",
      depth: 0,
      parent: null,
      count: 4,
      expandable: true,
    },
    {
      id: "roadmap",
      label: "Roadmap review",
      icon: "meeting",
      depth: 1,
      parent: "product",
      count: null,
      expandable: false,
    },
    {
      id: "launch",
      label: "Launch checklist",
      icon: "task",
      depth: 1,
      parent: "product",
      count: null,
      expandable: false,
    },
    {
      id: "pricing",
      label: "Pricing notes",
      icon: "note",
      depth: 1,
      parent: "product",
      count: null,
      expandable: false,
    },
    {
      id: "metrics",
      label: "Metrics board",
      icon: "dashboard",
      depth: 1,
      parent: "product",
      count: null,
      expandable: false,
    },
    {
      id: "one-on-ones",
      label: "1:1s",
      icon: "locked",
      depth: 0,
      parent: null,
      count: 2,
      expandable: false,
    },
  ];
  readonly expanded = signal(new Set(["product"]));
  readonly selectedId = signal("roadmap");

  readonly visibleLines = computed(() =>
    this.lines.filter(
      (line) => line.parent === null || this.expanded().has(line.parent),
    ),
  );

  toggle(id: string): void {
    this.expanded.update((open) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
