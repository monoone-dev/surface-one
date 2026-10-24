// The command's matching (`sone-command`), with no framework in it: Angular and the Vue and React twins
// (through @surface-one/core) filter the same way.
import { normalizeSearchText } from "./list-navigation";

/** Decides whether an item matches the search; `keywords` are the item's extra search terms. */
export type SoneCommandFilter = (
  value: string,
  search: string,
  keywords: readonly string[],
) => boolean;

/**
 * The built-in filter: every word of the search must appear (case- and
 * accent-insensitively) in the item's value or one of its keywords.
 */
export const soneCommandFilter: SoneCommandFilter = (
  value,
  search,
  keywords,
) => {
  const words = normalizeSearchText(search).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeSearchText([value, ...keywords].join(" "));
  return words.every((word) => haystack.includes(word));
};

/** Whether an item passes the search: everything does while filtering is off or the search is blank. */
export function commandItemMatches(
  value: string,
  keywords: readonly string[],
  search: string,
  shouldFilter = true,
  filter: SoneCommandFilter = soneCommandFilter,
): boolean {
  if (!shouldFilter || !search.trim()) return true;
  return filter(value, search, keywords);
}
