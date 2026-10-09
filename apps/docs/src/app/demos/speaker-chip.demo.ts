import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneSpeakerChipComponent } from "@surface-one/angular/speaker-chip";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <sone-speaker-chip speaker="me" />
    <sone-speaker-chip speaker="others" />
    <sone-speaker-chip speaker="others-0" />
    <sone-speaker-chip speaker="others-1" />
  </div>
  <div class="demo-row" style="align-items: center">
    <sone-speaker-chip speaker="others-0" label="Ada Park" />
    <sone-speaker-chip speaker="me" size="sm" />
    <sone-speaker-chip speaker="speaker-3" size="sm" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-speaker-chip-demo",
  imports: [SoneSpeakerChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SpeakerChipDemo {}
