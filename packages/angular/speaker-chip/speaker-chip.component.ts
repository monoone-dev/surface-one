import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  speakerInitials,
  speakerLabel,
  speakerTone,
} from "@surface-one/angular/format";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";

export type SpeakerChipSize = "sm" | "default";

/**
 * `<sone-speaker-chip>` — who is talking: initials in a tone-coloured avatar plus
 * the speaker's name, both derived from one speaker key (`me`, `others`,
 * `others-0`, `speaker-2`) with `speakerLabel()` / `speakerTone()`.
 */
@Component({
  selector: "sone-speaker-chip",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...SONE_AVATAR_PARTS],
  host: {
    "data-slot": "speaker-chip",
    "[attr.data-tone]": "tone()",
    "[attr.data-size]": "size()",
  },
  templateUrl: "./speaker-chip.component.html",
  styleUrl: "./speaker-chip.component.scss",
})
export class SoneSpeakerChipComponent {
  /** The speaker key; an unknown key is shown as it is. */
  readonly speaker = input<string | null>(null);
  /** Replaces the derived name (a real participant name, say). */
  readonly label = input<string | null>(null);
  readonly size = input<SpeakerChipSize>("default");

  protected readonly name = computed(
    () =>
      this.label()?.trim() ||
      speakerLabel(this.speaker()) ||
      (this.speaker() ?? "").trim(),
  );
  protected readonly initials = computed(() => speakerInitials(this.name()));
  protected readonly tone = computed(() => speakerTone(this.speaker()));
}
