import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_BUBBLE_PARTS } from "@surface-one/angular/bubble";
import { SONE_MARKER_PARTS } from "@surface-one/angular/marker";
import { SONE_MESSAGE_PARTS } from "@surface-one/angular/message";
import { SoneSpeakerInitialsPipe } from "@surface-one/angular/transcript";
import type { TranscriptTone } from "@surface-one/angular/transcript";

export interface LiveTranscriptLine {
  id: string;
  speaker: string;
  tone?: TranscriptTone;
  timeLabel: string;
  datetime?: string;
  final: boolean;
  flag?: string | null;
  text: string;
  translation?: string;
}

@Component({
  selector: "sone-live-transcript",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneSpeakerInitialsPipe,
    SoneButtonDirective,
    SoneBadgeDirective,
    ...SONE_AVATAR_PARTS,
    ...SONE_MESSAGE_PARTS,
    ...SONE_BUBBLE_PARTS,
    ...SONE_MARKER_PARTS,
  ],
  host: {
    "data-slot": "live-transcript",
    "[attr.data-state]": 'following() ? "following" : "scrolled"',
  },
  templateUrl: "./live-transcript.component.html",
  styleUrl: "./live-transcript.component.scss",
})
export class SoneLiveTranscriptComponent {
  readonly lines = input<LiveTranscriptLine[]>([]);
  readonly following = input(true);
  readonly canShowOlder = input(false);
  readonly jumpLabel = input($localize`Live transcript`);
  readonly label = input($localize`Live transcript history`);
  readonly partialLabel = input($localize`Listening…`);
  readonly translationLang = input<string | null>(null);

  readonly showOlder = output<void>();
  readonly jumpToLatest = output<void>();
  readonly atBottomChange = output<boolean>();

  private readonly scroller = viewChild<ElementRef<HTMLElement>>("scroller");

  scrollToEnd(): void {
    const el = this.scroller()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  protected onScroll(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    this.atBottomChange.emit(
      el.scrollHeight - el.scrollTop - el.clientHeight <= 48,
    );
  }
}
