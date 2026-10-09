import { Renderer, marked, type Token, type Tokens } from "marked";
import DOMPurify from "dompurify";
import { escapeHtml } from "@surface-one/angular/core";
import { SAFE_INLINE_IMAGE } from "./markdown-image";

// The source is UNTRUSTED (model output, pasted text, speech-to-text): raw HTML is escaped
// by default (also closes the one route a remote `<img>`/`<video>` could cause egress), images
// render only from inline `data:` URLs unless a caller's hook narrows that further, and
// everything goes through DOMPurify before Angular's own `[innerHTML]` sanitiser — never
// `bypassSecurityTrust*`-ed.
export interface MarkdownBlock {
  readonly key: string;
  readonly html: string;
}

export interface RenderOptions {
  readonly breaks: boolean;
}

export interface MarkdownOptions extends RenderOptions {
  readonly html?: (raw: string, block: boolean) => string;
  readonly image?: (token: Tokens.Image) => string;
  readonly taskBox?: (checked: boolean) => string;
  readonly externalLinks?: boolean;
  readonly allowAttrs?: readonly string[];
}

function escapeRawHtml(raw: string, block: boolean): string {
  return block ? `<p>${escapeHtml(raw)}</p>` : escapeHtml(raw);
}

function dataUrlImage({ href, title, text }: Tokens.Image): string {
  const rawAlt =
    text.trim() || $localize`:Fallback alt text for an image:Image`;
  const alt = escapeHtml(rawAlt);
  if (!SAFE_INLINE_IMAGE.test(href)) {
    return `<span class="markdown-image-blocked">${escapeHtml($localize`${rawAlt}:alt: — image not loaded`)}</span>`;
  }
  const t = title ? ` title="${escapeHtml(title)}"` : "";
  return `<img src="${href}" alt="${alt}"${t}>`;
}

// Task boxes are spans, not `<input>` (Angular's `[innerHTML]` sanitiser drops `<input>`);
// named "Task" via aria-label since an id-based aria-labelledby is impossible here.
function readOnlyTaskBox(checked: boolean): string {
  return `<span class="markdown-task-box" role="checkbox" aria-label="${escapeHtml($localize`:Checkbox of a task in a note:Task`)}" aria-checked="${checked ? "true" : "false"}" aria-disabled="true"></span>`;
}

function createRenderer(options: MarkdownOptions): Renderer {
  const renderer = new Renderer();
  const base = {
    link: renderer.link.bind(renderer),
    table: renderer.table.bind(renderer),
    listitem: renderer.listitem.bind(renderer),
  };
  const html = options.html ?? escapeRawHtml;
  const taskBox = options.taskBox ?? readOnlyTaskBox;

  renderer.html = (token: Tokens.HTML | Tokens.Tag): string =>
    html(token.text, "block" in token && !!token.block);

  if (options.externalLinks ?? true) {
    renderer.link = (token: Tokens.Link): string =>
      base
        .link(token)
        .replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
  }

  renderer.image = options.image ?? dataUrlImage;

  renderer.code = ({ text, lang, escaped }: Tokens.Code): string => {
    const language = (lang ?? "").trim().split(/\s+/)[0] ?? "";
    const body = escaped ? text : escapeHtml(text);
    const cls = language ? ` class="language-${escapeHtml(language)}"` : "";
    const label = language
      ? `<span class="markdown-code-lang" aria-hidden="true">${escapeHtml(language)}</span>`
      : "";
    return `<div class="markdown-code">${label}<pre><code${cls}>${body}\n</code></pre></div>`;
  };

  renderer.table = (token: Tokens.Table): string =>
    `<div class="markdown-table">${base.table(token)}</div>`;

  renderer.checkbox = ({ checked }: Tokens.Checkbox): string =>
    taskBox(!!checked);

  renderer.listitem = (item: Tokens.ListItem): string => {
    if (!item.task) {
      return base.listitem(item);
    }
    const cls = item.checked
      ? "markdown-task task-list-item is-done"
      : "markdown-task task-list-item";
    // Wrap only the item's own text (not a nested list): `text-decoration` on the
    // `<li>` would strike through sub-items too, and cannot be undone by a descendant.
    const split = item.tokens.findIndex((t) => t.type === "list");
    const head = split === -1 ? item.tokens : item.tokens.slice(0, split);
    const tail = split === -1 ? [] : item.tokens.slice(split);
    const parser = renderer.parser;
    return `<li class="${cls}"><span class="markdown-task-text">${parser.parse(head)}</span>${parser.parse(tail)}</li>\n`;
  };
  return renderer;
}

function sanitize(html: string, allowAttrs: readonly string[]): string {
  // Without a DOM (server-side rendering / prerender) DOMPurify cannot run and
  // exposes no `sanitize`. The markup then relies on Angular's own `[innerHTML]`
  // sanitiser, which runs on the server too and keeps only its safe element and
  // attribute allowlist (no style, form or input elements); the browser
  // re-renders through DOMPurify after hydration.
  if (typeof DOMPurify.sanitize !== "function") return html;
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: [
      "role",
      "aria-label",
      "aria-checked",
      "aria-disabled",
      "aria-hidden",
      ...allowAttrs,
    ],
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
  });
}

const DEFAULT_ATTRS: readonly string[] = ["target"];

export function renderMarkdown(
  source: string,
  options: MarkdownOptions,
): string {
  const out = marked.parse(source, {
    async: false,
    gfm: true,
    breaks: options.breaks,
    renderer: createRenderer(options),
  });
  return sanitize(
    typeof out === "string" ? out : "",
    options.allowAttrs ?? DEFAULT_ATTRS,
  );
}

let sharedRenderer: Renderer | null = null;
const referenceContextByCache = new WeakMap<Map<string, string>, string>();

export function renderBlocks(
  source: string,
  options: RenderOptions,
  cache: Map<string, string>,
): MarkdownBlock[] {
  sharedRenderer ??= createRenderer({ breaks: true });
  const renderer = sharedRenderer;
  const tokens = marked.lexer(source, { gfm: true, breaks: options.breaks });
  // Reference definitions can change a block without changing its raw source.
  const referenceContext = JSON.stringify(tokens.links);
  if (referenceContextByCache.get(cache) !== referenceContext) {
    cache.clear();
    referenceContextByCache.set(cache, referenceContext);
  }
  const blocks: MarkdownBlock[] = [];
  const next = new Map<string, string>();
  let i = 0;
  for (const token of tokens) {
    if (token.type === "space" || token.type === "def") {
      continue;
    }
    const key = `${options.breaks ? "b" : "n"}${i++}:${token.raw}`;
    let html = cache.get(key);
    if (html === undefined) {
      const list = Object.assign([token] as Token[], { links: tokens.links });
      const raw = marked.parser(list, {
        async: false,
        gfm: true,
        breaks: options.breaks,
        renderer,
      });
      html = sanitize(typeof raw === "string" ? raw : "", DEFAULT_ATTRS);
    }
    next.set(key, html);
    blocks.push({ key, html });
  }
  cache.clear();
  for (const [k, v] of next) {
    cache.set(k, v);
  }
  return blocks;
}
