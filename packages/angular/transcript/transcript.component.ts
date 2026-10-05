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
  readonly seekable = input(true);
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

  readonly visibleTurns = computed<TranscriptTurn[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.turns();
    return q ? all.filter((t) => t.text.toLowerCase().includes(q)) : all;
  });

  readonly activeTurnKey = computed<string | null>(() => {
    const t = this.currentTime();
    for (const turn of this.turns()) {
      if (t >= turn.startS && t < turn.endS) {
        return turn.key;
      }
    }
    return null;
  });

  /** A contiguous, hard-bounded window around the flashed (preferred) or active
   *  turn, grown while BOTH the row and fragment budget allow. */
  readonly renderedTurns = computed<TranscriptTurn[]>(() => {
    const all = this.visibleTurns();
    if (this.expanded()) {
      return all;
    }
    const rowCap = this.renderCap();
    const fragCap = this.fragmentCap();
    const fragmentCount = all.reduce(
      (sum, turn) => sum + turn.fragments.length,
      0,
    );
    if (all.length <= rowCap && fragmentCount <= fragCap) {
      return all;
    }

    const flash = this.flashId();
    const flashIdx =
      flash === null
        ? -1
        : all.findIndex((turn) => turn.fragments.some((f) => f.id === flash));
    const activeKey = this.activeTurnKey();
    const activeIdx =
      flashIdx >= 0
        ? flashIdx
        : activeKey
          ? all.findIndex((turn) => turn.key === activeKey)
          : -1;
    let start = activeIdx >= 0 ? activeIdx : 0;
    let end = Math.min(all.length, start + 1);
    let rendered = all[start]?.fragments.length ?? 0;

    while (end - start < rowCap) {
      let grew = false;
      if (start > 0) {
        const before = all[start - 1].fragments.length;
        if (rendered + before <= fragCap) {
          start -= 1;
          rendered += before;
          grew = true;
        }
      }
      if (end < all.length && end - start < rowCap) {
        const after = all[end].fragments.length;
        if (rendered + after <= fragCap) {
          end += 1;
          rendered += after;
          grew = true;
        }
      }
      if (!grew) {
        break;
      }
    }
    return all.slice(start, end);
  });

  readonly hiddenTurnCount = computed(
    () => this.visibleTurns().length - this.renderedTurns().length,
  );

  readonly activeFragmentIds = computed<Set<number>>(() => {
    const t = this.currentTime();
    const out = new Set<number>();
    for (const turn of this.renderedTurns()) {
      for (const f of turn.fragments) {
        if (t >= f.startS && t < f.endS) {
          out.add(f.id);
        }
      }
    }
    return out;
  });

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
        const rTop = row.offsetTop;
        const rBot = rTop + row.offsetHeight;
        if (rTop < box.scrollTop || rBot > box.scrollTop + box.clientHeight) {
          box.scrollTo({
            top: rTop - box.clientHeight / 2 + row.offsetHeight / 2,
            behavior: "smooth",
          });
        }
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
        // Drop the running animation, reflow, re-apply: the canonical restart.
        frag.style.animation = "none";
        void frag.offsetWidth;
        frag.style.animation = "";
        frag.scrollIntoView({ block: "center", behavior: "smooth" });
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
