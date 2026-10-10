import { InjectionToken } from "@angular/core";

import type { SoneFlowComponent } from "./flow.component";

/** The canvas, for the controls, the minimap and other children. */
export const SONE_FLOW = new InjectionToken<SoneFlowComponent>("SONE_FLOW");
