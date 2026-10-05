import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";

export type TreeRowIcon =
  "folder" | "locked" | "space" | "meeting" | "note" | "task" | "dashboard";

/**
 * Nesting is DRAWN, not built: consumers stay FLAT (one `@for` over
 * depth-tagged lines) rather than a recursive component pair, so there is
 * no T2 cycle risk.
 *
 * Owns 100% of the row's visual box so a Meetings row and a Notes row never
 * diverge; feature-specific content projects in as trailing `<ng-content>`.
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

  readonly activate = output<void>();
  readonly toggleExpand = output<void>();
}
