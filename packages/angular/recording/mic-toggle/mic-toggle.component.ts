import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { SoneToggleDirective } from "@surface-one/angular/toggle-group";

@Component({
  selector: "sone-mic-toggle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneToggleDirective],
  host: {
    "data-slot": "mic-toggle",
    "[attr.data-state]": 'muted() ? "muted" : "live"',
  },
  templateUrl: "./mic-toggle.component.html",
  styleUrl: "./mic-toggle.component.scss",
})
export class SoneMicToggleComponent {
  readonly muted = input(false);
  readonly compact = input(false);
  readonly disabled = input(false);
  readonly muteLabel = input($localize`Mute microphone`);
  readonly unmuteLabel = input($localize`Unmute microphone`);

  readonly muteToggle = output<void>();
}
