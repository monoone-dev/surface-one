import { Directive, TemplateRef, inject, input } from "@angular/core";

import type { SoneBarListItem } from "./bar-list.component";

export interface SoneBarListLabelContext<T> {
  readonly $implicit: T;
}

/**
 * `<ng-template soneBarListLabel let-item>` — renders each row's label instead of its
 * text (a badge, an avatar, a link). `soneBarListLabelOf` only TYPES `let-item` when the
 * items carry extra fields.
 */
@Directive({ selector: "ng-template[soneBarListLabel]" })
export class SoneBarListLabelDirective<
  T extends SoneBarListItem = SoneBarListItem,
> {
  readonly template =
    inject<TemplateRef<SoneBarListLabelContext<T>>>(TemplateRef);

  readonly soneBarListLabelOf = input<readonly T[] | null | undefined>(
    undefined,
  );

  static ngTemplateContextGuard<T extends SoneBarListItem>(
    _dir: SoneBarListLabelDirective<T>,
    ctx: unknown,
  ): ctx is SoneBarListLabelContext<T> {
    return typeof ctx === "object" && ctx !== null;
  }
}
