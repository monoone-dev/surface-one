import { Directive } from "@angular/core";

import { SoneSidePanelCloseComponent } from "./side-panel-close/side-panel-close.component";

@Directive({
  selector: "[soneSidePanel]",
  host: { class: "side-panel", "data-slot": "side-panel" },
})
export class SoneSidePanelDirective {}

@Directive({
  selector: "[soneSidePanelHeader]",
  host: { class: "side-panel-header", "data-slot": "side-panel-header" },
})
export class SoneSidePanelHeaderDirective {}

@Directive({
  selector: "[soneSidePanelTitle]",
  host: { class: "side-panel-title", "data-slot": "side-panel-title" },
})
export class SoneSidePanelTitleDirective {}

@Directive({
  selector: "[soneSidePanelActions]",
  host: { class: "side-panel-actions", "data-slot": "side-panel-actions" },
})
export class SoneSidePanelActionsDirective {}

@Directive({
  selector: "[soneSidePanelContent]",
  host: { class: "side-panel-content", "data-slot": "side-panel-content" },
})
export class SoneSidePanelContentDirective {}

export const SONE_SIDE_PANEL_PARTS = [
  SoneSidePanelDirective,
  SoneSidePanelHeaderDirective,
  SoneSidePanelTitleDirective,
  SoneSidePanelActionsDirective,
  SoneSidePanelContentDirective,
  SoneSidePanelCloseComponent,
] as const;
