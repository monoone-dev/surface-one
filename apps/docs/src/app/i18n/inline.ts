import { localizePath, type LocaleCode } from "./locales";

const escape = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );

/**
 * The tiny inline markup used in prose messages: `code`, **bold** and
 * [label](/path). Text is escaped first, so a message can never inject markup;
 * internal paths are localized, external links stay plain anchors (the sanitizer keeps them).
 * Site paths are written relative to the `<base href>`, so they work under a sub-path.
 */
export function inlineMarkup(text: string, code: LocaleCode): string {
  return escape(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
      if (href.startsWith("/storybook")) {
        return `<a href="${href.slice(1)}">${label}</a>`;
      }
      if (href.startsWith("/")) {
        const path = localizePath(href, code).slice(1) || "./";
        return `<a href="${path}" class="internal">${label}</a>`;
      }
      return `<a href="${href}">${label}</a>`;
    });
}
