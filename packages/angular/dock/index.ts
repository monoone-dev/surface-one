import { SoneDockComponent } from "./dock.component";
import {
  SoneDockGroupDirective,
  SoneDockItemDirective,
  SoneDockSeparatorDirective,
} from "./dock-item.directive";

export * from "./dock.component";
export * from "./dock-item.directive";
export * from "./dock.tokens";

/** Every part of the dock, for a component's `imports`. */
export const SONE_DOCK_PARTS = [
  SoneDockComponent,
  SoneDockItemDirective,
  SoneDockGroupDirective,
  SoneDockSeparatorDirective,
] as const;
