import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import {
  SoneLevelMeterComponent,
  SoneMicToggleComponent,
  SoneRecordButtonDirective,
  SoneStatusOrbComponent,
} from "@surface-one/angular/recording";

const TEMPLATE = `<div class="demo-stack" style="max-width: 360px; width: 100%">
  <div class="demo-row">
    <button soneRecordButton type="button" [state]="recording() ? 'recording' : 'idle'"
      [attr.aria-label]="recording() ? 'Stop recording' : 'Start recording'"
      (click)="recording.set(!recording())"></button>
    <sone-mic-toggle [muted]="muted()" [disabled]="!recording()" (muteToggle)="muted.set(!muted())" />
  </div>
  <div class="demo-row">
    <sone-status-orb [state]="recording() ? 'live' : 'ready'" />
    <span>{{ recording() ? (muted() ? 'Recording · muted' : 'Recording') : 'Ready' }}</span>
  </div>
  <div soneField>
    <label soneFieldLabel for="recording-demo-level">Simulated input level</label>
    <input #range id="recording-demo-level" type="range" min="0" max="1" step="0.05"
      [value]="level()" (input)="level.set(range.valueAsNumber)" />
  </div>
  <sone-level-meter [level]="meterLevel()" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-recording-demo",
  imports: [
    SoneRecordButtonDirective,
    SoneMicToggleComponent,
    SoneStatusOrbComponent,
    SoneLevelMeterComponent,
    ...SONE_FIELD_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RecordingDemo {
  readonly recording = signal(false);
  readonly muted = signal(false);
  readonly level = signal(0.45);
  /** The meter only moves while recording and unmuted. */
  readonly meterLevel = computed(() =>
    this.recording() && !this.muted() ? this.level() : 0,
  );
}
