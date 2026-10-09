import { type EditorState, Facet, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import type { SyntaxNode, Tree } from "@lezer/common";
import {
  type MarkdownImage,
  type MarkdownImageResolver,
  inlineDataImage,
} from "../markdown-image";
import { type ImageSize, dataImageSize } from "./image-size";
import { BULK_PARSE_MS, parseBudget, parsedTree } from "./live-parse";

const HEADING = /^ATXHeading([1-6])$/;
const SETEXT = /^SetextHeading([12])$/;
const WIKILINK = /\[\[([^\]\n]+)\]\]/g;
const MAX_LIST_DEPTH = 6;

const hidden = Decoration.replace({});
const lineClass = (cls: string) => Decoration.line({ class: cls });
const markClass = (cls: string) => Decoration.mark({ class: cls });

class TaskBoxWidget extends WidgetType {
  constructor(
    private readonly checked: boolean,
    private readonly markerFrom: number,
  ) {
    super();
  }

  override eq(other: TaskBoxWidget): boolean {
    return (
      other.checked === this.checked && other.markerFrom === this.markerFrom
    );
  }

  override toDOM(view: EditorView): HTMLElement {
    const box = document.createElement("span");
    box.className = "cm-md-task-box";
    box.setAttribute("role", "checkbox");
    box.setAttribute("aria-checked", String(this.checked));
    box.setAttribute(
      "aria-label",
      this.checked
        ? $localize`Completed task`
        : $localize`:Checkbox of a task in a note:Task`,
    );
    box.addEventListener("mousedown", (event) => {
      event.preventDefault();
      if (view.state.readOnly) {
        return;
      }
      const at = this.markerFrom + 1;
      view.dispatch({
        changes: { from: at, to: at + 1, insert: this.checked ? " " : "x" },
        userEvent: "input.toggle",
      });
    });
    return box;
  }

  override ignoreEvent(): boolean {
    return true;
  }
}

class BulletWidget extends WidgetType {
  override eq(): boolean {
    return true;
  }

  override toDOM(): HTMLElement {
    const bullet = document.createElement("span");
    bullet.className = "cm-md-bullet";
    bullet.textContent = "•";
    return bullet;
  }
}

class RuleWidget extends WidgetType {
  override eq(): boolean {
    return true;
  }

  override toDOM(): HTMLElement {
    const rule = document.createElement("span");
    rule.className = "cm-md-hr";
    return rule;
  }
}

// The width/height attributes give the <img> its aspect ratio before it decodes, so the lines below
// it do not jump when it loads.
class ImageWidget extends WidgetType {
  constructor(
    private readonly src: string,
    private readonly alt: string,
    private readonly size: ImageSize | null,
  ) {
    super();
  }

  override eq(other: ImageWidget): boolean {
    return (
      other.src === this.src &&
      other.alt === this.alt &&
      other.size?.width === this.size?.width &&
      other.size?.height === this.size?.height
    );
  }

  override toDOM(view: EditorView): HTMLElement {
    const img = document.createElement("img");
    img.className = "cm-md-image-widget";
    img.alt = this.alt;
    if (this.size) {
      img.width = this.size.width;
      img.height = this.size.height;
    }
    img.draggable = false;
    img.decoding = "async";
    img.addEventListener("load", () => view.requestMeasure());
    img.src = this.src;
    return img;
  }

  override ignoreEvent(): boolean {
    return false;
  }
}

export const markdownImageSource = Facet.define<
  MarkdownImageResolver,
  MarkdownImageResolver
>({
  combine: (values) => values[0] ?? inlineDataImage,
});

function imageOf(
  resolved: string | MarkdownImage | null,
): { src: string; size: ImageSize | null } | null {
  if (!resolved) {
    return null;
  }
  if (typeof resolved === "string") {
    return { src: resolved, size: dataImageSize(resolved) };
  }
  return {
    src: resolved.src,
    size: { width: resolved.width, height: resolved.height },
  };
}

const bullet = new BulletWidget();
const rule = new RuleWidget();

function activeLines(view: EditorView): ReadonlySet<number> {
  const lines = new Set<number>();
  if (!view.hasFocus) {
    return lines;
  }
  const { doc } = view.state;
  for (const range of view.state.selection.ranges) {
    const first = doc.lineAt(range.from).number;
    const last = doc.lineAt(range.to).number;
    for (let n = first; n <= last; n++) {
      lines.add(n);
    }
  }
  return lines;
}

function touchesSelection(view: EditorView, from: number, to: number): boolean {
  return (
    view.hasFocus &&
    view.state.selection.ranges.some((r) => r.from <= to && r.to >= from)
  );
}

function hideWithTrailingSpace(
  state: EditorState,
  from: number,
  to: number,
  out: Range<Decoration>[],
): void {
  const end = state.doc.sliceString(to, to + 1) === " " ? to + 1 : to;
  if (end > from) {
    out.push(hidden.range(from, end));
  }
}

function childrenOf(node: SyntaxNode, name: string): SyntaxNode[] {
  const found: SyntaxNode[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.name === name) {
      found.push(child);
    }
  }
  return found;
}

function listDepth(item: SyntaxNode): number {
  let depth = 0;
  for (let n: SyntaxNode | null = item.parent; n; n = n.parent) {
    if (n.name === "BulletList" || n.name === "OrderedList") {
      depth++;
    }
  }
  return Math.min(depth, MAX_LIST_DEPTH);
}

function decorateLink(
  view: EditorView,
  node: SyntaxNode,
  out: Range<Decoration>[],
): void {
  const marks = childrenOf(node, "LinkMark");
  const url = node.getChild("URL");
  if (marks.length < 3 || !url) {
    return;
  }
  const textFrom = marks[0].to;
  const textTo = marks[1].from;
  if (textTo > textFrom) {
    out.push(markClass("cm-md-link").range(textFrom, textTo));
  }
  if (!touchesSelection(view, node.from, node.to)) {
    out.push(hidden.range(marks[0].from, marks[0].to));
    out.push(hidden.range(marks[1].from, node.to));
  }
}

// Under the caret the source line is revealed ABOVE the still-rendered image, so revealing it adds one
// line instead of removing the image's whole height.
function decorateImage(
  view: EditorView,
  node: SyntaxNode,
  out: Range<Decoration>[],
): void {
  const { state } = view;
  const marks = childrenOf(node, "LinkMark");
  const url = node.getChild("URL");
  const sameLine =
    state.doc.lineAt(node.from).number === state.doc.lineAt(node.to).number;
  const image =
    url && marks.length >= 2 && sameLine
      ? imageOf(
          state.facet(markdownImageSource)(
            state.doc.sliceString(url.from, url.to),
          ),
        )
      : null;
  if (!image) {
    out.push(markClass("cm-md-image").range(node.from, node.to));
    return;
  }
  const alt = state.doc.sliceString(marks[0].to, marks[1].from).trim();
  const widget = new ImageWidget(image.src, alt, image.size);
  if (!touchesSelection(view, node.from, node.to)) {
    out.push(Decoration.replace({ widget }).range(node.from, node.to));
    return;
  }
  out.push(markClass("cm-md-image").range(node.from, node.to));
  out.push(Decoration.widget({ widget, side: 1 }).range(node.to));
}

function buildDecorations(view: EditorView, tree: Tree): DecorationSet {
  const { state } = view;
  const active = activeLines(view);
  const isActive = (pos: number) => active.has(state.doc.lineAt(pos).number);
  const out: Range<Decoration>[] = [];
  const codeRanges: [number, number][] = [];

  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from,
      to,
      enter: (ref) => {
        const name = ref.name;
        const node = ref.node;
        const heading = HEADING.exec(name) ?? SETEXT.exec(name);
        if (heading) {
          const line = state.doc.lineAt(ref.from);
          out.push(lineClass(`cm-md-h${heading[1]}`).range(line.from));
          return;
        }
        switch (name) {
          case "HeaderMark":
            if (node.parent && HEADING.test(node.parent.name)) {
              if (!isActive(ref.from)) {
                hideWithTrailingSpace(state, ref.from, ref.to, out);
              }
            } else if (!isActive(ref.from)) {
              out.push(hidden.range(ref.from, ref.to));
            }
            return;
          case "StrongEmphasis":
            out.push(markClass("cm-md-strong").range(ref.from, ref.to));
            return;
          case "Emphasis":
            out.push(markClass("cm-md-em").range(ref.from, ref.to));
            return;
          case "Strikethrough":
            out.push(markClass("cm-md-strike").range(ref.from, ref.to));
            return;
          case "InlineCode":
            codeRanges.push([ref.from, ref.to]);
            out.push(markClass("cm-md-code").range(ref.from, ref.to));
            return;
          case "EmphasisMark":
          case "StrikethroughMark":
            if (
              node.parent &&
              !touchesSelection(view, node.parent.from, node.parent.to)
            ) {
              out.push(hidden.range(ref.from, ref.to));
            }
            return;
          case "CodeMark":
            if (
              node.parent?.name === "InlineCode" &&
              !touchesSelection(view, node.parent.from, node.parent.to)
            ) {
              out.push(hidden.range(ref.from, ref.to));
            }
            return;
          case "Link":
            decorateLink(view, node, out);
            return false;
          case "Image":
            decorateImage(view, node, out);
            return false;
          case "FencedCode":
          case "CodeBlock": {
            codeRanges.push([ref.from, ref.to]);
            const first = state.doc.lineAt(ref.from).number;
            const last = state.doc.lineAt(ref.to).number;
            for (let n = first; n <= last; n++) {
              const line = state.doc.line(n);
              const edge = name === "FencedCode" && (n === first || n === last);
              out.push(
                lineClass(
                  edge ? "cm-md-codeblock cm-md-fence" : "cm-md-codeblock",
                ).range(line.from),
              );
            }
            return false;
          }
          case "Blockquote": {
            const first = state.doc.lineAt(ref.from).number;
            const last = state.doc.lineAt(ref.to).number;
            for (let n = first; n <= last; n++) {
              const edges =
                (n === first ? " cm-md-quote-start" : "") +
                (n === last ? " cm-md-quote-end" : "");
              out.push(
                lineClass(`cm-md-quote${edges}`).range(state.doc.line(n).from),
              );
            }
            return;
          }
          case "ListItem": {
            const depthClass = lineClass(
              `cm-md-list cm-md-depth-${listDepth(node)}`,
            );
            const first = state.doc.lineAt(ref.from).number;
            const last = state.doc.lineAt(ref.to).number;
            for (let n = first; n <= last; n++) {
              out.push(depthClass.range(state.doc.line(n).from));
            }
            return;
          }
          case "QuoteMark":
            if (!isActive(ref.from)) {
              hideWithTrailingSpace(state, ref.from, ref.to, out);
            }
            return;
          case "HorizontalRule":
            if (!isActive(ref.from)) {
              out.push(
                Decoration.replace({ widget: rule }).range(ref.from, ref.to),
              );
            }
            return;
          case "ListMark": {
            const item = node.parent;
            const task = item?.getChild("Task");
            const ordered = item?.parent?.name === "OrderedList";
            if (task) {
              if (!isActive(ref.from)) {
                hideWithTrailingSpace(state, ref.from, ref.to, out);
              }
            } else if (ordered) {
              out.push(markClass("cm-md-listmark").range(ref.from, ref.to));
            } else if (!isActive(ref.from)) {
              out.push(
                Decoration.replace({ widget: bullet }).range(ref.from, ref.to),
              );
            }
            return;
          }
          case "TaskMarker": {
            const checked = /x/i.test(state.doc.sliceString(ref.from, ref.to));
            const boxEnd =
              state.doc.sliceString(ref.to, ref.to + 1) === " "
                ? ref.to + 1
                : ref.to;
            if (!touchesSelection(view, ref.from, boxEnd)) {
              out.push(
                Decoration.replace({
                  widget: new TaskBoxWidget(checked, ref.from),
                }).range(ref.from, boxEnd),
              );
            }
            const task = node.parent;
            if (checked && task && task.to > ref.to) {
              out.push(markClass("cm-md-task-done").range(ref.to, task.to));
            }
            return;
          }
          default:
            return;
        }
      },
    });

    const text = state.doc.sliceString(from, to);
    for (const match of text.matchAll(WIKILINK)) {
      const start = from + (match.index ?? 0);
      const end = start + match[0].length;
      if (codeRanges.some(([a, b]) => start >= a && end <= b)) {
        continue;
      }
      out.push(markClass("cm-md-wikilink").range(start + 2, end - 2));
      if (!touchesSelection(view, start, end)) {
        out.push(hidden.range(start, start + 2));
        out.push(hidden.range(end - 2, end));
      }
    }
  }

  return Decoration.set(out, true);
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(
        view,
        parsedTree(view.state, view.viewport.to, BULK_PARSE_MS),
      );
    }

    update(update: ViewUpdate): void {
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.selectionSet ||
        update.focusChanged ||
        syntaxTree(update.startState) !== syntaxTree(update.state) ||
        update.startState.facet(markdownImageSource) !==
          update.state.facet(markdownImageSource)
      ) {
        const { view } = update;
        const budget = parseBudget(update.transactions);
        this.decorations = buildDecorations(
          view,
          parsedTree(view.state, view.viewport.to, budget),
        );
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
