import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import scss from "highlight.js/lib/languages/scss";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

/**
 * Syntax highlighting for the docs' code blocks. It runs during prerendering, so
 * crawlers and no-JS readers get coloured HTML; only the languages the docs use
 * are registered, to keep the bundle small. Colours come from `.hljs-*` rules in
 * styles.scss, built on tokens, so they follow the skin and colour mode.
 */
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);

const ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "typescript",
  html: "xml",
  angular: "xml",
  sh: "bash",
  shell: "bash",
  jsonc: "json",
  toml: "bash",
};

/** Highlighted HTML for `code` (escaped by highlight.js), or `null` for an unknown language. */
export function highlight(code: string, lang: string): string | null {
  const language = ALIASES[lang] ?? lang;
  if (!hljs.getLanguage(language)) return null;
  return hljs.highlight(code, { language, ignoreIllegals: true }).value;
}
