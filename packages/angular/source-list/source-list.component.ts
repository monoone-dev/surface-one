import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  input,
  signal,
} from "@angular/core";

import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSourceListItemDirective } from "./source-list-item.directive";

export type SourceListVariant = "chip" | "row";
export type SourceListSize = "default" | "sm";

@Component({
  selector: "sone-source-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, SoneBadgeDirective, SoneButtonDirective],
  templateUrl: "./source-list.component.html",
  styleUrl: "./source-list.component.scss",
  host: {
    "data-slot": "source-list",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-columns]": "columns()",
  },
})
export class SoneSourceListComponent<T> {
  readonly items = input<readonly T[]>([]);
  readonly trackBy = input.required<(item: T) => string>();
  readonly variant = input<SourceListVariant>("row");
  readonly size = input<SourceListSize>("default");
  readonly label = input("");
  readonly ariaLabel = input<string | null>(null);
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly limit = input<number | null>(null);
  readonly columns = input<1 | 2>(1);
  readonly list = input<boolean | null>(null);

  protected readonly item = contentChild.required<
    SoneSourceListItemDirective<T>
  >(SoneSourceListItemDirective);

  private readonly _expanded = signal(false);
  readonly expanded = this._expanded.asReadonly();

  protected readonly isList = computed(
    () => this.list() ?? this.variant() === "row",
  );

  protected readonly hiddenCount = computed(() => {
    const limit = this.limit();
    return limit === null ? 0 : Math.max(0, this.items().length - limit);
  });

  protected readonly visible = computed<readonly T[]>(() => {
    const limit = this.limit();
    return this._expanded() || limit === null
      ? this.items()
      : this.items().slice(0, limit);
  });

  toggle(): void {
    this._expanded.update((v) => !v);
  }
}
