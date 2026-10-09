import { SoneGraphCanvasDirective } from "./graph-canvas.directive";
import { SoneGraphCardComponent } from "./graph-card/graph-card.component";
import { SoneGraphControlsComponent } from "./graph-controls/graph-controls.component";
import { SoneGraphComponent } from "./graph.component";
import {
  SoneGraphCardTemplateDirective,
  SoneGraphLegendDirective,
} from "./graph-slots.directive";

export {
  SoneGraphCanvasDirective,
  SoneGraphCardComponent,
  SoneGraphCardTemplateDirective,
  SoneGraphComponent,
  SoneGraphControlsComponent,
  SoneGraphLegendDirective,
};

/** `<sone-graph>` with its slots: `[soneGraphLegend]` and `ng-template[soneGraphCard]`. */
export const SONE_GRAPH_PARTS = [
  SoneGraphComponent,
  SoneGraphLegendDirective,
  SoneGraphCardTemplateDirective,
] as const;
