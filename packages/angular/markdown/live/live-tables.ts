import {
  EditorSelection,
  type EditorState,
  type Extension,
  type Range,
  StateEffect,
  StateField,
  type Transaction,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { SyntaxNode, Tree } from "@lezer/common";
import { BULK_PARSE_MS, parseBudget, parsedTree } from "./live-parse";

type Align = "left" | "center" | "right" | null;

type InlinePiece =
  | string
  | {
      readonly tag: "strong" | "em" | "del" | "code" | "link";
      readonly children: readonly InlinePiece[];
    };

interface TableCell {
  readonly offset: number;
  readonly content: readonly InlinePiece[];
}

interface TableModel {
  readonly align: readonly Align[];
  readonly header: readonly TableCell[];
  readonly rows: readonly (readonly TableCell[])[];
}

const INITIAL_PARSE_CHARS = 50_000;
const PARSE_AHEAD_CHARS = 2_000;
const SKIPPED_INLINE = new Set([
  "EmphasisMark",
  "StrikethroughMark",
  "CodeMark",
  "LinkMark",
  "URL",
  "LinkTitle",
  "LinkLabel",
]);
const INLINE_TAGS = {
  StrongEmphasis: "strong",
  Emphasis: "em",
  Strikethrough: "del",
} as const;
const CELL_TAGS = {
  strong: "strong",
  em: "em",
  del: "del",
  code: "code",
  link: "span",
} as const;

const setFocused = StateEffect.define<boolean>();

const editorFocused = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setFocused)) {
        value = effect.value;
      }
    }
    return value;
  },
});

class TableWidget extends WidgetType {
  constructor(
    private readonly source: string,
    private readonly model: TableModel,
  ) {
    super();
  }

  override eq(other: TableWidget): boolean {
    return other.source === this.source;
  }

  override toDOM(view: EditorView): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "cm-md-table";
    const table = document.createElement("table");
    const head = table.createTHead().insertRow();
    this.model.header.forEach((cell, i) =>
      head.append(this.cellElement("th", cell, i)),
    );
    const body = table.createTBody();
    for (const row of this.model.rows) {
      const tr = body.insertRow();
      row.forEach((cell, i) => tr.append(this.cellElement("td", cell, i)));
    }
    wrap.append(table);
    wrap.addEventListener("mousedown", (event) => {
      if (!view.state.facet(EditorView.editable) || event.button !== 0) {
        return;
      }
      event.preventDefault();
      const cell = (event.target as HTMLElement | null)?.closest("th, td");
      const offset = Number(cell?.getAttribute("data-offset") ?? 0);
      const at = Math.min(view.posAtDOM(wrap) + offset, view.state.doc.length);
      view.focus();
      view.dispatch({ selection: { anchor: at }, scrollIntoView: true });
    });
    return wrap;
  }

  private cellElement(
    tag: "th" | "td",
    cell: TableCell,
    column: number,
  ): HTMLElement {
    const el = document.createElement(tag);
    el.setAttribute("data-offset", String(cell.offset));
    const align = this.model.align[column];
    if (align) {
      el.classList.add(`cm-md-table-${align}`);
    }
    appendInline(el, cell.content);
    return el;
  }

  override ignoreEvent(): boolean {
    return true;
  }
}

function appendInline(parent: HTMLElement, pieces: readonly InlinePiece[]) {
  for (const piece of pieces) {
    if (typeof piece === "string") {
      parent.append(piece);
      continue;
    }
    const el = document.createElement(CELL_TAGS[piece.tag]);
    if (piece.tag === "link") {
      el.className = "cm-md-link";
    }
    appendInline(el, piece.children);
    parent.append(el);
  }
}

function inlineOf(
  state: EditorState,
  node: SyntaxNode,
  from: number,
  to: number,
): InlinePiece[] {
  const out: InlinePiece[] = [];
  const text = (a: number, b: number) => {
    if (b > a) {
      out.push(state.doc.sliceString(a, b));
    }
  };
  let pos = from;
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.to <= from || child.from >= to) {
      continue;
    }
    text(pos, child.from);
    pos = child.to;
    const name = child.name;
    if (SKIPPED_INLINE.has(name)) {
      continue;
    }
    if (name in INLINE_TAGS) {
      out.push({
        tag: INLINE_TAGS[name as keyof typeof INLINE_TAGS],
        children: inlineOf(state, child, child.from, child.to),
      });
    } else if (name === "InlineCode") {
      const marks = child.getChildren("CodeMark");
      const start = marks[0]?.to ?? child.from;
      const end = marks.length > 1 ? marks[marks.length - 1].from : child.to;
      out.push({
        tag: "code",
        children: [state.doc.sliceString(start, end).replace(/\\\|/g, "|")],
      });
    } else if (name === "Link" || name === "Image") {
      const marks = child.getChildren("LinkMark");
      const start = marks[0]?.to ?? child.from;
      const end = marks[1]?.from ?? child.to;
      const label = inlineOf(state, child, start, end);
      if (name === "Link") {
        out.push({ tag: "link", children: label });
      } else {
        out.push(...label);
      }
    } else if (name === "Escape") {
      text(child.from + 1, child.to);
    } else {
      text(child.from, child.to);
    }
  }
  text(pos, to);
  return out;
}

function rowCells(
  state: EditorState,
  row: SyntaxNode,
  tableFrom: number,
): TableCell[] {
  const bounds = [row.from];
  for (const pipe of row.getChildren("TableDelimiter")) {
    bounds.push(pipe.from, pipe.to);
  }
  bounds.push(row.to);
  const segments: [number, number][] = [];
  for (let i = 0; i < bounds.length; i += 2) {
    segments.push([bounds[i], bounds[i + 1]]);
  }
  const blank = ([a, b]: [number, number]) =>
    state.doc.sliceString(a, b).trim() === "";
  if (segments.length > 1 && blank(segments[0])) {
    segments.shift();
  }
  if (segments.length > 1 && blank(segments[segments.length - 1])) {
    segments.pop();
  }
  const cells = row.getChildren("TableCell");
  return segments.map(([a, b]) => {
    const cell = cells.find((c) => c.from >= a && c.to <= b);
    return cell
      ? {
          offset: cell.from - tableFrom,
          content: inlineOf(state, cell, cell.from, cell.to),
        }
      : { offset: Math.min(a + 1, b) - tableFrom, content: [] };
  });
}

function alignments(source: string): Align[] {
  return source
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((spec) => {
      const s = spec.trim();
      const left = s.startsWith(":");
      const right = s.endsWith(":");
      return left && right ? "center" : right ? "right" : left ? "left" : null;
    });
}

function fit(cells: TableCell[], columns: number, end: number): TableCell[] {
  const out = cells.slice(0, columns);
  while (out.length < columns) {
    out.push({ offset: end, content: [] });
  }
  return out;
}

function tableModel(state: EditorState, table: SyntaxNode): TableModel | null {
  const headerNode = table.getChild("TableHeader");
  const delimiter = table.getChild("TableDelimiter");
  if (!headerNode || !delimiter) {
    return null;
  }
  const end = table.to - table.from;
  const header = rowCells(state, headerNode, table.from);
  const columns = header.length;
  return {
    align: alignments(state.doc.sliceString(delimiter.from, delimiter.to)),
    header,
    rows: table
      .getChildren("TableRow")
      .map((row) => fit(rowCells(state, row, table.from), columns, end)),
  };
}

function isComplete(state: EditorState, tree: Tree, node: SyntaxNode) {
  const { doc } = state;
  if (tree.length >= doc.length) {
    return true;
  }
  const next = node.to < doc.length ? doc.lineAt(node.to + 1).to : doc.length;
  return tree.length > next;
}

function buildTables(state: EditorState, tree: Tree): DecorationSet {
  const focused = state.field(editorFocused);
  const out: Range<Decoration>[] = [];
  for (let node = tree.topNode.firstChild; node; node = node.nextSibling) {
    if (node.name !== "Table" || !isComplete(state, tree, node)) {
      continue;
    }
    const from = state.doc.lineAt(node.from).from;
    const to = state.doc.lineAt(node.to).to;
    if (
      focused &&
      state.selection.ranges.some((r) => r.from <= to && r.to >= from)
    ) {
      continue;
    }
    const model = tableModel(state, node);
    if (model) {
      const widget = new TableWidget(state.doc.sliceString(from, to), model);
      out.push(Decoration.replace({ widget, block: true }).range(from, to));
    }
  }
  return Decoration.set(out);
}

function changedUpTo(tr: Transaction): number {
  let end = 0;
  tr.changes.iterChangedRanges((_fa, _ta, _fb, toB) => {
    end = Math.max(end, toB);
  });
  return Math.min(tr.state.doc.length, end + PARSE_AHEAD_CHARS);
}

const tableDecorations = StateField.define<DecorationSet>({
  create(state) {
    const upto = Math.min(state.doc.length, INITIAL_PARSE_CHARS);
    return buildTables(state, parsedTree(state, upto, BULK_PARSE_MS));
  },
  update(decorations, tr) {
    const focusChanged = tr.effects.some((e) => e.is(setFocused));
    const treeChanged = syntaxTree(tr.startState) !== syntaxTree(tr.state);
    if (!tr.docChanged && !tr.selection && !focusChanged && !treeChanged) {
      return decorations;
    }
    const tree = tr.docChanged
      ? parsedTree(tr.state, changedUpTo(tr), parseBudget([tr]))
      : syntaxTree(tr.state);
    return buildTables(tr.state, tree);
  },
  provide: (field) => EditorView.decorations.from(field),
});

// `setState` recreates the focus field as unfocused without a focus event; re-sync it so a caret
// left inside a table is not hidden under the rendered widget.
export function syncTableFocus(view: EditorView): void {
  if (view.hasFocus) {
    view.dispatch({ effects: setFocused.of(true) });
  }
}

interface CellRange {
  readonly from: number;
  readonly to: number;
}

function rowSegments(state: EditorState, row: SyntaxNode): CellRange[] {
  const bounds = [row.from];
  for (const pipe of row.getChildren("TableDelimiter")) {
    bounds.push(pipe.from, pipe.to);
  }
  bounds.push(row.to);
  const segments: CellRange[] = [];
  for (let i = 0; i < bounds.length; i += 2) {
    segments.push({ from: bounds[i], to: bounds[i + 1] });
  }
  const blank = (s: CellRange) =>
    state.doc.sliceString(s.from, s.to).trim() === "";
  if (segments.length > 1 && blank(segments[0])) {
    segments.shift();
  }
  if (segments.length > 1 && blank(segments[segments.length - 1])) {
    segments.pop();
  }
  return segments;
}

function tableAt(state: EditorState, pos: number): SyntaxNode | null {
  const tree = syntaxTree(state);
  for (let node = tree.topNode.firstChild; node; node = node.nextSibling) {
    if (node.name !== "Table") {
      continue;
    }
    const from = state.doc.lineAt(node.from).from;
    const to = state.doc.lineAt(node.to).to;
    if (pos >= from && pos <= to) {
      return node;
    }
    if (from > pos) {
      return null;
    }
  }
  return null;
}

function cellContent(state: EditorState, cell: CellRange): CellRange {
  const text = state.doc.sliceString(cell.from, cell.to);
  const lead = text.length - text.trimStart().length;
  const trail = text.length - text.trimEnd().length;
  if (lead + trail >= text.length) {
    const at = Math.min(cell.from + 1, cell.to);
    return { from: at, to: at };
  }
  return { from: cell.from + lead, to: cell.to - trail };
}

function targetCell(
  cells: readonly CellRange[],
  head: number,
  direction: 1 | -1,
): number {
  const current = cells.findIndex((c) => head >= c.from && head <= c.to);
  if (current !== -1) {
    return current + direction;
  }
  if (direction === 1) {
    const next = cells.findIndex((c) => c.from > head);
    return next === -1 ? cells.length : next;
  }
  let previous = -1;
  cells.forEach((c, i) => {
    if (c.to < head) {
      previous = i;
    }
  });
  return previous;
}

// Tab/Shift-Tab inside a GFM table walk its cells like Notion/Obsidian instead of indenting the row,
// which would turn the row into a code block and break the table.
export function moveTableCell(view: EditorView, direction: 1 | -1): boolean {
  const { state } = view;
  if (state.readOnly || state.selection.ranges.length > 1) {
    return false;
  }
  const head = state.selection.main.head;
  const table = tableAt(state, head);
  if (!table) {
    return false;
  }
  const rows = [
    table.getChild("TableHeader"),
    ...table.getChildren("TableRow"),
  ].filter((row): row is SyntaxNode => row !== null);
  if (rows.length === 0) {
    return false;
  }
  const columns = rowSegments(state, rows[0]).length;
  const cells = rows.flatMap((row) => rowSegments(state, row));
  const target = targetCell(cells, head, direction);
  if (target < 0) {
    return true;
  }
  if (target < cells.length) {
    const content = cellContent(state, cells[target]);
    view.dispatch({
      selection: EditorSelection.single(content.from, content.to),
      scrollIntoView: true,
      userEvent: "select",
    });
    return true;
  }
  const lastRow = rows[rows.length - 1];
  const end = state.doc.lineAt(lastRow.to).to;
  const insert = `\n|${"  |".repeat(Math.max(columns, 1))}`;
  view.dispatch({
    changes: { from: end, insert },
    selection: EditorSelection.cursor(end + 3),
    scrollIntoView: true,
    userEvent: "input",
  });
  return true;
}

export const liveTables: Extension = [
  editorFocused,
  EditorView.focusChangeEffect.of((_state, focusing) =>
    setFocused.of(focusing),
  ),
  tableDecorations,
];
