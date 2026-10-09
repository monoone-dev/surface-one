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
  SoneProcessingStatusComponent,
  SoneRecordButtonDirective,
  SoneRecordingIndicatorComponent,
  SoneStatusOrbComponent,
} from "@surface-one/angular/recording";

const TEMPLATE = `<div class="demo-stack" style="max-width: 360px; width: 100%">
  <div class="demo-row">
    <button soneRecordButton type="button" [state]="recording() ? 'recording' : 'idle'"
      [attr.aria-label]="recording() ? 'Stop recording' : 'Start recording'"
      (click)="recording.set(!recording())"></button>
    <sone-mic-toggle [muted]="muted()" [disabled]="!recording()" (muteToggle)="muted.set(!muted())" />
    <button soneRecordButton withLabel size="sm" type="button"
      [state]="paused() ? 'paused' : 'recording'" [disabled]="!recording()"
      (click)="paused.set(!paused())">{{ paused() ? 'Resume' : 'Pause' }}</button>
  </div>
  @if (recording()) {
    <sone-recording-indicator [seconds]="seconds()" [state]="paused() ? 'paused' : 'live'"
      [label]="paused() ? 'Paused' : muted() ? 'Recording · muted' : 'Recording'" />
  } @else {
    <div class="demo-row">
      <sone-status-orb state="ready" />
      <span>Ready</span>
    </div>
  }
  <div soneField>
    <label soneFieldLabel for="recording-demo-level">Simulated input level</label>
    <input #range id="recording-demo-level" type="range" min="0" max="1" step="0.05"
      [value]="level()" (input)="level.set(range.valueAsNumber)" />
  </div>
  <sone-level-meter [level]="meterLevel()" />
  <sone-level-meter [bars]="24" [history]="history" />
  <div class="demo-row" style="align-items: center">
    <sone-status-orb state="paused" /><span>Paused</span>
    <sone-status-orb state="queued" /><span>Queued</span>
    <sone-status-orb state="error" /><span>Failed</span>
  </div>
  <sone-processing-status stage="summarizing" [progress]="0.42" />
  <sone-processing-status stage="error" size="sm" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-recording-demo",
  imports: [
    SoneRecordButtonDirective,
    SoneMicToggleComponent,
    SoneStatusOrbComponent,
    SoneLevelMeterComponent,
    SoneRecordingIndicatorComponent,
    SoneProcessingStatusComponent,
    ...SONE_FIELD_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RecordingDemo {
  readonly recording = signal(false);
  readonly muted = signal(false);
  readonly paused = signal(false);
  readonly level = signal(0.45);
  readonly seconds = signal(754);
  /** Recent input levels, oldest first — a recorder would push one per tick. */
  readonly history = Array.from(
    { length: 24 },
    (_, i) => 0.5 + 0.45 * Math.sin(i / 2.3) * Math.cos(i / 5.1),
  );
  /** The meter only moves while recording, unmuted and not paused. */
  readonly meterLevel = computed(() =>
    this.recording() && !this.muted() && !this.paused() ? this.level() : 0,
  );
}
