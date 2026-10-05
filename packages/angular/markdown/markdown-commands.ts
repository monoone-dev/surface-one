export interface EditorState {
  readonly value: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

export type MarkdownCommand =
  | "heading"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "link"
  | "wikilink"
  | "bulleted"
  | "numbered"
  | "task"
  | "quote"
  | "codeBlock"
  | "indent"
  | "outdent"
  | "section";

const INLINE_MARKERS: Partial<Record<MarkdownCommand, string>> = {
  bold: "**",
  italic: "_",
  strike: "~~",
  code: "`",
};

export function applyMarkdownCommand(
  state: EditorState,
  command: MarkdownCommand,
): EditorState {
  const s = normalise(state);
  switch (command) {
    case "bold":
    case "italic":
    case "strike":
    case "code":
      return toggleInline(s, INLINE_MARKERS[command] as string);
    case "link":
      return toggleLink(s);
    case "heading":
    case "heading2":
      return toggleHeading(s, 2);
    case "heading1":
      return toggleHeading(s, 1);
    case "heading3":
      return toggleHeading(s, 3);
    case "heading4":
      return toggleHeading(s, 4);
    case "heading5":
      return toggleHeading(s, 5);
    case "heading6":
      return toggleHeading(s, 6);
    case "wikilink":
      return toggleWikilink(s);
    case "bulleted":
    case "numbered":
    case "task":
      return toggleList(s, command);
    case "quote":
      return toggleQuote(s);
    case "codeBlock":
      return toggleCodeBlock(s);
    case "indent":
      return indentLines(s);
    case "outdent":
      return outdentLines(s);
    case "section":
      return insertSection(s);
  }
}

export function toggleInline(state: EditorState, marker: string): EditorState {
  const { value } = state;
  const m = marker.length;
  let [start, end] = trimSelection(
    value,
    state.selectionStart,
    state.selectionEnd,
  );
  const selected = value.slice(start, end);

  if (
    selected.length >= 2 * m &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const inner = selected.slice(m, selected.length - m);
    if (!isLongerRun(value, start, end, marker)) {
      return {
        value: value.slice(0, start) + inner + value.slice(end),
        selectionStart: start,
        selectionEnd: start + inner.length,
      };
    }
  }
  if (
    value.slice(start - m, start) === marker &&
    value.slice(end, end + m) === marker &&
    !isLongerRun(value, start - m, end + m, marker)
  ) {
    return {
      value: value.slice(0, start - m) + selected + value.slice(end + m),
      selectionStart: start - m,
      selectionEnd: end - m,
    };
  }
  if (start === end) {
    start = end = state.selectionStart;
  }
  return {
    value:
      value.slice(0, start) + marker + selected + marker + value.slice(end),
    selectionStart: start + m,
    selectionEnd: end + m,
  };
}

function isLongerRun(
  value: string,
  from: number,
  to: number,
  marker: string,
): boolean {
  if (marker.length !== 1) {
    return false;
  }
  return value[from - 1] === marker || value[to] === marker;
}

const LINK = /^\[([^\]]*)\]\(([^)\s]*)(?:\s+"[^"]*")?\)$/;
const URL_LIKE = /^(?:https?:\/\/|mailto:|www\.)\S+$/i;

export function toggleLink(state: EditorState): EditorState {
  const { value } = state;
  const [start, end] = trimSelection(
    value,
    state.selectionStart,
    state.selectionEnd,
  );
  const selected = value.slice(start, end);

  const existing = LINK.exec(selected);
  if (existing) {
    const text = existing[1];
    return {
      value: value.slice(0, start) + text + value.slice(end),
      selectionStart: start,
      selectionEnd: start + text.length,
    };
  }
  if (URL_LIKE.test(selected)) {
    const text = "text";
    const out = `[${text}](${selected})`;
    return {
      value: value.slice(0, start) + out + value.slice(end),
      selectionStart: start + 1,
      selectionEnd: start + 1 + text.length,
    };
  }
  if (!selected) {
    const text = "text";
    const out = `[${text}](url)`;
    const at = state.selectionStart;
    return {
      value: value.slice(0, at) + out + value.slice(at),
      selectionStart: at + 1,
      selectionEnd: at + 1 + text.length,
    };
  }
  const out = `[${selected}](url)`;
  const urlAt = start + selected.length + 3;
  return {
    value: value.slice(0, start) + out + value.slice(end),
    selectionStart: urlAt,
    selectionEnd: urlAt + 3,
  };
}

export function toggleWikilink(state: EditorState): EditorState {
  const { value } = state;
  const [start, end] = trimSelection(
    value,
    state.selectionStart,
    state.selectionEnd,
  );
  const selected = value.slice(start, end);
  const inner = /^\[\[([^[\]]*)\]\]$/.exec(selected);
  if (inner) {
    return {
      value: value.slice(0, start) + inner[1] + value.slice(end),
      selectionStart: start,
      selectionEnd: start + inner[1].length,
    };
  }
  if (
    start !== end &&
    value.slice(start - 2, start) === "[[" &&
    value.slice(end, end + 2) === "]]"
  ) {
    return {
      value: value.slice(0, start - 2) + selected + value.slice(end + 2),
      selectionStart: start - 2,
      selectionEnd: end - 2,
    };
  }
  const at = start === end ? state.selectionStart : start;
  const to = start === end ? state.selectionStart : end;
  return {
    value: value.slice(0, at) + "[[" + selected + "]]" + value.slice(to),
    selectionStart: at + 2,
    selectionEnd: at + 2 + selected.length,
  };
}

const HEADING = /^(#{1,6})[ \t]+/;
const TASK = /^([-*+])[ \t]+\[[ xX]\][ \t]+/;
const BULLET = /^[-*+][ \t]+/;
const NUMBER = /^\d{1,9}[.)][ \t]+/;
const QUOTE = /^>[ \t]?/;
const INDENT = /^[ \t]*/;

type ListKind = "bulleted" | "numbered" | "task";

function listKind(body: string): { kind: ListKind; length: number } | null {
  const task = TASK.exec(body);
  if (task) {
    return { kind: "task", length: task[0].length };
  }
  const bullet = BULLET.exec(body);
  if (bullet) {
    return { kind: "bulleted", length: bullet[0].length };
  }
  const num = NUMBER.exec(body);
  if (num) {
    return { kind: "numbered", length: num[0].length };
  }
  return null;
}

export function toggleList(state: EditorState, kind: ListKind): EditorState {
  return mapLines(state, (lines) => {
    const content = lines.filter((l) => l.trim() !== "");
    const all =
      content.length > 0 &&
      content.every((l) => listKind(l.replace(INDENT, ""))?.kind === kind);
    let n = 0;
    return lines.map((line) => {
      if (line.trim() === "" && lines.length > 1) {
        return line;
      }
      const indent = INDENT.exec(line)?.[0] ?? "";
      const body = line.slice(indent.length);
      const current = listKind(body);
      const bare = current ? body.slice(current.length) : body;
      if (all) {
        return indent + bare;
      }
      n += 1;
      const prefix =
        kind === "bulleted" ? "- " : kind === "task" ? "- [ ] " : `${n}. `;
      return indent + prefix + bare;
    });
  });
}

export function toggleQuote(state: EditorState): EditorState {
  return mapLines(state, (lines) => {
    const content = lines.filter((l) => l.trim() !== "");
    const all = content.length > 0 && content.every((l) => QUOTE.test(l));
    return lines.map((line) => {
      if (all) {
        return line.replace(QUOTE, "");
      }
      return line.trim() === "" && lines.length > 1 ? ">" : `> ${line}`;
    });
  });
}

export function toggleHeading(state: EditorState, level: number): EditorState {
  const hashes = "#".repeat(Math.min(6, Math.max(1, level)));
  return mapLines(state, (lines) => {
    const content = lines.filter((l) => l.trim() !== "");
    const all =
      content.length > 0 &&
      content.every((l) => HEADING.exec(l)?.[1] === hashes);
    return lines.map((line) => {
      if (line.trim() === "" && lines.length > 1) {
        return line;
      }
      const bare = line.replace(HEADING, "");
      return all ? bare : `${hashes} ${bare}`;
    });
  });
}

const INDENT_UNIT = "  ";

export function indentLines(state: EditorState): EditorState {
  return mapLines(state, (lines) =>
    lines.map((line) =>
      line.trim() === "" && lines.length > 1 ? line : INDENT_UNIT + line,
    ),
  );
}

export function outdentLines(state: EditorState): EditorState {
  return mapLines(state, (lines) =>
    lines.map((line) =>
      line.startsWith("\t")
        ? line.slice(1)
        : line.replace(new RegExp(`^ {1,${INDENT_UNIT.length}}`), ""),
    ),
  );
}

export const SECTION_PLACEHOLDER = $localize`:Placeholder heading inserted by the New section toolbar button:New section`;

export function insertSection(state: EditorState): EditorState {
  const { value, selectionEnd } = state;
  const nl = value.indexOf("\n", selectionEnd);
  const lineEnd = nl === -1 ? value.length : nl;
  const lineStart = value.lastIndexOf("\n", lineEnd - 1) + 1;
  const blankLine = value.slice(lineStart, lineEnd).trim() === "";
  const head = value.slice(0, blankLine ? lineStart : lineEnd);
  const rest = value.slice(lineEnd).replace(/^\n+/, "");

  const lead =
    head.trim() === "" || head.endsWith("\n\n")
      ? ""
      : head.endsWith("\n")
        ? "\n"
        : "\n\n";
  const hashes = "#".repeat(sectionLevel(head));
  const heading = `${hashes} ${SECTION_PLACEHOLDER}`;
  const titleAt = head.length + lead.length + hashes.length + 1;
  return {
    value: head + lead + heading + "\n\n" + rest,
    selectionStart: titleAt,
    selectionEnd: titleAt + SECTION_PLACEHOLDER.length,
  };
}

function sectionLevel(before: string): number {
  const lines = before.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const level = HEADING.exec(lines[i])?.[1].length;
    if (level) {
      return level;
    }
  }
  return 2;
}

const FENCE_LINE = /^[ \t]{0,3}(`{3,}|~{3,})[^`]*$/;

export function toggleCodeBlock(state: EditorState): EditorState {
  const { value } = state;
  const { from, to } = lineRange(
    value,
    state.selectionStart,
    state.selectionEnd,
  );

  const prevStart = from === 0 ? -1 : value.lastIndexOf("\n", from - 2) + 1;
  const prevLine = from === 0 ? null : value.slice(prevStart, from - 1);
  const nextEnd = value.indexOf("\n", to + 1);
  const nextLine =
    to >= value.length
      ? null
      : value.slice(to + 1, nextEnd === -1 ? value.length : nextEnd);
  if (
    prevLine !== null &&
    nextLine !== null &&
    FENCE_LINE.test(prevLine) &&
    FENCE_LINE.test(nextLine)
  ) {
    const inner = value.slice(from, to);
    const afterNext = nextEnd === -1 ? value.length : nextEnd;
    return {
      value: value.slice(0, prevStart) + inner + value.slice(afterNext),
      selectionStart: prevStart,
      selectionEnd: prevStart + inner.length,
    };
  }

  const inner = value.slice(from, to);
  const out = "```\n" + inner + "\n```";
  return {
    value: value.slice(0, from) + out + value.slice(to),
    selectionStart: from + 4,
    selectionEnd: from + 4 + inner.length,
  };
}

export function continueList(state: EditorState): EditorState | null {
  const { value, selectionStart, selectionEnd } = normalise(state);
  if (selectionStart !== selectionEnd) {
    return null;
  }
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndIdx = value.indexOf("\n", selectionStart);
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
  const line = value.slice(lineStart, lineEnd);
  const indent = INDENT.exec(line)?.[0] ?? "";
  const body = line.slice(indent.length);

  let prefix: string | null = null;
  let next = "";
  const task = TASK.exec(body);
  const num = NUMBER.exec(body);
  const bullet = BULLET.exec(body);
  const quote = QUOTE.exec(line);
  if (task) {
    prefix = task[0];
    next = `${task[1]} [ ] `;
  } else if (bullet) {
    prefix = bullet[0];
    next = prefix;
  } else if (num) {
    prefix = num[0];
    const n = parseInt(num[0], 10);
    next = num[0].replace(/^\d+/, String(n + 1));
  } else if (quote) {
    const rest = line.slice(quote[0].length);
    if (rest.trim() === "") {
      return clearPrefix(value, lineStart, lineEnd);
    }
    return insertAt(value, selectionStart, "\n> ");
  }
  if (
    prefix === null ||
    selectionStart < lineStart + indent.length + prefix.length
  ) {
    return null;
  }
  if (body.slice(prefix.length).trim() === "") {
    return clearPrefix(value, lineStart, lineEnd);
  }
  return insertAt(value, selectionStart, "\n" + indent + next);
}

function clearPrefix(
  value: string,
  lineStart: number,
  lineEnd: number,
): EditorState {
  return {
    value: value.slice(0, lineStart) + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart,
  };
}

function insertAt(value: string, at: number, text: string): EditorState {
  return {
    value: value.slice(0, at) + text + value.slice(at),
    selectionStart: at + text.length,
    selectionEnd: at + text.length,
  };
}

export function diffReplacement(
  before: string,
  after: string,
): { start: number; end: number; text: string } {
  let start = 0;
  const max = Math.min(before.length, after.length);
  while (start < max && before[start] === after[start]) {
    start++;
  }
  let endBefore = before.length;
  let endAfter = after.length;
  while (
    endBefore > start &&
    endAfter > start &&
    before[endBefore - 1] === after[endAfter - 1]
  ) {
    endBefore--;
    endAfter--;
  }
  return { start, end: endBefore, text: after.slice(start, endAfter) };
}

function normalise(state: EditorState): EditorState {
  const len = state.value.length;
  const a = clamp(state.selectionStart, 0, len);
  const b = clamp(state.selectionEnd, 0, len);
  return {
    value: state.value,
    selectionStart: Math.min(a, b),
    selectionEnd: Math.max(a, b),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
}

function trimSelection(
  value: string,
  start: number,
  end: number,
): [number, number] {
  let s = start;
  let e = end;
  while (s < e && /\s/.test(value[s])) {
    s++;
  }
  while (e > s && /\s/.test(value[e - 1])) {
    e--;
  }
  return [s, e];
}

function lineRange(
  value: string,
  start: number,
  end: number,
): { from: number; to: number } {
  let e = end;
  if (e > start && value[e - 1] === "\n") {
    e--;
  }
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const nl = value.indexOf("\n", e);
  const to = nl === -1 ? value.length : nl;
  return { from, to };
}

function mapLines(
  state: EditorState,
  fn: (lines: string[]) => string[],
): EditorState {
  const { value, selectionStart, selectionEnd } = state;
  const { from, to } = lineRange(value, selectionStart, selectionEnd);
  const lines = value.slice(from, to).split("\n");
  const next = fn(lines).join("\n");
  const out = value.slice(0, from) + next + value.slice(to);
  if (selectionStart === selectionEnd) {
    const delta = next.length - (to - from);
    const caret = Math.max(from, selectionStart + delta);
    return { value: out, selectionStart: caret, selectionEnd: caret };
  }
  return { value: out, selectionStart: from, selectionEnd: from + next.length };
}
