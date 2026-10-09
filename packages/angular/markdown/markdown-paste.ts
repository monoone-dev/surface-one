const MARKDOWN_BLOCK =
  /^(?: {0,3}#{1,6}[ \t]| {0,3}>|[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]| {0,3}(?:```|~~~)| {0,3}\|.*\|[ \t]*$)/m;

const FORMATTING =
  "h1, h2, h3, h4, h5, h6, b, strong, i, em, u, s, del, strike, mark, a, ul, ol, li, table, blockquote, pre, code, img, picture, svg, hr, input";

const squash = (text: string) => text.replace(/\s+/g, "");

// A Markdown file copied out of a plain-text view arrives with an HTML twin that only wraps the
// same characters; converting that HTML would escape the syntax, so its plain text wins.
export function isMarkdownSourceCopy(html: string, text: string): boolean {
  if (!text || !MARKDOWN_BLOCK.test(text)) {
    return false;
  }
  const body = new DOMParser().parseFromString(html, "text/html").body;
  return (
    body.querySelector(FORMATTING) === null &&
    squash(body.textContent ?? "") === squash(text)
  );
}
