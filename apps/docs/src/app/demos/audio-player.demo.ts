import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneAudioPlayerComponent } from "@surface-one/angular/audio-player";

const TEMPLATE = `<div class="demo-stack" style="max-width: 560px; width: 100%">
  <sone-audio-player
    [src]="recording"
    [skipSeconds]="15"
    [rates]="[1, 1.5, 2]"
    (timeUpdate)="position.set($event)"
  />
  <span style="color: var(--text-secondary); font-size: var(--font-size-sm)">
    Position: {{ position().toFixed(1) }} s
  </span>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-audio-player-demo",
  imports: [SoneAudioPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AudioPlayerDemo {
  /** A tiny silent WAV inlined as a data URL, so the demo needs no audio file. */
  readonly recording =
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
  readonly position = signal(0);
}
