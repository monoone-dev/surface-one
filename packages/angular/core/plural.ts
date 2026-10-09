import { activeLocale } from "./locale";

function splitCases(body: string): Map<string, string> {
  const cases = new Map<string, string>();
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf("{", i);
    if (open < 0) break;
    const key = body.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < body.length && depth > 0) {
      if (body[j] === "{") depth++;
      else if (body[j] === "}") depth--;
      j++;
    }
    if (key) cases.set(key, body.slice(open + 1, j - 1));
    i = j;
  }
  return cases;
}

/**
 * Picks the branch of an ICU plural message for `count`:
 * `plural(n, $localize`{n, plural, =0 {No notes} one {# note} other {# notes}}`)`.
 * Exact `=N` cases win, then the active locale's plural category, then `other`;
 * `#` becomes the count. Keep other placeholders out of the message.
 */
export function plural(count: number, icu: string): string {
  const match = /^\s*\{\s*[\w.]+\s*,\s*plural\s*,([\s\S]*)\}\s*$/.exec(icu);
  if (!match) return icu;
  const cases = splitCases(match[1] ?? "");
  let category = "other";
  try {
    category = new Intl.PluralRules(activeLocale()).select(count);
  } catch {
    category = new Intl.PluralRules("en").select(count);
  }
  const branch =
    cases.get(`=${count}`) ?? cases.get(category) ?? cases.get("other") ?? "";
  return branch.replace(/#/g, String(count));
}
