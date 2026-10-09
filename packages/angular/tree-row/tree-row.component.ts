import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
} from "@angular/core";

import { SONE_TREE, type SoneTreeItemRef } from "@surface-one/angular/core";

export type TreeRowIcon =
  "folder" | "locked" | "space" | "meeting" | "note" | "task" | "dashboard";

/**
 * Nesting is DRAWN, not built: consumers stay FLAT (one `@for` over
 * depth-tagged lines) rather than a recursive component pair, so there is
 * no T2 cycle risk.
 *
 * Owns 100% of the row's visual box so a Meetings row and a Notes row never
 * diverge; feature-specific content projects in as trailing `<ng-content>`.
 *
 * Inside a `[soneTree]` (`@surface-one/angular/tree`) the row becomes a
 * `role="treeitem"` with `aria-level` / `aria-expanded` / `aria-selected` and the
 * tree's roving tabindex; its own buttons leave the Tab order. Outside a tree it
 * renders exactly as before.
 */
@Component({
  selector: "sone-tree-row",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "sidebar-menu-item",
    "data-sidebar": "menu-item",
    "[class.is-selected]": "selected()",
    "[attr.data-depth]": "depth()",
    "[style.--tree-row-depth]": "depth()",
  },
  templateUrl: "./tree-row.component.html",
  styleUrl: "./tree-row.component.scss",
})
export class SoneTreeRowComponent {
  readonly label = input.required<string>();
  readonly depth = input(0);
  readonly selected = input(false);
  readonly icon = input<TreeRowIcon>("folder");
  readonly emoji = input<string | null>(null);
  readonly count = input<number | null>(null);
  readonly expandable = input(false);
  readonly expanded = input(false);

  protected readonly caretLabel = computed(() =>
    this.expanded()
      ? $localize`Collapse ${this.label()}:name:`
      : $localize`Expand ${this.label()}:name:`,
  );

  /** `aria-level` inside a `[soneTree]` (default: `depth + 1`). */
  readonly level = input<number | null>(null);
  /** Whether the row has children, for `aria-expanded` (default: `expandable`). */
  readonly hasChildren = input<boolean | null>(null);

  readonly activate = output<void>();
  readonly toggleExpand = output<void>();

  private readonly tree = inject(SONE_TREE, { optional: true });
  /** True inside a `[soneTree]`: the row is a treeitem and its buttons are not Tab stops. */
  protected readonly inTree = !!this.tree;

  constructor() {
    const tree = this.tree;
    if (!tree) return;
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const level = (): number => this.level() ?? this.depth() + 1;
    const hasChildren = (): boolean => this.hasChildren() ?? this.expandable();
    const ref: SoneTreeItemRef = {
      element,
      level,
      expandable: hasChildren,
      expanded: () => this.expanded(),
      selected: () => this.selected(),
      label: () => this.label(),
      expand: () => {
        if (hasChildren() && !this.expanded()) this.toggleExpand.emit();
      },
      collapse: () => {
        if (hasChildren() && this.expanded()) this.toggleExpand.emit();
      },
      activate: () => this.activate.emit(),
    };
    const unregister = tree.register(ref);
    inject(DestroyRef).onDestroy(unregister);
    // Set imperatively, only in a tree: host bindings would strip the `role` /
    // `aria-*` a consumer already writes on rows outside one.
    effect(() => {
      element.setAttribute("role", "treeitem");
      element.setAttribute("aria-level", String(level()));
      if (hasChildren()) {
        element.setAttribute("aria-expanded", String(this.expanded()));
      } else {
        element.removeAttribute("aria-expanded");
      }
      element.setAttribute("aria-selected", String(this.selected()));
      element.setAttribute("tabindex", tree.tabStop() === ref ? "0" : "-1");
    });
  }
}
