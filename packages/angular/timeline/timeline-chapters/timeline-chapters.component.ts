import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { SoneClockPipe, clockTime } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import type { TimelineChapterItem } from "../timeline.types";

@Component({
  selector: "sone-timeline-chapters",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneClockPipe, SoneButtonDirective],
  host: {
    "data-slot": "timeline-chapters",
    role: "list",
    "[attr.aria-label]": "label()",
  },
  templateUrl: "./timeline-chapters.component.html",
  styleUrl: "./timeline-chapters.component.scss",
})
export class SoneTimelineChaptersComponent {
  protected chapterLabel(label: string, startS: number): string {
    return $localize`Chapter ${label}:label:, starts ${clockTime(startS)}:start:`;
  }

  readonly chapters = input<TimelineChapterItem[]>([]);
  readonly label = input($localize`Chapters`);
  readonly activeOrders = input<ReadonlySet<number>>(new Set());

  readonly seek = output<number>();

  protected onChapter(event: MouseEvent, startS: number): void {
    event.stopPropagation();
    this.seek.emit(startS);
  }
}
