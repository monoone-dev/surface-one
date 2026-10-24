import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
  booleanAttribute,
} from "@angular/core";
import { SoneClockPipe } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SONE_EMPTY_PARTS } from "@surface-one/angular/empty-state";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_BUBBLE_PARTS } from "@surface-one/angular/bubble";
import { SONE_MESSAGE_PARTS } from "@surface-one/angular/message";
import { SoneSpeakerInitialsPipe } from "./speaker-initials.pipe";
import type { TranscriptTurn } from "./transcript.types";
import {
  activeTranscriptFragmentIds,
  activeTranscriptTurnKey,
  filterTranscriptTurns,
  flashTranscriptFragment,
  followTranscriptRow,
  transcriptWindow,
} from "./transcript-window";

@Component({
  selector: "sone-transcript",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneClockPipe,
    SoneSpeakerInitialsPipe,
    SoneButtonDirective,
    SoneBadgeDirective,
    ...SONE_EMPTY_PARTS,
    ...SONE_AVATAR_PARTS,
    ...SONE_MESSAGE_PARTS,
    ...SONE_BUBBLE_PARTS,
  ],
  host: { "data-slot": "transcript" },
  templateUrl: "./transcript.component.html",
  styleUrl: "./transcript.component.scss",
})
export class SoneTranscriptComponent {
  private readonly injector = inject(Injector);

  readonly turns = input<TranscriptTurn[]>([]);
  readonly currentTime = input(0);
  readonly query = input("");
  readonly flashId = input<number | null>(null);
  readonly flashSeq = input(0);
  readonly seekable = input(true, { transform: booleanAttribute });
  readonly renderCap = input(80);
  readonly fragmentCap = input(160);

  readonly seek = output<number>();
  readonly flashEnd = output<number>();

  readonly expanded = signal(false);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>("scroller");
  private readonly turnRows = viewChildren<ElementRef<HTMLElement>>("turnRow");

  readonly flashKey = computed(
    () => `${this.flashId() ?? ""}#${this.flashSeq()}`,
  );

  readonly visibleTurns = computed<TranscriptTurn[]>(() =>
    filterTranscriptTurns(this.turns(), this.query()),
  );

  readonly activeTurnKey = computed<string | null>(() =>
    activeTranscriptTurnKey(this.turns(), this.currentTime()),
  );

  /** A contiguous, hard-bounded window around the flashed (preferred) or active
   *  turn, grown while BOTH the row and fragment budget allow. */
  readonly renderedTurns = computed<TranscriptTurn[]>(() =>
    transcriptWindow(this.visibleTurns(), {
      expanded: this.expanded(),
      rowCap: this.renderCap(),
      fragmentCap: this.fragmentCap(),
      flashId: this.flashId(),
      activeKey: this.activeTurnKey(),
    }),
  );

  readonly hiddenTurnCount = computed(
    () => this.visibleTurns().length - this.renderedTurns().length,
  );

  readonly activeFragmentIds = computed<Set<number>>(() =>
    activeTranscriptFragmentIds(this.renderedTurns(), this.currentTime()),
  );

  private readonly _followActive = effect(() => {
    const key = this.activeTurnKey();
    if (!key || this.query().trim()) {
      return;
    }
    afterNextRender(
      () => {
        const row = this.turnRows().find(
          (r) => r.nativeElement.getAttribute("data-turn") === key,
        )?.nativeElement;
        const box = this.scroller()?.nativeElement;
        if (!row || !box) {
          return;
        }
        followTranscriptRow(box, row);
      },
      { injector: this.injector },
    );
  });

  private lastScrolledFlashKey = "";

  private readonly _scrollFlashIntoView = effect(() => {
    const flash = this.flashId();
    const key = this.flashKey();
    const turns = this.renderedTurns();
    if (
      flash === null ||
      turns.length === 0 ||
      key === this.lastScrolledFlashKey
    ) {
      return;
    }
    afterNextRender(
      () => {
        const frag = this.scroller()?.nativeElement.querySelector<HTMLElement>(
          `.frag[data-flash="${CSS.escape(key)}"]`,
        );
        if (!frag) {
          return;
        }
        this.lastScrolledFlashKey = key;
        flashTranscriptFragment(frag);
      },
      { injector: this.injector },
    );
  });

  collapse(): void {
    this.expanded.set(false);
  }

  protected showAll(): void {
    this.expanded.set(true);
  }

  protected onFlashEnd(id: number): void {
    if (this.flashId() === id) {
      this.flashEnd.emit(id);
    }
  }
}
