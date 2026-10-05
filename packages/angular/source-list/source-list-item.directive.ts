import { Directive, TemplateRef, inject, input } from "@angular/core";

export interface SourceListItemContext<T> {
  readonly $implicit: T;
}

// `soneSourceListItemOf` only TYPES `let-s`; the list itself decides which items render.
@Directive({ selector: "ng-template[soneSourceListItem]" })
export class SoneSourceListItemDirective<T> {
  readonly template =
    inject<TemplateRef<SourceListItemContext<T>>>(TemplateRef);
  readonly soneSourceListItemOf = input<readonly T[] | null | undefined>(
    undefined,
  );

  static ngTemplateContextGuard<T>(
    _dir: SoneSourceListItemDirective<T>,
    ctx: unknown,
  ): ctx is SourceListItemContext<T> {
    return typeof ctx === "object" && ctx !== null;
  }
}
