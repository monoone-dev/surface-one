export interface IndentState {
  readonly value: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

export type IndentDirection = 1 | -1;

const INDENT_UNIT = 2;
const TAB_WIDTH = 4;
const LIST_ITEM = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+|$)/;

interface Line {
  readonly from: number;
  readonly text: string;
  readonly indent: number;
  readonly indentChars: number;
  readonly listWidth: number | null;
}

function measure(text: string, from: number): Line {
  let indent = 0;
  let indentChars = 0;
  while (indentChars < text.length) {
    const ch = text[indentChars];
    if (ch === " ") {
      indent += 1;
    } else if (ch === "\t") {
      indent += TAB_WIDTH - (indent % TAB_WIDTH);
    } else {
      break;
    }
    indentChars += 1;
  }
  const item = LIST_ITEM.exec(text);
  const listWidth = item ? item[2].length + Math.max(1, item[3].length) : null;
  return { from, text, indent, indentChars, listWidth };
}

function splitLines(value: string): Line[] {
  const lines: Line[] = [];
  let from = 0;
  for (const text of value.split("\n")) {
    lines.push(measure(text, from));
    from += text.length + 1;
  }
  return lines;
}

function lineIndexAt(lines: readonly Line[], pos: number): number {
  let index = 0;
  while (index + 1 < lines.length && lines[index + 1].from <= pos) {
    index += 1;
  }
  return index;
}

function isBlank(line: Line): boolean {
  return line.text.trim() === "";
}

function previousSibling(lines: readonly Line[], index: number): Line | null {
  const indent = lines[index].indent;
  for (let i = index - 1; i >= 0; i--) {
    const line = lines[i];
    if (isBlank(line)) {
      continue;
    }
    if (line.listWidth !== null && line.indent <= indent) {
      return line.indent === indent ? line : null;
    }
    if (line.listWidth === null && line.indent < indent) {
      return null;
    }
  }
  return null;
}

function parentItem(lines: readonly Line[], index: number): Line | null {
  const indent = lines[index].indent;
  for (let i = index - 1; i >= 0; i--) {
    const line = lines[i];
    if (isBlank(line)) {
      continue;
    }
    if (line.indent < indent) {
      return line.listWidth !== null ? line : null;
    }
  }
  return null;
}

function subtreeEnd(lines: readonly Line[], index: number): number {
  const indent = lines[index].indent;
  let end = index;
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isBlank(line)) {
      continue;
    }
    if (line.indent <= indent) {
      break;
    }
    end = i;
  }
  return end;
}

function reindent(line: Line, delta: number): string {
  if (delta === 0 || isBlank(line)) {
    return line.text;
  }
  const next = Math.max(0, line.indent + delta);
  return " ".repeat(next) + line.text.slice(line.indentChars);
}

function mapPosition(
  lines: readonly Line[],
  next: readonly string[],
  pos: number,
): number {
  const index = lineIndexAt(lines, pos);
  let from = 0;
  for (let i = 0; i < index; i++) {
    from += next[i].length + 1;
  }
  const line = lines[index];
  const column = pos - line.from;
  const grown = next[index].length - line.text.length;
  if (column >= line.indentChars) {
    return from + Math.max(0, column + grown);
  }
  return from + Math.min(column, next[index].length);
}

// A nested item starts at its sibling's content column (3 spaces under `1.`, 2 under `-`), or it
// would not nest in CommonMark.
export function shiftIndent(
  state: IndentState,
  direction: IndentDirection,
): IndentState {
  const { value } = state;
  const start = Math.max(0, Math.min(state.selectionStart, value.length));
  const end = Math.max(start, Math.min(state.selectionEnd, value.length));
  const lines = splitLines(value);
  const first = lineIndexAt(lines, start);
  const endsAtLineStart =
    end > start && end === lines[lineIndexAt(lines, end)].from;
  const last = lineIndexAt(lines, endsAtLineStart ? end - 1 : end);
  const head = lines[first];

  if (head.listWidth === null && direction === 1 && start === end) {
    const insert = " ".repeat(INDENT_UNIT);
    const caret = start + insert.length;
    return {
      value: value.slice(0, start) + insert + value.slice(start),
      selectionStart: caret,
      selectionEnd: caret,
    };
  }

  const deltas = new Array<number>(lines.length).fill(0);
  if (head.listWidth !== null) {
    let delta: number;
    if (direction === 1) {
      const sibling = previousSibling(lines, first);
      delta = sibling
        ? sibling.indent + (sibling.listWidth ?? 0) - head.indent
        : 0;
    } else {
      const parent = parentItem(lines, first);
      delta = (parent ? parent.indent : 0) - head.indent;
    }
    const through = Math.max(last, subtreeEnd(lines, last));
    for (let i = first; i <= through; i++) {
      deltas[i] = delta;
    }
  } else {
    for (let i = first; i <= last; i++) {
      deltas[i] =
        direction === 1 ? INDENT_UNIT : -Math.min(lines[i].indent, INDENT_UNIT);
    }
  }

  const next = lines.map((line, i) => reindent(line, deltas[i]));
  return {
    value: next.join("\n"),
    selectionStart: mapPosition(lines, next, start),
    selectionEnd: mapPosition(lines, next, end),
  };
}
