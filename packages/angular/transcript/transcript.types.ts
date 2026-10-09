export type TranscriptTone = "me" | "others" | (string & {});

export interface TranscriptSegment {
  id: number;
  /** `null` = unattributed (legacy single-stream audio); consecutive `null`s still fold together. */
  speakerKey: string | null;
  speaker: string | null;
  tone?: TranscriptTone;
  startS: number;
  endS: number;
  text: string;
  secondaryText?: string;
}

export interface TranscriptFragment {
  id: number;
  startS: number;
  endS: number;
  text: string;
  secondaryText?: string;
}

export interface TranscriptTurn {
  key: string;
  speakerKey: string | null;
  speaker: string | null;
  tone?: TranscriptTone;
  startS: number;
  endS: number;
  text: string;
  secondaryText?: string;
  fragments: TranscriptFragment[];
}

export function foldTranscriptTurns(
  segments: readonly TranscriptSegment[],
  maxFragments = 16,
): TranscriptTurn[] {
  const out: TranscriptTurn[] = [];
  let cur: TranscriptTurn | null = null;
  for (const s of segments) {
    const key = s.speakerKey ?? null;
    if (cur && cur.speakerKey === key && cur.fragments.length < maxFragments) {
      cur.fragments.push(fragmentOf(s));
      cur.endS = s.endS;
    } else {
      cur = {
        key: `t${s.id}`,
        speakerKey: key,
        speaker: s.speaker,
        tone: s.tone,
        startS: s.startS,
        endS: s.endS,
        text: "",
        fragments: [fragmentOf(s)],
      };
      out.push(cur);
    }
  }
  for (const turn of out) {
    turn.text = turn.fragments.map((f) => f.text).join(" ");
    if (turn.fragments.some((f) => f.secondaryText !== undefined)) {
      turn.secondaryText = turn.fragments
        .map((f) => f.secondaryText ?? "")
        .filter(Boolean)
        .join(" ");
    }
  }
  return out;
}

function fragmentOf(s: TranscriptSegment): TranscriptFragment {
  const fragment: TranscriptFragment = {
    id: s.id,
    startS: s.startS,
    endS: s.endS,
    text: s.text,
  };
  if (s.secondaryText !== undefined) fragment.secondaryText = s.secondaryText;
  return fragment;
}

export function speakerInitials(label: string | null | undefined): string {
  return (label ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      /^\d+$/.test(word) ? word : word.charAt(0).toLocaleUpperCase(),
    )
    .join("");
}
