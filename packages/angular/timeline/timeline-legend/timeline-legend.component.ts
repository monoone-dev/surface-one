import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { SoneClockPipe } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import type {
  TimelineLaneRename,
  TimelineLaneSuggestion,
  TimelineLegendLane,
} from "../timeline.types";

@Component({
  selector: "sone-timeline-legend",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneClockPipe, SoneButtonDirective, SoneBadgeDirective],
  host: { "data-slot": "timeline-legend" },
  templateUrl: "./timeline-legend.component.html",
  styleUrl: "./timeline-legend.component.scss",
})
export class SoneTimelineLegendComponent {
  protected renameLabel(lane: string): string {
    return $localize`Rename ${lane}:lane:`;
  }

  protected acceptLabel(lane: string, name: string): string {
    return $localize`Rename ${lane}:lane: to ${name}:name:`;
  }

  private readonly injector = inject(Injector);

  readonly lanes = input<TimelineLegendLane[]>([]);
  readonly suggestions = input<TimelineLaneSuggestion[]>([]);
  readonly nameLabel = input($localize`Speaker name`);

  readonly rename = output<TimelineLaneRename>();

  protected readonly suggestionByLane = computed(() => {
    const map = new Map<string, string>();
    for (const s of this.suggestions()) {
      const label = s.label?.trim();
      if (label) {
        map.set(s.lane, label);
      }
    }
    return map;
  });

  readonly editing = signal<string | null>(null);
  protected readonly draft = signal("");
  private readonly field = viewChild<ElementRef<HTMLInputElement>>("field");

  protected startRename(event: Event, lane: string): void {
    event.stopPropagation();
    this.draft.set(lane);
    this.editing.set(lane);
    afterNextRender(
      () => {
        const el = this.field()?.nativeElement;
        el?.focus();
        el?.select();
      },
      { injector: this.injector },
    );
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected commit(oldLabel: string): void {
    if (this.editing() !== oldLabel) {
      return;
    }
    const newLabel = this.draft().trim();
    this.editing.set(null);
    if (newLabel && newLabel !== oldLabel) {
      this.rename.emit({ oldLabel, newLabel });
    }
  }

  protected cancel(event: Event): void {
    event.stopPropagation();
    this.editing.set(null);
  }

  protected accept(oldLabel: string): void {
    const newLabel = this.suggestionByLane().get(oldLabel)?.trim();
    if (newLabel && newLabel !== oldLabel) {
      this.rename.emit({ oldLabel, newLabel });
    }
  }
}
