import { Directive, TemplateRef, inject, input } from "@angular/core";

import type { SoneFlowNode, SoneFlowPanelPosition } from "./flow.types";

/** What a `soneFlowNode` template receives. */
export interface SoneFlowNodeContext<D = unknown> {
  $implicit: SoneFlowNode<D>;
  selected: boolean;
}

/**
 * `<ng-template soneFlowNode let-node let-selected="selected">` draws the body of
 * every node instead of the default icon, label and description. The canvas keeps
 * the box, the selection, the dragging and the connection handles. Controls inside
 * the template (buttons, inputs) work as usual and never start a drag.
 */
@Directive({ selector: "ng-template[soneFlowNode]" })
export class SoneFlowNodeTemplateDirective {
  readonly template = inject<TemplateRef<SoneFlowNodeContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: SoneFlowNodeTemplateDirective,
    ctx: unknown,
  ): ctx is SoneFlowNodeContext {
    return true;
  }
}

/** Pins projected content (a legend, a run button) to a corner or edge of the canvas. */
@Directive({
  selector: "[soneFlowPanel]",
  host: {
    class: "flow-panel",
    "data-slot": "flow-panel",
    "[attr.data-position]": "position()",
  },
})
export class SoneFlowPanelDirective {
  readonly position = input<SoneFlowPanelPosition, SoneFlowPanelPosition | "">(
    "top-left",
    { alias: "soneFlowPanel", transform: (v) => v || "top-left" },
  );
}
