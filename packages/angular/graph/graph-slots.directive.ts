import { Directive, TemplateRef, inject } from "@angular/core";
import type { SoneGraphNode } from "./graph.types";

/** Marks content projected into the controls' info panel (a legend, counts). */
@Directive({
  selector: "[soneGraphLegend]",
  host: { "data-slot": "graph-legend" },
})
export class SoneGraphLegendDirective {}

/** What a `soneGraphCard` template receives. */
export interface SoneGraphCardContext {
  $implicit: SoneGraphNode;
  pinned: boolean;
  /** The `describe(node)` text. */
  description: string;
  /** The custom property chain of the node's tone, as a CSS colour. */
  tone: string;
}

/**
 * `<ng-template soneGraphCard let-node let-pinned="pinned">` replaces the body of the
 * node card (title + meta); the card's position and its Open action stay.
 */
@Directive({ selector: "ng-template[soneGraphCard]" })
export class SoneGraphCardTemplateDirective {
  readonly template = inject<TemplateRef<SoneGraphCardContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: SoneGraphCardTemplateDirective,
    ctx: unknown,
  ): ctx is SoneGraphCardContext {
    return true;
  }
}
