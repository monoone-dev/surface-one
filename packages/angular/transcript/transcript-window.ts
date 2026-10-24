import type { TranscriptTurn } from "./transcript.types";

/** The key of the turn playing at `seconds`, or `null` between turns. */
export function activeTranscriptTurnKey(
  turns: readonly TranscriptTurn[],
  seconds: number,
): string | null {
  for (const turn of turns) {
    if (seconds >= turn.startS && seconds < turn.endS) {
      return turn.key;
    }
  }
  return null;
}

/** The ids of the fragments playing at `seconds`. */
export function activeTranscriptFragmentIds(
  turns: readonly TranscriptTurn[],
  seconds: number,
): Set<number> {
  const out = new Set<number>();
  for (const turn of turns) {
    for (const f of turn.fragments) {
      if (seconds >= f.startS && seconds < f.endS) {
        out.add(f.id);
      }
    }
  }
  return out;
}

export interface TranscriptWindowOptions {
  /** Every turn renders (the reader asked to show them all). */
  readonly expanded: boolean;
  /** At most this many rows … */
  readonly rowCap: number;
  /** … and this many fragments, before the window stops growing. */
  readonly fragmentCap: number;
  /** The flashed fragment, preferred as the window's centre. */
  readonly flashId: number | null;
  /** The playing turn, the centre when nothing is flashed. */
  readonly activeKey: string | null;
}

/**
 * A contiguous, hard-bounded window of `turns` around the flashed (preferred) or active
 * turn, grown while BOTH the row and fragment budget allow; every turn when they fit.
 */
export function transcriptWindow(
  all: readonly TranscriptTurn[],
  options: TranscriptWindowOptions,
): TranscriptTurn[] {
  if (options.expanded) {
    return [...all];
  }
  const rowCap = options.rowCap;
  const fragCap = options.fragmentCap;
  const fragmentCount = all.reduce(
    (sum, turn) => sum + turn.fragments.length,
    0,
  );
  if (all.length <= rowCap && fragmentCount <= fragCap) {
    return [...all];
  }

  const flash = options.flashId;
  const flashIdx =
    flash === null
      ? -1
      : all.findIndex((turn) => turn.fragments.some((f) => f.id === flash));
  const activeKey = options.activeKey;
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
}

/** The turns whose text contains `query` (case-insensitive); all of them for an empty query. */
export function filterTranscriptTurns(
  turns: readonly TranscriptTurn[],
  query: string,
): TranscriptTurn[] {
  const q = query.trim().toLowerCase();
  return q ? turns.filter((t) => t.text.toLowerCase().includes(q)) : [...turns];
}

/** Scrolls `row` to the middle of `box` (smoothly) when any part of it is out of view. */
export function followTranscriptRow(box: HTMLElement, row: HTMLElement): void {
  const rTop = row.offsetTop;
  const rBot = rTop + row.offsetHeight;
  if (rTop < box.scrollTop || rBot > box.scrollTop + box.clientHeight) {
    box.scrollTo({
      top: rTop - box.clientHeight / 2 + row.offsetHeight / 2,
      behavior: "smooth",
    });
  }
}

/** Restarts a flashed fragment's highlight animation and scrolls it to the middle. */
export function flashTranscriptFragment(frag: HTMLElement): void {
  // Drop the running animation, reflow, re-apply: the canonical restart.
  frag.style.animation = "none";
  void frag.offsetWidth;
  frag.style.animation = "";
  frag.scrollIntoView({ block: "center", behavior: "smooth" });
}
