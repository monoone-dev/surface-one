import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneSidebarComponent } from "@surface-one/angular/sidebar";
import { SoneTreeDirective } from "@surface-one/angular/tree";
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
  expandable: boolean;
}

const TEMPLATE = `<sone-sidebar style="width: 18rem">
  <div soneTree aria-label="Workspace">
    @for (line of visibleLines(); track line.id) {
      <sone-tree-row
        [label]="line.label"
        [icon]="line.icon"
        [depth]="line.depth"
        [expandable]="line.expandable"
        [expanded]="expanded().has(line.id)"
        [selected]="selectedId() === line.id"
        (activate)="selectedId.set(line.id)"
        (toggleExpand)="toggle(line.id)"
      />
    }
  </div>
</sone-sidebar>
<p style="margin: var(--space-3) 0 0; color: var(--text-secondary)">Opened: {{ selectedId() }}</p>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tree-demo",
  imports: [SoneSidebarComponent, SoneTreeDirective, SoneTreeRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TreeDemo {
  // FLAT lines tagged with depth; the tree reads order from the DOM and level from depth.
  readonly lines: TreeLine[] = [
    {
      id: "product",
      label: "Product",
      icon: "folder",
      depth: 0,
      parent: null,
      expandable: true,
    },
    {
      id: "design",
      label: "Design",
      icon: "folder",
      depth: 1,
      parent: "product",
      expandable: true,
    },
    {
      id: "specs",
      label: "Specs review",
      icon: "meeting",
      depth: 2,
      parent: "design",
      expandable: false,
    },
    {
      id: "tokens",
      label: "Token audit",
      icon: "note",
      depth: 2,
      parent: "design",
      expandable: false,
    },
    {
      id: "roadmap",
      label: "Roadmap review",
      icon: "meeting",
      depth: 1,
      parent: "product",
      expandable: false,
    },
    {
      id: "launch",
      label: "Launch checklist",
      icon: "task",
      depth: 1,
      parent: "product",
      expandable: false,
    },
    {
      id: "research",
      label: "Research",
      icon: "space",
      depth: 0,
      parent: null,
      expandable: true,
    },
    {
      id: "interviews",
      label: "Interviews",
      icon: "note",
      depth: 1,
      parent: "research",
      expandable: false,
    },
    {
      id: "one-on-ones",
      label: "1:1s",
      icon: "locked",
      depth: 0,
      parent: null,
      expandable: false,
    },
  ];
  readonly expanded = signal(new Set(["product"]));
  readonly selectedId = signal("roadmap");

  readonly visibleLines = computed(() => {
    const open = this.expanded();
    const byId = new Map(this.lines.map((line) => [line.id, line]));
    const shown = (line: TreeLine): boolean =>
      line.parent === null ||
      (open.has(line.parent) && shown(byId.get(line.parent)!));
    return this.lines.filter(shown);
  });

  toggle(id: string): void {
    this.expanded.update((open) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
