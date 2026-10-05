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
}

export interface TranscriptFragment {
  id: number;
  startS: number;
  endS: number;
  text: string;
}

export interface TranscriptTurn {
  key: string;
  speakerKey: string | null;
  speaker: string | null;
  tone?: TranscriptTone;
  startS: number;
  endS: number;
  text: string;
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
      cur.fragments.push({
        id: s.id,
        startS: s.startS,
        endS: s.endS,
        text: s.text,
      });
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
        fragments: [{ id: s.id, startS: s.startS, endS: s.endS, text: s.text }],
      };
      out.push(cur);
    }
  }
  for (const turn of out) {
    turn.text = turn.fragments.map((f) => f.text).join(" ");
  }
  return out;
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
