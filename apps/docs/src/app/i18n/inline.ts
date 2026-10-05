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
 */
export function inlineMarkup(text: string, code: LocaleCode): string {
  return escape(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
      if (href.startsWith("/storybook")) {
        return `<a href="${href}">${label}</a>`;
      }
      if (href.startsWith("/")) {
        return `<a href="${localizePath(href, code)}" class="internal">${label}</a>`;
      }
      return `<a href="${href}">${label}</a>`;
    });
}
