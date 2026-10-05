import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_MARKER_PARTS } from "@surface-one/angular/marker";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

const TEMPLATE = `<div class="demo-stack" style="max-width: 480px; width: 100%">
  <div soneMarker>
    <span soneMarkerIcon><sone-spinner [size]="16" [label]="null" /></span>
    <span soneMarkerContent class="shimmer">Thinking…</span>
  </div>
  <div soneMarker>
    <span soneMarkerIcon aria-hidden="true">✓</span>
    <span soneMarkerContent>Searched 4 meeting notes</span>
  </div>
  <div soneMarker variant="separator">
    <span soneMarkerContent>Conversation compacted</span>
  </div>
  <div soneMarker variant="border">
    <span soneMarkerContent>Earlier today</span>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-marker-demo",
  imports: [...SONE_MARKER_PARTS, SoneSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MarkerDemo {}
