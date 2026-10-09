const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DETAILS",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "SUMMARY",
  "TABLE",
  "UL",
]);
const SKIPPED_TAGS = new Set([
  "HEAD",
  "META",
  "LINK",
  "SCRIPT",
  "STYLE",
  "TEMPLATE",
  "NOSCRIPT",
  "IFRAME",
  "OBJECT",
  "SVG",
  "BUTTON",
  "SELECT",
  "TEXTAREA",
]);
const SAFE_URL = /^(https?:|mailto:|obsidian:|index-one-attachment:|#)/i;
const UNICODE_BULLET = /^([ \t]*)[•◦▪▫‣⁃●○■□·][ \t]+/gm;
const LINE_BULLET = /^[•◦▪▫‣⁃●○■□·][ \t]+/;
const CODE_TAGS = new Set(["CODE", "KBD", "SAMP"]);
const BLOCK_SELECTOR = [...BLOCK_TAGS]
  .map((tag) => tag.toLowerCase())
  .join(",");

interface InlineStyle {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly strike: boolean;
  readonly code: boolean;
}

const PLAIN: InlineStyle = {
  bold: false,
  italic: false,
  strike: false,
  code: false,
};

function styleOf(el: Element, inherited: InlineStyle): InlineStyle {
  const tag = el.tagName.toUpperCase();
  const css = (el.getAttribute("style") ?? "").toLowerCase();
  const weight = /font-weight\s*:\s*(\w+)/.exec(css)?.[1];
  const declaredNormal = weight === "normal" || weight === "400";
  const declaredBold =
    weight === "bold" || weight === "bolder" || Number(weight) >= 600;
  return {
    bold:
      (inherited.bold && !declaredNormal) ||
      declaredBold ||
      ((tag === "B" || tag === "STRONG") && !declaredNormal),
    italic:
      inherited.italic ||
      tag === "I" ||
      tag === "EM" ||
      /font-style\s*:\s*italic/.test(css),
    strike:
      inherited.strike ||
      tag === "S" ||
      tag === "DEL" ||
      tag === "STRIKE" ||
      /text-decoration[^;]*line-through/.test(css),
    code: inherited.code || tag === "CODE" || tag === "KBD" || tag === "SAMP",
  };
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

function escapeUnderscores(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "_") {
      out += ch;
      continue;
    }
    const prev = text[i - 1] ?? "";
    const next = text[i + 1] ?? "";
    const inRun = prev === "_" || next === "_";
    const atBoundary = !WORD_CHAR.test(prev) || !WORD_CHAR.test(next);
    out += inRun || atBoundary ? "\\_" : "_";
  }
  return out;
}

function escapeInline(text: string): string {
  return escapeUnderscores(
    text.replace(/([\\`*])/g, "\\$1").replace(/~/g, "\\~"),
  )
    .replace(/\[(?=[^\]\n]*\]\()/g, "\\[")
    .replace(/&(?=#?\w+;)/g, "\\&")
    .replace(/<(?=[A-Za-z/!])/g, "\\<");
}

function codeSpan(content: string): string {
  const longest = Math.max(
    0,
    ...(content.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = "`".repeat(longest + 1);
  const pad = content.startsWith("`") || content.endsWith("`") ? " " : "";
  return `${fence}${pad}${content}${pad}${fence}`;
}

function isBlock(el: Element): boolean {
  return (
    BLOCK_TAGS.has(el.tagName.toUpperCase()) ||
    !!el.querySelector(BLOCK_SELECTOR)
  );
}

function escapeLineStart(line: string): string {
  if (LINE_BULLET.test(line)) {
    return line.replace(LINE_BULLET, "- ");
  }
  if (/^(?:[-=][ \t]*){2,}$/.test(line)) {
    return `\\${line}`;
  }
  return line
    .replace(/^(\s*)([#>+-])(?=\s)/, "$1\\$2")
    .replace(/^(\s*)(\d+)([.)])(?=\s)/, "$1$2\\$3");
}

function wrap(text: string, style: InlineStyle): string {
  if (!text.trim()) {
    return text;
  }
  const lead = /^\s*/.exec(text)?.[0] ?? "";
  const trail = /\s*$/.exec(text)?.[0] ?? "";
  let core = text.slice(lead.length, text.length - trail.length);
  if (style.code) {
    core = codeSpan(core);
  } else {
    if (style.strike) core = `~~${core}~~`;
    if (style.italic) core = `*${core}*`;
    if (style.bold) core = `**${core}**`;
  }
  return lead + core + trail;
}

function inline(node: Node, style: InlineStyle): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const raw = (node.textContent ?? "").replace(/[\s\u00a0]+/g, " ");
    return wrap(style.code ? raw : escapeInline(raw), style);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  const el = node as Element;
  const tag = el.tagName.toUpperCase();
  if (SKIPPED_TAGS.has(tag)) {
    return "";
  }
  if (tag === "BR") {
    return "\n";
  }
  if (tag === "IMG") {
    const src = el.getAttribute("src") ?? "";
    if (!SAFE_URL.test(src)) {
      return "";
    }
    const alt = (el.getAttribute("alt") ?? "").replace(/[[\]]/g, "");
    return `![${alt}](${src})`;
  }
  if (tag === "INPUT" && el.getAttribute("type") === "checkbox") {
    return "";
  }
  if (isBlock(el)) {
    return blocks(el).join("\n\n");
  }
  if (/mso-list\s*:\s*ignore/i.test(el.getAttribute("style") ?? "")) {
    return "";
  }
  if (CODE_TAGS.has(tag) && !style.code) {
    const raw = (el.textContent ?? "").replace(/[\s\u00a0]+/g, " ");
    const core = raw.trim();
    if (!core) {
      return raw;
    }
    const lead = raw.startsWith(" ") ? " " : "";
    const trail = raw.endsWith(" ") ? " " : "";
    return wrap(`${lead}${codeSpan(core)}${trail}`, { ...style, code: false });
  }
  const childStyle = styleOf(el, style);
  if (tag === "A") {
    const href = el.getAttribute("href") ?? "";
    const text = children(el, childStyle).trim();
    if (!text) {
      return "";
    }
    return SAFE_URL.test(href) && href !== text ? `[${text}](${href})` : text;
  }
  return children(el, childStyle);
}

function children(el: Element, style: InlineStyle): string {
  let out = "";
  for (const child of Array.from(el.childNodes)) {
    out += inline(child, style);
  }
  return out;
}

function cleanParagraph(text: string): string {
  return text
    .split("\n")
    .map((line) => escapeLineStart(line.replace(/[ \t]+/g, " ").trim()))
    .join("\n")
    .trim();
}

function indentBlock(text: string, pad: string): string {
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

function listItem(li: Element, marker: string): string {
  const box = li.querySelector(
    ":scope > input[type=checkbox], :scope > p > input[type=checkbox]",
  );
  const checked = box?.hasAttribute("checked") ?? false;
  const task = box ? (checked ? "[x] " : "[ ] ") : "";
  const body = blocks(li).join("\n");
  const pad = " ".repeat(marker.length);
  const [first, ...rest] = body.split("\n");
  const head = `${marker}${task}${first ?? ""}`.trimEnd();
  return rest.length ? `${head}\n${indentBlock(rest.join("\n"), pad)}` : head;
}

function list(el: Element): string {
  const ordered = el.tagName === "OL";
  let n = Number(el.getAttribute("start") ?? "1") || 1;
  const items: string[] = [];
  for (const child of Array.from(el.children)) {
    if (child.tagName === "LI") {
      items.push(listItem(child, ordered ? `${n++}. ` : "- "));
    } else if (child.tagName === "UL" || child.tagName === "OL") {
      items.push(indentBlock(list(child), ordered ? "   " : "  "));
    }
  }
  return items.join("\n");
}

function table(el: Element): string {
  const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.children)
      .filter((cell) => cell.tagName === "TD" || cell.tagName === "TH")
      .map((cell) =>
        cleanParagraph(children(cell, PLAIN))
          .replace(/\n+/g, " ")
          .replace(/\|/g, "\\|"),
      ),
  );
  const width = Math.max(0, ...rows.map((row) => row.length));
  if (width === 0) {
    return "";
  }
  const line = (cells: string[]) =>
    `| ${Array.from({ length: width }, (_, i) => cells[i] ?? "").join(" | ")} |`;
  const [header, ...body] = rows;
  return [
    line(header),
    line(Array.from({ length: width }, () => "---")),
    ...body.map(line),
  ].join("\n");
}

function wordListItem(el: Element): string | null {
  const css = el.getAttribute("style") ?? "";
  if (!/mso-list\s*:\s*l\d/i.test(css)) {
    return null;
  }
  const level = Number(/level(\d+)/i.exec(css)?.[1] ?? "1");
  const marker =
    Array.from(el.querySelectorAll("span"))
      .find((span) =>
        /mso-list\s*:\s*ignore/i.test(span.getAttribute("style") ?? ""),
      )
      ?.textContent?.replace(/[\s\u00a0]+/g, "") ?? "";
  const ordered = /^\w{1,4}[.)]$/.test(marker);
  const text = cleanParagraph(children(el, PLAIN)).replace(/\n+/g, " ");
  return `${"  ".repeat(Math.max(0, level - 1))}${ordered ? "1. " : "- "}${text}`;
}

function block(el: Element): string {
  const tag = el.tagName.toUpperCase();
  const heading = /^H([1-6])$/.exec(tag);
  if (heading) {
    const text = cleanParagraph(children(el, PLAIN)).replace(/\n+/g, " ");
    return text ? `${"#".repeat(Number(heading[1]))} ${text}` : "";
  }
  switch (tag) {
    case "UL":
    case "OL":
      return list(el);
    case "PRE": {
      const code = el.textContent?.replace(/\n$/, "") ?? "";
      const lang =
        /language-([\w+-]+)/.exec(
          `${el.className} ${el.querySelector("code")?.className ?? ""}`,
        )?.[1] ?? "";
      const fence = code.includes("```") ? "~~~" : "```";
      return `${fence}${lang}\n${code}\n${fence}`;
    }
    case "BLOCKQUOTE":
      return blocks(el)
        .join("\n\n")
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
    case "HR":
      return "---";
    case "TABLE":
      return table(el);
    default:
      return blocks(el).join("\n\n");
  }
}

function blocks(el: Element): string[] {
  const out: string[] = [];
  let run = "";
  let previousWasWordItem = false;
  const flush = () => {
    const text = cleanParagraph(run);
    if (text) {
      out.push(text);
      previousWasWordItem = false;
    }
    run = "";
  };
  for (const child of Array.from(el.childNodes)) {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      SKIPPED_TAGS.has((child as Element).tagName.toUpperCase())
    ) {
      continue;
    }
    if (child.nodeType === Node.ELEMENT_NODE && isBlock(child as Element)) {
      flush();
      const item = wordListItem(child as Element);
      if (item !== null && previousWasWordItem) {
        out[out.length - 1] += `\n${item}`;
        continue;
      }
      const text = item ?? block(child as Element);
      if (text.trim()) {
        out.push(text);
        previousWasWordItem = item !== null;
      }
    } else {
      run += inline(child, PLAIN);
    }
  }
  flush();
  return out;
}

function isCodeEditorCopy(doc: Document): boolean {
  const root = doc.body.firstElementChild;
  const css = (root?.getAttribute("style") ?? "").toLowerCase();
  return (
    !!root &&
    doc.body.children.length === 1 &&
    /white-space\s*:\s*pre/.test(css) &&
    /font-family\s*:[^;]*(mono|menlo|consolas|courier|sf mono)/.test(css)
  );
}

/** `null` when the HTML carries no formatting worth keeping, so the plain text should be pasted. */
export function htmlToMarkdown(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (isCodeEditorCopy(doc)) {
    return null;
  }
  const markdown = blocks(doc.body)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return markdown || null;
}

export function normalizePastedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(UNICODE_BULLET, "$1- ");
}
